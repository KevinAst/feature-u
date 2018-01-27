import verify      from '../util/verify';
import isString    from 'lodash.isstring';
import isFunction  from 'lodash.isfunction';

// our default no-op function
const noOp = () => null;

/**
 * @function createFeature
 * @description
 *
 * Create a new Feature object, accumulating Aspect content to be consumed
 * by launchApp().
 *
 * **Please Note** `createFeature()` accepts named parameters.
 *
 * @param {string} name the identity of the feature.  Feature names
 * are used to index the [App Object](#app-object) by feature _(in
 * support of [Cross Feature
 * Communication](#cross-feature-communication))_, and are therefore
 * guaranteed to be unique.  Application code can also use [Feature
 * Name](#feature-name) in various [Single Source of
 * Truth](#single-source-of-truth) operations.
 * 
 * @param {boolean} [enabled=true] an indicator as to whether this
 * feature is enabled (true) or not (false).  When used, this
 * indicator is typically based on a dynamic expression, allowing
 * packaged code to be dynamically enabled/disabled at run-time
 * _(please refer to: [Feature Enablement](#feature-enablement))_.
 *
 * @param {Any} [publicFace] an optional resource object that is the
 * feature's Public API, promoting cross-communication between
 * features.  This object is exposed through the App object as:
 * `app.{featureName}.{publicFace}` _(please refer to: [publicFace and
 * the App Object](#publicface-and-the-app-object))_.
 *
 * @param {appWillStartCB} [appWillStart] an optional [Application
 * Life Cycle Hook](#application-life-cycle-hooks) invoked one time,
 * just before the app starts up.  This life-cycle hook can do any
 * type of initialization, and/or optionally supplement the app's
 * top-level content (using a non-null return) _(please refer to:
 * [appWillStart](#appwillstart))_.
 *
 * @param {appDidStartCB} [appDidStart] an optional [Application Life
 * Cycle Hook](#application-life-cycle-hooks) invoked one time,
 * immediately after the app has started.  Because the app is
 * up-and-running at this time, you have access to the appState and
 * the dispatch() function ... assuming you are using redux (when
 * detected by feature-u's plugable aspects) _(please refer to:
 * [appDidStart](#appdidstart))_.
 * 
 * @param {AspectContent} [extendedAspect] additional aspects, as defined
 * by the feature-u's pluggable Aspect extension.
 *
 * @return {Feature} a new Feature object (to be consumed by feature-u
 * launchApp()).
 */
export default function createFeature({name,
                                       enabled=true,

                                       publicFace={}, // default to empty object, providing a consistent indicator in app object (that the feature is present/enabled)

                                       appWillStart=noOp,
                                       appDidStart=noOp,

                                       ...extendedAspect}={}) {

  // validate createFeature() parameters
  const check = verify.prefix('createFeature() parameter violation: ');

  // ... name
  check(name,            'name is required');
  check(isString(name),  'name must be a string');

  // ... enabled
  check(enabled===true || enabled===false, 'enabled must be a boolean');

  // ... publicFace: nothing to validate (it can be anything, INCLUDING a .managedExpansion function)

  // ... appWillStart
  check(isFunction(appWillStart), 'appWillStart (when supplied) must be a function');

  // ... appDidStart
  check(isFunction(appDidStart), 'appDidStart (when supplied) must be a function');

  // ... extendedAspect
  //     ... this validation occurs by the Aspect itself (via launchApp())

  // create/return our new Feature object
  return {
    name,
    enabled,

    publicFace,

    appWillStart,
    appDidStart,

    ...extendedAspect,
  };
}

const builtInFeatureKeywords = {
  name:         true,
  enabled:      true,
  publicFace:   true,
  appWillStart: true,
  appDidStart:  true,
};

/**
 * @private
 * 
 * Return indicator as to whether the supplied keyword is a built-in
 * Feature keyword.
 *
 * @param {string} keyword the keyword name to check.
 *
 * @param {boolean} true: is keyword, false: is NOT keyword
 */
export function isBuiltInFeatureKeyword(keyword) {
  return builtInFeatureKeywords[keyword] || false;
}

/**
 * Add additional Feature keyword (typically used by Aspect extensions
 * to Feature).
 *
 * @param {string} keyword the keyword name to add.
 */
export function addBuiltInFeatureKeyword(keyword) {
  builtInFeatureKeywords[keyword] = true;
}



//***
//*** Specification: Feature
//***

/**
 * @typedef {Object} Feature
 *
 * Feature objects (emitted from `createFeature()`) are used ?? bla bla
 */


//***
//*** Specification: appWillStartCB
//***

/**
 * An optional app life-cycle hook invoked one time, just before the
 * app starts up.
 *
 * This life-cycle hook can do any type of initialization. For
 * example: initialize FireBase.
 *
 * In addition, it can optionally supplement the app's top-level root
 * element (i.e. react component instance).  Any significant return
 * (truthy) is interpreted as the app's new rootAppElm.
 * **IMPORTANT**: When this is used, the supplied curRootAppElm MUST
 * be included as part of this definition (accommodating the
 * accumulative process of other feature injections)!
 *
 * **Please Note** `appWillStart()` utilizes named parameters.
 *
 * @callback appWillStartCB
 * 
 * @param {App} app the App object used in feature cross-communication.
 * 
 * @param {reactElm} curRootAppElm - the current react app element
 * root.
 *
 * @return {reactElm} optionally, new top-level content (which in turn
 * must contain the supplied curRootAppElm), or falsy for unchanged.
 */


//***
//*** Specification: appDidStartCB
//***

/**
 * An optional app life-cycle hook invoked one time, immediately after
 * the app has started.
 *
 * Because the app is up-and-running at this time, you have access to
 * the appState and dispatch() function ... assuming you are using
 * redux (when detected by feature-u's plugable aspects).
 *
 * **Please Note** `appDidStart()` utilizes named parameters.
 *
 * @callback appDidStartCB
 * 
 * @param {App} app the App object used in feature cross-communication.
 * 
 * @param {Any} [appState] - the redux top-level app state (when redux
 * is in use).
 * 
 * @param {function} [dispatch] - the redux dispatch() function (when
 * redux is in use).
 */
