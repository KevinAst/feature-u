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

?? BASIC ORIENTATION (refine) as needed

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

For details, please refer to the
{{book.guide.extending_aspectLifeCycleMethods}} section.


## Defining rootAppElm

?? refine docs

In **feature-u** the `rootAppElm` is the top-level react DOM that
represents the display of the entire application.

This is a non-changing omnipresent DOM that achieves it's dynamics
through a series of both framework components and application injected
utilities.  As an example, a typical `rootAppElm` will contain:

- a navigational component **providing screen dynamics** _(through an **Aspect** Framework injection)_
- a state promotional component **making state available to subordinates** _(through an **Aspect** Framework injection)_
- a notification utility _(through an application **Feature** injection)_
- a left-nav menu _(through an application **Feature** injection)_
- etc. etc. etc.

The `rootAppElm` is defined through a progressive accumulation of DOM
injections, using a combination of both Aspects and Features.

There are three API's involved and they all accept a `curRootAppElm`
parameter, and return a new `rootAppElm` that includes the supplied
elememt, accommodating the accumulative process.

The three API's are listed here, and are executed in this order.  They
include life-cycle-hooks that are defined from both Aspects and
Features.

1. {{book.guide.initialRootAppElmMeth$}}
2. {{book.guide.appWillStartCB$}}
3. {{book.guide.injectRootAppElmMeth$}}

It is important to understand that the Feature hook is sandwidged
between the two Aspect hooks.  Without this insight, you would most
certainly wonder what the difference was between the two Aspect hooks.

A null rootAppElm seeds the entire process.  The first hook is used by
any Aspect that wishes to inject itself before all others ... and so on.

The end result is a DOM hierarchy, where the first element injected is
manifest at the bottom of the hierarchy, and the last one ends up on
top.

To put this in perspective, let's analyze an example where we are
using two Aspects (feature-redux, and feature-router), and an
application Feature that manages a left-nav menu available throughout
the application.

1. The Aspect for feature-router (`routeAspect`) injects a
   `<StateRouter>` component that (by design) can have no other
   children.  Therefore it uses the first api:

   **`routeAspect: Aspect.initialRootAppElm()`**
   ```js
   function initialRootAppElm(app, curRootAppElm) {
     // insure we don't clober any supplied content
     // ... by design, <StateRouter> doesn't support children
     if (curRootAppElm) {
       throw new Error('*** ERROR*** Please register routeAspect (from feature-router) before other Aspects ' +
                       'that inject content in the rootAppElm ... <StateRouter> does NOT support children.');
     }

     // seed the rootAppElm with our StateRouter
     return <StateRouter routes={this.routes}
                         fallbackElm={this.fallbackElm}
                         componentWillUpdateHook={this.componentWillUpdateHook}
                         namedDependencies={{app}}/>;
   }
   ```

2. The `leftNav` application feature, injects it's Drawer/SideBar
   component through the second api (the only one available to
   Features):

   **`leftNav: Feature.appWillStart()`**
   ```js
   function appWillStart({app, curRootAppElm}) {
     return (
       <Drawer ref={ ref => registerDrawer(ref) }
               content={<SideBar/>}
               onClose={closeSideBar}>
         {curRootAppElm}
       </Drawer>
     );
   }
   ```

3. The Aspect for feature-redux (`reducerAspect`) injects the redux
   `<Provider>` component that must encompass all other components
   (i.e. be on top). Therefore it uses the third api:

   **`reducerAspect: Aspect.injectRootAppElm()`**
   ```js
   function injectRootAppElm(app, curRootAppElm) {
     return (
       <Provider store={this.appStore}>
         {curRootAppElm}
       </Provider>
     );
   }
   ```

The **end result** of this example generates the following DOM:

```
<Provider store={this.appStore}>
  <Drawer ref={ ref => registerDrawer(ref) }
          content={<SideBar/>}
          onClose={closeSideBar}>
    <StateRouter routes={this.routes}
                 fallbackElm={this.fallbackElm}
                 componentWillUpdateHook={this.componentWillUpdateHook}
                 namedDependencies={{app}}/>
  </Drawer>
</Provider>
```


## Aspect Cross Communication

Some Aspects will rely on an **Aspect Cross Communication** mechanism
to accomplish their work _(not to be confused with
{{book.guide.crossCom}})_.

**Aspect Cross Communication** is where an **Aspect** requires
additional information _(over and above it's
{{book.api.AspectContent}})_ either from other Aspects or Features.
Therefore the extending Aspect must define (and use) additional
Aspect/Feature APIs.

As an example of this, consider the feature-redux plugin.  Because it
manages redux, it also maintains the redux middleware.  As a result,
it must provide a way for other **Aspects** to inject their
middleware.  It acomplishes this by exposing a new **Aspect** API:
`Aspect.getReduxMiddleware()`.

An extending **Aspect** that introduces a new API should do the
following:

1. Document the API, so the external client knows how to use it.

1. Register the API, allowing it to pass **feature-u** validation.
   Depending on whether this is an API for a {{book.api.Feature}} or
   {{book.api.Aspect}}, use one of the following:

   - **API:** {{book.api.extendAspectProperty$}}
   - **API:** {{book.api.extendFeatureProperty$}}


   This registration allows the new API (i.e. the `name`) to be
   referenced in either createAspect() or createFeature()
   respectively.

   The registration should occur globally, during the in-line
   expansion of the extending Aspect, guaranteeing the new API is
   available during **feature-u** validation.

1. Utilize the API in one of the
   {{book.guide.extending_aspectLifeCycleMethods}} to to gather the
   additional information _(from other Aspects or Features)_.

As a concrete example of this, let's look at some code snippits from
the aforementioned feature-redux plugin:

1. Here is the new API's documentation: ??

   ?? link to doc:    https://github.com/KevinAst/feature-redux#inputs
   ?? inline the docs here too

1. Here is the new API's registration:

   ?? link to github code
   ```js
   ???
   ```

1. Here is the new API's usage:

   ?? link to github code
   ```js
   ???
   ```
   

## Aspect Life Cycle Methods

The following list represents a complete compilation of all **Aspect
Life Cycle Methods**.  Simply follow the link for a thorough
discussion of each:

 - [`Aspect.name`](#aspectname)
 - {{book.guide.validateConfigurationMeth$}}
 - {{book.guide.expandFeatureContentMeth$}}
 - {{book.guide.validateFeatureContentMeth$}}
 - {{book.guide.assembleFeatureContentMeth$}}
 - {{book.guide.assembleAspectResourcesMeth$}}
 - {{book.guide.initialRootAppElmMeth$}}
 - {{book.guide.injectRootAppElmMeth$}}
 - [`Aspect.additionalMethods()`](#aspectadditionalmethods)

**Notes of Interest** ...

- **Execution Order**: 

  The order in which these methods are presented _(above)_ represent
  the same order they are executed.


- **Aspect State Retention**: 

  It is not uncommon for an **Aspect** to use more than one of these
  life cycle methods to do it's work.  When this happens, there may be
  a need to retain state _(in order to pick up in one method where it
  left off in another)_.

  These hooks are in fact methods of the **Aspect** object.  In other
  words, **`this`** is bound to the **Aspect** object instance.  As a
  result, you are free to use `this` for your **state retention**.

  As an example, an Aspect may:

   1. use {{book.guide.assembleFeatureContentMeth}} to assemble it's
      content across all features ... **retaining the content in
      self**

   2. and then use {{book.guide.injectRootAppElmMeth}} to promote the
      **content assembled in prior step**
 

- **App Parameter**: 

  You will notice that the `app` parameter is supplied on many of these
  life cycle methods.  As you know the {{book.api.App}} object is used
  in promoting {{book.guide.crossCom}}.  

  While it is most likely an anti-pattern to directly interrogate the
  **App** object within the **Aspect**, it is frequently required to
  "pass through" to downstream processes _(as an opaque object)_.
  **This is the reason the **App** object is supplied**!!

  As examples of this:

  - The `Feature.logic` aspect _({{book.ext.featureReduxLogic}})_ will
    dependency inject (DI) the app object into the
    {{book.ext.reduxLogic}} process.

  - The `Feature.route` aspect _({{book.ext.featureRouter}})_
    communicates the app in it's routing callbacks.

  - etc. etc. etc.


### Aspect.name

The `Aspect.name` is used to "key" {{book.api.AspectContent}} of this
type in the {{book.api.Feature}} object.  

For example: an `Aspect.name: 'xyz'` would permit a `Feature.xyz:
xyzContent` construct.

As a result, Aspect names cannot clash with built-in aspects, and
they must be unique _(across all aspects that are in-use)_.


_**Best Practice ...**_

It is a good practice to allow your Aspect name to be re-configured at
run-time _because they must be unique, and externally published
Aspects cannot know the Aspect mix that is in-use_.  This can be
accomplished through a defensive Aspect implementation that references
feature properties by indexing the Aspect.name rather than hard coding
it.

As an example, the following code snippet assumes a context of an xyz
**Aspect method** ...

**`xyzAspect.someMethod()`:**
```js
  ...
  const feature = ...;

  // DO NOT HARD CODE:
  ... feature.xyz

  // RATHER INDEX:
  ... feature[this.name]
  
```

This allows your clientele to reset the Aspect.name as follows:

**`client code initialization`:**
```js
  xyzAspect.name = 'xyzFoo';
```


### Aspect.validateConfiguration()

**API:** {{book.api.validateConfigurationMeth$}}

{{book.api.validateConfigurationMeth}} is an optional validation hook
allowing this aspect to verify it's own required configuration (if
any).  Some aspects may require certain settings in self for them to
operate.

**RETURN**: an error message string when self is in an invalid state
(falsy when valid).  Because this validation occurs under the control
of `launchApp()`, any message is prefixed with: `'launchApp() parameter
violation: '`.


### Aspect.expandFeatureContent()

**API:** {{book.api.expandFeatureContentMeth$}}

{{book.api.expandFeatureContentMeth}} is an optional aspect expansion
hook, defaulting to the algorithm defined by {{book.api.managedExpansion}}.

This method (when used) should expand self's
{{book.api.AspectContent}} in the supplied feature (which is known to
contain this aspect **and** is in need of expansion), replacing that
content (within the feature).

Once expansion is complete, **feature-u** will perform a delayed
validation of the expanded content.

The default behavior simply implements the expansion algorithm
defined by {{book.api.managedExpansion}}:

```js
feature[this.name] = feature[this.name](app);
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


### Aspect.assembleFeatureContent()

**API:** {{book.api.assembleFeatureContentMeth$}}

{{book.api.assembleFeatureContentMeth}} assembles content for this
aspect across all features, retaining needed state for subsequent ops.
This method is required because this is the primary task that is
accomplished by all aspects.


### Aspect.assembleAspectResources()

**API:** {{book.api.assembleAspectResourcesMeth$}}

{{book.api.assembleAspectResourcesMeth}} is an optional hook that
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

{{book.api.initialRootAppElmMeth}} is an optional callback hook that
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

{{book.api.injectRootAppElmMeth}} is an optional callback hook that
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



### Aspect.additionalMethods()

Aspects may contain any number of additional "proprietary" methods,
supporting two different requirements:

- internal Aspect helper methods, and

- APIs used in "aspect cross-communication" ... a contract between one
  or more aspects.  This is merely an API specified by one
  {{book.api.Aspect}}, and used by another {{book.api.Aspect}},
  facilitated through the {{book.api.assembleAspectResourcesMeth$}}
  hook.

  As an example of this, consider {{book.ext.featureRedux}}.  Because
  it manages {{book.ext.redux}}, it must promote a technique by which
  other Aspects can register their redux middleware.  This is
  accomplished through the proprietary method:
  `Aspect.getReduxMiddleware(): middleware`.
