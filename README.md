This project is my first attempt to run React.js on the top of ModdableSDK, implementing a custom renderer with `react-reconciler`.

## Prerequisites

* [Moddable](https://github.com/Moddable-OpenSource/moddable) (latest `public` branch)

## Installation

This repository has two projects

- `lib`: A library project that bundles a custom renderer, `react`, `react-reconciler` into a single esm module using `rollup.js`
- `app`: A Moddable application. It uses a bundled `react-moddable` library in `lib/dist`

```
npm install
cd app && npm install
cd ..
```

## Build

The project's default build target is `lin` that launches a simulator on Linux.

```
npm run build
```