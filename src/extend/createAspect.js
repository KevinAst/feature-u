import verify                    from '../util/verify';
import isString                  from 'lodash.isstring';
import isFunction                from 'lodash.isfunction';
import {isBuiltInFeatureKeyword} from '../core/createFeature';

const default_validateConfiguration = (feature) => null;

function default_expandFeatureContent(app, feature) {
  // expand self's content in the supplied feature
  // ... by invoking the managedExpansionCB(app) embellished by managedExpansion(managedExpansionCB)
  feature[this.name] = feature[this.name](app);
}

const default_assembleAspectResources = (app, aspects) => null;

const default_injectRootAppElm = (app, activeFeatures, curRootAppElm) => curRootAppElm;

 
/**
 * @function createAspect
 * @description
 *
 * Create an Aspect object, used to extend feature-u.
 *
 * The Aspect object promotes a series of life-cycle methods that
 * **feature-u** invokes in a controlled way.  This life-cycle is
 * controlled by `launchApp()` _... it is supplied the Aspects, and it
 * invokes their methods._
 * 
 * The essential characteristics of the Aspect life-cycle is to:
 * 
 * - accumulate aspect content across all features
 * - perform the desired setup and configuration
 * - expose the framework in some way _(by injecting a component in the
 *   root DOM, or some "aspect cross-communication mechanism")_
 * 
 * Typically the Aspect object will need to retain state between these
 * life-cycle methods in order to do it's job.
 * 
 * Some Aspects may rely on an "aspect cross-communication mechanism" to
 * accomplish it's work.  This is merely a proprietary Aspect method which
 * is documented and consumed by another Aspect.  Please refer to
 * [Aspect.additionalMethods()](#aspectadditionalmethods).
 *
 * **Please Note** this function uses named parameters.  The order in
 * which these items are presented represents the same order they are
 * executed.
 *
 * @param {string} name the aspect name.  This name is used to "key"
 * aspects of this type in the Feature object: `Feature.{name}: xyz`.
 * As a result, Aspect names must be unique across all aspects that
 * are in-use.
 *
 * @param {validateConfigurationMeth} [validateConfiguration] an
 * optional validation hook allowing this aspect to verify it's own
 * required configuration (if any).  Some aspects may require certain
 * settings in self for them to operate.
 *
 * @param {expandFeatureContentMeth} [expandFeatureContent] an optional
 * aspect expansion hook, defaulting to the algorithm defined by
 * managedExpansion().  This function rarely needs to be overridden.
 * It provides a hook to aspects that need to transfer additional
 * content from the expansion function to the expanded content.
 *
 * @param {validateFeatureContentMeth} validateFeatureContent a
 * validation hook allowing this aspect to verify it's content on the
 * supplied feature (which is known to contain this aspect).
 *
 * @param {assembleFeatureContentMeth} assembleFeatureContent the
 * Aspect method that assembles content for this aspect
 * across all features, retaining needed state for subsequent ops.
 * This method is required because this is the primary task that is
 * accomplished by all aspects.
 *
 * @param {assembleAspectResourcesMeth} [assembleAspectResources] an
 * optional Aspect method that assemble resources for this aspect
 * across all other aspects, retaining needed state for subsequent
 * ops.  This hook is executed after all the aspects have assembled
 * their feature content (i.e. after `assembleFeatureContent()`).
 *
 * @param {injectRootAppElmMeth} [injectRootAppElm] an optional callback
 * hook that promotes some characteristic of this aspect within the
 * app root element (i.e. react component instance).
 * 
 * @param {Any} [additionalMethods] additional methods (proprietary to
 * specific Aspects), supporting two different requirements:
 * <ol>
 * <li> internal Aspect helper methods, and
 * <li> APIs used in "aspect cross-communication" ... a contract
 *      between one or more aspects.  This is merely an API specified
 *      by one Aspect, and used by another Aspect, that is facilitate
 *      through the `Aspect.assembleAspectResources(app, aspects)`
 *      hook.
 * </ol>
 *
 * @return {Aspect} a new Aspect object (to be consumed by launchApp()).
 */
export default function createAspect({name,
                                      validateConfiguration=default_validateConfiguration,
                                      expandFeatureContent=default_expandFeatureContent,
                                      validateFeatureContent,
                                      assembleFeatureContent,
                                      assembleAspectResources=default_assembleAspectResources,
                                      injectRootAppElm=default_injectRootAppElm,
                                      ...additionalMethods}={}) {

  // ***
  // *** validate parameters
  // ***

  const check = verify.prefix('createAspect() parameter violation: ');

  check(name,            'name is required');
  check(isString(name),  'name must be a string');
  check(!isBuiltInFeatureKeyword(name), `aspect name value: '${name}' is a reserved Feature keyword`);
  // NOTE: Aspect.name uniqueness is validated in launchApp() (once we know all aspects in-use)

  check(isFunction(validateConfiguration),   'validateConfiguration (when supplied) must be a function');

  check(isFunction(expandFeatureContent),    'expandFeatureContent (when supplied) must be a function');

  check(validateFeatureContent,              'validateFeatureContent is required');
  check(isFunction(validateFeatureContent),  'validateFeatureContent must be a function');

  check(assembleFeatureContent,              'assembleFeatureContent is required');
  check(isFunction(assembleFeatureContent),  'assembleFeatureContent must be a function');

  check(isFunction(assembleAspectResources), 'assembleAspectResources (when supplied) must be a function');

  check(isFunction(injectRootAppElm),        'injectRootAppElm (when supplied) must be a function');



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
    injectRootAppElm,
    ...additionalMethods,
  };

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
 * controlled by `launchApp()` _... it is supplied the Aspects, and it
 * invokes their methods._
 * 
 * For more information, please refer to {{book.guide.extending}}.
 */


//***
//*** Specification: AspectContent
//***

/**
 * @typedef {Any} AspectContent
 * 
 * The content (or payload) of an Aspect, specified within a Feature.
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
 * @callback validateConfigurationMeth
 *
 * @return {string} an error message when self is in an invalid state
 * (falsy when valid).  Because this validation occurs under the
 * control of `launchApp()`, any message is prefixed with:
 * `'launchApp() parameter violation: '`.
 */


//***
//*** Specification: expandFeatureContentMeth
//***

/**
 * Expand self's AspectContent in the supplied feature, replacing that
 * content (within the feature).  Once expansion is complete,
 * feature-u will perform a delayed validation of the expanded
 * content.
 *
 * The default behavior simply implements the expansion algorithm
 * defined by managedExpansion():
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
 * managedExpansion()).
 *
 * @return {string} an optional error message when the supplied
 * feature contains invalid content for this aspect (falsy when
 * valid).  This is a specialized validation of the expansion
 * function, over-and-above what is checked in the standard
 * validateFeatureContent() hook.
 */


//***
//*** Specification: validateFeatureContentMeth
//***

/**
 * A validation hook allowing this aspect to verify it's content on
 * the supplied feature.
 *
 * @callback validateFeatureContentMeth
 * 
 * @param {Feature} feature - the feature to validate, which is known
 * to contain this aspect.
 *
 * @return {string} an error message string when the supplied feature
 * contains invalid content for this aspect (falsy when valid).
 * Because this validation conceptually occurs under the control of
 * `createFeature()`, any message is prefixed with: `'createFeature()
 * parameter violation: '`.
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
 * @callback assembleFeatureContentMeth
 *
 * @param {App} app the App object used in feature cross-communication.
 * 
 * @param {Feature[]} activeFeatures - The set of active (enabled)
 * features that comprise this application.
 */



//***
//*** Specification: assembleAspectResourcesMeth
//***

/**
 * An optional Aspect method that assemble resources for this aspect
 * across all other aspects, retaining needed state for subsequent
 * ops.  This hook is executed after all the aspects have assembled
 * their feature content (i.e. after `assembleFeatureContent()`).
 *
 * This is an optional second-pass (so-to-speak) of Aspect data
 * gathering, that facilitates an "aspect cross-communication"
 * mechanism.  It allows a given aspect to gather resources from other
 * aspects, through a documented API for a given Aspect (ex:
 * Aspect.getXyz()).
 * 
 * As an example of this, the "reducer" aspect (which manages redux),
 * allows other aspects to inject their own redux middleware (ex:
 * redux-logic), through it's documented Aspect.getReduxMiddleware()
 * API.
 *
 * @callback assembleAspectResourcesMeth
 *
 * @param {App} app the App object used in feature cross-communication.
 * 
 * @param {Aspect[]} aspects - The set of feature-u Aspect objects
 * used in this this application.
 */



//***
//*** Specification: injectRootAppElmMeth
//***

/**
 * An optional callback hook that promotes some characteristic of this
 * aspect within the app root element (i.e. react component instance).
 * 
 * All aspects will either promote themselves through this hook, -or-
 * through some "aspect cross-communication" mechanism.
 *
 * **NOTE**: When this hook is used, the supplied curRootAppElm MUST be
 * included as part of this definition!
 *
 * @callback injectRootAppElmMeth
 *
 * @param {App} app the App object used in feature cross-communication.
 * 
 * @param {Feature[]} activeFeatures - The set of active (enabled)
 * features that comprise this application.  This can be used in an
 * optional Aspect/Feature cross-communication.  As an example, an Xyz
 * Aspect may define a Feature API by which a Feature can inject DOM
 * in conjunction with the Xyz Aspect DOM injection.
 * 
 * @param {reactElm} curRootAppElm - the current react app element root.
 *
 * @return {reactElm} a new react app element root (which in turn must
 * contain the supplied curRootAppElm), or simply the supplied
 * curRootAppElm (if no change).
 */
