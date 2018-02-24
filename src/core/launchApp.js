import isFunction           from 'lodash.isfunction';
import verify               from '../util/verify';
import {isAspectProperty}   from '../extend/createAspect';
import {isFeatureProperty}  from './createFeature';


/**
 * Launch an application by assembling the supplied features, driving
 * the configuration of the frameworks in use _(as orchestrated by the
 * supplied set of plugable Aspects)_.
 *
 * For more information _(with examples)_, please refer to
 * {{book.guide.detail_launchingApp}}.
 *
 * **Please Note** this function uses named parameters.
 *
 * @param {Aspect[]} [aspects] the set of plugable Aspects that extend
 * **feature-u**, integrating other frameworks to match your specific
 * run-time stack.<br/><br/>
 * 
 * When NO Aspects are supplied _(an atypical case)_, only the very
 * basic **feature-u** characteristics are in effect (like publicFace
 * and life-cycle hooks).
 *
 * @param {Feature[]} features the features that comprise this
 * application.
 *
 * @param {registerRootAppElmCB} registerRootAppElm the callback hook
 * that registers the supplied root application element to the specific
 * React framework used in the app.<br/><br/>
 * 
 * Because this registration is accomplished by app-specific code,
 * **feature-u** can operate in any of the react platforms, such as:
 * {{book.ext.react}} web, {{book.ext.reactNative}},
 * {{book.ext.expo}}, etc.<br/><br/>
 * 
 * Please refer to {{book.guide.detail_reactRegistration}} for more
 * details and complete examples.
 *
 * @return {App} the App object used to promote
 * {{book.guide.crossCom}}.
 */
export default function launchApp({aspects=[],
                                   features,
                                   registerRootAppElm,
                                   ...unknownArgs}={}) {

  // validate launchApp() parameters
  const check = verify.prefix('launchApp() parameter violation: ');

  // ... aspects
  const aspectMap = op.alch.genesis(aspects);

  // ... features
  check(features,                'features is required');
  check(Array.isArray(features), 'features must be a Feature[] array');

  // ... registerRootAppElm
  check(registerRootAppElm,             'registerRootAppElm is required');
  check(isFunction(registerRootAppElm), 'registerRootAppElm must be a function');

  // ... unrecognized named parameter
  const unknownArgKeys = Object.keys(unknownArgs);
  check(unknownArgKeys.length === 0,  `unrecognized named parameter(s): ${unknownArgKeys}`);

  // ... unrecognized positional parameter
  check(arguments.length === 1,  'unrecognized positional parameters (only named parameters can be specified)');

  // peform "Aspect" property validation
  op.helper.validateAspectProperties(aspects);

  // peform "Feature" property validation
  op.alch.validateFeatureContent(features, aspectMap);

  // prune to activeFeatures, insuring all feature.names are unique
  const activeFeatures = op.helper.pruneActiveFeatures(features);

  // create our App object containing the publicFace (used in cross-communication between features)
  const app = op.helper.createApp(activeFeatures);

  // expand the feature content of any aspect that relies on managedExpansion()
  // ... AND perform a delayed validation, once expansion has occurred
  op.alch.expandFeatureContent(app, activeFeatures, aspects);

  // assemble content of each aspect across all features
  op.alch.assembleFeatureContent(app, activeFeatures, aspects);

  // assemble resources for each aspect across all other aspects, ONCE ALL aspects have assembled their feature content
  op.alch.assembleAspectResources(app, aspects);

  // define our rootAppElm via DOM injections from a combination of Aspects/Features
  // ... also apply Feature.appWillStart() life-cycle hook
  const rootAppElm = op.helper.defineRootAppElm(app, activeFeatures, aspects);

  // start our app by registering our rootAppElm to the appropriate react framework
  // ... because this is accomplished by app-specific code, 
  //     feature-u can operate in any number of containing react frameworks,
  //     like: React Web, React Native, Expo, etc.
  registerRootAppElm(rootAppElm);

  // apply Feature.appDidStart() life-cycle hook
  op.flch.appDidStart(app, activeFeatures, aspects);

  // expose our new App object (used in feature cross-communication)
  return app;
}



//***
//*** Specification: registerRootAppElmCB
//***

/**
 * The {{book.api.launchApp}} callback hook that registers the
 * supplied root application element to the specific React framework
 * used in the app.
 *
 * Because this registration is accomplished by app-specific code,
 * **feature-u** can operate in any of the React platforms, such as:
 * {{book.ext.react}} web, {{book.ext.reactNative}},
 * {{book.ext.expo}}, etc.
 * 
 * Please refer to {{book.guide.detail_reactRegistration}} for more
 * details and complete examples.
 *
 * @callback registerRootAppElmCB
 * 
 * @param {reactElm} rootAppElm - the root application element to be
 * registered.
 *
 * @return void
 */



//***
//*** Specification: App
//***

/**
 * @typedef {Object} App
 *
 * The App object _(emitted from {{book.api.launchApp}})_ facilitates
 * {{book.guide.crossCom}} by accumulating the Public API of all
 * features, through named feature nodes structured as follows:
 * 
 * ```js
 * App.{featureName}.{publicFace}
 * ```
 * 
 * For more information, please refer to
 * {{book.guide.crossCom_publicFaceApp}} and
 * {{book.guide.detail_appObject}}.
 */



//***
//*** Operations Bundle (broken out for testability)
//***

/*
 * A bundle of launchApp() operations (i.e. functions)
 *  - exported internally
 *  - supporting isolated unit testing
 *
 * Because we use a bundled container, it provides rudimentary
 * testing hooks for things like:
 *  - mocking
 *  - monkey patching
 *  - etc.
 */
export const op = {
  alch:   {}, // aspect-life-cycle-hook  ... see definitions (below)
  flch:   {}, // feature-life-cycle-hook ... see definitions (below)
  helper: {}, // general helpers         ... see definitions (below)
};



//*--------------------------------------------------------------
//* aspect-life-cycle-hook: genesis(aspects): aspectMap
//*--------------------------------------------------------------

op.alch.genesis = function(aspects) {

  const check = verify.prefix('launchApp() parameter violation: ');

  check(Array.isArray(aspects), 'aspects (when supplied) must be an Aspect[] array');

  // our convenient hash of aspects
  // ... keyed by aspectName
  //     aspectMap[aspectName]: aspect
  const aspectMap = aspects.reduce( (accum, aspect) => {
    // the set of aspects in use MUST have unique names
    if (accum[aspect.name]) {
      check(false, `supplied aspects contain a NON-unique name: '${aspect.name}'`);
    }

    // allow each aspect to perform Aspect related initialization and validation
    const errMsg = aspect.genesis();
    check(!errMsg, errMsg); // non-null is considered a validation error

    // maintain our aspect hash
    accum[aspect.name] = aspect;
    return accum;
  }, {});

  return aspectMap;
};



//*---------------------------------------------------
//* helper: validateAspectProperties(aspects): void
//*---------------------------------------------------

op.helper.validateAspectProperties = function(aspects) {

  // peform "Aspect" property validation
  // NOTE 1: This is done here rather than createAspect(), because 
  //         all Aspects need to be expanded (i.e. imported) for any extendAspectProperty() to be executed)
  //         ... this will have been done by the time launchApp() is executed!!
  // NOTE 2: The original source of this error is in createAspect(), 
  //         so we prefix any errors as such!
  const check = verify.prefix('createAspect() parameter violation: ');

  aspects.forEach( aspect => {       // for each aspect
    for (const propName in aspect) { // iterate over the aspects props

      // handle unrecognized Aspect.property
      // ... NOTE: Aspect extended propertis have already been added to this isAspectProperty() list
      //           via extendAspectProperty() 
      //               executed globally during the in-line expansion of the extending Aspect
      //               SO it is in the list at this time!!
      check(isAspectProperty(propName), `Aspect.name: '${aspect.name}' contains unrecognized property: ${propName} ... no Aspect is registered to handle this!`);
    }
  });
};



//*-----------------------------------------------------------------------------
//* aspect-life-cycle-hook: validateFeatureContent(features, aspectMap): void
//*-----------------------------------------------------------------------------

op.alch.validateFeatureContent = function(features, aspectMap) {

  // peform "Feature" property validation
  // NOTE 1: This is done here rather than createFeature(), because it's the aspect's
  //         responsibility, and this is the spot where we have aspect context.
  // NOTE 2: The original source of this error is in createFeature(), 
  //         so we prefix any errors as such!
  const check = verify.prefix('createFeature() parameter violation: ');

  features.forEach( feature => {      // for each feature
    for (const propName in feature) { // iterate over the features props

      // we only validate non built-in keywords
      // ... built-ins are validated by createFeature()
      // ... these extra props will be processed by an Aspect
      //     ... an error condition if if no Aspect is registered to handle it
      // ... NOTE: Aspect extended propertis have already been added to this isFeatureProperty() list
      //           via extendFeatureProperty() 
      //               executed globally during the in-line expansion of the extending Aspect
      //               SO it is in the list at this time!!
      if (!isFeatureProperty(propName)) {

        // locate the aspect that will process this item
        const aspect = aspectMap[propName];

        // handle unrecognized aspect
        check(aspect, `Feature.name: '${feature.name}' contains unrecognized property: ${propName} ... no Aspect is registered to handle this!`);

        // delay validation when expansion is needed
        // ... is accomplished in subsequent step (after expansion has occurred)
        // ... this means that validation logic in aspect does NOT have to worry about .managedExpansion
        if (!feature[propName].managedExpansion) {

          // allow the aspect to validate it's content
          // ... ex: a reducer MUST be a function (or managedExpansion) and it must have a shape!
          const errMsg = aspect.validateFeatureContent(feature); // validate self's aspect on supplied feature (which is known to contain this aspect)
          check(!errMsg, errMsg); // non-null is considered a validation error
        }
      }
    }
  });
};



//*----------------------------------------------------------------
//* helper: pruneActiveFeatures(features): activeFeatures
//*----------------------------------------------------------------

op.helper.pruneActiveFeatures = function(features) {

  const check = verify.prefix('launchApp() parameter violation: ');

  // prune to activeFeatures, insuring all feature.names are unique
  const allFeatureNames = {};
  const activeFeatures = features.filter( feature => {
    check(!allFeatureNames[feature.name], `feature.name: '${feature.name}' is NOT unique`);
    allFeatureNames[feature.name] = true;
    return feature.enabled;
  });

  return activeFeatures;
};



//*------------------------------------------
//* helper: createApp(activeFeatures): app
//*------------------------------------------

op.helper.createApp = function(activeFeatures) {

  // create our App object containing the publicFace (used in cross-communication between features)
  const app =  {
    // EX:
    // featureA: {
    //   sel: {
    //     abc(appState),
    //   },
    //   actions: {
    //     xyz(...),
    //   },
    //   api: {
    //     fooBar(...),
    //   },
    // },
    // featureB: {
    //   ...
    // },
    // etc: {
    //   ...
    // },
  };

  // resolve/promote the publicFace of ALL active features - held in our app object!
  // ... this is acomplished FIRST (i.e. before other feature aspects)
  //     so the expansion of other feature apects can use it
  // ... this eliminates order dependency issues related to feature
  //     expansion - EVEN in code that is expanded in-line
  activeFeatures.forEach( feature => {
    // promote the feature publicFace in our app
    // ... NOTE: createFeature() defaults this to an empty object
    //           (providing a consistent indicator that the feature is present/enabled)
    app[feature.name] = feature.publicFace;
  });

  return app;
};



//*------------------------------------------------------------------------------------
//* aspect-life-cycle-hook: expandFeatureContent(app, activeFeatures, aspects): void
//*------------------------------------------------------------------------------------

op.alch.expandFeatureContent = function(app, activeFeatures, aspects) {

  // expand the feature content of any aspect that relies on managedExpansion()
  // ... AND perform a delayed validation, once expansion has occurred
  // NOTE: The original source of this error is in createFeature(), 
  //       so we prefix any errors as such!
  const check = verify.prefix('createFeature() parameter violation: ');

  aspects.forEach( aspect => {
    activeFeatures.forEach( feature => {
      if (feature[aspect.name] && feature[aspect.name].managedExpansion) {

        let errMsg = null;

        // perform the expansion
        // ... a simple process, BUT provides the hook to do more (ex: reducer tranfer of slice)
        errMsg = aspect.expandFeatureContent(app, feature);
        // ... specialized validation, over-and-above the validateFeatureContent() hook
        check(!errMsg, errMsg); // truthy is considered a validation error

        // perform our delayed validation
        errMsg = aspect.validateFeatureContent(feature); // validate self's aspect on supplied feature (which is known to contain this aspect)
        check(!errMsg, errMsg); // truthy is considered a validation error
      }
    });
  });
};



//*--------------------------------------------------------------------------------------
//* aspect-life-cycle-hook: assembleFeatureContent(app, activeFeatures, aspects): void
//*--------------------------------------------------------------------------------------

op.alch.assembleFeatureContent = function(app, activeFeatures, aspects) {

  // assemble content of each aspect across all features
  // ... retaining needed state for subsequent ops
  aspects.forEach( aspect => {
    aspect.assembleFeatureContent(app, activeFeatures);
  });
};



//*-----------------------------------------------------------------------
//* aspect-life-cycle-hook: assembleAspectResources(app, aspects): void
//*-----------------------------------------------------------------------

op.alch.assembleAspectResources = function(app, aspects) {

  // assemble resources for each aspect across all other aspects, ONCE ALL aspects have assembled their feature content
  // ... retaining needed state for subsequent ops
  aspects.forEach( aspect => {
    aspect.assembleAspectResources(app, aspects);
  });
};



//*----------------------------------------------------------------------
//* helper: defineRootAppElm(app, activeFeatures, aspects): rootAppElm
//*----------------------------------------------------------------------

op.helper.defineRootAppElm = function(app, activeFeatures, aspects) {

  // define our curRootAppElm via DOM injections from a combination of Aspects/Features
  let rootAppElm = null; // we start with nothing

  // FIRST: DOM injection via Aspect.initialRootAppElm(app, curRootAppElm)
  rootAppElm = op.alch.initialRootAppElm(app, aspects, rootAppElm);

  // SECOND: DOM injection via Feature.appWillStart() life-cycle hook
  rootAppElm = op.flch.appWillStart(app, activeFeatures, rootAppElm);

  // THIRD: DOM injection via Aspect.injectRootAppElm()
  rootAppElm = op.alch.injectRootAppElm(app, aspects, rootAppElm);

  // NOTE: We do NOT validate rootAppElm to insure it is non-null!
  //       - at first glance it would appear that a null rootAppElm would render NOTHING
  //       - HOWEVER, ULTIMATLY the app code (found in the registerRootAppElm() hook) 
  //         can display whatever it wants ... a given app may have chosen to inject it's own rootAppElm
  return rootAppElm;

};



//*--------------------------------------------------------------------------------------
//* aspect-life-cycle-hook: initialRootAppElm(app, aspects, curRootAppElm): rootAppElm
//*--------------------------------------------------------------------------------------

op.alch.initialRootAppElm = function(app, aspects, curRootAppElm) {

  // DOM injection via Aspect.initialRootAppElm(app, curRootAppElm)
  const rootAppElm = aspects.reduce( (curRootAppElm, aspect) => aspect.initialRootAppElm(app, curRootAppElm),
                                     curRootAppElm );
  return rootAppElm;
};



//*-----------------------------------------------------------------------------------------
//* feature-life-cycle-hook: appWillStart(app, activeFeatures, curRootAppElm): rootAppElm
//*-----------------------------------------------------------------------------------------

op.flch.appWillStart = function(app, activeFeatures, curRootAppElm) {

  // DOM injection via Feature.appWillStart() life-cycle hook
  // - can perform ANY initialization
  // - AND supplement our top-level content (using a non-null return)
  //   ... wedged between the two Aspect DOM injections (in support of various Aspect needs)
  const rootAppElm = activeFeatures.reduce( (curRootAppElm, feature) => feature.appWillStart({app, curRootAppElm}) || curRootAppElm,
                                            curRootAppElm );
  return rootAppElm;
};



//*-------------------------------------------------------------------------------------
//* aspect-life-cycle-hook: injectRootAppElm(app, aspects, curRootAppElm): rootAppElm
//*-------------------------------------------------------------------------------------

op.alch.injectRootAppElm = function(app, aspects, curRootAppElm) {

  // DOM injection via Aspect.injectRootAppElm()
  const rootAppElm = aspects.reduce( (curRootAppElm, aspect) => aspect.injectRootAppElm(app, curRootAppElm),
                                     curRootAppElm );
  return rootAppElm;
};



//*----------------------------------------------------------------------------
//* feature-life-cycle-hook: appDidStart(app, activeFeatures, aspects): void
//*----------------------------------------------------------------------------

op.flch.appDidStart = function(app, activeFeatures, aspects) {

  // locate the redux app store (if any) from our aspects
  // ... used as a convenience to pass appState/dispatch to appDidStart()
  // ... we define this from the cross-aspect redux method: Aspect.getReduxStore()
  const reduxAspect = aspects.find( aspect => aspect.getReduxStore ? true : false );
  const [appState, dispatch] = reduxAspect 
                                ? [reduxAspect.getReduxStore().getState(), reduxAspect.getReduxStore().dispatch]
                                : [undefined, undefined];

  // apply Feature.appDidStart() life-cycle hooks
  // console.log(`xx launchApp ... feature appDidStart(): `, {appState, dispatch});
  activeFeatures.forEach( feature => feature.appDidStart({app, appState, dispatch}) );
};
