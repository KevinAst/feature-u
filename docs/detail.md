# A Closer Look

As mentioned previously, the basic process of feature-u is that each
feature promotes a `Feature` object that contains various aspects of
that feature ... _things like: the feature's name, it's Public API,
whether it is enabled, initialization constructs, and resources used
to configure it's slice of the frameworks in use._

In turn, these Feature objects are supplied to `launchApp()`, which
configures and starts your application, returning an [App
Object](#app-object) (_which promotes the public API of each
feature_).

_Let's take a closer look at this process ..._

* [aspects](#aspects)
* [Feature Object (relaying aspect content)](#feature-object-relaying-aspect-content)
  - [Built-In aspects](#built-in-aspects)
  - [Extendable aspects](#extendable-aspects)
* [Launching Your Application](#launching-your-application)
  - [React Registration](#react-registration)
* [App Object](#app-object)
  - [Feature Public API](#feature-public-api)
  - [Does Feature Exist](#does-feature-exist)


<!-- *** SECTION ********************************************************************************  -->
## aspects

In feature-u, "aspect" is a generalized term used to refer to the various
ingredients that (when combined) constitute your application.  Aspects
can take on many different forms ... for example:

  - UI Components and Routes, 
  - State Management (actions, reducers, selectors), 
  - Business Logic, 
  - Startup Initialization Code, 
  - etc.

**Not all aspects are of interest to feature-u** ...  _only those that
are needed to setup and launch the app_ ... all others are
considered to be an internal implementation detail of the feature.  As
an example, consider the redux state manager: while it uses actions,
reducers, and selectors ... only reducers are needed to setup and
configure redux.

**feature-u** provides a base set of **built-in aspects** (out-of-the-box)
but allows additional aspects to be introduced through it's extendable
API.

1. [**Built-In aspects**](#built-in-aspects):

   These aspects are promoted directly by the base feature-u package.
   They provide very rudimentary capabilities, such as feature
   enablement, public API, and application life-cycle hooks.

1. [**Extendable aspects**](#extendable-aspects):

   These aspects are promoted by external packages (_or self defined
   in your project_).  They provide feature-u integration with other
   frameworks (for example [redux] state management, or [redux-logic]
   business logic, or navigational routers, etc.).  They are created
   with feature-u's extendable API, and are packaged separately, so as
   to not introduce unwanted dependencies.



<!-- *** SECTION ********************************************************************************  -->
## Feature Object (relaying aspect content)

The Feature object is merely a container that holds aspect content
that is of interest to feature-u.

Each feature within your application promotes a Feature object (using
`createFeature()`) that catalogs the aspects of that feature.

Ultimately, all Feature objects are consumed by `launchApp()`. 


### Built-In aspects

Built-in aspects are promoted directly by the base feature-u package.
They provide very rudimentary capabilities, such as feature
enablement, public API, and application life-cycle hooks.

Like all aspects, Built-In aspect content is relayed through Feature
object properties (via `createFeature()`).

- `Feature.name`

  A string property which represents the identity of the feature.
  Feature names are used to index the [App Object](#app-object) by
  feature _(in support of [Cross Feature
  Communication](#cross-feature-communication))_, and are therefore
  guaranteed to be unique.  Application code can also use [Feature
  Name](#feature-name) in various [Single Source of
  Truth](#single-source-of-truth) operations.


- `Feature.enabled`

  A boolean property that determines whether the feature is enabled or
  not.  This indicator is typically based on a dynamic expression,
  allowing packaged code to be dynamically enabled/disabled at
  run-time _(please refer to: [Feature
  Enablement](#feature-enablement))_.


- `Feature.publicFace`
  
  An optional resource object that is the feature's Public API,
  promoting cross-communication between features.  This object is
  exposed through the App object as: `app.{featureName}.{publicFace}`
  _(please refer to: [publicFace and the App
  Object](#publicface-and-the-app-object))_.


- `Feature.appWillStart`
  
  An optional [Application Life Cycle
  Hook](#application-life-cycle-hooks) invoked one time, just before
  the app starts up.  This life-cycle hook can do any type of
  initialization, and/or optionally supplement the app's top-level
  content (using a non-null return) _(please refer to:
  [appWillStart](#appwillstart))_.


- `Feature.appDidStart`
  
  An optional [Application Life Cycle
  Hook](#application-life-cycle-hooks) invoked one time, immediately
  after the app has started.  Because the app is up-and-running at
  this time, you have access to the appState and the dispatch()
  function ... assuming you are using redux (when detected by
  feature-u's plugable aspects) _(please refer to:
  [appDidStart](#appdidstart))_.


### Extendable aspects

**feature-u** is extendable!  Extendable Aspects provide **feature-u**
integration with other frameworks (for example [redux] state
management, or [redux-logic] business logic, etc.).  For this reason
(_by in large_) **they provide the most value**, because they **fully
integrate your features into your run-time stack!**

Extendable Aspects are packaged separately from **feature-u**, so as to not
introduce unwanted dependencies (_because not everyone uses the same
frameworks_).  You pick and choose them based on the framework(s) used
in your project (_matching your project's run-time stack_).

Extendable Aspects are created with **feature-u**'s extendable API, using
`createAspect()`.  You can define your own Aspect (_if the one you
need doesn't already exist_)!

Like all aspects, Extendable Aspect content is relayed through Feature
object properties (via `createFeature()`).

Because Extendable Aspects are not part of the base **feature-u**
package, it is a bit problematic to discuss them here (_they are
either in a separate npm package, or self contained in your project_).
**You should search the npm registry with the `'feature-u'` keyword**
_to find the ones that meet your requirements_.  With that said, we
will briefly discuss the Extendable Aspects that were created in
conjunction with the initial development of **feature-u** (_just to give
you a feel of what is possible_).


- `Feature.reducer` via: **feature-redux**
  
  **feature-redux** is the **feature-u** integration point to
  [redux]!

  It configures [redux] through the `reducerAspect` (_to be
  supplied to_ `launchApp()`), which extends the Feature object,
  adding support for the `Feature.reducer` property, referencing
  feature-based reducers.

  Only reducers are of interest because that is all that is needed to
  configure [redux].  All other redux items (_actions, selectors,
  etc._) are considered to be an internal implementation detail of the
  feature.

  The `Feature.reducer` content must be embellished by
  `slicedReducer()`, which provides instructions on how to combine
  multiple feature-based reducers in constructing the overall
  top-level application state tree.

  Because **feature-redux** manages redux, it also provides an
  integration hook to other Aspects that need to inject redux
  middleware.

  Please refer to the **feature-redux** documentation for complete
  details.
  
  
- `Feature.logic` via: **feature-redux-logic**

  **feature-redux-logic** is the **feature-u** integration point to
  [redux-logic]!

  It configures [redux-logic] through the `logicAspect` (_to be
  supplied to_ `launchApp()`), which extends the Feature object,
  adding support for the `Feature.logic` property, referencing
  feature-based logic modules.

  The following article is an introduction (and motivation) for the
  development of redux-logic: [Where do I put my business logic in a
  React-Redux
  application](https://medium.com/@jeffbski/where-do-i-put-my-business-logic-in-a-react-redux-application-9253ef91ce1).

  Please refer to the **feature-redux-logic** documentation for complete
  details.

 
- `Feature.route` via: **feature-router**

  **feature-router** is the **feature-u** integration point to
  **Feature Routes**!

  It configures **Feature Router** through the `routeAspect` (_to be
  supplied to_ `launchApp()`), which extends the Feature object,
  adding support for the `Feature.route` property, referencing routes
  defined through the `featureRoute()` function.

  **Feature Routes** are _based on a very simple concept_: **allow the
  application state to drive the routes!** It operates through a
  series of registered functional callback hooks, which determine the
  active screen based on an analysis of the the overall appState.
  This is particularly useful in feature-based routing, because each
  feature can promote their own UI components in an encapsulated and
  autonomous way!  Because of this, **feature-router** is a
  preferred routing solution for **feature-u**.

  Please refer to the **feature-router** documentation for complete
  details.


<!-- *** SECTION ********************************************************************************  -->
## Launching Your Application

By assimilating the set of features that comprise an application,
interpreting each feature aspect, **feature-u** can actually
coordinate the launch of your application (i.e. start it running)!

This is accomplished through the `launchApp()` function.

- It manages the setup and configuration of the frameworks in use,
  such as [redux], [redux-logic], etc.  This is based on a set of
  supplied plugable Aspects that extend **feature-u**, integrating
  external frameworks to match your specific run-time stack.

- It facilitates application life-cycle hooks on the Feature object,
  allowing features to manage things like: initialization and
  injecting root UI elements, etc.

- It creates and promotes the App object which contains the publicFace
  of all features, facilitating a cross-communication between features.

As a result, your application mainline is very simple and generic.
There is no real app-specific code in it.  That is because each
feature injects their own app-specific constructs.  The mainline
merely accumulates the Aspects and Features, and starts the app by
invoking `launchApp()`:

_This code snippet is mostly repeated from the Usage section (but is
included here for completeness):_

**`src/app.js`**
```js
import React             from 'react';
import ReactDOM          from 'react-dom';
import {routeAspect}     from './util/feature-u/aspect/feature-router';
import {reducerAspect}   from './util/feature-u/aspect/feature-redux';
import {logicAspect}     from './util/feature-u/aspect/feature-redux-logic';
import {launchApp}       from './util/feature-u';
import SplashScreen      from './util/comp/SplashScreen';
import features          from './feature'; // the set of features that comprise this application


// *1* define our set of "plugable" feature-u Aspects, conforming to our app's run-time stack
const aspects = [
  routeAspect,   // StateRouter ... order: early, because <StateRouter> DOM injection does NOT support children
  reducerAspect, // redux       ... order: later, because <Provider> DOM injection should be on top
  logicAspect,   // redux-logic ... order: N/A,   because NO DOM injection
];


// configure our Aspects (as needed)
// ... StateRouter fallback screen (when no routes are in effect)
routeAspect.fallbackElm = <SplashScreen msg="I'm trying to think but it hurts!"/>;


// launch our app, exposing the feature-u App object (facilitating cross-feature communication)!
export default launchApp({         // *3*
  aspects,
  features,
  registerRootAppElm(rootAppElm) { // *2*
    ReactDOM.render(rootAppElm,
                    getElementById('myAppRoot'));
  }
});
```

The Aspect collection _(see `*1*` in `app.js` snippet above)_ reflects
the frameworks of our run-time stack _(in our example [redux],
[redux-logic], and [feature-router])_ and extend the acceptable
Feature properties _(`Feature.reducer`, `Feature.logic`, and
`Feature.route` respectively)_ ... _**see:** [closer-look Extendable
aspects]_


### React Registration

The `launchApp()` function uses a `registerRootAppElm()` callback
_(see `*2*` in `app.js` snippet above)_ to catalog the supplied
`rootAppElm` to the specific React platform in use.  Because this
registration is accomplished by your app-specific code, **feature-u**
can operate in any of the React platforms, such as:

**React Web**
```js
import ReactDOM from 'react-dom';
...
export default launchApp({
  aspects,
  features,
  registerRootAppElm(rootAppElm) {
    ReactDOM.render(rootAppElm,
                    getElementById('myAppRoot'));
  }
});
```

**React Native**
```js
import {AppRegistry} from 'react-native';
...
export default launchApp({
  aspects,
  features,
  registerRootAppElm(rootAppElm) {
    AppRegistry.registerComponent('myAppKey',
                                  ()=>rootAppElm); // convert rootAppElm to a React Component
  }
});
```

**Expo**
```js
import Expo from 'expo';
...
export default launchApp({
  aspects,
  features,
  registerRootAppElm(rootAppElm) {
    Expo.registerRootComponent(()=>rootAppElm); // convert rootAppElm to a React Component
  }
});
```


<!-- *** SECTION ********************************************************************************  -->
## App Object

An App object is emitted from the `launchApp()` function, which
promotes the accumulated Public API of all features.

The App object should be exported _(see `*3*` in `app.js` snippet
above)_ so other modules can access it (providing [Cross Feature
Communication]).  Please note that depending on the context, there are
various techniques by which the App object can be accessed (see:
[Accessing the App Object](#accessing-the-app-object)).

The App object contains named feature nodes, structured as follows:

```js
App.{featureName}.{publicFace}
```

The app object can be used for two distinct purposes: 

1. to access a feature's Public API, and
2. to determine whether a feature exists.


### Feature Public API

The App object promotes the feature's Public API (i.e. it's
publicFace).

As an example, an application that has two features (featureA, and
featureB) will look like this:

```js
app: {
  featureA: {
    action: {
      open(),
      close()
    }
  },
  featureB: {
  }
}
```

You can see that featureA is promoting a couple of actions (open(),
close()) in it's publicFace, while featureB has NO publicFace.


### Does Feature Exist

The App object can be used to determine if a feature is present or
not.  If a feature does not exist, or has been disabled, the
corresponding `app.{featureName}` will NOT exist.

 - It could be that `featureA` will conditionally use `featureB` if it
   is present.

   ```js
   if (app.featureB) {
     ... do something featureB related
   }
   ```

 - It could be that `featureC` unconditionally requires that `featureD`
   is present.  This can be checked in the `appWillStart()` life cycle
   hook.

   ```js
   appWillStart({app, curRootAppElm}) {
     assert(app.featureD, '***ERROR*** I NEED featureD');
   }
   ```
