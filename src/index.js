// ?? STUB OUT (barely)
import createFeature from './core/createFeature';
// import createAspect               from './extend/createAspect';
// import createFeature,
//        {addBuiltInFeatureKeyword} from './core/createFeature';
// import launchApp                  from './core/launchApp';
// import managedExpansion           from './core/managedExpansion';


//*** 
//*** Promote all feature-u utilities through a centralized module.
//*** 

// NOTE: This non-default export supports ES6 imports.
//       Example:
//         import { createFeature }    from 'feature-u';
//       -or-
//         import * as FeatureU from 'feature-u';
export {
  createFeature,
//managedExpansion,
//launchApp,
//createAspect,
//addBuiltInFeatureKeyword,
};

// NOTE: This default export supports CommonJS modules (otherwise Babel does NOT promote them).
//       Example:
//         const { createFeature } = require('feature-u');
//       -or-
//         const FeatureU   = require('feature-u');
export default {
  createFeature,
//managedExpansion,
//launchApp,
//createAspect,
//addBuiltInFeatureKeyword,
};

