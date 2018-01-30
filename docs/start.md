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
