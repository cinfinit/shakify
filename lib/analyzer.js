import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';
// import tar from 'tar';
import * as tar from 'tar';
import { rollup } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {gzipSize} from 'gzip-size';

const CACHE_FILE = path.join(os.tmpdir(), 'shakify-cli-cache.json');

function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

export function clearCache() {
  if (fs.existsSync(CACHE_FILE)) {
    fs.unlinkSync(CACHE_FILE);
    console.log('✅ Cache cleared!');
  } else {
    console.log('⚠️ No cache found.');
  }
}

async function fetchPackageMetadata(packageName, spinner) {
  const url = `https://registry.npmjs.org/${packageName}`;
  spinner.text = `Fetching metadata for ${packageName}...`;
  const response = await axios.get(url);
  const latestVersion = response.data['dist-tags'].latest;
  return response.data.versions[latestVersion];
}

async function downloadAndExtractPackage(packageName, tarballUrl, spinner) {
  spinner.text = `Downloading ${packageName}...`;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `${packageName}-`));
  const response = await axios.get(tarballUrl, { responseType: 'stream' });
  await new Promise((resolvePromise, rejectPromise) => {
    const extractStream = tar.x({ cwd: tempDir, strip: 1 });
    response.data.pipe(extractStream);
    extractStream.on('finish', resolvePromise);
    extractStream.on('error', rejectPromise);
  });
  spinner.text = `Extracted package.`;
  return tempDir;
}

function extractExportsFromPackageJson(pkgJson) {
  if (!pkgJson.exports) return ['.'];
  if (typeof pkgJson.exports === 'string') return ['.'];
  if (typeof pkgJson.exports === 'object') {
    return Object.keys(pkgJson.exports).filter(key => !key.startsWith('#'));
  }
  return ['.'];
}

function analyzePackageFields(pkgJson) {
  const sideEffects = pkgJson.sideEffects === undefined ? true : pkgJson.sideEffects;
  const esmSupport = !!(pkgJson.module || pkgJson.exports);
  const commonJsSupport = !!pkgJson.main;

  return {
    sideEffects,
    treeShakeable: sideEffects === false || (Array.isArray(sideEffects) && sideEffects.length === 0),
    esmSupport,
    commonJsSupport,
  };
}

async function measureExportSize(packageName, exportName, spinner) {
  spinner.text = `Bundling export '${exportName}'...`;
  const importPath = exportName === '.' ? packageName : `${packageName}${exportName}`;
  const inputCode = `import * as pkg from '${importPath}'; export default pkg;`;

  const bundle = await rollup({
    input: 'entry.js',
    plugins: [
      {
        name: 'virtual-entry',
        resolveId(id) {
          if (id === 'entry.js') return id;
          return null;
        },
        load(id) {
          if (id === 'entry.js') return inputCode;
          return null;
        },
      },
      resolve(),
      commonjs(),
    ],
  });

  const { output } = await bundle.generate({ format: 'esm' });
  const code = output[0].code;
  const size = Buffer.byteLength(code, 'utf8');
  const gzippedSize = await gzipSize(code);
  return { size, gzippedSize };
}

export async function analyzePackage(packageName, spinner) {
  const meta = await fetchPackageMetadata(packageName, spinner);
  const versionKey = `${packageName}@${meta.version}`;

  const cache = loadCache();

  if (cache[versionKey]) {
    spinner.succeed(`Using cached data for ${versionKey}`);
    return { ...cache[versionKey], cached: true, version: meta.version };
  }

  spinner.text = `Analyzing ${versionKey}...`;

  const extractedPath = await downloadAndExtractPackage(packageName, meta.dist.tarball, spinner);
  const pkgJsonPath = path.join(extractedPath, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

  const analysis = analyzePackageFields(pkgJson);
  const exportsList = extractExportsFromPackageJson(pkgJson);

  const exportSizes = [];
  for (const exportName of exportsList) {
    try {
      const sizes = await measureExportSize(packageName, exportName, spinner);
      exportSizes.push({ exportName, ...sizes });
    } catch (e) {
      exportSizes.push({ exportName, error: e.message });
    }
  }

  const result = {
    analysis,
    exportSizes,
    version: meta.version,
    cached: false,
  };

  cache[versionKey] = result;
  saveCache(cache);

  spinner.succeed(`Analysis complete for ${versionKey}`);
  return result;
}