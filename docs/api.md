
<br/><br/><br/>

<a id="createFeature"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  createFeature(name, [enabled], [publicFace], [appWillStart], [appDidStart], [extendedAspect]) ⇒ [`Feature`](#Feature)</h5>
Create a new Feature object, accumulating Aspect content to be consumedby launchApp().**Please Note** `createFeature()` accepts named parameters.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | string |  | the identity of the feature.  Feature names are used to index the [App Object](#app-object) by feature _(in support of [Cross Feature Communication](#cross-feature-communication))_, and are therefore guaranteed to be unique.  Application code can also use [Feature Name](#feature-name) in various [Single Source of Truth](#single-source-of-truth) operations. |
| [enabled] | boolean | <code>true</code> | an indicator as to whether this feature is enabled (true) or not (false).  When used, this indicator is typically based on a dynamic expression, allowing packaged code to be dynamically enabled/disabled at run-time _(please refer to: [Feature Enablement](#feature-enablement))_. |
| [publicFace] | Any |  | an optional resource object that is the feature's Public API, promoting cross-communication between features.  This object is exposed through the App object as: `app.{featureName}.{publicFace}` _(please refer to: [publicFace and the App Object](#publicface-and-the-app-object))_. |
| [appWillStart] | [`appWillStartCB`](#appWillStartCB) |  | an optional [Application Life Cycle Hook](#application-life-cycle-hooks) invoked one time, just before the app starts up.  This life-cycle hook can do any type of initialization, and/or optionally supplement the app's top-level content (using a non-null return) _(please refer to: [appWillStart](#appwillstart))_. |
| [appDidStart] | [`appDidStartCB`](#appDidStartCB) |  | an optional [Application Life Cycle Hook](#application-life-cycle-hooks) invoked one time, immediately after the app has started.  Because the app is up-and-running at this time, you have access to the appState and the dispatch() function ... assuming you are using redux (when detected by feature-u's plugable aspects) _(please refer to: [appDidStart](#appdidstart))_. |
| [extendedAspect] | [`AspectContent`](#AspectContent) |  | additional aspects, as defined by the feature-u's pluggable Aspect extension. |

**Returns**: [`Feature`](#Feature) - a new Feature object (to be consumed by feature-ulaunchApp()).  

<br/><br/><br/>

<a id="addBuiltInFeatureKeyword"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  addBuiltInFeatureKeyword(keyword)</h5>
Add additional Feature keyword (typically used by Aspect extensionsto Feature).


| Param | Type | Description |
| --- | --- | --- |
| keyword | string | the keyword name to add. |


<br/><br/><br/>

<a id="launchApp"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  launchApp([aspects], features, registerRootAppElm) ⇒ App</h5>
Launch an app by assembling the supplied features, driving theconfiguration of the frameworks in use, as orchistrated by thesupplied set of pluggable apsects.- It manages the setup and configuration of all your feature  aspects, including things like: state management, logic, routing,  etc.- It facilitates app life-cycle methods on the Feature object,  allowing features to manage things like: initialization and  inject root UI elements, etc.- It creates and promotes the App object which contains the  publicFace of all features, facilating a cross-communication  between features.Please refer to the user documenation for more details and completeexamples.**Please Note** `launchApp()` accepts named parameters.


| Param | Type | Description |
| --- | --- | --- |
| [aspects] | [`Array.&lt;Aspect&gt;`](#Aspect) | the set of plugable aspects that extend feature-u, integrating other frameworks to match your specific run-time stack.  When NO aspects are supplied (an atypical case), only the very basic feature-u characteristics are in effect (like publicFace and life-cycle hooks). |
| features | [`Array.&lt;Feature&gt;`](#Feature) | the features that comprise this application. |
| registerRootAppElm | [`registerRootAppElmCB`](#registerRootAppElmCB) | the callback hook that registers the supplied root application element to the specific React framework used in the app.  Because this registration is accomplished by app-specific code, feature-u can operate in any of the react platforms, such as: React Web, React Native, Expo, etc. |

**Returns**: App - the App object used to promote featurecross-communication.  

<br/><br/><br/>

<a id="managedExpansion"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  managedExpansion(managedExpansionCB) ⇒ [`managedExpansionCB`](#managedExpansionCB)</h5>
Mark the supplied managedExpansionCB as a "managed expansioncallback", distinguishing it from other functions (such as reducerfunctions).Features may communicate AspectContent directly, or through amanagedExpansionCB.  The latter: 1. supports cross-feature communication (through app object    injection), and  2. minimizes circular dependency issues (of ES6 modules).Managed Expansion Callbacks are used when a fully resolved `app`object is requried during in-line code expansion.  They are merelyfunctions that are passed the `app` object and return theexpanded AspectContent (ex: reducer, logic modules, etc.).The managedExpansionCB function should conform to the followingsignature:```jsAPI: managedExpansionCB(app): AspectContent```Example (feature-redux `reducerAspect`):```js  export default slicedReducer('foo', managedExpansion( (app) => combineReducers({...reducer-code-requiring-app...} ) ));```SideBar: For reducer aspects, slicedReducer() should always wrap         the the outer function passed to createFunction(), even         when managedExpansion() is used.Example (feature-redux-logic `logicAspect`):```js  export const startAppAuthProcess = managedExpansion( (app) => createLogic({    ...logic-code-requiring-app...  }));```Please refer to the feature-u `managedExpansion()` documentationfor more detail.


| Param | Type | Description |
| --- | --- | --- |
| managedExpansionCB | [`managedExpansionCB`](#managedExpansionCB) | the callback function that when invoked (by feature-u) expands/returns the desired AspectContent. |

**Returns**: [`managedExpansionCB`](#managedExpansionCB) - the supplied managedExpansionCB,marked as a "managed expansion callback".  

<br/><br/><br/>

<a id="createAspect"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  createAspect(name, [validateConfiguration], [expandFeatureContent], validateFeatureContent, assembleFeatureContent, [assembleAspectResources], [injectRootAppElm], [additionalMethods]) ⇒ [`Aspect`](#Aspect)</h5>
Create an Aspect object, used to extend feature-u.The Aspect object promotes a series of life-cycle methods that**feature-u** invokes in a controlled way.  This life-cycle iscontrolled by `launchApp()` _... it is supplied the Aspects, and itinvokes their methods._The essential characteristics of the Aspect life-cycle is to:- accumulate aspect content across all features- perform the desired setup and configuration- expose the framework in some way _(by injecting a component in the  root DOM, or some "aspect cross-communication mechanism")_Typically the Aspect object will need to retain state between theselife-cycle methods in order to do it's job.Some Aspects may rely on an "aspect cross-communication mechanism" toaccomplish it's work.  This is merely a proprietary Aspect method whichis documented and consumed by another Aspect.  Please refer to[Aspect.additionalMethods()](#aspectadditionalmethods).**Please Note**: `createAspect()` accepts named parameters.  Theorder in which these items are presented represents the same orderthey are executed.


| Param | Type | Description |
| --- | --- | --- |
| name | string | the aspect name.  This name is used to "key" aspects of this type in the Feature object: `Feature.{name}: xyz`. As a result, Aspect names must be unique across all aspects that are in-use. |
| [validateConfiguration] | [`validateConfigurationMeth`](#validateConfigurationMeth) | an optional validation hook allowing this aspect to verify it's own required configuration (if any).  Some aspects may require certain settings in self for them to operate. |
| [expandFeatureContent] | [`expandFeatureContentMeth`](#expandFeatureContentMeth) | an optional aspect expansion hook, defaulting to the algorithm defined by managedExpansion().  This function rarely needs to be overridden. It provides a hook to aspects that need to transfer additional content from the expansion function to the expanded content. |
| validateFeatureContent | [`validateFeatureContentMeth`](#validateFeatureContentMeth) | a validation hook allowing this aspect to verify it's content on the supplied feature (which is known to contain this aspect). |
| assembleFeatureContent | [`assembleFeatureContentMeth`](#assembleFeatureContentMeth) | the Aspect method that assembles content for this aspect across all features, retaining needed state for subsequent ops. This method is required because this is the primary task that is accomplished by all aspects. |
| [assembleAspectResources] | [`assembleAspectResourcesMeth`](#assembleAspectResourcesMeth) | an optional Aspect method that assemble resources for this aspect across all other aspects, retaining needed state for subsequent ops.  This hook is executed after all the aspects have assembled their feature content (i.e. after `assembleFeatureContent()`). |
| [injectRootAppElm] | [`injectRootAppElmMeth`](#injectRootAppElmMeth) | an optional callback hook that promotes some characteristic of this aspect within the app root element (i.e. react component instance). |
| [additionalMethods] | Any | additional methods (proprietary to specific Aspects), supporting two different requirements: <ol> <li> internal Aspect helper methods, and <li> APIs used in "aspect cross-communication" ... a contract      between one or more aspects.  This is merely an API specified      by one Aspect, and used by another Aspect, that is facilitate      through the `Aspect.assembleAspectResources(app, aspects)`      hook. </ol> |

**Returns**: [`Aspect`](#Aspect) - a new Aspect object (to be consumed by launchApp()).  

<br/><br/><br/>

<a id="verify"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  verify(condition, msg)</h5>
A convenience assertion utility, typically used to validatepre-conditions of a routine.**Advanced**: verify.prefix(msgPrefix) returns a higher-order              verify() function where all messages are prefixed.

**Throws**:

- Error an Error is thrown when the supplied condition isNOT met.


| Param | Type | Description |
| --- | --- | --- |
| condition | truthy | a "truthy" condition which must be satisfied. |
| msg | string | a message clarifying the condition being checked. |


<br/><br/><br/>

<a id="Feature"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  Feature : Object</h5>
Feature objects (emitted from `createFeature()`) are used ?? bla bla


<br/><br/><br/>

<a id="appWillStartCB"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  appWillStartCB ⇒ reactElm</h5>
An optional app life-cycle hook invoked one time, just before theapp starts up.This life-cycle hook can do any type of initialization. Forexample: initialize FireBase.In addition, it can optionally supplement the app's top-level rootelement (i.e. react component instance).  Any significant return(truthy) is interpreted as the app's new rootAppElm.**IMPORTANT**: When this is used, the supplied curRootAppElm MUSTbe included as part of this definition (accommodating theaccumulative process of other feature injections)!**Please Note** `appWillStart()` utilizes named parameters.


| Param | Type | Description |
| --- | --- | --- |
| app | App | the App object used in feature cross-communication. |
| curRootAppElm | reactElm | the current react app element root. |

**Returns**: reactElm - optionally, new top-level content (which in turnmust contain the supplied curRootAppElm), or falsy for unchanged.  

<br/><br/><br/>

<a id="appDidStartCB"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  appDidStartCB : function</h5>
An optional app life-cycle hook invoked one time, immediately afterthe app has started.Because the app is up-and-running at this time, you have access tothe appState and dispatch() function ... assuming you are usingredux (when detected by feature-u's plugable aspects).**Please Note** `appDidStart()` utilizes named parameters.


| Param | Type | Description |
| --- | --- | --- |
| app | App | the App object used in feature cross-communication. |
| [appState] | Any | the redux top-level app state (when redux is in use). |
| [dispatch] | function | the redux dispatch() function (when redux is in use). |


<br/><br/><br/>

<a id="registerRootAppElmCB"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  registerRootAppElmCB : function</h5>
The launchApp() callback hook that registers the supplied rootapplication element to the specific React framework used in the app.Because this registration is accomplished by app-specific code,feature-u can operate in any of the React platforms, such as: ReactWeb, React Native, Expo, etc. (see: **React Registration**).**NOTE on rootAppElm:**- Typically the supplied rootAppElm will have definition, based on  the Aspects and Features that are in use.  In this case, it is the  responsibility of this callback to register this content in  some way (either directly or indirectly).- However, there are atypical isolated cases where the supplied  rootAppElm can be null.  This can happen when the app chooses NOT  to use Aspects/Features that inject any UI content.  In this case,  the callback is free to register it's own content.Please refer to the user documentation for more details andcomplete examples.


| Param | Type | Description |
| --- | --- | --- |
| rootAppElm | reactElm | the root application element to be registered. |


<br/><br/><br/>

<a id="managedExpansionCB"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  managedExpansionCB ⇒ [`AspectContent`](#AspectContent)</h5>
A "managed expansion callback" (defined by `managedExpansion()`) thatwhen invoked (by feature-u) expands and returns the desiredAspectContent.


| Param | Type | Description |
| --- | --- | --- |
| app | App | The feature-u app object, promoting the publicFace of each feature. |

**Returns**: [`AspectContent`](#AspectContent) - The desired AspectContent (ex: reducer,logic module, etc.).  

<br/><br/><br/>

<a id="Aspect"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  Aspect : Object</h5>
Aspect objects (emitted from `createAspect()`) are used to extendfeature-u.


<br/><br/><br/>

<a id="AspectContent"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  AspectContent : Any</h5>
The content (or payload) of an Aspect, specified within a Feature.An Aspect accumulates appropriate information from Features, indexedby the Aspect name.The content type is specific to the Aspect.  For example, a reduxAspect assembles reducers, while a redux-logic Aspect gathers logicmodules.


<br/><br/><br/>

<a id="validateConfigurationMeth"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  validateConfigurationMeth ⇒ string</h5>
A validation hook allowing this aspect to verify it's own requiredconfiguration (if any).  Some aspects may require certain settingsin self for them to operate.

**Returns**: string - an error message when self is in an invalid state(falsy when valid).  Because this validation occurs under thecontrol of `launchApp()`, any message is prefixed with:`'launchApp() parameter violation: '`.  

<br/><br/><br/>

<a id="expandFeatureContentMeth"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  expandFeatureContentMeth ⇒ string</h5>
Expand self's AspectContent in the supplied feature, replacing thatcontent (within the feature).  Once expansion is complete,feature-u will perform a delayed validation of the expandedcontent.The default behavior simply implements the expansion algorithmdefined by managedExpansion():```jsfeature[this.name] = feature[this.name](app);```This default behavior rarely needs to change.  It however providesa hook for aspects that need to transfer additional content fromthe expansion function to the expanded content.  As an example, the`reducer` aspect must transfer the slice property from theexpansion function to the expanded reducer.


| Param | Type | Description |
| --- | --- | --- |
| app | App | the App object used in feature cross-communication. |
| feature | [`Feature`](#Feature) | the feature which is known to contain this aspect **and** is in need of expansion (as defined by managedExpansion()). |

**Returns**: string - an optional error message when the suppliedfeature contains invalid content for this aspect (falsy whenvalid).  This is a specialized validation of the expansionfunction, over-and-above what is checked in the standardvalidateFeatureContent() hook.  

<br/><br/><br/>

<a id="validateFeatureContentMeth"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  validateFeatureContentMeth ⇒ string</h5>
A validation hook allowing this aspect to verify it's content onthe supplied feature.


| Param | Type | Description |
| --- | --- | --- |
| feature | [`Feature`](#Feature) | the feature to validate, which is known to contain this aspect. |

**Returns**: string - an error message string when the supplied featurecontains invalid content for this aspect (falsy when valid).Because this validation conceptually occurs under the control of`createFeature()`, any message is prefixed with: `'createFeature()parameter violation: '`.  

<br/><br/><br/>

<a id="assembleFeatureContentMeth"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  assembleFeatureContentMeth : function</h5>
The required Aspect method that assembles content for this aspectacross all features, retaining needed state for subsequent ops.This method is required because this is the primary task that isaccomplished by all aspects.


| Param | Type | Description |
| --- | --- | --- |
| app | App | the App object used in feature cross-communication. |
| activeFeatures | [`Array.&lt;Feature&gt;`](#Feature) | The set of active (enabled) features that comprise this application. |


<br/><br/><br/>

<a id="assembleAspectResourcesMeth"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  assembleAspectResourcesMeth : function</h5>
An optional Aspect method that assemble resources for this aspectacross all other aspects, retaining needed state for subsequentops.  This hook is executed after all the aspects have assembledtheir feature content (i.e. after `assembleFeatureContent()`).This is an optional second-pass (so-to-speak) of Aspect datagathering, that facilitates an "aspect cross-communication"mechanism.  It allows a given aspect to gather resources from otheraspects, through a documented API for a given Aspect (ex:Aspect.getXyz()).As an example of this, the "reducer" aspect (which manages redux),allows other aspects to inject their own redux middleware (ex:redux-logic), through it's documented Aspect.getReduxMiddleware()API.


| Param | Type | Description |
| --- | --- | --- |
| app | App | the App object used in feature cross-communication. |
| aspects | [`Array.&lt;Aspect&gt;`](#Aspect) | The set of feature-u Aspect objects used in this this application. |


<br/><br/><br/>

<a id="injectRootAppElmMeth"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  injectRootAppElmMeth ⇒ reactElm</h5>
An optional callback hook that promotes some characteristic of thisaspect within the app root element (i.e. react component instance).All aspects will either promote themselves through this hook, -or-through some "aspect cross-communication" mechanism.**NOTE**: When this hook is used, the supplied curRootAppElm MUST beincluded as part of this definition!


| Param | Type | Description |
| --- | --- | --- |
| app | App | the App object used in feature cross-communication. |
| activeFeatures | [`Array.&lt;Feature&gt;`](#Feature) | The set of active (enabled) features that comprise this application.  This can be used in an optional Aspect/Feature cross-communication.  As an example, an Xyz Aspect may define a Feature API by which a Feature can inject DOM in conjunction with the Xyz Aspect DOM injection. |
| curRootAppElm | reactElm | the current react app element root. |

**Returns**: reactElm - a new react app element root (which in turn mustcontain the supplied curRootAppElm), or simply the suppliedcurRootAppElm (if no change).  
