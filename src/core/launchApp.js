import React                from 'react';
import isFunction           from 'lodash.isfunction';
import verify               from '../util/verify';
import {isAspectProperty}   from '../extend/createAspect';
import {isFeatureProperty}  from './createFeature';
import createFassets        from './createFassets';
import {FassetsContext}     from './withFassets';
import logf                 from '../util/logf';

let executionOrder = 1; // running counter of execution order of life-cycle-hooks (unit-test related)

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
 * basic **feature-u** characteristics are in effect (like fassets
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

 * @return {Fassets} the Fassets object used in 
 * cross-feature-communication. ?xRETRO-TO-fassets
 *
 * @function launchApp
 */
export default function launchApp({aspects=[],
                                   features,
                                   registerRootAppElm,
                                   ...unknownArgs}={}) {

  logf('STARTING: - your application is now starting up');

  // reset: running counter of execution order of life-cycle-hooks (unit-test related)
  executionOrder = 1;

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

  // ?xRETRO-TO-fassets ... OBSOLETE THIS
  // ? // create our App object containing the publicFace (used in cross-communication between features)
  // ? const app = op.helper.createApp(activeFeatures);
  // ?xRETRO-TO-fassets ... NEW: invoke createFassets() -AND- gen error if publicFace is still used
  // accumulate all feature assets in our Fassets object (used in cross-feature-communication)
  const fassets = createFassets(activeFeatures);

  // expand the feature content of any aspect that relies on managedExpansion()
  // ... AND perform a delayed validation, once expansion has occurred
  op.alch.expandFeatureContent(fassets, activeFeatures, aspects);  // ?xRETRO-TO-fassets - param

  // assemble content of each aspect across all features
  op.alch.assembleFeatureContent(fassets, activeFeatures, aspects);  // ?xRETRO-TO-fassets - param

  // assemble resources for each aspect across all other aspects, ONCE ALL aspects have assembled their feature content
  op.alch.assembleAspectResources(fassets, aspects);  // ?xRETRO-TO-fassets - param

  // define our rootAppElm via DOM injections from a combination of Aspects/Features
  // ... also apply Feature.appWillStart() life-cycle hook
  const rootAppElm = op.helper.defineRootAppElm(fassets, activeFeatures, aspects);  // ?xRETRO-TO-fassets - param

  // start our app by registering our rootAppElm to the appropriate react framework
  // NOTE 1: Because this is accomplished by app-specific code, 
  //         feature-u can operate in any number of containing react frameworks,
  //         like React Web, React Native, Expo, etc.
  // NOTE 2: We delay this process (via timeout) making "import fassets" feasible
  //         to UI rendering functions ... such as redux connect().
  //         This technique allows launchApp() to complete, and the fassets object
  //         to have definition (via application code export)
  //         for use in these UI rendering functions.
  //         HOWEVER: We subsequently discovered that this timeout is 
  //                  NOT compatible with Expo (or react-native - not sure which)
  //                  ERROR: Module AppRegistry is not a registered callable module (calling runApplication)
  //                  EVIDENTLY the designated expo mainline cannot run to completion
  //                  without first registering a component in some way
  //                  ... ex: Expo.registerRootComponent(...);
//setTimeout(() => { // remove timeout (see "NOTE 2" above)
    registerRootAppElm(rootAppElm, fassets); // ?xRETRO-TO-fassets enhance this API by passing fassets (allowing client to inject their own <FassetsContext.Provider> for a null rootAppElm)
//}, 0);

  // apply Feature.appDidStart() life-cycle hook
  op.flch.appDidStart(fassets, activeFeatures, aspects);  // ?xRETRO-TO-fassets - param

  logf('COMPLETE: your application has now started');

  // ?xRETRO-TO-fassets
  // expose our new App object (used in feature cross-communication)
  return fassets;
}



//***
//*** A secret diagnostic hook attached to the launchApp() function.
//***

launchApp.diag = {
  logf, // allow client to enable feature-u logs via: launchApp.diag.logf.enable();
};



//***
//*** Specification: registerRootAppElmCB
//***

// ?xRETRO-TO-fassets enhance this API by passing fassets (allowing client to inject their own <FassetsContext.Provider> for a null rootAppElm)

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
 * @param {Fassets} fassets the Fassets object used in cross-feature-communication
 * (rarely needed except to allow client to inject their own
 * FassetsContext.Provider for a null rootAppElm).
 *
 * @return void
 */



// ? //***
// ? //*** Specification: App  // ?xRETRO-TO-fassets - OBSOLETE ... delete it ... AND retrofit all api.App references to api.Fassets
// ? //***
// ? 
// ? /**
// ?  * @typedef {Object} App
// ?  *
// ?  * The App object _(emitted from {{book.api.launchApp}})_ facilitates
// ?  * {{book.guide.crossCom}} by accumulating the Public API of all
// ?  * features, through named feature nodes structured as follows:
// ?  * 
// ?  * ```js
// ?  * App.{featureName}.{publicFace}
// ?  * ```
// ?  * 
// ?  * For more information, please refer to
// ?  * {{book.guide.crossCom_publicFaceApp}} and
// ?  * {{book.guide.detail_appObject}}.
// ?  */



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

  // maintain: running counter of execution order of life-cycle-hooks (unit-test related)
  op.alch.genesis.executionOrder = executionOrder++;

  const check = verify.prefix('launchApp() parameter violation: ');

  check(Array.isArray(aspects), 'aspects (when supplied) must be an Aspect[] array');

  logf('the following Aspects are in effect: ' +
       aspects.map( (aspect) => `\n  Aspect.name:${aspect.name}` ));

  // log summary
  const hookCount   = aspects.reduce( (count, aspect) => aspect.genesis ? count+1 : count, 0);
  const hookSummary = aspects.map( (aspect) => `\n  Aspect.name:${aspect.name}${aspect.genesis ? ' <-- defines: genesis()' : ''}` );
  logf(`aspect-life-cycle-hook ... PROCESSING: Aspect.genesis() ... ${hookCount} hooks:${hookSummary}`);

  // our convenient hash of aspects
  // ... keyed by aspectName
  //     aspectMap[aspectName]: aspect
  const aspectMap = aspects.reduce( (accum, aspect) => {
    // the set of aspects in use MUST have unique names
    if (accum[aspect.name]) {
      check(false, `supplied aspects contain a NON-unique name: '${aspect.name}'`);
    }

    // allow each aspect to perform Aspect related initialization and validation
    if (aspect.genesis) {
      logf(`aspect-life-cycle-hook ... Aspect.name:${aspect.name} ... invoking it's defined Aspect.genesis()`);
      const errMsg = aspect.genesis();
      check(!errMsg, errMsg); // non-null is considered a validation error
    }

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
      //               executed early within the extending Aspect (i.e. in genesis())
      //               SO it is in the list at this time!!
      check(isAspectProperty(propName), `Aspect.name: '${aspect.name}' contains unrecognized property: ${propName} ... no Aspect is registered to handle this!`);
    }
  });
};



//*-----------------------------------------------------------------------------
//* aspect-life-cycle-hook: validateFeatureContent(features, aspectMap): void
//*-----------------------------------------------------------------------------

op.alch.validateFeatureContent = function(features, aspectMap) {

  // NOTE: nothing to logf() here BECAUSE entire result is potential EXCEPTIONS

  // maintain: running counter of execution order of life-cycle-hooks (unit-test related)
  op.alch.validateFeatureContent.executionOrder = executionOrder++;

  // log summary
  const aspects = []; // convert aspectMap to array ... do this RATHER than change API JUST to accommodate logging
  for (const propKey in aspectMap) {
    aspects.push(aspectMap[propKey]);
  }
  const hookCount   = aspects.reduce( (count, aspect) => aspect.validateFeatureContent ? count+1 : count, 0);
  const hookSummary = aspects.map( (aspect) => `\n  Aspect.name:${aspect.name}${aspect.validateFeatureContent ? ' <-- defines: validateFeatureContent()' : ''}` );
  logf(`aspect-life-cycle-hook ... PROCESSING: Aspect.validateFeatureContent() ... ${hookCount} hooks:${hookSummary}`);

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
      //               executed early within the extending Aspect (i.e. in genesis())
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
          logf(`aspect-life-cycle-hook ... Aspect.name:${aspect.name} ... invoking it's required Aspect.validateFeatureContent() on Feature.name:${feature.name}'s Feature.${aspect.name}`);
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

  logf('the following Features were supplied: ' +
       features.map( (feature) => `\n  Feature.name:${feature.name}${feature.enabled ? '' : '  <<< NOT ACTIVE'}`));
  logf('the following Features are in effect (i.e. active): ' +
       activeFeatures.map( (feature) => `\n  Feature.name:${feature.name}` ));

  return activeFeatures;
};



//*------------------------------------------
//* helper: createApp(activeFeatures): app  // ?xRETRO-TO-fassets - OBSOLETE
//*------------------------------------------

// ? op.helper.createApp = function(activeFeatures) {
// ? 
// ?   // create our App object containing the publicFace (used in cross-communication between features)
// ?   const app =  {
// ?     // EX:
// ?     // featureA: {
// ?     //   sel: {
// ?     //     abc(appState),
// ?     //   },
// ?     //   actions: {
// ?     //     xyz(...),
// ?     //   },
// ?     //   api: {
// ?     //     fooBar(...),
// ?     //   },
// ?     // },
// ?     // featureB: {
// ?     //   ...
// ?     // },
// ?     // etc: {
// ?     //   ...
// ?     // },
// ?   };
// ? 
// ?   // resolve/promote the publicFace of ALL active features - held in our app object!
// ?   // ... this is acomplished FIRST (i.e. before other feature aspects)
// ?   //     so the expansion of other feature apects can use it
// ?   // ... this eliminates order dependency issues related to feature
// ?   //     expansion - EVEN in code that is expanded in-line
// ?   activeFeatures.forEach( feature => {
// ?     // promote the feature publicFace in our app
// ?     // ... NOTE: default to empty object, 
// ?     //           providing a consistent indicator that the feature is present/enabled
// ?     app[feature.name] = feature.publicFace || {};
// ?   });
// ? 
// ?   // log summary
// ?   const hookCount   = activeFeatures.reduce( (count, feature) => feature.publicFace ? count+1 : count, 0);
// ?   const hookSummary = activeFeatures.map( (feature) => `\n  Feature.name:${feature.name}${feature.publicFace ? ' <-- defines: publicFace' : ''}` );
// ?   logf(`cross-feature-communication ... INTERPRETING: Feature.publicFace ... ${hookCount} hooks:${hookSummary}`);
// ? 
// ?   logf('cross-feature-communication ... the following app is in effect: ', app);
// ? 
// ?   return app;
// ? };



//*------------------------------------------------------------------------------------
//* aspect-life-cycle-hook: expandFeatureContent(fassets, activeFeatures, aspects): void // ?xRETRO-TO-fassets - param
//*------------------------------------------------------------------------------------

op.alch.expandFeatureContent = function(fassets, activeFeatures, aspects) { // ?xRETRO-TO-fassets - param

  // maintain: running counter of execution order of life-cycle-hooks (unit-test related)
  op.alch.expandFeatureContent.executionOrder = executionOrder++;

  // log summary
  const hookCount   = aspects.reduce( (count, aspect) => aspect.expandFeatureContent ? count+1 : count, 0);
  const hookSummary = aspects.map( (aspect) => `\n  Aspect.name:${aspect.name}${aspect.expandFeatureContent ? ' <-- defines: expandFeatureContent()' : ''}` );
  logf(`resolving managedExpansion() ... either by DEFAULT-PROCESS -OR- aspect-life-cycle-hook PROCESSING: Aspect.expandFeatureContent() ... ${hookCount} hooks:${hookSummary}`);

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
        if (aspect.expandFeatureContent) {
          // aspect wishes to do this
          // ... a simple process, BUT provides the hook to do more (ex: reducer tranfer of slice)
          logf(`resolving managedExpansion() [by aspect-life-cycle-hook Aspect.name:${aspect.name}'s Aspect.expandFeatureContent()] ON Feature.name:${feature.name}'s Feature.${aspect.name} AspectContent`);

          errMsg = aspect.expandFeatureContent(fassets, feature); // ?xRETRO-TO-fassets - param
          // ... specialized validation, over-and-above the validateFeatureContent() hook
          check(!errMsg, errMsg); // truthy is considered a validation error
        }
        else {
          logf(`resolving managedExpansion() [by DEFAULT-PROCESS] ON Feature.name:${feature.name}'s Feature.${aspect.name} AspectContent`);
          // default implementation (when not done by the aspect)
          feature[aspect.name] = feature[aspect.name](fassets); // ?xRETRO-TO-fassets - param
        }

        // perform our delayed validation
        logf(`aspect-life-cycle-hook ... Aspect.name:${aspect.name} ... invoking it's required Aspect.validateFeatureContent() on Feature.name:${feature.name}'s Feature.${aspect.name} ... DELAYED from managedExpansion()`);
        errMsg = aspect.validateFeatureContent(feature); // validate self's aspect on supplied feature (which is known to contain this aspect)
        check(!errMsg, errMsg); // truthy is considered a validation error
      }
    });
  });
};



//*--------------------------------------------------------------------------------------
//* aspect-life-cycle-hook: assembleFeatureContent(fassets, activeFeatures, aspects): void // ?xRETRO-TO-fassets - param
//*--------------------------------------------------------------------------------------

op.alch.assembleFeatureContent = function(fassets, activeFeatures, aspects) { // ?xRETRO-TO-fassets - param

  // maintain: running counter of execution order of life-cycle-hooks (unit-test related)
  op.alch.assembleFeatureContent.executionOrder = executionOrder++;

  // log summary
  const hookCount   = aspects.reduce( (count, aspect) => aspect.assembleFeatureContent ? count+1 : count, 0);
  const hookSummary = aspects.map( (aspect) => `\n  Aspect.name:${aspect.name}${aspect.assembleFeatureContent ? ' <-- defines: assembleFeatureContent()' : ''}` );
  logf(`aspect-life-cycle-hook ... PROCESSING: Aspect.assembleFeatureContent() ... ${hookCount} hooks:${hookSummary}`);

  // assemble content of each aspect across all features
  // ... retaining needed state for subsequent ops
  aspects.forEach( aspect => {
    logf(`aspect-life-cycle-hook ... Aspect.name:${aspect.name} ... invoking it's required Aspect.assembleFeatureContent()`);
    aspect.assembleFeatureContent(fassets, activeFeatures); // ?xRETRO-TO-fassets - param
  });
};



//*-----------------------------------------------------------------------
//* aspect-life-cycle-hook: assembleAspectResources(fassets, aspects): void // ?xRETRO-TO-fassets - param
//*-----------------------------------------------------------------------

op.alch.assembleAspectResources = function(fassets, aspects) { // ?xRETRO-TO-fassets - param

  // maintain: running counter of execution order of life-cycle-hooks (unit-test related)
  op.alch.assembleAspectResources.executionOrder = executionOrder++;

  // log summary
  const hookCount   = aspects.reduce( (count, aspect) => aspect.assembleAspectResources ? count+1 : count, 0);
  const hookSummary = aspects.map( (aspect) => `\n  Aspect.name:${aspect.name}${aspect.assembleAspectResources ? ' <-- defines: assembleAspectResources()' : ''}` );
  logf(`aspect-life-cycle-hook ... PROCESSING: Aspect.assembleAspectResources() ... ${hookCount} hooks:${hookSummary}`);

  // assemble resources for each aspect across all other aspects, ONCE ALL aspects have assembled their feature content
  // ... retaining needed state for subsequent ops
  aspects.forEach( aspect => {
    if (aspect.assembleAspectResources) {
      logf(`aspect-life-cycle-hook ... Aspect.name:${aspect.name} ... invoking it's defined Aspect.assembleAspectResources()`);
      aspect.assembleAspectResources(fassets, aspects); // ?xRETRO-TO-fassets - param
    }
  });
};



//*----------------------------------------------------------------------
//* helper: defineRootAppElm(fassets, activeFeatures, aspects): rootAppElm // ?xRETRO-TO-fassets - param
//*----------------------------------------------------------------------

op.helper.defineRootAppElm = function(fassets, activeFeatures, aspects) { // ?xRETRO-TO-fassets - param

  // define our curRootAppElm via DOM injections from a combination of Aspects/Features
  let rootAppElm = null; // we start with nothing

  logf('defining-rootAppElm ... starting process, rootAppElm: null');

  // FIRST: DOM injection via Aspect.initialRootAppElm(fassets, curRootAppElm) // ?xRETRO-TO-fassets - param
  rootAppElm = op.alch.initialRootAppElm(fassets, aspects, rootAppElm); // ?xRETRO-TO-fassets - param

  // SECOND: DOM injection via Feature.appWillStart() life-cycle hook
  rootAppElm = op.flch.appWillStart(fassets, activeFeatures, rootAppElm); // ?xRETRO-TO-fassets - param

  // THIRD: DOM injection via Aspect.injectRootAppElm()
  rootAppElm = op.alch.injectRootAppElm(fassets, aspects, rootAppElm); // ?xRETRO-TO-fassets - param

  // ?xRETRO-TO-fassets - NEW LOGIC
  // FOURTH: inject our <FassetsContext.Provider> in support of withFassets() HoC
  //         NOTE: We conditionally do this if a rootAppElm has been defined.
  //               Otherwise, the App is responible for this in the registerRootAppElm() hook.
  if (rootAppElm) {
    rootAppElm = <FassetsContext.Provider value={fassets}>{rootAppElm}</FassetsContext.Provider>;
  }

  // NOTE: We do NOT validate rootAppElm to insure it is non-null!
  //       - at first glance it would appear that a null rootAppElm would render NOTHING
  //       - HOWEVER, ULTIMATLY the app code (found in the registerRootAppElm() hook) 
  //         can display whatever it wants ... a given app may have chosen to inject it's own rootAppElm
  logf('defining-rootAppElm ... complete, rootAppElm: ', logf.elm2html(rootAppElm));
  return rootAppElm;

};



//*--------------------------------------------------------------------------------------
//* aspect-life-cycle-hook: initialRootAppElm(fassets, aspects, curRootAppElm): rootAppElm // ?xRETRO-TO-fassets - param
//*--------------------------------------------------------------------------------------

op.alch.initialRootAppElm = function(fassets, aspects, curRootAppElm) { // ?xRETRO-TO-fassets - param

  // maintain: running counter of execution order of life-cycle-hooks (unit-test related)
  op.alch.initialRootAppElm.executionOrder = executionOrder++;

  // log summary
  const hookCount   = aspects.reduce( (count, aspect) => aspect.initialRootAppElm ? count+1 : count, 0);
  const hookSummary = aspects.map( (aspect) => `\n  Aspect.name:${aspect.name}${aspect.initialRootAppElm ? ' <-- defines: initialRootAppElm()' : ''}` );
  logf(`aspect-life-cycle-hook ... PROCESSING: Aspect.initialRootAppElm() ... ${hookCount} hooks:${hookSummary}`);

  // DOM injection via Aspect.initialRootAppElm(fassets, curRootAppElm) // ?xRETRO-TO-fassets - param
  return aspects.reduce( (curRootAppElm, aspect) => {

    if (aspect.initialRootAppElm) {

      logf(`aspect-life-cycle-hook ... Aspect.name:${aspect.name} ... invoking it's defined Aspect.initialRootAppElm()`);
      const rootAppElm = aspect.initialRootAppElm(fassets, curRootAppElm); // ?xRETRO-TO-fassets - param

      if (rootAppElm !== curRootAppElm) {
        logf(`defining-rootAppElm ... Aspect.name:${aspect.name}'s Aspect.initialRootAppElm() CHANGED rootAppElm: `,
             logf.elm2html(rootAppElm));
      }

      return rootAppElm;
    }
    else {
      return curRootAppElm;
    }

  }, curRootAppElm );
};



//*-----------------------------------------------------------------------------------------
//* feature-life-cycle-hook: appWillStart(fassets, activeFeatures, curRootAppElm): rootAppElm // ?xRETRO-TO-fassets - param
//*-----------------------------------------------------------------------------------------

op.flch.appWillStart = function(fassets, activeFeatures, curRootAppElm) { // ?xRETRO-TO-fassets - param

  // maintain: running counter of execution order of life-cycle-hooks (unit-test related)
  op.flch.appWillStart.executionOrder = executionOrder++;

  // log summary
  const hookCount   = activeFeatures.reduce( (count, feature) => feature.appWillStart ? count+1 : count, 0);
  const hookSummary = activeFeatures.map( (feature) => `\n  Feature.name:${feature.name}${feature.appWillStart ? ' <-- defines: appWillStart()' : ''}` );
  logf(`feature-life-cycle-hook ... PROCESSING: Feature.appWillStart() ... ${hookCount} hooks:${hookSummary}`);

  // DOM injection via Feature.appWillStart() life-cycle hook
  // - can perform ANY initialization
  // - AND supplement our top-level content (using a non-null return)
  //   ... wedged between the two Aspect DOM injections (in support of various Aspect needs)
  return activeFeatures.reduce( (curRootAppElm, feature) => {

    if (feature.appWillStart) {

      logf(`feature-life-cycle-hook ... Feature.name:${feature.name} ... invoking it's defined Feature.appWillStart()`);
      const rootAppElm = feature.appWillStart({fassets, curRootAppElm}) || curRootAppElm; // ?xRETRO-TO-fassets - param NOTE: Feature.appWillStart uses a "fassets" NAMED PAREMETER!!!

      if (rootAppElm !== curRootAppElm) {
        logf(`defining-rootAppElm ... Feature.name:${feature.name}'s Feature.appWillStart() CHANGED rootAppElm: `,
             logf.elm2html(rootAppElm));
      }

      return rootAppElm;
    }
    else {
      return curRootAppElm;
    }

  }, curRootAppElm );
};



//*-------------------------------------------------------------------------------------
//* aspect-life-cycle-hook: injectRootAppElm(fassets, aspects, curRootAppElm): rootAppElm // ?xRETRO-TO-fassets - param
//*-------------------------------------------------------------------------------------

op.alch.injectRootAppElm = function(fassets, aspects, curRootAppElm) { // ?xRETRO-TO-fassets - param

  // maintain: running counter of execution order of life-cycle-hooks (unit-test related)
  op.alch.injectRootAppElm.executionOrder = executionOrder++;

  // log summary
  const hookCount   = aspects.reduce( (count, aspect) => aspect.injectRootAppElm ? count+1 : count, 0);
  const hookSummary = aspects.map( (aspect) => `\n  Aspect.name:${aspect.name}${aspect.injectRootAppElm ? ' <-- defines: injectRootAppElm()' : ''}` );
  logf(`aspect-life-cycle-hook ... PROCESSING: Aspect.injectRootAppElm() ... ${hookCount} hooks:${hookSummary}`);

  // DOM injection via Aspect.injectRootAppElm()
  return aspects.reduce( (curRootAppElm, aspect) => {

    if (aspect.injectRootAppElm) {

      logf(`aspect-life-cycle-hook ... Aspect.name:${aspect.name} ... invoking it's defined Aspect.injectRootAppElm()`);
      const rootAppElm = aspect.injectRootAppElm(fassets, curRootAppElm); // ?xRETRO-TO-fassets - param

      if (rootAppElm !== curRootAppElm) {
        logf(`defining-rootAppElm ... Aspect.name:${aspect.name}'s Aspect.injectRootAppElm() CHANGED rootAppElm: `,
             logf.elm2html(rootAppElm));
      }

      return rootAppElm;
    }
    else {
      return curRootAppElm;
    }
    
  }, curRootAppElm );
};



//*----------------------------------------------------------------------------
//* feature-life-cycle-hook: appDidStart(fassets, activeFeatures, aspects): void // ?xRETRO-TO-fassets - param
//*----------------------------------------------------------------------------

op.flch.appDidStart = function(fassets, activeFeatures, aspects) { // ?xRETRO-TO-fassets - param

  // maintain: running counter of execution order of life-cycle-hooks (unit-test related)
  op.flch.appDidStart.executionOrder = executionOrder++;

  // log summary
  const hookCount   = activeFeatures.reduce( (count, feature) => feature.appDidStart ? count+1 : count, 0);
  const hookSummary = activeFeatures.map( (feature) => `\n  Feature.name:${feature.name}${feature.appDidStart ? ' <-- defines: appDidStart()' : ''}` );
  logf(`feature-life-cycle-hook ... PROCESSING: Feature.appDidStart() ... ${hookCount} hooks:${hookSummary}`);

  // locate the redux app store (if any) from our aspects
  // ... used as a convenience to pass appState/dispatch to appDidStart()
  // ... we define this from the cross-aspect redux method: Aspect.getReduxStore()
  const reduxAspect = aspects.find( aspect => aspect.getReduxStore ? true : false );
  const [appState, dispatch] = reduxAspect 
                                ? [reduxAspect.getReduxStore().getState(), reduxAspect.getReduxStore().dispatch]
                                : [undefined, undefined];

  // apply Feature.appDidStart() life-cycle hooks
  activeFeatures.forEach( feature => {
    if (feature.appDidStart) {
      logf(`feature-life-cycle-hook ... Feature.name:${feature.name} ... invoking it's defined Feature.appDidStart()`);
      feature.appDidStart({fassets, appState, dispatch}); // ?xRETRO-TO-fassets - param NOTE: Feature.appDidStart uses a "fassets" NAMED PAREMETER!!!
    }
  });
};
