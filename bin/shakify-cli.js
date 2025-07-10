#!/usr/bin/env node
import ora from 'ora';
import { analyzePackage, clearCache } from '../lib/analyzer.js';

const args = process.argv.slice(2);

if (args.includes('--clear-cache')) {
  clearCache();
  process.exit(0);
}

if (args.length < 1) {
  console.error('Usage: shakify-cli <package-name> [--clear-cache]');
  process.exit(1);
}

const packageName = args[0];
const spinner = ora().start();

try {
  const result = await analyzePackage(packageName, spinner);
  spinner.stop();

  const { analysis, exportSizes, version, cached } = result;

  console.log(`\n=== Package Analysis: ${packageName}@${version} ===`);
  console.log(`ESM Support:        ${analysis.esmSupport}`);
  console.log(`CommonJS Support:   ${analysis.commonJsSupport}`);
  console.log(`Side Effects Flag:  ${JSON.stringify(analysis.sideEffects)}`);
  console.log(`Tree-shakeable:     ${analysis.treeShakeable}`);
  console.log(`Cached Result:      ${cached}`);
  console.log('========================================\n');

  console.log('Export sizes:');
  for (const exp of exportSizes) {
    if (exp.error) {
      console.warn(`${exp.exportName.padEnd(15)} | Error: ${exp.error}`);
    } else {
      console.log(`${exp.exportName.padEnd(15)} | Size: ${exp.size.toString().padStart(7)} bytes | Gzipped: ${exp.gzippedSize.toFixed(0).padStart(6)} bytes`);
    }
  }
} catch (err) {
  spinner.fail(`Error: ${err.message}`);
  process.exit(1);
}