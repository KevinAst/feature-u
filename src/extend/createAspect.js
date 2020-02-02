import verify               from '../util/verify';
import isString             from 'lodash.isstring';
import isFunction           from 'lodash.isfunction';
import isPlainObject        from 'lodash.isplainobject';
import {isFeatureProperty}  from '../core/createFeature';
import logf                 from '../util/logf';
 
/**
 * Create an {{book.api.Aspect}} object, used to extend **feature-u**.
 *
 * The {{book.api.Aspect}} object promotes a series of life-cycle
 * methods that **feature-u** invokes in a controlled way.  This
 * life-cycle is controlled by {{book.api.launchApp}} _... it is
 * supplied the Aspects, and it invokes their methods._
 * 
 * The essential characteristics of a typical {{book.api.Aspect}}
 * life-cycle is to:
 * 
 * - accumulate {{book.api.AspectContent}} across all features
 * - perform the desired setup and configuration
 * - expose the framework in some way _(by injecting a component in the
 *   root DOM, or some {{book.guide.extending_aspectCrossCommunication}}
 *   mechanism)_
 * 
 * The {{book.guide.extending}} section provides more insight on how
 * {{book.api.Aspect}}s are created and used.
 * 
 * Aspect Plugins have NO one specific method that is required.  Rather
 * the requirement is to **specify something** _(so as to not have an
 * empty plugin that does nothing)_.
 * Please refer to the **"No Single Aspect Method
 * is Required"** discussion in the
 * {{book.guide.extending_aspectLifeCycleMethods}}.
 * 
 * **Please Note** this function uses named parameters.  The order in
 * which these items are presented represents the same order they are
 * executed.
 *
 * @param {string} name the `Aspect.name` is used to "key"
 * {{book.api.AspectContent}} of this type in the {{book.api.Feature}}
 * object. <br/>
 * 
 * For example: an `Aspect.name: 'xyz'` would permit a `Feature.xyz:
 * xyzContent` construct.<br/>
 * 
 * As a result, Aspect names cannot clash with built-in aspects, and
 * they must be unique _(across all aspects that are in-use)_.<br/>
 *
 * The `Aspect.name` is required, primarily for identity
 * purposes _(in logs and such)_.
 *
 * @param {genesisMeth} [genesis] a Life Cycle Hook invoked
 * one time, at the very beginning of the app's start up process.
 * This hook can perform Aspect related **initialization** and
 * **validation**:
 *
 * @param {validateFeatureContentMeth} [validateFeatureContent] a
 * validation hook allowing this aspect to verify it's content on the
 * supplied feature (which is known to contain this aspect).
 *
 * @param {expandFeatureContentMeth} [expandFeatureContent] an
 * aspect expansion hook, defaulting to the algorithm defined
 * by {{book.api.expandWithFassets}}.<br/>
 *
 * This function rarely needs to be overridden.  It provides a hook to
 * aspects that need to transfer additional content from the expansion
 * function to the expanded content.
 *
 * @param {assembleFeatureContentMeth} [assembleFeatureContent] the
 * Aspect method that assembles content for this aspect across all
 * features, retaining needed state for subsequent ops.<br/>
 *
 * This method is typically the primary task that is accomplished by
 * most aspects.
 *
 * @param {assembleAspectResourcesMeth} [assembleAspectResources] an
 * Aspect method that assemble resources for this aspect
 * across all other aspects, retaining needed state for subsequent
 * ops.<br/>
 *
 * This hook is executed after all the aspects have assembled their
 * feature content (i.e. after
 * {{book.api.assembleFeatureContentMeth}}).
 *
 * @param {initialRootAppElmMeth} [initialRootAppElm] a
 * callback hook that promotes some characteristic of this aspect
 * within the `rootAppElm` ... the top-level react DOM that represents
 * the display of the entire application.<br/>
 * 
 * The {{book.guide.extending_definingAppElm}} section highlights when
 * to use {{book.api.initialRootAppElmMeth}} verses
 * {{book.api.injectRootAppElmMeth}}.
 *
 * @param {injectRootAppElmMeth} [injectRootAppElm] a
 * callback hook that promotes some characteristic of this aspect
 * within the `rootAppElm` ... the top-level react DOM that represents
 * the display of the entire application.<br/>
 * 
 * The {{book.guide.extending_definingAppElm}} section highlights when
 * to use {{book.api.initialRootAppElmMeth}} verses
 * {{book.api.injectRootAppElmMeth}}.
 *
 * @param {injectParamsInHooksMeth} [injectParamsInHooks] an
 * Aspect method that promotes `namedParams` into the
 * feature's {{book.guide.appLifeCycles}}, from this aspect.<br/>

 * This hook is executed after all aspects have assembled their
 * feature content (i.e. after
 * {{book.api.assembleFeatureContentMeth}}).
 *
 * @param {Any} [config] a sub-object that can be used for
 * any type of configuration that a specific Aspect may need _(see:
 * {{book.guide.aspectConfig}})_.
 * 
 * @param {Any} [additionalMethods] additional methods (proprietary to
 * specific Aspects), supporting
 * {{book.guide.extending_aspectCrossCommunication}} ... a contract
 * between one or more aspects _(see:
 * {{book.guide.additionalMethods}})_.
 *
 * @return {Aspect} a new Aspect object (to be consumed by {{book.api.launchApp}}).
 *
 * @function createAspect
 */
export default function createAspect(namedParams={}) {

  // ***
  // *** validate parameters
  // ***

  const check = verify.prefix('createAspect() parameter violation: ');

  // ... namedParams
  check(isPlainObject(namedParams), `only named parameters may be supplied`);

  // descturcture our individual namedParams
  // ... NOTE: We do this here (rather in the function signature) to have access
  //           to the overall namedParams variable - for validation purposes!
  //           Access via the JavaScript implicit `arguments[0]` variable is 
  //           NOT reliable (in this context) exhibiting a number of quirks :-(
  let {name,   // ... using `let`, because some are reassigned (below)
       genesis,
       validateFeatureContent,
       expandFeatureContent,
       assembleFeatureContent,
       assembleAspectResources,
       initialRootAppElm,
       injectRootAppElm,
       injectParamsInHooks,
       config={},
       ...additionalMethods} = namedParams;

  // ... name (NOTE: name check takes precedence to facilitate `Aspect.name` identity in subsequent errors :-)
  check(name,            'name is required (at minimum for identity purposes)');
  check(isString(name),  'name must be a string');
  check(!isFeatureProperty(name), `Aspect.name: '${name}' is a reserved Feature keyword`);
  // NOTE: Aspect.name uniqueness is validated in launchApp() (once we know all aspects in-use)

  // ... unrecognized positional parameter
  //     NOTE: when defaulting entire struct, arguments.length is 0
  check(arguments.length <= 1, `Aspect.name:${name} ... unrecognized positional parameters (only named parameters can be specified) ... ${arguments.length} positional parameters were found`);

  // ... all method params - when supplied, verify are functions -AND- total how many were supplied
  // ... verify all method params are functions -AND- keep track of how many were supplied
  let totalMethodsSupplied = 0;
  ['genesis',
   'validateFeatureContent',
   'expandFeatureContent',
   'assembleFeatureContent',
   'assembleAspectResources',
   'initialRootAppElm',
   'injectRootAppElm',
   'injectParamsInHooks'].forEach( (paramName) => {
     const param = namedParams[paramName];
     if (param) {
       totalMethodsSupplied++;
       check(isFunction(param), `Aspect.name:${name} ... ${paramName} (when supplied) must be a function`);
     }
   } );

  // ... inject no-ops for critical methods that are assumed to exist throughout the code-base
  //     NOTE: By NOT requiring these critical methods, we support edge cases where
  //           aspect content is not needed from the feature set (ex: a plugin "adds value" to another plugin).
  function noOp() {}
  // ... validateFeatureContent
  if (!validateFeatureContent) {
    validateFeatureContent = noOp;
  }
  // ... assembleFeatureContent
  if (!assembleFeatureContent) {
    assembleFeatureContent = noOp;
  }

  // ... config (NOTE: we default to {} in signature - above)
  check(config,                 `Aspect.name:${name} ... config is required`);
  check(isPlainObject(config),  `Aspect.name:${name} ... config must be a plain object literal`);

  // ... additionalMethods
  //     ... this validation occurs in launchApp()
  //         BECAUSE we don't know the Aspects in use UNTIL run-time

  // ... must specify at least ONE method param 
  //     so as to not have an empty plugin that does nothing
  check(totalMethodsSupplied > 0, `Aspect.name:${name} ... at least one method must be supplied ... an empty Aspect plugin does nothing!`);


  // ***
  // *** return our new Aspect object
  // ***

  return {
    name,
    genesis,
    validateFeatureContent,
    expandFeatureContent,
    assembleFeatureContent,
    assembleAspectResources,
    initialRootAppElm,
    injectRootAppElm,
    injectParamsInHooks,
    config,
    ...additionalMethods,
  };

}


/**
 * Maintain all VALID Aspect properties.
 *
 * This is used to restrict Aspect properties to ONLY valid ones:
 *  - preventing user typos
 *  - validation is employed at run-time in launchApp()
 *
 * Initially seeded with Aspect builtins.
 *
 * Later, supplemented with extendAspectProperty(name, owner) at run-time
 * (via Aspect plugins).
 *
 * @private
 */
const validAspectProps = {
  name:                     'builtin',
  genesis:                  'builtin',
  validateFeatureContent:   'builtin',
  expandFeatureContent:     'builtin',
  assembleFeatureContent:   'builtin',
  assembleAspectResources:  'builtin',
  initialRootAppElm:        'builtin',
  injectRootAppElm:         'builtin',
  injectParamsInHooks:      'builtin',
  config:                   'builtin',
};

/**
 * Is the supplied name a valid Aspect property?
 *
 * @param {string} name the property name to check.
 *
 * @param {boolean} true:  valid Aspect property,
 *                  false: NOT a Aspect property
 *
 * @private
 */
export function isAspectProperty(name) {
  return validAspectProps[name] ? true : false;
}

/**
 * Extend valid Aspect properties to include the supplied name
 * ... used when extending APIs for
 * {{book.guide.extending_aspectCrossCommunication}}.
 *
 * **feature-u** keeps track of the agent that owns this extension
 * (using the owner parameter).  This is used to prevent exceptions
 * when duplicate extension requests are made by the same owner.  This
 * can happen when multiple instances of an aspect type are supported,
 * and also in unit testing.
 *
 * @param {string} name the property name to extend.
 *
 * @param {string} owner the requesting owner id of this extension
 * request.  Use any string that uniquely identifies your utility
 * _(such as the aspect's npm package name)_.
 * 
 * @throws {Error} when supplied name is already reserved by a different owner
 */
export function extendAspectProperty(name, owner) {

  // validate parameters
  const check = verify.prefix('extendAspectProperty() parameter violation: ');

  check(name,            'name is required');
  check(isString(name),  'name must be a string');

  check(owner,           'owner is required');
  check(isString(owner), 'owner must be a string');

  // verify supplied name is NOT already reserved (by a different owner)
  if (isAspectProperty(name) &&           // already reserved
      validAspectProps[name] !== owner) { // by a different owner
    throw new Error(`**ERROR** extendAspectProperty('${name}', '${owner}') ... 'Aspect.name:${name}' is already reserved by different owner.`);
  }

  // reserve it
  validAspectProps[name] = owner;
  logf(`invoking: extendAspectProperty('${name}', '${owner}') ... now validAspectProps: `, validAspectProps);
}


//***
//*** Specification: Aspect
//***

/**
 * @typedef {Object} Aspect
 *
 * Aspect objects (emitted from {{book.api.createAspect}}) are used to
 * extend **feature-u**.
 * 
 * The Aspect object promotes a series of life-cycle methods that
 * **feature-u** invokes in a controlled way.  This life-cycle is
 * controlled by {{book.api.launchApp}} _... it is supplied the
 * Aspects, and it invokes their methods._
 * 
 * Typically Aspects are packaged separately _(as an external npm
 * **feature-u** extension)_, although they can be created locally
 * within a project _(if needed)_.
 * 
 * For more information, please refer to
 * {{book.guide.detail_extendableAspects}} and
 * {{book.guide.extending}}.
 */


//***
//*** Specification: AspectContent
//***

/**
 * @typedef {Any} AspectContent
 * 
 * The content (or payload) of an {{book.api.Aspect}}, specified
 * within a {{book.api.Feature}}.
 * 
 * The content type is specific to the Aspect. For example, a redux
 * Aspect assembles reducers (via `Feature.reducer`), while a
 * redux-logic Aspect gathers logic modules (via `Feature.logic`),
 * etc.
 * 
 * AspectContent can either be defined from **built-in** aspects
 * _(via core **feature-u**)_, or **extensions** _(from
 * {{book.api.Aspect}})_.
 * 
 * An {{book.api.Aspect}} object extends **feature-u** by accumulating
 * information of interest from {{book.api.Feature}} objects _(indexed
 * by the Aspect name)_.
 * 
 * **Note**: Whenever AspectContent definitions require the 
 * {{book.api.FassetsObject}} **at code expansion time**, you can wrap the
 * definition in a {{book.api.expandWithFassets}} function.  In other
 * words, your aspect content can either be the actual content itself
 * _(ex: a reducer)_, or a function that returns the content.
 *
 * For more information, please refer to
 * {{book.guide.detail_featureAndAspect}}.
 */


//***
//*** Specification: genesisMeth
//***

/**
 * A Life Cycle Hook invoked one time, at the very beginning of
 * the app's start up process.
 * 
 * This hook can perform Aspect related **initialization** and
 * **validation**:
 * 
 * - **initialization**: this is where where proprietary Aspect/Feature
 *   APIs should be registered (if any) - via
 *   {{book.api.extendAspectProperty}} and
 *   {{book.api.extendFeatureProperty}} _(please see:
 *   {{book.guide.extending_aspectCrossCommunication}})_.
 *
 * - **validation**: It is possible to perform Aspect validation in the
 *   `genesis()` method ... say for required configuration properties
 *   injected by the client after instantiation.  This is the reason for
 *   the optional return string.
 * 
 *   This however is somewhat antiquated to Aspects that are promoted as
 *   singletons (where configuration had to occur after instantiation).
 * 
 *   A better technique is to promote an Aspect constructor (that
 *   requires configuration parameters), and perform your validation in
 *   the constructor.
 * 
 * **API:** {{book.api.genesisMeth$}}
 *
 * @callback genesisMeth
 *
 * @return {string} an error message when self is in an invalid state
 * (falsy when valid).  Because this validation occurs under the
 * control of {{book.api.launchApp}}, any message is prefixed with:
 * `'launchApp() parameter violation: '`.
 */


//***
//*** Specification: validateFeatureContentMeth
//***

/**
 * A validation hook allowing this aspect to verify it's content on
 * the supplied feature.
 *
 * **API:** {{book.api.validateFeatureContentMeth$}}
 *
 * @callback validateFeatureContentMeth
 * 
 * @param {Feature} feature - the feature to validate, which is known
 * to contain this aspect.
 *
 * @return {string} an error message string when the supplied feature
 * contains invalid content for this aspect (falsy when valid).
 * Because this validation conceptually occurs under the control of
 * {{book.api.createFeature}}, any message is prefixed with:
 * `'createFeature() parameter violation: '`.
 */


//***
//*** Specification: expandFeatureContentMeth
//***

/**
 * Expand self's {{book.api.AspectContent}} in the supplied feature,
 * replacing that content (within the feature).  Once expansion is
 * complete, **feature-u** will perform a delayed validation of the
 * expanded content.
 *
 * **API:** {{book.api.expandFeatureContentMeth$}}
 *
 * The default behavior simply implements the expansion algorithm
 * defined by {{book.api.expandWithFassets}}:
 *
 * ```js
 * feature[this.name] = feature[this.name](fassets);
 * ```
 *
 * This default behavior rarely needs to change.  It however provides
 * a hook for aspects that need to transfer additional content from
 * the expansion function to the expanded content.  As an example, the
 * `reducer` aspect must transfer the slice property from the
 * expansion function to the expanded reducer.
 *
 * @callback expandFeatureContentMeth
 *
 * @param {Fassets} fassets the Fassets object used in feature
 * cross-communication.
 * 
 * @param {Feature} feature - the feature which is known to contain
 * this aspect **and** is in need of expansion (as defined by
 * {{book.api.expandWithFassets}}).
 *
 * @return {string} an optional error message when the supplied
 * feature contains invalid content for this aspect (falsy when
 * valid).  This is a specialized validation of the expansion
 * function, over-and-above what is checked in the standard
 * {{book.api.validateFeatureContentMeth}} hook.
 */



//***
//*** Specification: assembleFeatureContentMeth
//***

/**
 * The Aspect method that assembles content for this aspect
 * across all features, retaining needed state for subsequent ops.
 * This method is typically the primary task that is accomplished by
 * most aspects.
 *
 * **API:** {{book.api.assembleFeatureContentMeth$}}
 *
 * @callback assembleFeatureContentMeth
 *
 * @param {Fassets} fassets the Fassets object used in feature
 * cross-communication.
 * 
 * @param {Feature[]} activeFeatures - The set of active (enabled)
 * features that comprise this application.
 *
 * @return void
 */



//***
//*** Specification: assembleAspectResourcesMeth
//***

/**
 * An Aspect method that assembles resources for this aspect
 * across all other aspects, retaining needed state for subsequent
 * ops.  This hook is executed after all the aspects have assembled
 * their feature content (i.e. after
 * {{book.api.assembleFeatureContentMeth}}).
 *
 * **API:** {{book.api.assembleAspectResourcesMeth$}}
 *
 * This is an optional second-pass (so-to-speak) of Aspect data
 * gathering, that facilitates
 * {{book.guide.extending_aspectCrossCommunication}}.  It allows an
 * extending aspect to gather resources from other aspects, using an
 * additional API (ex: `Aspect.getXyz()`).
 *
 * @callback assembleAspectResourcesMeth
 *
 * @param {Fassets} fassets the Fassets object used in feature
 * cross-communication.
 * 
 * @param {Aspect[]} aspects - The set of **feature-u** Aspect objects
 * used in this this application.
 *
 * @return void
 */



//***
//*** Specification: initialRootAppElmMeth
//***

/**
 * A callback hook that promotes some characteristic of this
 * aspect within the `rootAppElm` ... the top-level react DOM that
 * represents the display of the entire application.
 * 
 * **API:** {{book.api.initialRootAppElmMeth$}}
 * 
 * The {{book.guide.extending_definingAppElm}} section highlights when
 * to use {{book.api.initialRootAppElmMeth}} verses
 * {{book.api.injectRootAppElmMeth}}.
 *
 * **NOTE**: When this hook is used, the supplied curRootAppElm MUST be
 * included as part of this definition!
 *
 * @callback initialRootAppElmMeth
 *
 * @param {Fassets} fassets the Fassets object used in feature
 * cross-communication.
 * 
 * @param {reactElm} curRootAppElm - the current react app element root.
 *
 * @return {reactElm} a new react app element root (which in turn must
 * contain the supplied curRootAppElm), or simply the supplied
 * curRootAppElm (if no change).
 */



//***
//*** Specification: injectRootAppElmMeth
//***

/**
 * A callback hook that promotes some characteristic of this
 * aspect within the `rootAppElm` ... the top-level react DOM that
 * represents the display of the entire application.
 * 
 * **API:** {{book.api.injectRootAppElmMeth$}}
 * 
 * The {{book.guide.extending_definingAppElm}} section highlights when
 * to use {{book.api.initialRootAppElmMeth}} verses
 * {{book.api.injectRootAppElmMeth}}.
 *
 * **NOTE**: When this hook is used, the supplied curRootAppElm MUST be
 * included as part of this definition!
 *
 * @callback injectRootAppElmMeth
 *
 * @param {Fassets} fassets the Fassets object used in feature
 * cross-communication.
 * 
 * @param {reactElm} curRootAppElm - the current react app element root.
 *
 * @return {reactElm} a new react app element root (which in turn must
 * contain the supplied curRootAppElm), or simply the supplied
 * curRootAppElm (if no change).
 */



//***
//*** Specification: injectParamsInHooksMeth
//***

/**
 * An Aspect method that promotes `namedParams` into the
 * feature's {{book.guide.appLifeCycles}}, from this aspect.  This
 * hook is executed after all aspects have assembled their feature
 * content (i.e. after {{book.api.assembleFeatureContentMeth}}).
 *
 * Here is a `namedParams` example from a redux aspect, promoting it's
 * state and dispatch functions:
 * 
 * ```js
 * {getState, dispatch}
 * ```
 * 
 * **API:** {{book.api.injectParamsInHooksMeth$}}
 *
 * Any aspect may promote their own set of `namedParams`.  **feature-u**
 * will insure there are no name clashes across aspects (which results
 * in an exception).  If your parameter names have a high potential
 * for clashing, a **best practice** would be to qualify them in some
 * way to better insure uniqueness.
 *
 * @callback injectParamsInHooksMeth
 *
 * @param {Fassets} fassets the Fassets object used in feature
 * cross-communication.
 *
 * @return {namedParams} a plain object that will be injected (as
 * named parameters) into the feature's {{book.guide.appLifeCycles}},
 * from this aspect.
 */
