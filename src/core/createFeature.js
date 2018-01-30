import verify      from '../util/verify';
import isString    from 'lodash.isstring';
import isFunction  from 'lodash.isfunction';

// our default no-op function
const noOp = () => null;

/**
 * Create a new {{book.api.Feature}} object, cataloging
 * {{book.api.AspectContent}} to be consumed by
 * {{book.api.launchApp}}.  Each feature within an app promotes it's
 * own {{book.api.Feature}} object.
 *
 * For more information, please refer to
 * {{book.guide.detail_featureAndAspect}}, with examples at
 * {{book.guide.usage_featureObject}}.
 *
 * **Please Note** this function uses named parameters.
 *
 * @param {string} name the identity of the feature.  Feature names
 * are used to index the {{book.api.App}} Object _(in support of
 * {{book.guide.crossCom}})_, and are therefore guaranteed to be
 * unique.  Application code can also use the Feature name in various
 * {{book.guide.truth}} operations.
 * 
 * @param {boolean} [enabled=true] an indicator as to whether this
 * feature is enabled (true) or not (false).  When used, this
 * indicator is typically based on a dynamic expression, allowing
 * packaged code to be dynamically enabled/disabled at run-time
 * _(please refer to: {{book.guide.enablement}})_.
 *
 * @param {Any} [publicFace] an optional resource object that is the
 * feature's Public API, promoting {{book.guide.crossCom}}.  This
 * object is exposed through the {{book.api.App}} object as:
 * `app.{featureName}.{publicFace}` _(please refer to:
 * {{book.guide.crossCom_publicFaceApp}})_.
 *
 * @param {appWillStartCB} [appWillStart] an optional
 * {{book.guide.appLifeCycle}} invoked one time, just before the app
 * starts up.  This life-cycle hook can do any type of initialization,
 * and/or optionally supplement the app's top-level content (using a
 * non-null return) _(please refer to: {{book.guide.appWillStart}})_.
 *
 * @param {appDidStartCB} [appDidStart] an optional
 * {{book.guide.appLifeCycle}} invoked one time, immediately after the
 * app has started.  Because the app is up-and-running at this time,
 * you have access to the appState and the dispatch() function
 * ... assuming you are using redux (when detected by feature-u's
 * plugable aspects) _(please refer to: {{book.guide.appDidStart}})_.
 * 
 * @param {AspectContent} [extendedAspect] additional aspects, as
 * defined by the feature-u's pluggable Aspect extension _(please
 * refer to: {{book.guide.detail_extendableAspects}} -and-
 * {{book.guide.extending}})_.
 *
 * @return {Feature} a new Feature object (to be consumed by
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
 * The Feature object is a container that holds
 * {{book.api.AspectContent}} that is of interest to **feature-u**.
 * 
 * Each feature within an application promotes a Feature object (using
 * {{book.api.createFeature}}) that catalogs the aspects of that
 * feature.
 * 
 * Ultimately, all Feature objects are consumed by
 * {{book.api.launchApp}}.
 *
 * For more information, please refer to
 * {{book.guide.detail_featureAndAspect}}, with examples at
 * {{book.guide.usage_featureObject}}.
 */


//***
//*** Specification: appWillStartCB
//***

/**
 * An optional {{book.guide.appLifeCycle}} invoked one time, just
 * before the app starts up.
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
 * For more information _(with examples)_, please refer to the
 * Guide's {{book.guide.appWillStart}}.
 *
 * **Please Note** this function uses named parameters.
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
 * An optional {{book.guide.appLifeCycle}} invoked one time,
 * immediately after the app has started.
 *
 * Because the app is up-and-running at this time, you have access to
 * the `appState` and `dispatch()` function ... assuming you are using
 * {{book.ext.redux}} (when detected by feature-u's plugable aspects).
 *
 * For more info with examples, please see the Guide's
 * {{book.guide.appDidStart}}.
 *
 * **Please Note** this function uses named parameters.
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
 *
 * @return void
 */
