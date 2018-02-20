/*******************************************************************************
 * WebPack 2 Bundler Configuration: for a consumable library!
 * 
 * Requirements: 
 * ============
 * 
 *   - ES6 master (code maintained in ES6)
 * 
 *   - Consumable by least-common-denominator (ES5)
 *     * transpiled via babel
 * 
 *   - Bundle accessable through all module
 *     * npm package (via $ npm install)
 * 
 *   - UMD (Universal Module Definition)
 *     ... Supporting ALL Module Environments, including:
 *     * ES6 Import (Native JS)
 *     * CommonJS
 *     * AMD
 *     * <script> tag
 * 
 *   - Lint
 *     * via ESLint
 *
 * Process:
 *
 *      ES6 src
 *         |
 *         |
 *      WebPack 2
 *         |
 *         +--- Babel Transpiler / ESLint
 *         |
 *         v
 *  Consumable Library (UMD/ES5)
 *
 *******************************************************************************/

import webpack      from 'webpack'; // webpack built-in plugins
import path         from 'path';
import packageInfo  from './package.json';

// define indication of production packaging (driven by NODE_ENV environment variable)
const { NODE_ENV }  = process.env;
const productionEnv = NODE_ENV === 'production';

// programatically morph libraryName into a CamelCase version of package.name
// ... ex: FROM: 'feature-u' TO: 'FeatureU'
const libraryName = () => {
  const nodes   = packageInfo.name.split('-');
  const libName = nodes.reduce( (libName, node) => libName + node.charAt(0).toUpperCase() + node.slice(1), '');
  console.log(`*** Using libraryName(): '${libName}' (FROM: '${packageInfo.name}')\n`);
  return libName;
};

// define our WebPack configuration
const webpackConfig = {
  entry:           path.resolve(__dirname, 'src/index.js'), // our traversal entry point
  output: {
    path:          path.resolve(__dirname, 'dist'),                        // bundlePath ....... ex: {projectDir}/dist
    filename:      packageInfo.name + (productionEnv ? '.min.js' : '.js'), // bundleFileName ... ex: feature-u.min.js

    library:       libraryName(), // bundle as a library (i.e. for external consumption) ....... ex: FeatureU
    libraryTarget: 'umd', // UMD compliance (Universal Module Definition) promotes library support for ALL module environments
    umdNamedDefine: true  // name the AMD module (when libraryTarget is 'umd')
  },
  module: {
    rules: [
      // transpile (via babel) to ES5 least-common-denominator (master src utilizes ES6)
      { test: /\.(js|jsx)$/,  use: 'babel-loader'  },
      // apply style check with eslint
      // ... NOTE: This is production code only (i.e. what is being bundled).
      //           To check test code, use the npm lint script.
//*1* { test: /\.(js|jsx)$/,  use: 'eslint-loader' },
//*1* 2/19/2018: I disabled this eslint step BECAUSE 
//     - it was erroring on code picked up from my node_modules that has been transpiled to es5 (i.e. feature-u)
//       ex: C:\dev\feature-u\es\index.js
//           1:1  error  'use strict' is unnecessary inside of modules  strict
//     - my thought is I only care about MY code being eslint correct (which is verified externally), NOT my dependent packages
//     - UNSURE of the full ramifications of this
    ]
  },
  plugins: [] // NOTE: WebPack 2 auto includes webpack.optimize.OccurrenceOrderPlugin, so there is NO need to specify it!
};

// minify production bundle
if (productionEnv) {
  webpackConfig.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        pure_getters: true,
        unsafe:       true,
        unsafe_comps: true,
        warnings:     false
      }
    })
  );
}

// that's all folks :-)
export default webpackConfig;
