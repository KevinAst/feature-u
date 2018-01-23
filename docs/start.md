# Getting Started

## Install

```shell
npm install --save feature-u~
```


## Access

All functions are exposed through [UMD](https://github.com/umdjs/umd),
and therefore accessable through any one of the following techniques ...

?? retrofit to feature-u!!!

- **ES6 Import (Native JS)**
  
  ```js
  import { generateActions }  from 'feature-u';
  -OR-
  import * as ActionU from 'feature-u';
  -OR-
  import ActionU from 'feature-u';
  
  generateActions(...)
  -OR-
  ActionU.generateActions(...)
  ```
  
  
- **CommonJS**
  
  ```js
  const { generateActions } = require('feature-u');
  -OR-
  const ActionU = require('feature-u');
  
  generateActions(...)
  -OR-
  ActionU.generateActions(...)
  ```
  
  
- **AMD**
  
  ```js
  define(['feature-u', 'otherModule'], function(ActionU, otherModule) {
    ActionU.generateActions(...)
  });
  ```
  
  
- **&lt;script&gt; tag**
  
  ```
  <script src="https://unpkg.com/feature-u/dist/feature-u.min.js"></script>
  
  <script>
    ActionU.generateActions(...)
  </script>
  ```
