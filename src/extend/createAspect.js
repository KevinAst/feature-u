import verify               from '../util/verify';
import isString             from 'lodash.isstring';
import isFunction           from 'lodash.isfunction';
import {isFeatureProperty}  from '../core/createFeature';

const default_validateConfiguration = (feature) => null;

function default_expandFeatureContent(app, feature) {
  // expand self's content in the supplied feature
  // ... by invoking the managedExpansionCB(app) embellished by managedExpansion(managedExpansionCB)
  feature[this.name] = feature[this.name](app);
}

const default_assembleAspectResources = (app, aspects) => null;

const default_processRootAppElm = (app, curRootAppElm) => curRootAppElm;

 
/**
 * Create an {{book.api.Aspect}} object, used to extend **feature-u**.
 *
 * The {{book.api.Aspect}} object promotes a series of life-cycle
 * methods that **feature-u** invokes in a controlled way.  This
 * life-cycle is controlled by {{book.api.launchApp}} _... it is
 * supplied the Aspects, and it invokes their methods._
 * 
 * The essential characteristics of the {{book.api.Aspect}} life-cycle is to:
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
 * **Please Note** this function uses named parameters.  The order in
 * which these items are presented represents the same order they are
 * executed.
 *
 * @param {string} name the `Aspect.name` is used to "key"
 * {{book.api.AspectContent}} of this type in the {{book.api.Feature}}
 * object.<br/><br/>
 * 
 * For example: an `Aspect.name: 'xyz'` would permit a `Feature.xyz:
 * xyzContent` construct.<br/><br/>
 * 
 * As a result, Aspect names cannot clash with built-in aspects, and
 * they must be unique _(across all aspects that are in-use)_.
 *
 * @param {validateConfigurationMeth} [validateConfiguration] an
 * optional validation hook allowing this aspect to verify it's own
 * required configuration (if any).<br/><br/>
 * 
 * Some aspects may require certain settings in self for them to
 * operate.
 *
 * @param {expandFeatureContentMeth} [expandFeatureContent] an
 * optional aspect expansion hook, defaulting to the algorithm defined
 * by {{book.api.managedExpansion}}.<br/><br/>
 *
 * This function rarely needs to be overridden.  It provides a hook to
 * aspects that need to transfer additional content from the expansion
 * function to the expanded content.
 *
 * @param {validateFeatureContentMeth} validateFeatureContent a
 * validation hook allowing this aspect to verify it's content on the
 * supplied feature (which is known to contain this aspect).
 *
 * @param {assembleFeatureContentMeth} assembleFeatureContent the
 * Aspect method that assembles content for this aspect across all
 * features, retaining needed state for subsequent ops.<br/><br/>
 *
 * This method is required because this is the primary task that is
 * accomplished by all aspects.
 *
 * @param {assembleAspectResourcesMeth} [assembleAspectResources] an
 * optional Aspect method that assemble resources for this aspect
 * across all other aspects, retaining needed state for subsequent
 * ops.<br/><br/>
 *
 * This hook is executed after all the aspects have assembled their
 * feature content (i.e. after
 * {{book.api.assembleFeatureContentMeth}}).
 *
 * @param {initialRootAppElmMeth} [initialRootAppElm] an optional
 * callback hook that promotes some characteristic of this aspect
 * within the `rootAppElm` ... the top-level react DOM that represents
 * the display of the entire application.<br/><br/>
 * 
 * The {{book.guide.extending_definingAppElm}} section highlights when
 * to use {{book.api.initialRootAppElmMeth}} verses
 * {{book.api.injectRootAppElmMeth}}.
 *
 * @param {injectRootAppElmMeth} [injectRootAppElm] an optional
 * callback hook that promotes some characteristic of this aspect
 * within the `rootAppElm` ... the top-level react DOM that represents
 * the display of the entire application.<br/><br/>
 * 
 * The {{book.guide.extending_definingAppElm}} section highlights when
 * to use {{book.api.initialRootAppElmMeth}} verses
 * {{book.api.injectRootAppElmMeth}}.
 * 
 * @param {Any} [additionalMethods] additional methods (proprietary to
 * specific Aspects), supporting two different requirements:<br/><br/>
 * 
 * 1. internal Aspect helper methods, and<br/><br/>
 * 
 * 2. APIs used in {{book.guide.extending_aspectCrossCommunication}}
 *    ... a contract between one or more aspects.  This is merely an
 *    API specified by one Aspect, and used by another Aspect, that is
 *    facilitate through the {{book.api.assembleAspectResourcesMeth$}}
 *    hook.
 *
 * @return {Aspect} a new Aspect object (to be consumed by {{book.api.launchApp}}).
 */
export default function createAspect({name,
                                      validateConfiguration=default_validateConfiguration,
                                      expandFeatureContent=default_expandFeatureContent,
                                      validateFeatureContent,
                                      assembleFeatureContent,
                                      assembleAspectResources=default_assembleAspectResources,
                                      initialRootAppElm=default_processRootAppElm,
                                      injectRootAppElm=default_processRootAppElm,
                                      ...additionalMethods}={}) {

  // ***
  // *** validate parameters
  // ***

  const check = verify.prefix('createAspect() parameter violation: ');

  check(name,            'name is required');
  check(isString(name),  'name must be a string');
  check(!isFeatureProperty(name), `Aspect.name: '${name}' is a reserved Feature keyword`);
  // NOTE: Aspect.name uniqueness is validated in launchApp() (once we know all aspects in-use)

  check(isFunction(validateConfiguration),   'validateConfiguration (when supplied) must be a function');

  check(isFunction(expandFeatureContent),    'expandFeatureContent (when supplied) must be a function');

  check(validateFeatureContent,              'validateFeatureContent is required');
  check(isFunction(validateFeatureContent),  'validateFeatureContent must be a function');

  check(assembleFeatureContent,              'assembleFeatureContent is required');
  check(isFunction(assembleFeatureContent),  'assembleFeatureContent must be a function');

  check(isFunction(assembleAspectResources), 'assembleAspectResources (when supplied) must be a function');

  check(isFunction(initialRootAppElm),       'initialRootAppElm (when supplied) must be a function');

  check(isFunction(injectRootAppElm),        'injectRootAppElm (when supplied) must be a function');

  // ... additionalMethods
  //     ... this validation occurs in launchApp()
  //         BECAUSE we don't know the Aspects in use UNTIL run-time

  // ***
  // *** return our new Aspect object
  // ***

  return {
    name,
    validateConfiguration,
    expandFeatureContent,
    validateFeatureContent,
    assembleFeatureContent,
    assembleAspectResources,
    initialRootAppElm,
    injectRootAppElm,
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
 * Later, supplemented with extendAspectProperty(name) at run-time
 * (via Aspect plugins).
 *
 * @private
 */
const validAspectProps = {
  name:                     true,
  validateConfiguration:    true,
  expandFeatureContent:     true,
  validateFeatureContent:   true,
  assembleFeatureContent:   true,
  assembleAspectResources:  true,
  initialRootAppElm:        true,
  injectRootAppElm:         true,
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
  return validAspectProps[name] || false;
}

/**
 * Extend the supplied name as an Aspect property.  This is used by
 * Aspects to extend Aspect APIs for
 * {{book.guide.extending_aspectCrossCommunication}}.
 *
 * @param {string} name the property name to allow.
 */
export function extendAspectProperty(name) {

  if (isAspectProperty(name)) {
    throw new Error(`**ERROR** extendAspectProperty('${name}') ... 'Aspect.${name}' is already in use (i.e. it is already a valid Aspect property)!`);
  }

  validAspectProps[name] = true;
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
 * controlled by {{book.api.launchApp}}` _... it is supplied the
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
 * An {{book.api.Aspect}} object extends **feature-u** by accumulating
 * information of interest from {{book.api.Feature}} objects _(indexed
 * by the Aspect name)_.
 * 
 * The content type is specific to the Aspect. For example, a redux
 * Aspect assembles reducers (via `Feature.reducer`), while a
 * redux-logic Aspect gathers logic modules (via `Feature.logic`),
 * etc.
 * 
 * For more information, please refer to
 * {{book.guide.detail_featureAndAspect}}.
 */


//***
//*** Specification: validateConfigurationMeth
//***

/**
 * A validation hook allowing this aspect to verify it's own required
 * configuration (if any).  Some aspects may require certain settings
 * in self for them to operate.
 *
 * **API:** {{book.api.validateConfigurationMeth$}}
 *
 * @callback validateConfigurationMeth
 *
 * @return {string} an error message when self is in an invalid state
 * (falsy when valid).  Because this validation occurs under the
 * control of {{book.api.launchApp}}, any message is prefixed with:
 * `'launchApp() parameter violation: '`.
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
 * defined by {{book.api.managedExpansion}}:
 *
 * ```js
 * feature[this.name] = feature[this.name](app);
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
 * @param {App} app the App object used in feature
 * cross-communication.
 * 
 * @param {Feature} feature - the feature which is known to contain
 * this aspect **and** is in need of expansion (as defined by
 * {{book.api.managedExpansion}}).
 *
 * @return {string} an optional error message when the supplied
 * feature contains invalid content for this aspect (falsy when
 * valid).  This is a specialized validation of the expansion
 * function, over-and-above what is checked in the standard
 * {{book.api.validateFeatureContentMeth}} hook.
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
//*** Specification: assembleFeatureContentMeth
//***

/**
 * The required Aspect method that assembles content for this aspect
 * across all features, retaining needed state for subsequent ops.
 * This method is required because this is the primary task that is
 * accomplished by all aspects.
 *
 * **API:** {{book.api.assembleFeatureContentMeth$}}
 *
 * @callback assembleFeatureContentMeth
 *
 * @param {App} app the App object used in feature cross-communication.
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
 * An optional Aspect method that assembles resources for this aspect
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
 * @param {App} app the App object used in feature cross-communication.
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
 * An optional callback hook that promotes some characteristic of this
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
 * @param {App} app the App object used in feature cross-communication.
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
 * An optional callback hook that promotes some characteristic of this
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
 * @param {App} app the App object used in feature cross-communication.
 * 
 * @param {reactElm} curRootAppElm - the current react app element root.
 *
 * @return {reactElm} a new react app element root (which in turn must
 * contain the supplied curRootAppElm), or simply the supplied
 * curRootAppElm (if no change).
 */
