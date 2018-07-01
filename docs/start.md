# Getting Started

## Install

```shell
npm install --save feature-u
```


## Access

All functions are exposed through [UMD](https://github.com/umdjs/umd),
and therefore accessible through any one of the following techniques ...

- **ES6 Import (Native JS)**
  
  ```js
  import { createFeature }  from 'feature-u';
  -OR-
  import * as FeatureU from 'feature-u';
  -OR-
  import FeatureU from 'feature-u';
  
  createFeature(...)
  -OR-
  FeatureU.createFeature(...)
  ```
  
  
- **CommonJS**
  
  ```js
  const { createFeature } = require('feature-u');
  -OR-
  const FeatureU = require('feature-u');
  
  createFeature(...)
  -OR-
  FeatureU.createFeature(...)
  ```
  
  
- **AMD**
  
  ```js
  define(['feature-u', 'otherModule'], function(FeatureU, otherModule) {
    FeatureU.createFeature(...)
  });
  ```
  
  
- **&lt;script&gt; tag**
  
  ```
  <script src="https://unpkg.com/feature-u/dist/feature-u.min.js"></script>
  
  <script>
    FeatureU.createFeature(...)
  </script>
  ```


## Potential Need for Polyfills

The implementation of this library employs modern es2015+ JavaScript
constructs.  Even though the library distribution is transpiled to
[es5](https://en.wikipedia.org/wiki/ECMAScript#5th_Edition) _(the
least common denominator)_, **polyfills may be required** if you are
using an antiquated JavaScript engine _(such as the IE browser)_.

We take the approach that **polyfills are the responsibility of the
client app**.  This is a legitimate approach, as specified by the [W3C
Polyfill Findings](https://www.w3.org/2001/tag/doc/polyfills/)
_(specifically [Advice for library
authors](https://www.w3.org/2001/tag/doc/polyfills/#advice-for-library-and-framework-authors))_.

- polyfills should only be introduced one time _(during code expansion
  of the app)_
- a library should not pollute the global name space _(by including
  polyfills at the library level)_
- a library should not needlessly increase it's bundle size _(by
  including polyfills that are unneeded in a majority of target
  environments)_

As it turns out, **app-level polyfills are not hard to implement**,
with the advent of third-party utilities, such as babel:

- simply import [babel-polyfill](https://babeljs.io/docs/en/babel-polyfill.html)
- or use babel's
  [babel-preset-env](https://babeljs.io/docs/en/babel-preset-env.html)
  in conjunction with babel 7's `"useBuiltins": "usage"` option

**If your target JavaScript engine is inadequate, it will generate
native run-time errors, and you will need to address the polyfills.**
Unfortunately, in many cases these errors can be very obscure _(even
to seasoned developers)_.  The following [Babel Feature
Request](https://github.com/babel/babel/issues/8089) _(if/when
implemented)_ is intended to address this issue.
