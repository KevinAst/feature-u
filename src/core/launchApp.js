import isFunction                from 'lodash.isfunction';
import verify                    from '../util/verify';
import {isBuiltInFeatureKeyword} from './createFeature';


/**
 * @function launchApp
 * @description
 *
 * Launch an app by assembling the supplied features, driving the
 * configuration of the frameworks in use, as orchistrated by the
 * supplied set of pluggable apsects.
 *
 * - It manages the setup and configuration of all your feature
 *   aspects, including things like: state management, logic, routing,
 *   etc.
 *
 * - It facilitates app life-cycle methods on the Feature object,
 *   allowing features to manage things like: initialization and
 *   inject root UI elements, etc.
 *
 * - It creates and promotes the App object which contains the
 *   publicFace of all features, facilating a cross-communication
 *   between features.
 *
 * Please refer to the user documenation for more details and complete
 * examples.
 *
 * **Please Note** `launchApp()` accepts named parameters.
 *
 * @param {Aspect[]} [aspects] the set of plugable aspects that extend
 * feature-u, integrating other frameworks to match your specific
 * run-time stack.  When NO aspects are supplied (an atypical case),
 * only the very basic feature-u characteristics are in effect (like
 * publicFace and life-cycle hooks).
 *
 * @param {Feature[]} features the features that comprise this
 * application.
 *
 * @param {registerRootAppElmCB} registerRootAppElm the callback hook
 * that registers the supplied root application element to the specific
 * React framework used in the app.  Because this registration is
 * accomplished by app-specific code, feature-u can operate in any of
 * the react platforms, such as: React Web, React Native, Expo, etc.
 *
 * @return {App} the App object used to promote feature
 * cross-communication.
 */
export default function launchApp({aspects=[],
                                   features,
                                   registerRootAppElm,
                                   ...unknownArgs}={}) {

  // validate launchApp() parameters
  const check = verify.prefix('launchApp() parameter violation: ');

  // ... aspects
  check(Array.isArray(aspects), 'aspects (when supplied) must be an Aspect[] array');
  const aspectMap = aspects.reduce( (accum, aspect) => { // our convenient hash of aspects
    // the seat of aspects in use MUST have unique names
    if (accum[aspect.name]) {
      check(false, `supplied aspects contain a NON-unique name: '${aspect.name}'`);
    }

    // allow each aspect to validate itself (for applied run-time configuration settings)
    const errMsg = aspect.validateConfiguration();
    check(!errMsg, errMsg); // non-null is considered a validation error

    // maintain our convenient hash of aspects
    accum[aspect.name] = aspect;
    return accum;
  }, {});

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


  // peform "Feature" property validation
  // NOTE 1: This is done here rather than createFeature(), because it's the aspect's
  //         responsibility, and this is the spot where we have aspect context.
  // NOTE 2: The original source of this error is in createFeature(), 
  //         so we prefix any errors as such!
  const checkFeature = verify.prefix('createFeature() parameter violation: ');
  features.forEach( feature => {      // for each feature
    for (const propName in feature) { // iterate over the features props
      // we only validate non built-in keywords
      // ... i.e. ones managed by our aspects
      // ... built-ins are validated by createFeature()
      if (!isBuiltInFeatureKeyword(propName)) {

        // locate the aspect that will process this item
        const aspect = aspectMap[propName];

        // handle unrecognized aspect
        checkFeature(aspect, `unrecognized keyword: ${propName} (no aspect is registered to handle this)!`);

        // delay validation when expansion is needed
        // ... is accomplished in subsequent step (after expansion has occurred)
        // ... this means that validation logic in aspect does NOT have to worry about .managedExpansion
        if (!feature[propName].managedExpansion) {

          // allow the aspect to validate it's content
          // ... ex: a reducer MUST be a function (or managedExpansion) and it must have a shape!
          const errMsg = aspect.validateFeatureContent(feature); // validate self's aspect on supplied feature (which is known to contain this aspect)
          checkFeature(!errMsg, errMsg); // non-null is considered a validation error
        }
      }
    }
  });

  // prune to activeFeatures, insuring all feature.names are unique
  const allFeatureNames = {};
  const activeFeatures = features.filter( feature => {
    check(!allFeatureNames[feature.name], `feature.name: '${feature.name}' is NOT unique`);
    allFeatureNames[feature.name] = true;
    return feature.enabled;
  });

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

  // expand the feature content of any aspect that relies on managedExpansion()
  // ... AND perform a delayed validation, once expansion has occurred
  aspects.forEach( aspect => {
    activeFeatures.forEach( feature => {
      if (feature[aspect.name] && feature[aspect.name].managedExpansion) {

        let errMsg = null;

        // perform the expansion
        // ... a simple process, BUT provides the hook to do more (ex: reducer tranfer of slice)
        errMsg = aspect.expandFeatureContent(app, feature);
        // ... specialized validation, over-and-above the validateFeatureContent() hook
        checkFeature(!errMsg, errMsg); // truthy is considered a validation error

        // perform our delayed validation
        errMsg = aspect.validateFeatureContent(feature); // validate self's aspect on supplied feature (which is known to contain this aspect)
        checkFeature(!errMsg, errMsg); // truthy is considered a validation error
      }
    });
  });

  // assemble content of each aspect across all features
  // ... retaining needed state for subsequent ops
  aspects.forEach( aspect => {
    aspect.assembleFeatureContent(app, activeFeatures);
  });

  // assemble resources for each aspect across all other aspects, ONCE ALL aspects have assembled their feature content
  // ... retaining needed state for subsequent ops
  aspects.forEach( aspect => {
    aspect.assembleAspectResources(app, aspects);
  });

  // apply Feature.appWillStart() life-cycle hook
  // AND define our rootAppElm from a combination Features/Aspects DOM injections
  let rootAppElm = null;
  // ... FIRST: feature DOM injection via Feature.appWillStart() life-cycle hook
  //            - can perform ANY initialization
  //            - AND supplement our top-level content (using a non-null return)
  //              ... accomplished FIRST because (in general) it is thought Aspects should inject higher in the DOM
  rootAppElm = activeFeatures.reduce( (curRootAppElm, feature) => feature.appWillStart({app, curRootAppElm}) || curRootAppElm, rootAppElm );

  // ... SECOND: aspect DOM injection via Aspect.injectRootAppElm()
  rootAppElm = aspects.reduce( (curRootAppElm, aspect) => aspect.injectRootAppElm(app, activeFeatures, curRootAppElm), rootAppElm );
  // ... NOTE: We do NOT validate rootAppElm to insure it is non-null!
  //           - at first glance it would appear that a null rootAppElm would render NOTHING
  //           - HOWEVER, ULTIMATLY the app code (found in the registerRootAppElm() hook) 
  //             can display whatever it wants ... a given app may have chosen to inject it's own rootAppElm

  // start our app by registering our rootAppElm to the appropriate react framework
  // ... because this is accomplished by app-specific code, 
  //     feature-u can operate in any number of containing react frameworks,
  //     like: React Web, React Native, Expo, etc.
  registerRootAppElm(rootAppElm);

  // locate the redux app store (if any) from our aspects
  // ... used as a convenience to pass appState/dispatch to appDidStart()
  // ... we define this from the cross-aspect redux method: Aspect.getReduxStore()
  const reduxAspect = aspects.find( aspect => aspect.getReduxStore ? true : false );
  const [appState, dispatch] = reduxAspect 
                                ? [reduxAspect.getReduxStore().getState(), reduxAspect.getReduxStore().dispatch]
                                : [undefined, undefined];
  // console.log(`xx launchApp ... invoking appDidStart(): `, {appState, dispatch});

  // apply Feature.appDidStart() life-cycle hooks
  activeFeatures.forEach( feature => feature.appDidStart({app, appState, dispatch}) );

  // expose our new App object (used in feature cross-communication)
  return app;
}



//***
//*** Specification: registerRootAppElmCB
//***

/**
 * The launchApp() callback hook that registers the supplied root
 * application element to the specific React framework used in the app.
 *
 * Because this registration is accomplished by app-specific code,
 * feature-u can operate in any of the React platforms, such as: React
 * Web, React Native, Expo, etc. (see: **React Registration**).
 * 
 * **NOTE on rootAppElm:**
 * 
 * - Typically the supplied rootAppElm will have definition, based on
 *   the Aspects and Features that are in use.  In this case, it is the
 *   responsibility of this callback to register this content in
 *   some way (either directly or indirectly).
 * 
 * - However, there are atypical isolated cases where the supplied
 *   rootAppElm can be null.  This can happen when the app chooses NOT
 *   to use Aspects/Features that inject any UI content.  In this case,
 *   the callback is free to register it's own content.
 * 
 * Please refer to the user documentation for more details and
 * complete examples.
 *
 * @callback registerRootAppElmCB
 * 
 * @param {reactElm} rootAppElm - the root application element to be
 * registered.
 */
