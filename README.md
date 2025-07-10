# 🪩 shakify [![NPM version](https://img.shields.io/npm/v/shakify.svg?style=flat)](https://www.npmjs.com/package/shakify) [![NPM downloads](https://img.shields.io/npm/dm/shakify.svg?style=flat)](https://npmjs.org/package/shakify) 
> 🍃 A CLI tool to shake the truth out of your npm packages
---
## 💡 What is this?
**`shakify`** is your bundle’s personal trainer.  
It inspects npm packages and tells you:
- 🪶 Is it tree-shakeable?
- 🔌 Is it ESM or just CommonJS in disguise?
- 📦 How heavy are each of its exports?
In other words — it **helps you avoid bloated bundles** by letting you pick smarter, leaner dependencies.
> Think of it as a lie detector for npm modules that *claim* to be lightweight.
---
## ✨ Features
- ✅ Detects tree-shaking support
- 🔍 Shows ESM vs CommonJS support
- 📦 Analyzes per-export size (raw + gzipped)
- ⚡ Caches results (with manual clearing via `--clear-cache`)
- 📦 Downloads and inspects real published packages (not guesswork)
- 🌀 CLI spinner magic for extra drama
---
## 🛠️ Install
```bash
npm install -g shakify
```
## 🚀 Usage
```bash
npx shakify-cli <package-name>
```
### Example:
```bash
npx shakify-cli lodash-es
```
### To clear cached results:
```bash
npx shakify-cli react --clear-cache
```

## 🖼 Sample Output
```
=== Package Analysis: lodash-es@4.17.21 ===
ESM Support:        true
CommonJS Support:   false
Side Effects Flag:  false
Tree-shakeable:     true
Cached Result:      false
Export sizes:
.               | Size:    6248 bytes | Gzipped:   1931 bytes
/debounce       | Size:     882 bytes | Gzipped:    410 bytes
/throttle       | Size:     768 bytes | Gzipped:    390 bytes
```

## 📦 Real Benefits
shakify helps you:

- ✅ Avoid packages that can’t be tree-shaken
- ✅ Spot fat exports before they hit your bundle
- ✅ Replace bloated deps with slimmer alternatives
- ✅ Make smarter decisions during package selection
- ✅ Sleep better knowing your JS is lean and mean 💤

## 🧠 Ideal for...
- Frontend devs who care about performance
- Framework authors and lib maintainers
- CI/CD optimization nerds
- You (yes, you reading this 👀)

## 🔁 Caching
Shakify caches results in your system’s temp directory.

### Want to refresh the results?
```bash
npx shakify-cli <package-name> --clear-cache
```
---
Shakify doesn’t judge — it just snitches 📦⚖️
This is a tool for the devs who check bundle sizes like others check calories.  
If that’s you — welcome, friend. Let's keep those kilobytes lean and those load times snappy.
If you enjoy it, share it. If it breaks, yell at your terminal (or open an issue, whichever works).
Stay lightweight. Stay skeptical. Stay shakified 🪩  
---
## ✍️ Note from the Author
This all started with a simple question:  
**"Why is my bundle bigger than my app?"**
Turns out, not all npm packages are what they seem. Some are lean, modular marvels. Others are… well, more like vending machines that give you the entire aisle.
So I built **shakify** — a tool to sniff out the truth behind the `node_modules` curtain.
Whether you're optimizing your Next.js app, squeezing bytes out of a landing page, or just enjoy yelling at JavaScript in different ways, `shakify` is here to help.
It won't fix all your problems, but it might make you think twice before importing `moment.js` 😅

— *[cinfinit](https://github.com/cinfinit)*  

📦 Built with curiosity, and you know more curiosity.
