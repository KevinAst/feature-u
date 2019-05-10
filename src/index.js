import createFeature,
       {extendFeatureProperty}  from './core/createFeature';
import launchApp                from './core/launchApp';
import expandWithFassets        from './core/expandWithFassets';
import fassetValidations        from './core/fassetValidations';
import {useFassets}             from './core/useFassets';
import {withFassets,
        FassetsContext}         from './core/withFassets'; // publically expose FassetsContext (in rare case when client code defines their own DOM via registerRootAppElm())
import assertNoRootAppElm       from './core/assertNoRootAppElm';
import createAspect,
       {extendAspectProperty}   from './extend/createAspect';


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
  launchApp,
  expandWithFassets,
  fassetValidations,
  useFassets,
  withFassets,
  FassetsContext,
  assertNoRootAppElm,
  createAspect,
  extendAspectProperty,
  extendFeatureProperty,
};

// NOTE: This default export supports CommonJS modules (otherwise Babel does NOT promote them).
//       Example:
//         const { createFeature } = require('feature-u');
//       -or-
//         const FeatureU   = require('feature-u');
export default {
  createFeature,
  launchApp,
  expandWithFassets,
  fassetValidations,
  useFassets,
  withFassets,
  FassetsContext,
  assertNoRootAppElm,
  createAspect,
  extendAspectProperty,
  extendFeatureProperty,
};

