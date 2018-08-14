import verify      from '../util/verify';
import isString    from 'lodash.isstring';
import isFunction  from 'lodash.isfunction';
import logf        from '../util/logf';

/**
 * Create a new {{book.api.Feature}} object, cataloging
 * {{book.api.AspectContent}} to be consumed by
 * {{book.api.launchApp}}.  Each feature within an application
 * promotes it's own {{book.api.Feature}} object.
 *
 * For more information, please refer to
 * {{book.guide.detail_featureAndAspect}}.
 *
 * **Please Note** this function uses named parameters.
 *
 * @param {string} name the identity of the feature.  Feature names
 * are guaranteed to be unique.  Application code can use the Feature
 * name in various **single-source-of-truth** operations _(see
 * {{book.guide.bestPractices}})_.
 * 
 * @param {boolean} [enabled=true] an indicator as to whether this
 * feature is enabled (true) or not (false).  When used, this
 * indicator is typically based on a dynamic expression, allowing
 * packaged code to be dynamically enabled/disabled at run-time
 * _(please refer to: {{book.guide.enablement}})_.
 *
 * @param {fassets} [fassets] 
 * an optional aspect that promotes feature assets used in
 * {{book.guide.crossCom}} (i.e. the Public Face of a feature).
 * `fassets` directives can both define resources, and/or declare a
 * resource contract (the intention to use a set of fasset resources).
 * Resources are accumulated across all features, and exposed through
 * the {{book.api.FassetsObject}}, and the {{book.api.withFassets}}
 * HoC.
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
 * defined by the feature-u's Aspect plugins (please refer to:
 * {{book.guide.detail_extendableAspects}} -and-
 * {{book.guide.extending}}).
 *
 * @return {Feature} a new Feature object (to be consumed by
 * launchApp()).
 *
 * @function createFeature
 */
export default function createFeature({name,
                                       enabled=true,

                                       fassets,

                                       appWillStart,
                                       appDidStart,

                                       ...extendedAspect}={}) {

  // validate createFeature() parameters
  const check = verify.prefix('createFeature() parameter violation: ');

  // ... name
  check(name,            'name is required');
  check(isString(name),  'name must be a string');

  // ... enabled
  check(enabled===true || enabled===false, 'enabled must be a boolean');

  // ... fasset: validation occurs in createFasset()

  // ... appWillStart
  if (appWillStart) {
    check(isFunction(appWillStart), 'appWillStart (when supplied) must be a function');
  }

  // ... appDidStart
  if (appDidStart) {
    check(isFunction(appDidStart), 'appDidStart (when supplied) must be a function');
  }

  // ... extendedAspect
  //     ... this validation occurs by the Aspect itself (via launchApp())
  //         BECAUSE we don't know the Aspects in use UNTIL run-time (in launchApp)

  // create/return our new Feature object
  return {
    name,
    enabled,

    fassets,

    appWillStart,
    appDidStart,

    ...extendedAspect,
  };
}


/**
 * Maintain all VALID Feature properties.
 *
 * This is used to restrict Feature properties to ONLY valid ones:
 *  - preventing user typos
 *  - validation is employed at run-time in launchApp()
 *
 * Initially seeded with Feature builtins.
 *
 * Later, supplemented with extendFeatureProperty(name, owner) at run-time
 * (via Aspect plugins).
 *
 * @private
 */
const validFeatureProps = {

  //            owner id  of extension (ex: aspect's npm package name)
  //            =========
  name:         'builtin',
  enabled:      'builtin',
  publicFace:   'builtin',  // OBSOLETE as of feature-u@1 ... still registered for the sole purpose of generating more specific error (see: createFassets.js)
  fassets:      'builtin',
  appWillStart: 'builtin',
  appDidStart:  'builtin',

};

/**
 * Is the supplied name a valid Feature property?
 *
 * @param {string} name the property name to check.
 *
 * @param {boolean} true:  valid Feature property,
 *                  false: NOT a Feature property
 *
 * @private
 */
export function isFeatureProperty(name) {
  return validFeatureProps[name] ? true : false;
}

/**
 * Extend valid Feature properties to include the supplied name
 * ... used when extending APIs for
 * {{book.guide.extending_aspectCrossCommunication}}.
 *
 * **feature-u** keeps track of the agent that owns this extension
 * (using the owner parameter).  This is used to prevent exceptions
 * when duplicate extension requests are made by the same owner.  This
 * can happen when multiple instances of an aspect type are supported,
 * and also in unit testing.
 *
 * @param {string} name the property name to allow.
 *
 * @param {string} owner the requesting owner id of this extension
 * request.  Use any string that uniquely identifies your utility
 * _(such as the aspect's npm package name)_.
 * 
 * @throws {Error} when supplied name is already reserved by a different owner
 */
export function extendFeatureProperty(name, owner) {

  // validate parameters
  const check = verify.prefix('extendFeatureProperty() parameter violation: ');

  check(name,            'name is required');
  check(isString(name),  'name must be a string');

  check(owner,           'owner is required');
  check(isString(owner), 'owner must be a string');

  // verify supplied name is NOT already reserved (by a different owner)
  if (isFeatureProperty(name) &&           // already reserved
      validFeatureProps[name] !== owner) { // by a different owner
    throw new Error(`**ERROR** extendFeatureProperty('${name}', '${owner}') ... 'Feature.${name}' is already reserved by different owner.`);
  }

  // reserve it
  validFeatureProps[name] = owner;
  logf(`invoking: extendFeatureProperty('${name}', '${owner}') ... now validFeatureProps: `, validFeatureProps);
}



//***
//*** Specification: Feature
//***

/**
 * @typedef {Object} Feature
 * 
 * The Feature object is merely a lightweight container that holds
 * {{book.api.AspectContent}} of interest to **feature-u**.
 * 
 * Each feature within an application promotes a Feature object (using
 * {{book.api.createFeature}}) which catalogs the aspects of that feature.
 * 
 * Ultimately, all Feature objects are consumed by
 * {{book.api.launchApp}}.
 * 
 * Feature content are simple key/value pairs (the key being an
 * Aspect.name with values of AspectContent).  These aspects can
 * either be **built-in** (from core **feature-u**), or **extensions**.
 *
 * Here is an example:
 * 
 * ```js
 * export default createFeature({
 *   name:     'featureA', // builtin aspect (name must be unique across all features within app)
 *   enabled:  true,       // builtin aspect enabling/disabling feature
 * 
 *   fassets: {            // builtin aspect promoting Public Face - Cross Feature Communication
 *     define: {
 *       'api.openA':  () => ...,
 *       'api.closeA': () => ...,
 *     },
 *   },
 * 
 *   appWillStart: (...) => ..., // builtin aspect (Application Life Cycle Hook)
 *   appDidStart:  (...) => ..., // ditto
 * 
 *   reducer: ..., // feature redux reducer (extended aspect from the feature-redux plugin)
 *   logic:   ..., // feature logic modules (extended aspect from the feature-redux-logic plugin)
 * });
 * ```
 *
 * For more information, please refer to
 * {{book.guide.detail_featureAndAspect}}.
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
 * accumulative process of other feature injections)! **More information 
 * is available at {{book.guide.injectingDomContent}}**
 *
 * For more information _(with examples)_, please refer to the
 * Guide's {{book.guide.appWillStart}}.
 *
 * **Please Note** this function uses named parameters.
 *
 * @callback appWillStartCB
 * 
 * @param {Fassets} fassets the Fassets object used in cross-feature-communication.
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
 * @param {Fassets} fassets the Fassets object used in cross-feature-communication.
 * 
 * @param {Any} [appState] - the redux top-level app state (when redux
 * is in use).
 * 
 * @param {function} [dispatch] - the redux dispatch() function (when
 * redux is in use).
 *
 * @return void
 */


//***
//*** Specification: fassets
//***

/**
 * @typedef {BuiltInAspect} fassets
 * 
 * A builtin aspect that publicly promotes feature-based resources
 * called `fassets` (feature assets).  These resources are the basis
 * of {{book.guide.crossCom}}. You can think of this as the Public Face
 * of a feature.
 * 
 * **SideBar**: The term `fassets` is a play on words.  While it is
 * pronounced "facet" _and is loosely related to this term_, it is
 * spelled fassets (i.e. feature assets).
 * 
 * Feature resources are accumulated across all features, and exposed
 * through the {{book.api.FassetsObject}}.  They can also be referenced
 * via the {{book.api.withFassets}} HoC.
 * 
 * The `fassets` aspect can both define resources, and/or declare a
 * resource contract (i.e. the intention to use a set of fasset
 * resources).  This is accomplished via three separate `fassets`
 * directives: `define`, `use`, and `defineUse`.  A good summary of
 * these directives can be found at
 * {{book.guide.crossCom_fassetsRecapPushOrPull}}.
 * 
 * 1. **define**: define public resources, held in the
 *    {{book.api.FassetsObject}}
 *    
 *    ```js
 *    fassets: {
 *      define: {
 *        '{fassetsKey}': {fassetsValue}
 *    
 *        ... 
 *    
 *        NOTES:
 *         - fassetsKey MUST be unique
 *         - are case-sensitive
 *         - may contain federated namespace (via dots ".")
 *           ... normalized in fassets object
 *           ... ex: 'MainPage.launch'
 *         - may be any valid JS identifier (less $ support)
 *         - may NOT contain wildcards
 *           ... i.e. must be defined completely
 *
 *        // examples ...
 *        'openView': actions.view.open, // fassets.openView(viewName): Action
 *    
 *        // federated namespace example
 *        'selector.currentView': selector.currentView, // fassets.selector.currentView(appState): viewName
 *    
 *        // UI Component example
 *        'MainPage.cart.link': () => <Link to="/cart">Cart</Link>,
 *        'MainPage.cart.body': () => <Route path="/cart" component={ShoppingCart}/>,
 *      }
 *    }
 *    ```
 *    
 * 2. **use**: specify public resource keys that will be **used** by the
 *    containing feature (i.e. a resource contract)
 *    
 *    ```js
 *    fassets: {
 *      use: [
 *        '{fassetsKey}',
 *        -or-
 *        ['$fassetsKey', {required: true/false, type: $validationFn}],
 *    
 *        ... 
 *    
 *        NOTES:
 *         - each key will be supplied by other features
 *         - this is a communication to other features (i.e. a contract)
 *           ... saying: I plan to "use" these injections
 *           HOWEVER: feature-u cannot strictly enforce this usage
 *                    ... enclosed feature should reference this
 *                        {fassetsKey} through fassets.get(), or withFassets()
 *         - is case-sensitive
 *         - may contain federated namespace (with dots ".")
 *           ... ex: 'MainPage.launch'
 *         - may be any valid JS identifier (less $ support)
 *         - may contain wildcards (with "*")
 *           ... ex: 'MainPage.*.link'
 *
 *        // examples ...
 *        'MainPage.launch',
 *       
 *        // may contain wildcards ...
 *        'MainPage.*.link',
 *        'MainPage.*.body',
 *       
 *        // optionally supply options object, controlling optionality and data types
 *        ['MainPage.*.link',  { required: true,   type: any  }], // same as DEFAULTS
 *        ['MainPage.*.link',  { required: false,             }], // optional of any type
 *        ['MainPage.*.link',  {                   type: comp }], // required of react component type
 *        ['MainPage.*.link',  { required: false,  type: comp }], // optional of react component type
 *      ]
 *    }
 *    ```
 *    
 * 3. **defineUse**: define public resources specified by other features (via
 *    the `use` directive)
 *    
 *    ```js
 *    fassets: {
 *      defineUse: {
 *        '{fassetsKey}': {fassetsValue}
 *    
 *        ... 
 *    
 *        NOTES:
 *         - this is identical to fassets.define EXCEPT:
 *         - it MUST MATCH a fassets.use directive
 *           ... using this directive, feature-u will perform additional
 *               validation to unsure these entries match a use contract
 *    
 *        // examples ...
 *        'MainPage.cart.link': () => <Link to="/cart">Cart</Link>,
 *        'MainPage.cart.body': () => <Route path="/cart" component={ShoppingCart}/>,
 *      }
 *    }
 *    ```
 * 
 * For more information, please refer to {{book.guide.crossCom}},
 * {{book.api.FassetsObject}}, the {{book.api.withFassets}} HoC,
 * and the {{book.guide.crossCom_fassetsRecapPushOrPull}}.
 */
