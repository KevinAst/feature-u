# Extending feature-u

**feature-u** is extendable!  It operates in an open plugable
architecture where Extendable Aspects integrate **feature-u** to other
frameworks, matching your specific run-time stack.  **This is good,**
_because not everyone uses the same frameworks_!

 - You want state management using {{book.ext.redux}}?  There is an
   Aspect for that: {{book.ext.featureRedux}}.

 - You want to maintain your logic using {{book.ext.reduxLogic}}?
   There is an Aspect for that: {{book.ext.featureReduxLogic}}.

 - You want your features to autonomously promote their screens within
   the application?  There is an Aspect for that:
   {{book.ext.featureRouter}}.

 - Can't find an Aspect that integrates the XYZ framework?  You can
   create your own using {{book.api.createAspect}}!  For extra credit,
   you should consider publishing your package, so other XYZ users can
   benefit from your work!

It is important to understand that **feature-u** does not alter the
interface to these frameworks in any way.  You use them the same way
you always have.  **feature-u** merely provides a well defined
organizational layer, where the frameworks are automatically
setup and configured by accumulating the necessary resources across all
your features.


## Locating Extensions

To locate the latest set of published **feature-u** extensions, simply
**search the npm registry** using a `'feature-u'` keyword.  All
packages that extend **feature-u** should include this keyword in
their package.

During **feature-u**'s initial release (3/2018), I published the three
Aspects mentioned above _(matching my preferred stack)_, so at that
time there were three plugins.  Assuming **feature-u** gains momentum,
the hope is that other authors will contribute their work.

If you create your own extension and decide to publish it, don't
forget to include the `'feature-u'` keyword in your package, _so
others can easily locate your extension_.


## Aspect Object (extending feature-u)

To extend **feature-u**, you merely define and promote an
{{book.api.Aspect}} object (using {{book.api.createAspect}}).

The {{book.api.Aspect}} object promotes a series of life-cycle methods
that **feature-u** invokes in a controlled way.  This life-cycle is
controlled by {{book.api.launchApp}} _... it is supplied the Aspects,
and it invokes their methods._

The essential characteristics of the {{book.api.Aspect}} life-cycle is
to:

- accumulate {{book.api.AspectContent}} across all features
- perform the desired setup and configuration
- expose the framework in some way _(by injecting a component in the
  root DOM, or some {{book.guide.extending_aspectCrossCommunication}}
  mechanism)_

For complete details, please refer to the section on
{{book.guide.extending_aspectLifeCycleMethods}}.


## Defining rootAppElm

In **feature-u** the `rootAppElm` is the top-level react DOM that
represents the display of the entire application.

This is a non-changing omnipresent DOM that achieves it's dynamics
through a series of both framework components and application injected
utilities.  As an example, a typical `rootAppElm` may contain:

- a navigational component **providing screen dynamics** _(through an **Aspect** Framework injection)_
- a state promotional component **making state available to subordinates** _(through an **Aspect** Framework injection)_
- a notification utility _(through an application **Feature** injection)_
- a left-nav menu _(through an application **Feature** injection)_
- etc. etc. etc.

The `rootAppElm` is defined through a progressive accumulation of DOM
injections, using a combination of both {{book.api.Aspects}} and
{{book.api.Features}}.

There are **three API's** involved and they all accept a `curRootAppElm`
parameter, and return a new `rootAppElm` that includes the supplied
element, _accommodating the accumulative process_.

The three API's are listed here, and **are executed in this order**.
They include life-cycle-hooks that are defined from both
{{book.api.Aspects}} and {{book.api.Features}}.

1. {{book.guide.initialRootAppElmMeth$}}
2. {{book.guide.appWillStartCB$}}
3. {{book.guide.injectRootAppElmMeth$}}

It is important to understand that the {{book.api.Feature}} hook is
sandwiched between the two {{book.api.Aspect}} hooks.  _Without this
insight, you would most certainly wonder what the difference was
between the two Aspect hooks_.

A null `rootAppElm` seeds the entire process.  The first hook is used
by any Aspect that wishes to inject itself before all others ... and
so on.  The end result is a DOM hierarchy where the first injected
element is manifest at the bottom of the hierarchy, and the last
injection ends up on top.

To put this in perspective, let's analyze an example where we are
using two Aspects ({{book.ext.featureRedux}}, and
{{book.ext.featureRouter}}), and an application Feature that manages a
left-nav menu available throughout the application.

1. The Aspect for {{book.ext.featureRouter}} (`routeAspect`) injects a
   `<StateRouter>` component that (by design) can have no other
   children.  Therefore it uses the first api:

   **`routeAspect: Aspect.initialRootAppElm()`**
   ```js
   function initialRootAppElm(fassets, curRootAppElm) {
     // insure we don't clobber any supplied content
     // ... by design, <StateRouter> doesn't support children
     if (curRootAppElm) {
       throw new Error('*** ERROR*** Please register routeAspect (from feature-router) before other Aspects ' +
                       'that inject content in the rootAppElm ... <StateRouter> does NOT support children.');
     }

     // seed the rootAppElm with our StateRouter
     return <StateRouter routes={this.routes}
                         fallbackElm={this.config.fallbackElm$}
                         componentWillUpdateHook={this.config.componentWillUpdateHook$}
                         namedDependencies={{fassets}}/>;
   }
   ```

2. The `leftNav` application feature, injects it's Drawer/SideBar
   component through the second API _(the only one available to
   Features)_:

   **`leftNav: Feature.appWillStart()`**
   ```js
   function appWillStart({fassets, curRootAppElm}) {
     return (
       <Drawer ref={ ref => registerDrawer(ref) }
               content={<SideBar/>}
               onClose={closeSideBar}>
         {curRootAppElm}
       </Drawer>
     );
   }
   ```

3. The Aspect for {{book.ext.featureRedux}} (`reducerAspect`) injects the redux
   `<Provider>` component that must encompass all other components
   (i.e. be on top). Therefore it uses the third API:

   **`reducerAspect: Aspect.injectRootAppElm()`**
   ```js
   function injectRootAppElm(fassets, curRootAppElm) {
     return (
       <Provider store={this.appStore}>
         {curRootAppElm}
       </Provider>
     );
   }
   ```

4. Last but not least, **feature-u** renders
   `<FassetsContext.Provider>` at the root of the application DOM _(in
   support of {{book.guide.crossCom}} with the {{book.api.useFassets}}
   Hook and {{book.api.withFassets}} HoC)_.

   This is conditionally performed only when a rootAppElm has been
   defined.  Otherwise, the App is responsible for this in the
   {{book.api.registerRootAppElmCB}} hook.

   ```js
   if (rootAppElm) {
     rootAppElm = <FassetsContext.Provider value={fassets}>{rootAppElm}</FassetsContext.Provider>;
   }
   ```

The **end result** of this example generates the following DOM:

```
<FassetsContext.Provider value={fassets}>
  <Provider store={this.appStore}>
    <Drawer ref={ ref => registerDrawer(ref) }
            content={<SideBar/>}
            onClose={closeSideBar}>
      <StateRouter routes={this.routes}
                   fallbackElm={this.config.fallbackElm$}
                   componentWillUpdateHook={this.config.componentWillUpdateHook$}
                   namedDependencies={{fassets}}/>
    </Drawer>
  </Provider>
</FassetsContext.Provider>
```


## Aspect Cross Communication

Some Aspects will rely on an **Aspect Cross Communication** mechanism
to accomplish their work _(not to be confused with
{{book.guide.crossCom}})_.

**Aspect Cross Communication** is where an **Aspect** requires
additional information _(over and above it's
{{book.api.AspectContent}})_ either from other {{book.api.Aspects}} or
{{book.api.Features}}.  Therefore the extending Aspect must define
(and use) **additional Aspect/Feature APIs**.

As an example of this, consider the {{book.ext.featureRedux}} plugin.
Because it manages {{book.ext.redux}}, it also maintains the
{{book.ext.reduxMiddleware}}.  As a result, it must provide a way for
other **Aspects** to inject their middleware.  It accomplishes this by
exposing a new **Aspect API**: `Aspect.getReduxMiddleware()`.

- An extending **Aspect** that introduces a new API should **do the
  following**:
  
  1. Document the API, so the external client knows how to use it.
  
  1. Register the API, allowing it to pass **feature-u** validation.
     Depending on whether this is an API for a {{book.api.Aspect}} or
     {{book.api.Feature}}, use one of the following:
  
     - **API:** {{book.api.extendAspectProperty$}}
     - **API:** {{book.api.extendFeatureProperty$}}
  
     This registration allows the new API (i.e. the `name` parameter)
     to be referenced in either {{book.api.createAspect}} or
     {{book.api.createFeature}} respectively.

     This registration should occur in the client constructor or
     the {{book.guide.genesisMeth}} life cycle method _(i.e. very
     early)_ to guarantee the new API is available during
     **feature-u** validation.

     **SideBar**: **feature-u** keeps track of the agent that owns
     each extension through the owner parameter.  Use any string that
     uniquely identifies your utility _(such as the aspect's npm
     package name)_.  This prevents exceptions when duplicate
     extension requests are made by the same owner.  This can happen
     when multiple instances of an aspect type are supported, and also
     in unit testing.
  
  1. Utilize the API in one of the
     {{book.guide.extending_aspectLifeCycleMethods}} to gather the
     additional information _(from other {{book.api.Aspects}} or
     {{book.api.Features}})_.

- **Example**: 

  As a **concrete example** of this, let's look at some code snippets
  from the aforementioned {{book.ext.featureRedux}} plugin:
  
  1. Here is how the new API is documented:

     [feature-redux Inputs](https://github.com/KevinAst/feature-redux#inputs)
  
     - **Middleware Integration**:
  
       Because **feature-redux** manages {{book.ext.redux}}, other Aspects
       can promote their {{book.ext.reduxMiddleware}} through
       **feature-redux**'s `Aspect.getReduxMiddleware()` API (an
       {{book.guide.extending_aspectCrossCommunication}} mechanism).  As
       an example, the {{book.ext.featureReduxLogic}} Aspect integrates
       **redux-logic**.
  
  1. Here is the new API registration:

     **`createReducerAspect()` constructor** ...
     [feature-redux/src/reducerAspect.js](https://github.com/KevinAst/feature-redux/blob/7ce84b7f15f0c23872e917745b990c8225236e2d/src/reducerAspect.js#L62-L70)
     ```js

     // ***
     // *** Initialization: register feature-redux proprietary Aspect APIs
     // ***

     extendAspectProperty('getReduxStore', 'feature-redux');      // Aspect.getReduxStore(): store
     extendAspectProperty('getReduxMiddleware', 'feature-redux'); // Aspect.getReduxMiddleware(): reduxMiddleware
     extendAspectProperty('getReduxEnhancer', 'feature-redux');   // Aspect.getReduxEnhancer(): StoreEnhancer
     ```
  
  1. Here is the new API usage:
  
     [feature-redux-logic/src/logicAspect.js](https://github.com/KevinAst/feature-redux-logic/blob/c879cad72eab5686de2f36ca59723052b88eac6c/src/logicAspect.js#L68-L78)
     ```js
     /**
      * Expose our redux middleware that activates redux-logic.  
      *
      * This method is consumed by the feature-redux Aspect using an
      * "aspect cross-communication".
      *
      * @private
      */
     function getReduxMiddleware() {
       return this.logicMiddleware;
     }
     ```
   

## Aspect Life Cycle Methods

The following list represents a complete compilation of all **Aspect
Life Cycle Methods**.  Simply follow the link for a thorough
discussion of each:

 - {{book.guide.aspectName}}
 - {{book.guide.genesisMeth$}}
 - {{book.guide.validateFeatureContentMeth$}}
 - {{book.guide.expandFeatureContentMeth$}}
 - {{book.guide.assembleFeatureContentMeth$}}
 - {{book.guide.assembleAspectResourcesMeth$}}
 - {{book.guide.initialRootAppElmMeth$}}
 - {{book.guide.injectRootAppElmMeth$}}
 - {{book.guide.injectParamsInHooksMeth$}}
 - {{book.guide.aspectConfig}}
 - {{book.guide.additionalMethods}}

**Notes of Interest** ...

- **Execution Order**: 

  The order in which these methods are presented _(above)_ represent
  the same order they are executed.


- **No Single Aspect Method is Required**: 

  Aspect Plugins have NO one specific method that is required.  Rather
  the requirement is to **specify something** _(so as to not have an
  empty plugin that does nothing)_.

  Typically, a plugin is accumulating aspect content from the feature
  set.  In this case it needs to specify the items that accommodate
  this process (i.e. {{book.guide.aspectName}},
  {{book.guide.validateFeatureContentMeth}}, and
  {{book.guide.assembleFeatureContentMeth}}).

  There are edge cases, however, where aspect content is **not**
  needed from the feature set.  Consider a case where an aspect plugin
  is merely "adding value" to another plugin (ex:
  {{book.ext.featureReduxPersist}} makes {{book.ext.featureRedux}}
  persistent).


- **Aspect State Retention**: 

  It is common for an **Aspect** to use more than one of these
  life cycle methods to do it's work.  When this happens, typically
  there is a need for state retention _(in order to pick up in one
  step where it left off in another)_.

  As an example, an Aspect may:

   1. use {{book.guide.assembleFeatureContentMeth}} to assemble it's
      content across all features ... **retaining the content**

   2. and then use {{book.guide.injectRootAppElmMeth}} to promote the
      **content assembled in the prior step**

  This state retention can be implemented in a number of different
  ways, depending on your philosophy and run-time environment.  For
  example, you could use the module context of an ES6 environment, or
  alternatively the Aspect object instance itself.

  The latter is available _(should you choose to use it)_ because
  these hooks are in fact methods of the **Aspect** object.  In other
  words, **`this`** is bound to the **Aspect** object instance.  As a
  result, you are free to use `this` for your **state retention**.
 

- **fassets Parameter**:

  You will notice that the `fassets` parameter is supplied on many of these
  life cycle methods.  As you know the {{book.api.FassetsObject}} is used
  in promoting {{book.guide.crossCom}}.  

  While it is most likely an anti-pattern to directly interrogate the
  {{book.api.FassetsObject}} within the **Aspect**, it is frequently required to
  "pass through" to downstream processes _(as an opaque object)_.
  **This is the reason the fassets object is supplied**!!

  As examples of this:

  - The `Feature.logic` aspect _({{book.ext.featureReduxLogic}})_ will
    dependency inject (DI) the {{book.api.FassetsObject}} into the
    {{book.ext.reduxLogic}} process.

  - The `Feature.route` aspect _({{book.ext.featureRouter}})_
    communicates `fassets` in it's routing callbacks.

  - etc. etc. etc.


### Aspect.name

The `Aspect.name` is used to "key" {{book.api.AspectContent}} of this
type in the {{book.api.Feature}} object.  

For example: an `Aspect.name: 'xyz'` would permit a `Feature.xyz:
xyzContent` construct.

As a result, Aspect names cannot clash with built-in aspects, and
they must be unique _(across all aspects that are in-use)_.

The `Aspect.name` is required, primarily for identity purposes _(in
logs and such)_.

### Aspect.genesis()

**API:** {{book.api.genesisMeth$}}

{{book.api.genesisMeth}} is a Life Cycle Hook invoked one
time, at the very beginning of the app's start up process.

**Antiquated Note**:

- The `genesis()` hook is somewhat antiquated, relegated to Aspects
  that are promoted as singletons.  In this scenario, client-side
  configuration could be introduced after instantiation _(by adding
  content to {{book.guide.aspectConfig}})_, while still allowing
  **initialization** and **validation** to occur early in the startup
  process _(via this `genesis()` hook)_.

- A better alternative to the `genesis()` hook is to promote your
  {{book.guide.extending_customAspectPlugins}} as non-singletons,
  where **initialization** and **validation** can be directly promoted
  though the plugin constructor.

The `genesis()` hook can perform Aspect related **initialization** and
**validation**:

- **initialization**: It is possible to to register proprietary
  Aspect/Feature APIs in the `genesis()` hook ... via
  {{book.api.extendAspectProperty}} and
  {{book.api.extendFeatureProperty}} _(please see:
  {{book.guide.extending_aspectCrossCommunication}} and
  {{book.guide.crossCom}})_.

  The preferred place to do this initialization is in the plugin
  constructor _(see **Antiquated Note** above)_.

- **validation**: It is possible to perform Aspect validation in the
  `genesis()` hook ... say for required configuration properties
  injected by the client after instantiation.  This is the reason for
  the optional return string.

  The preferred place to do validation is in the plugin constructor,
  gathering this information as constructor parameters _(see
  **Antiquated Note** above)_.

**RETURN**: an error message string when self is in an invalid state
(falsy when valid).  Because this validation occurs under the control
of `launchApp()`, any message is prefixed with: `'launchApp() parameter
violation: '`.


### Aspect.validateFeatureContent()

**API:** {{book.api.validateFeatureContentMeth$}}

{{book.api.validateFeatureContentMeth}} is a validation hook allowing
this aspect to verify it's content on the supplied feature (which is
known to contain this aspect).

**RETURN**: an error message string when the supplied feature contains
invalid content for this aspect (falsy when valid).  Because this
validation conceptually occurs under the control of
{{book.api.createFeature}}, any message is prefixed with:
`'createFeature() parameter violation: '`.


### Aspect.expandFeatureContent()

**API:** {{book.api.expandFeatureContentMeth$}}

{{book.api.expandFeatureContentMeth}} is a aspect expansion
hook, defaulting to the algorithm defined by {{book.api.expandWithFassets}}.

This method (when used) should expand self's
{{book.api.AspectContent}} in the supplied feature (which is known to
contain this aspect **and** is in need of expansion), replacing that
content (within the feature).

Once expansion is complete, **feature-u** will perform a delayed
validation of the expanded content.

The default behavior simply implements the expansion algorithm
defined by {{book.api.expandWithFassets}}:

```js
feature[this.name] = feature[this.name](fassets);
```

This default behavior rarely needs to change.  It however provides a
hook for aspects that need to transfer additional content from the
expansion function to the expanded content.  As an example, the
`reducer` aspect must transfer the slice property from the expansion
function to the expanded reducer.

**RETURN**: an optional error message string when the supplied feature
contains invalid content for this aspect (falsy when valid).  This is
a specialized validation of the expansion function, over-and-above
what is checked in the standard validateFeatureContent() hook.


### Aspect.assembleFeatureContent()

**API:** {{book.api.assembleFeatureContentMeth$}}

{{book.api.assembleFeatureContentMeth}} assembles content for this
aspect across all features, retaining needed state for subsequent ops.
This method is typically the primary task that is accomplished by most
aspects.


### Aspect.assembleAspectResources()

**API:** {{book.api.assembleAspectResourcesMeth$}}

{{book.api.assembleAspectResourcesMeth}} is a hook that
assembles resources for this aspect across all other aspects, retaining
needed state for subsequent ops.  This hook is executed after all the
aspects have assembled their feature content (i.e. after
{{book.api.assembleFeatureContentMeth}}).

This is an optional second-pass (so-to-speak) of Aspect data
gathering, that facilitates
{{book.guide.extending_aspectCrossCommunication}}.  It allows an
extending aspect to gather resources from other aspects, using an
additional API (ex: `Aspect.getXyz()`).

As an example of this, consider {{book.ext.featureRedux}}.  Because it
manages {{book.ext.redux}}, it must promote a technique by which other
Aspects can register their redux middleware.  This is accomplished
through the proprietary method: `Aspect.getReduxMiddleware():
middleware`.


### Aspect.initialRootAppElm()

**API:** {{book.api.initialRootAppElmMeth$}}

{{book.api.initialRootAppElmMeth}} is a callback hook that
promotes some characteristic of this aspect within the `rootAppElm`
... the top-level react DOM that represents the display of the entire
application.

The {{book.guide.extending_definingAppElm}} section highlights when to
use {{book.api.initialRootAppElmMeth}} verses
{{book.api.injectRootAppElmMeth}}.

**NOTE**: When this hook is used, the supplied curRootAppElm MUST be
included as part of this definition!

**RETURN**: a new react app element root (which in turn must contain
the supplied curRootAppElm), or simply the supplied curRootAppElm (if
no change).


### Aspect.injectRootAppElm()

**API:** {{book.api.injectRootAppElmMeth$}}

{{book.api.injectRootAppElmMeth}} is a callback hook that
promotes some characteristic of this aspect within the `rootAppElm`
... the top-level react DOM that represents the display of the entire
application.

The {{book.guide.extending_definingAppElm}} section highlights when to
use {{book.api.initialRootAppElmMeth}} verses
{{book.api.injectRootAppElmMeth}}.

**NOTE**: When this hook is used, the supplied curRootAppElm MUST be
included as part of this definition!

**RETURN**: a new react app element root (which in turn must contain
the supplied curRootAppElm), or simply the supplied curRootAppElm (if
no change).


### Aspect.injectParamsInHooks()

**API:** {{book.api.injectParamsInHooksMeth$}}

{{book.api.injectParamsInHooksMeth}} is
an Aspect method that promotes `namedParams` into the
feature's {{book.guide.appLifeCycles}}, from this aspect.  This
hook is executed after all aspects have assembled their feature
content (i.e. after {{book.api.assembleFeatureContentMeth}}).

Here is a `namedParams` example from a redux aspect, promoting it's
state and dispatch functions:

```js
{getState, dispatch}
```

Any aspect may promote their own set of `namedParams`.  **feature-u**
will insure there are no name clashes across aspects (which results in
an exception).  If your parameter names have a high potential for
clashing, a **best practice** would be to qualify them in some way to
better insure uniqueness.

**RETURN**: a plain object that will be injected (as
named parameters) into the feature's {{book.guide.appLifeCycles}},
from this aspect.  


### Aspect.config

The `Aspect.config` is a sub-object that can be used for any type of
state retention that a specific {{book.api.Aspect}} may need.

Typically, this information is configuration related.  Configurations
should be documented by the specific {{book.api.Aspect}}, validated in
the Aspect constructor, and retained in the `Aspect.config` sub-object.

The reason the `Aspect.config` sub-object is used in this way is that
it is "open" (i.e. any content is allowed).  In other words there is
no need to pre-register acceptable properties on the `config`
sub-object (as there is in direct properties of the Aspect object
... i.e. {{book.api.extendAspectProperty}}).

In addition to configuration, it is common for Aspects to use the
`config` sub-object for **hidden** diagnostic purposes _(hidden in the
sense that they are not documented)_.  These settings are employed
when researching an issue, and typically alter behavior in some way or
glean additional information.  As such they would only be communicated
to users on a case-by-case basis.


### Aspect.additionalMethods()

Aspects may contain additional "proprietary" methods in support of
{{book.guide.extending_aspectCrossCommunication}} ... a contract
between one or more aspects.  This is merely an API specified by one
{{book.api.Aspect}}, and used by another {{book.api.Aspect}},
facilitated through the {{book.api.assembleAspectResourcesMeth$}}
hook.

As an example of this, consider {{book.ext.featureRedux}}.  Because it
manages {{book.ext.redux}}, it must promote a technique by which other
Aspects can register their redux middleware.  This is accomplished
through the proprietary method: `Aspect.getReduxMiddleware():
middleware`.

## Custom Aspect Plugins

Typically a Custom Aspect Plugin is promoted through it's own
constructor that:

1. Accumulates/Validates needed configuration (as constructor
   parameters).

2. Performs any required initialization, such as registering
   proprietary Feature/Aspect APIs
   (`extendFeatureProperty()`/`extendAspectProperty()`).

3. Creates/returns the custom Aspect Plugin object

   - a. Seeded with the internal {{book.guide.extending_aspectLifeCycleHooks}} needed to implement this plugin

   - b. Retaining needed configuration to be used/accessed by it's {{book.guide.extending_aspectLifeCycleHooks}}
     _(using {{book.guide.aspectConfig}} because of it's "open" nature ... no need to pre-register content)_

Here is an example:

```js
export default function createMyCustomAspect({name='myDefaultName', // ... **1**
                                              configParam1,
                                              configParam2=false,
                                              ...unknownArgs}={}) {

  // validate all client-supplied parameters ... **1**
  ... snip snip

  // initialize self ... **2**
  // ... example taken from feature-redux
  extendAspectProperty('getReduxStore', 'feature-redux');      // Aspect.getReduxStore(): store

  // promote our custom Aspect Plugin object ... **3**
  return createAspect({
    name,

    // define the needed Aspect Life Cycle Hooks for self ... **3.a**
    // ... internal functions (not shown in this example)
    // ... that become the Aspect methods
    validateFeatureContent,
    assembleFeatureContent,
    injectRootAppElm,
    ... snip snip

    // retain needed configuration to be used internally ... **3.b**
    // ... using Aspect.config because of it's "open" nature
    //     (no need to pre-register content)
    config: {
      configParam1,
      configParam2
    },
  });
}
```
