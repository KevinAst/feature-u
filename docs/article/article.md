# feature-u (Feature Based Project Organization for React)

This article is an introduction to [feature-u] - a library that
_facilitates feature-based project organization_ in your [react]
project.  This utility assists in organizing your project by
individual features.

<p align="center"><img src="img/features.jpg" alt="Features" width="60%"></p>

Most developers would agree that organizing your project by feature is
much preferred over type-based patterns.  Because **application
domains grow** _in the real world_, project **organization by type
simply doesn't scale**, _it just becomes unmanageable_!  There are
many good articles on this topic with insights on feature-based design
and structure _(see: [References] below)_.

This article outlines my excursion into feature-based composition.  In
working through the details, I realized there was an opportunity for a
library to help manage and streamline some of the hurdles incurred in
this process.  The result: _[feature-u]_.


<!-- *** SECTION ********************************************************************************  -->
## Backdrop

Let's start by chronicling my journey in this process

**out of the Starting Gate ...**

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

_sooo ...  I had decided to restructure my project by features_.  From
a design perspective, there were a number of considerations in
determining the feature boundaries.  I had read all the articles, and
applied my design to a **new feature-based directory structure**.

In general, I was feeling good about my progress.  I was starting to
see concrete benefits ... **feature segregation was going to result in
code that is much more manageable!**

</ul>

**the Hurdles ...**

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

However, there were a number of hurdles yet to be resolved ...

- How can I encapsulate and isolate my features, while still
  allowing them to collaborate with one another?

- How can selected features introduce start-up initialization (_even
  injecting utility at the root DOM_), without relying on some external
  startup process?

- How can I promote feature-based UI components in an isolated and
  autonomous way?

- How can I configure my chosen frameworks now that my code is so
  spread out?

- How can I enable/disable selected features which are either
  optional, or require a license upgrade?

- In short, how can I pull it all together so that my individual
  features operate as one application?

</ul>

**the Goal _(what now?)_ ...**

<ul><!--- indentation hack for github - other attempts with style is stripped (be careful with number bullets) ---> 

The **overriding goal** of **feature-u** is two fold:

1. Allow features to **Plug-and-Play!** This encompasses many things,
   such as: encapsulation, cross communication, enablement,
   initialization, etc., etc.  We will build on these concepts
   throughout this article.

2. **Automate the startup of your application!!** You have the
   features.  Allow them to promote their characteristics, so a
   central utility can **automatically configure the frameworks** used
   in your app, thereby **launching your application!** This task
   **must be accomplished in an extendable way**, _because not
   everyone uses the same set of frameworks!_

</ul>

<!-- *** SECTION ********************************************************************************  -->
## feature-u Basics

The basic process of [feature-u] is that each feature promotes a
[`Feature`] object that contains various aspects of that feature
... _things like: the feature's name, it's Public API, whether it is
enabled, initialization constructs, and resources used to configure
it's slice of the frameworks in use._

In turn, these [`Feature`] objects are supplied to [`launchApp()`],
which configures and starts your application, returning an [`App`]
object (_which promotes the public API of each feature_).

_aspects ..._

In **feature-u**, "aspect" is a generalized term used to refer to the
various ingredients that (when combined) constitute your application.
Aspects can take on many different forms: **UI Components** and
**Routes** &bull; **State Management** _(actions, reducers,
selectors)_ &bull; **Business Logic** &bull; **Startup Initialization
Code** &bull; _etc. etc. etc._

**Not all aspects are of interest to feature-u** ...  _only those that
are needed to setup and launch the app_ ... all others are considered
an internal implementation detail of the feature.  As an example,
consider the redux state manager: while it uses actions, reducers, and
selectors ... only reducers are needed to setup and configure redux.

_framework integration ..._

A fundamental goal of **feature-u** is to **automatically configure
the framework(s)** used in your run-time-stack _(by accumulating the
necessary resources across all your features)_.  Because not everyone
uses the same frameworks, **feature-u** accomplishes this through
**Extendable Aspects** _(you can find them in external NPM packages,
or you can create your own)_.

It is important to understand that the interface to your chosen
frameworks is not altered in any way.  You use them the same way you
always have _(just within your feature boundary)_.  **feature-u**
merely provides a well defined organizational layer, where the
frameworks are automatically setup and configured by accumulating the
necessary resources across all your features.


<!-- *** SECTION ********************************************************************************  -->
## eatery-nod

[eatery-nod] is the application _where **feature-u** was conceived_.
It is a [react-native] - [expo] mobile app, and is one of my sandbox
applications that I use to test frameworks.  I like to develop apps
that I can use, but have enough real-world requirements to make it
interesting.

**eatery-nod** randomly selects a "date night" restaurant from a pool
of favorites.  _My wife and I have a steady "date night", and we are
always indecisive on which of our favorite restaurants to frequent
:-)_ So **eatery-nod** provides the spinning wheel!


<!-- *** SECTION ********************************************************************************  -->
## Before & After

Anyone who knows me will tell you that I have an appreciation for a
good before/after analysis.  Whether it is a home remodel or a
software refactor, it helps to chronicle where you have been, so as to
quantify concreate achevements _(giving you a sense of
accomplishment)_.

<p align="center"><img src="img/beforeAfter.jpg" alt="Before/After" width="40%"></p>

Let's take a look at **eatery-nod**'s directory structure
(before/after).

For illustration purposes, I have only expanded a few directories, but
I think you get the idea _(click on the caption link to navigate the
actual code - sourced on github)_.

**Before**: _here is my project before features ..._

[src BEFORE]

```
eatery-nod src BEFORE features

src/
├──actions/        ... redux actions
│     auth.js
│     discovery.js
│     eateries.js
│     ... snip snip
├──api/            ... various abstract APIs
│     device.js
│     discovery.js
│     ... snip snip
├──app/            ... mainline startup **1**
│  │  ScreenRouter.js
│  │  SideBar.js
│  │  index.js
│  └──startup/
│     │  createAppStore.js
│     │  platformSetup.android.js
│     │  platformSetup.ios.js
│     └──firebase/
│           firebaseAppConfig.js
│           initFireBase.js
├──appState/       ... redux reducers
│     auth.js
│     discovery.js
│     eateries.js
│     ... snip snip
├──comp/           ... UI Component Screens
│     DiscoveryListScreen.js
│     EateriesListScreen.js
│     ... snip snip
├──logic/          ... redux-logic modules
│     auth.js
│     discovery.js
│     eateries.js
│     ... snip snip
└──util/           ... common utilities
```



**After**: _and here is the same project after features ..._

[src AFTER]
```
eatery-nod src AFTER features

src/
│  app.js          ... launches app via launchApp() **2**
├──feature/
│  │  index.js     ... accumulate/promote all app Feature objects
│  ├──auth/        ... the app's authorization feature
│  │  │  actions.js
│  │  │  featureName.js
│  │  │  index.js
│  │  │  logic.js
│  │  │  publicFace.js
│  │  │  route.js
│  │  │  signInFormMeta.js
│  │  │  state.js
│  │  └──comp/
│  │        SignInScreen.js
│  │        SignInVerifyScreen.js
│  ├──currentView/ ... other features
│  ├──device/      ... feature to initialize the device
│  │  │  actions.js
│  │  │  api.js
│  │  │  appDidStart.js
│  │  │  appWillStart.js
│  │  │  featureName.js
│  │  │  index.js
│  │  │  logic.js
│  │  │  publicFace.js
│  │  │  route.js
│  │  │  state.js
│  │  └──init/
│  │        platformSetup.android.js
│  │        platformSetup.ios.js
│  ├──discovery/
│  ├──eateries/
│  ├──firebase/
│  ├──leftNav/
│  ├──logActions/
│  └──sandbox/
└──util/           ... common utilities used across all features
```

As expected, **the difference in project organization is dramatic**!

- **Before features**: you find constructs for a given feature spread
  over numerious typed directories.

- **After features**: all aspects of a given feature are contained in
  it's own isolated directory.

- A notable difference is **the dramatic reduction in complexity of
  the application startup process!** The "before features" contained
  an entire `app\` directory of startup code _(see `**1**` above)_,
  while the "after features" simply contains a single `app.js` startup
  file _(see `**2**` above)_.  **Where did all the complexity go?**
  _... stay tuned_!



**SideBar**: _**eatery-nod** feature orientation ..._

You can get a feel for what each **eatery-nod** feature accomplishes,
by perusing the [README files] found in each feature directory.
Screen flows are even shown _(where applicable)_, so it really helps
in orienting you to the project.  Take some time now and skim through
these [README files]:

- [device]:      initializes the device for use by the app, and promotes a **device api** abstraction
- [auth]:        promotes complete user authentication
- [leftNav]:     promotes the app-specific Drawer/SideBar on the app's left side
- [currentView]: maintains the currentView with get/set cross-feature communication bindings
- [eateries]:    manages and promotes the eateries view
- [discovery]:   manages and promotes the discovery view
- [firebase]:    initializes the google firebase service
- [logActions]:  logs all dispatched actions and resulting state
- [sandbox]:     promotes a variety of interactive tests, used in development, that can easily be disabled



<!-- *** SECTION ********************************************************************************  -->
## feature-u In Action

To better understand **feature-u**, let's take a closer look at some
**eatery-nod** examples in action.

<p align="center"><img src="img/examples.jpg" alt="Examples" width="60%"></p>

Each of the following sections briefly introduce a new **feature-u**
topic, correlating sample code from **eatery-nod**.  Additional
information is provided through links, both to the **feature-u** docs,
and **eatery-nod** source code.  In some cases the in-lined sample
code has been streamlined _(to emphasize a focal point)_, however the
caption link will take you to the actual code _(hosted on github)_.

TK: update links

0. INTERNAL: markdown shows order from "Why" section
9. [Simplified App Startup](#simplified-app-startup)
0. [React Platforms](#react-platforms)
3. [Feature Initialization](#feature-initialization)
2. [Feature Collaboration](#feature-collaboration)
6. [Framework Integration](#framework-integration)
4. [Feature Enablement](#feature-enablement)
5. [Managed Code Expansion](#managed-code-expansion)
7. ?? UI Component Promotion
8. ?? Single Source of Truth


<!-- 
"Why feature-u" docs section
   ... it should be OK to re-order
   ... emphasizing a progression that makes sense

1. Feature Encapsulation <<< ABSTRACT CONCEPT NOT presented here (it is an amalgamation of several items)
2. Feature Collaboration
3. Feature Initialization
4. Feature Enablement
5. Resource Resolution during Code Expansion
6. Framework Integration
7. UI Component Promotion
8. Single Source of Truth
9. Simplified App Startup
-->



<!-- ** SUB-SECTION ********************************************************************************  -->
## Simplified App Startup

After breaking your application up into pieces _(i.e. features)_, how
do you pull them all back together, and actually start your app
running?  At first glance, this may seem like a daunting task.  As it
turns out, however, because of the structure promoted by
**feature-u**, it actually is a very simple process.

To solve this, **feature-u** provides the [`launchApp()`] function
_(see: [Launching Your Application])_.

Here is **eatery-nod**'s mainline ...

**[`src/app.js`]** TK: GIST with Caption Link HIGHLIGHTING the launchApp() line
```js
import Expo              from 'expo';
import {launchApp}       from 'feature-u';
import {reducerAspect}   from 'feature-redux';
import {logicAspect}     from 'feature-redux-logic';
import {routeAspect}     from 'feature-router';
import features          from './feature'; // the set of features that comprise this application

// launch our app, exposing the App object (facilitating cross-feature communication)
export default launchApp({           // *3*

  aspects: [                         // *1*
    reducerAspect, // redux          ... extending: Feature.reducer
    logicAspect,   // redux-logic    ... extending: Feature.logic
    routeAspect,   // Feature Routes ... extending: Feature.route
  ],

  features,                          // *2*

  registerRootAppElm(rootAppElm) {   // *4*
    Expo.registerRootComponent(()=>rootAppElm);
  }
});
```

The first thing to note is just how simple and generic the mainline
startup process is.  There is no real app-specific code in it
... **not even any global initialization**!  That is because
**feature-u** provides various hooks that allow your features to
inject their own app-specific constructs!!

The mainline merely accumulates the Aspects and Features, and starts
the app by invoking [`launchApp()`]:

Here are some **important points of interest** _(match the numbers to
`*n*` in the code above)_:

1. the supplied Aspects _(pulled from separate npm packages)_ reflect
   the frameworks of our run-time stack _(in our example [redux],
   [redux-logic], and [feature-router])_ and extend the acceptable
   Feature properties _(`Feature.reducer`, `Feature.logic`, and
   `Feature.route` respectively)_ ... _**see:** [Extendable aspects]_

2. all app features are accumulated from our `feature/` directory

3. _as a preview_ to [Feature Collaboration](#feature-collaboration)
   (TK link), the exported return value of [`launchApp()`] is an
   [`App`] object, which promotes the accumulated Public API of all
   features.



<!-- *** SECTION ********************************************************************************  -->
## React Platforms

In the example above _(see `**4**`)_, you see that [`launchApp()`] uses
a [`registerRootAppElm()`] callback hook to register the supplied
`rootAppElm` to the specific React platform in use.  Because this
registration is accomplished by app-specific code, **feature-u** can
operate in any of the React platforms _(see [React Registration])_.

Here are some [`registerRootAppElm()`] variations:

**[react web]** TK: GIST with Caption Link to external site (NOT eatery-nod code)
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

**[react-native]** TK: GIST with Caption Link to external site (NOT eatery-nod code)
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

**[expo]** TK: GIST with Caption Link to external site (NOT eatery-nod code)
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
## Feature Initialization

Any given feature should not have to rely on an external startup
process to perform the initialization that it needs.  Rather, the
feature should be able to spawn initialization that it depends on.
This could be any number of things, such as &bull; initialize some
service API &bull; inject a utility react component at the App root
&bull; dispatch an action that kicks off a startup process &bull; etc.

To solve this, **feature-u** introduces two [Application Life Cycle
Hooks], injected through the following Feature aspects:

1. [`Feature.appWillStart({app, curRootAppElm}): rootAppElm || falsy`]
   ...  invoked one time, just before the app starts up.  This an do
   any type of initialization, including supplementing the app's
   top-level root element (i.e. react component instance).

2. [`Feature.appDidStart({app, appState, dispatch}): void`] ...
   invoked one time immediatly after the app has started.  A typical
   usage for this hook is to dispatch some type of bootstrap action.

Here are some examples from **eatery-nod**:

<!-- 
NO:  device/appWillStart ... platformSetup()
YES: device/appDidStart .... dispatch( actions.bootstrap() );
NO:  device/appWillStart ... inject ROOT ELM: Notify component

YES: leftNav/appWillStart .. inject ROOT ELM: Drawer/SideBar component

NO:  eateries/appDidStart .. dispatch( app.currentView.actions.changeView(featureName) ); ... TOO CONFUSING: simply defaults the standard view to use

YES: firebase/appWillStart . initFireBase()
-->


- **FireBase Initialization**

  **[`src/feature/firebase/index.js`]** TK: GIST with Caption Link HIGHLIGHTING appWillStart() RANGE
  ```js
  import {createFeature}  from 'feature-u';
  import initFireBase     from './init/initFireBase';

  /**
   * The **'firebase'** feature initializes the google firebase service,
   * and provides a placeholder for future API abstractions.
   */
  export default createFeature({
    name: 'firebase',

    appWillStart({app, curRootAppElm}) {
      initFireBase(); // initialize FireBase
    },
  });
  ```

- **Bootstrap Action**

  **[`src/feature/device/appDidStart.js`]** via **[`src/feature/device/index.js`]** TK: GIST with Caption Link HIGHLIGHTING appDidStart() RANGE
  ```js
  import actions  from './actions';

  /**
   * An app-level life-cycle hook that dispatches our bootstrap action
   * that gets the ball rolling!
   */
  export default function appDidStart({app, appState, dispatch}) {
    dispatch( actions.bootstrap() );
  }
  ```

- **Inject DOM Root Elm**

  **[`src/feature/leftNav/appWillStart.js`]** via **[`src/feature/leftNav/index.js`]** TK: GIST with Caption Link HIGHLIGHTING appWillStart() RANGE
  ```js
  import React            from 'react';
  import {Drawer}         from 'native-base';
  import SideBar, 
        {registerDrawer,
         closeSideBar}    from './comp/SideBar';

  /**
   * Inject our Drawer/SideBar component at the root of our app
   */
  export default function appWillStart({app, curRootAppElm}) {
    return (
      <Drawer ref={ ref => registerDrawer(ref) }
              content={<SideBar/>}
              onClose={closeSideBar}>
        {curRootAppElm}
      </Drawer>
    );
  }
  ```



<!-- *** SECTION ********************************************************************************  -->
## Feature Collaboration

Even though a feature's implementation is encapsulated, it still needs
to interact with it's surroundings.  To complicate matters, one
feature should never import resources from another feature, because it
should strive to be plug-and-play.  As a result, we need a
well-defined feature-based Public API.

To solve this, **feature-u** promotes a [Cross Feature Communication].
This is accomplished through the `Feature.publicFace` [Built-In
aspect] property.  A feature can expose whatever it deems necessary
through it's `publicFace`.  There are no real constraints on this
resource.  It is truly open.  Typically this involves promoting
selected **actions** &bull; **selectors** &bull; **APIs** &bull; etc.

The `publicFace` of all features are accumulated and exposed through
the [`App`] object (emitted from [`launchApp()`]).  It contains named feature
nodes, as follows:

```js
App.{featureName}.{publicFace}
```

Here is an example from **eatery-nod**'s [auth] feature.

<!-- 
NO:  device/publicFace.js ........ API     ACTIONS: ready()                                                                      SELECTORS: areFontsLoaded(appState) ... isDeviceReady(appState) ... getDeviceLoc(appState)
YES: auth/publicFace.js ..........         ACTIONS: userProfileChanged(userProfile) ... signOut()                                SELECTORS: getUserPool(appState)
NO:  leftNav/publicFace.js ....... open() close() SideBar
NO:  currentView/publicFace.js ...         ACTIONS: changeView(viewName)                                                         SELECTORS: getView(appState): string
NO:  eateries/publicFace.js ......         ACTIONS: openFilterDialog([domain] [,formMsg]) ... add(eateryId) ... remove(eateryId) SELECTORS: getDbPool(appState)
NO:  discovery/publicFace.js ..... API     ACTIONS: openFilterDialog([domain] [,formMsg])
-->


**[`src/feature/auth/publicFace.js`]** via **[`src/feature/auth/index.js`]** TK: GIST with Caption Link HIGHLIGHTING RANGE
```js
import actions  from './actions';
import * as sel from './state';

/**
 * The publicFace promoted by this feature through: app.auth...
 */
export default {
  actions: {
    userProfileChanged: actions.userProfileChanged, // userProfileChanged(userProfile)
    signOut:            actions.signOut,            // signOut()
  },
  sel: {
    getUserPool:        sel.getUserPool,
  },
};
```

Out of all the items found in the `auth` feature, only two actions and
one selector are public.  Here is what the [`App`] object would look
like for this example:

```js
app: {
  auth: {
    actions: {
      userProfileChanged(userProfile),
      signOut(),
    },
    sel: {
      getUserPool(appState),
    },
  },
  currentView: {   // other features
    ... snip snip
  },
}
```

As a result, the `auth` feature's public API can be accessed as
follows:

```js
  app.auth.actions.userProfileChanged(userProfile)
  app.auth.actions.signOut()
  app.auth.sel.getUserPool(appState): 
```


<!-- *** SECTION ********************************************************************************  -->
## Framework Integration

Most likely your application employs one or more frameworks (ex:
[redux], [redux-logic], etc.).  How are the resources needed by these
frameworks acumulated and configured across the many features of your
app?

To solve this, **feature-u** introduces [Extendable aspects].
**feature-u** is [extendable]!!  It provides integration points
between your features and your chosen frameworks.

Extendable Aspects are packaged separately from **feature-u**, so as
to not introduce unwanted dependencies (_because not everyone uses the
same frameworks_).  You pick and choose them based on the framework(s)
used in your project _(matching your project's run-time stack)_.  They
are created with **feature-u**'s extendable API, using
[`createAspect()`].  You can define your own Aspect, _if the one you
need doesn't already exist_!

Let's take a look at a [redux] example from **eatery-nod**.  

The `device` feature maintains it's own slice of the state tree.  It
promotes it's reducer through the `Feature.reducer` aspect:

<!-- 
YES: device/state.js .... simplest state
NO:  many others
-->

**[`src/feature/device/index.js`]** TK: GIST with Caption Link HIGHLIGHTING reducer
```js
import {createFeature}  from 'feature-u';
import name             from './featureName';
import reducer          from './state';

export default createFeature({
  name,
  reducer,
  ... snip snip
});
```

Because `Feature.reducer` is an **extended aspect** (verses a
_built-in aspect_), it is only available because we registered the
[feature-redux] `reducerAspect` to [`launchApp()`] _(please refer to
[Simplified App Startup](#simplified-app-startup) above TK link)_

The **key thing to understand** is that **feature-u** _(through the
[feature-redux] extension)_ will automatically configure [redux] by
accumulating all feature reducers into one overall appState.

Here is the reducer code ...

**[`src/feature/device/state.js`]** TK: GIST with Caption Link HIGHLIGHTING reducer RANGE
```js
import {combineReducers}  from 'redux';
import {reducerHash}      from 'astx-redux-util';
import {slicedReducer}    from 'feature-redux';
import actions            from './actions';

const reducer = slicedReducer('device', combineReducers({

  status: reducerHash({ // string: 'Waiting for bla bla bla' -or- 'READY'
    [actions.statusUpdate]: (state, action) => action.statusMsg,
  }, 'Waiting for App to start'), // initialState

  fontsLoaded: reducerHash({
    [actions.loadFonts.complete]: (state, action) => true,
    [actions.loadFonts.fail]:     (state, action) => 'Device fonts could NOT be loaded :-('
  }, false), // initialState

  loc: reducerHash({ // loc: {lat, lng}
    [actions.locateDevice.complete]: (state, action) => action.loc,
  }, null), // initialState

}) );

export default reducer;
```

A feature-based reducer is simply a normal reducer that manages the
feature's slice of the the overall appState. The only difference is it
must be embellished with [`slicedReducer()`], which provides
instructions on where to insert it in the overall top-level appState.

As a result, the `device` reducer only maintains the state relevent to
the `device` feature _(i.e. it's little slice of the world)_ ... a
**status**, a **fontsLoaded** indicator, and the **device location**.

**SideBar**: We are using the [astx-redux-util] utility's
[`reducerHash()`] function to concisely implement the feature's
reducer _(providing an alternative to the common switch statement)_.
I have found that in using a utility like this, for most cases it is
feasable to implement all the reducers of a feature in one file _(due
in part to the smaller boundary of a feature)_.  [astx-redux-util]
also promotes other [Higher-Order Reducers].  You may want to check
this out.


<!-- *** SECTION ********************************************************************************  -->
## Feature Enablement

Some of your features may need to be dynamically enabled or disabled.
As an example, certain features may only be enabled with a license
upgrade, or other features may only be used for diagnostic purposes.

To solve this, **feature-u** introduces [Feature Enablement].  Using
the `Feature.enabled` [Built-In aspect] _(a boolean property)_, you
can enable or disable your feature.

Here is an example from **eatery-nod**'s [sandbox] feature ...

<!-- 
YES: sandbox/index.js
NO:  logActions/index.js
-->

**[`src/feature/sandbox/index.js`]** TK: GIST with Caption Link HIGHLIGHTING reducer RANGE
```js
import {createFeature}  from 'feature-u';

export default createFeature({
  name:    'sandbox',
  enabled: false,
  ... snip snip
});
```

The [sandbox] feature promotes a variety of interactive tests,
used in development, that can easily be disabled.

Typically this indicator is based on a dynamic expression, but in this
case it is simply hard-coded _(to be set by a developer)_.

**SideBar:** When other features interact with a feature that can be
disabled, you can use the [`App`] object to determine if a feature is
presdent or not _(see: [Feature Enablement] for more information)_.



<!-- *** SECTION ********************************************************************************  -->
## Managed Code Expansion

In general, accessing **imported resources** during in-line code
expansion can be problematic, _due to the order in which these
resources are expanded_.  The **feature-u** [`App`] object is such a
critical resource _(because it promotes the Public API of all
features)_, **it must be available even during code expansion**.  In
other words, we cannot rely on an "imported app" being resolved during
code expansion time.

To solve this, **feature-u** introduces [Managed Code Expansion].

When aspect content definitions require the [`App`] object at code
expansion time, you simply wrap the definition in a
[`managedExpansion()`] function.  In other words, your aspect content
can either be the actual content itself _(ex: a reducer)_, or a
function that returns the content.

When this is done, **feature-u** will expand it by invoking it in a
controlled way, passing the fully resolved [`App`] object as a
parameter.

Here is a logic module from **eatery-nod**'s [auth] feature ...

**[`src/feature/auth/logic.js`]** TK: GIST with Caption Link HIGHLIGHTING reducer RANGE
```js
import {createLogic}      from 'redux-logic';
import {managedExpansion} from 'feature-u';
import featureName        from './featureName';
import actions            from './actions';

                                  // *1*
export const startAuthorization = managedExpansion( (app) => createLogic({

  name: `${featureName}.startAuthorization`,
  type: String(app.device.actions.ready),    // *2*
  
  process({getState, action}, dispatch, done) {
    dispatch( actions.bootstrap() );
    done();
  },
}));

... snip snip
```

You can see that the [auth] feature is using an action from the
[device] feature, requiring access to the `app` object (see `*2*`).
Because the `app` object is needed during code expansion, we use the
[`managedExpansion()`] function (see `*1*`), allowing **feature-u** to
expand it in a controlled way, passing the fully resolved `app` object
as a parameter.




<!-- *** SECTION ********************************************************************************  -->
## XXX 

??$$ NUMBER 4

Bla ???

To solve this, **feature-u** ?? introduces ??

Here are some examples from **eatery-nod**:

<!-- 
NO:  ?? device/appWillStart ... platformSetup()
YES: ?? device/appDidStart .... dispatch( actions.bootstrap() );
-->


- **Xxx**

  **`src/feature/firebase/xxx.js`**
  ```js
  xxx
  ```





















<!-- *** SECTION ********************************************************************************  -->
## feature-u Benefits ...

In summary, the benefits of using **feature-u** include:

- **Feature Encapsulation** _isolating feature implementations improves code manageability_

- **Cross Feature Communication** _a feature's public API is promoted through a well-defined standard_

- **Feature Enablement** _enable/disable features through a run-time switch_

- **Application Life Cycle Hooks** _features can initialize themselves without
  relying on an external process_

- **Single Source of Truth** is facilitated in a number of ways
  _within a feature's implementation_

- **Framework Integration** _configure the framework(s) of your choice
  (matching your run-time-stack) using **feature-u**'s extendable API_

- **UI Component Promotion** _through Feature Routes_

- **Minimize Feature Order Dependency Issues** _even in code that is
  expanded in-line_

- **Plug-and-Play** _features can be added/removed easily_

- **Simplified Mainline** _launcApp() starts the app running by
  configuring the frameworks in use, all driven by a simple set of
  features!_

- **Operates in any React Platform** _(React Web, React Native, Expo,
  etc.)_


<!-- ?? trash (I think):
- **Manages Feature Aspects** _accumulation, setup, configure, etc._
-->

Hopefully this article gives you a feel for how **feature-u** can
improve your project.  Please refer to the full documentation for more
details.

**feature-u** allows you to **focus your attention on the "business
end" of your features!** _Go forth and compute!!_



<!--
## ?? SideBar highlight my preferred run-time stack and show how concise usage is with MY other utilities
  * ? action definitions can be with action-u
  * ? reducer definitions can be with astx-redux-util
-->


## References

- [A feature based approach to React development](http://ryanlanciaux.com/blog/2017/08/20/a-feature-based-approach-to-react-development/)
  _... Ryan Lanciaux_
  <!--
  KJB: very good high level stuff ... NOTED BY Jeff
       * general discussion
       * structure (SAME AS MINE)
           src
             features/
               cart/
                 components/
                 actionCreators.js
                 index.js
                 reducer.js
                 selectors.js
               product/
               other/
       * talks about a Feature Flag
         ... a technique to turn some functionality of your application off,
             via configuration, without deploying new code
  -->

- [How to better organize your React applications?](https://medium.com/@alexmngn/how-to-better-organize-your-react-applications-2fd3ea1920f1)
  _... Alexis Mangin_
  <!--
  KJB: more general discussion of react (without redux) ... NOTED BY Jeff
       * discusses scenes
  -->

- [How to use Redux on highly scalable javascript applications?](https://medium.com/@alexmngn/how-to-use-redux-on-highly-scalable-javascript-applications-4e4b8cb5ef38)
  _... Alexis Mangin_
  <!--
  KJB: very good discussion of breaking redux up into features (exactly what I am doing)
       * same author of above article: Alexis Mangin
  -->

- [The 100% correct way to structure a React app (or why there’s no such thing)](https://hackernoon.com/the-100-correct-way-to-structure-a-react-app-or-why-theres-no-such-thing-3ede534ef1ed)
  _... David Gilbertson_
  <!--
  KJB: more interested in file usage/accessability (large hit count)
  -->

- [Redux for state management in large web apps](https://blog.mapbox.com/redux-for-state-management-in-large-web-apps-c7f3fab3ce9b)
  _... David Clark_
  <!--
  KJB: NOT directly feature related, HOWEVER points out several feature-based items, such as sliced reducers
  -->

  <!-- KJB: OMIT: marginal value
- [How to structure real world Redux/React application](https://medium.com/@yiquanzhou/how-to-structure-real-world-redux-react-application-d61e66a7dd36)
  _... Yiquan Zhou_
  -->








<!--- internal references ---> 
[References]:       #references

<!--- eatery-nod TODO: eventually change BRANCH: organize-by-feature TO TAG: after-features ---> 
[eatery-nod]:   https://github.com/KevinAst/eatery-nod/tree/organize-by-feature
[src BEFORE]:   https://github.com/KevinAst/eatery-nod/tree/before-features/src
[src AFTER]:    https://github.com/KevinAst/eatery-nod/tree/organize-by-feature/src
[README files]: https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/README.md
[device]:       https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/device/README.md
[auth]:         https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/auth/README.md
[leftNav]:      https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/leftNav/README.md
[currentView]:  https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/currentView/README.md
[eateries]:     https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/eateries/README.md
[discovery]:    https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/discovery/README.md
[firebase]:     https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/firebase/README.md
[logActions]:   https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/logActions/README.md
[sandbox]:      https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/sandbox/README.md

[`src/app.js`]:                           https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/app.js#L28-L34

[`src/feature/firebase/index.js`]:        https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/firebase/index.js#L11-L13

[`src/feature/device/appDidStart.js`]:    https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/device/appDidStart.js#L7-L9
[`src/feature/device/index.js`]:          https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/device/index.js#L62

[`src/feature/leftNav/appWillStart.js`]:  https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/leftNav/appWillStart.js#L10-L18
[`src/feature/leftNav/index.js`]:         https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/leftNav/index.js#L24

[`src/feature/auth/publicFace.js`]:       https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/auth/publicFace.js#L7-L15
[`src/feature/auth/index.js`]:            https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/auth/index.js#L49
[`src/feature/auth/logic.js`]:            https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/auth/logic.js#L18-L27

[`src/feature/device/index.js`]:          https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/device/index.js#L57
[`src/feature/device/state.js`]:          https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/device/state.js#L10-L27

[`src/feature/sandbox/index.js`]:         https://github.com/KevinAst/eatery-nod/blob/organize-by-feature/src/feature/sandbox/index.js#L15


<!--- feature-u ---> 
[feature-u]:        https://feature-u.js.org/
[feature-router]:   https://github.com/KevinAst/feature-router

[Launching Your Application]:   https://feature-u.js.org/cur/detail.html#launching-your-application
[Extendable aspects]:           https://feature-u.js.org/cur/detail.html#extendable-aspects
[React Registration]:           https://feature-u.js.org/cur/detail.html#react-registration
[Cross Feature Communication]:  https://feature-u.js.org/cur/crossCommunication.html
[Application Life Cycle Hooks]: https://feature-u.js.org/cur/appLifeCycle.html
[Built-In aspect]:              https://feature-u.js.org/cur/detail.html#built-in-aspects
[Feature Enablement]:           https://feature-u.js.org/cur/enablement.html
[Managed Code Expansion]:       https://feature-u.js.org/cur/crossCommunication.html#managed-code-expansion
[extendable]:                   https://feature-u.js.org/cur/extending.html


[`Feature`]:        https://feature-u.js.org/cur/api.html#Feature
[`App`]:            https://feature-u.js.org/cur/api.html#App

[`launchApp()`]:           https://feature-u.js.org/cur/api.html#launchApp
[`registerRootAppElm()`]:  https://feature-u.js.org/cur/api.html#registerRootAppElmCB

[`Feature.appWillStart()`]:                                           https://feature-u.js.org/cur/appLifeCycle.html#appwillstart
[`Feature.appWillStart({app, curRootAppElm}): rootAppElm || falsy`]:  https://feature-u.js.org/cur/appLifeCycle.html#appwillstart

[`Feature.appDidStart()`]:                                https://feature-u.js.org/cur/appLifeCycle.html#appDidStart
[`Feature.appDidStart({app, appState, dispatch}): void`]: https://feature-u.js.org/cur/appLifeCycle.html#appDidStart

[`managedExpansion()`]:    https://feature-u.js.org/cur/api.html#managedExpansion

[`createAspect()`]:        https://feature-u.js.org/cur/api.html#createAspect

[feature-redux]:     https://github.com/KevinAst/feature-redux
[`slicedReducer()`]: https://github.com/KevinAst/feature-redux#slicedreducer

<!--- external links ---> 
[react]:            https://reactjs.org/

[react web]:        https://reactjs.org/
[react-native]:     https://facebook.github.io/react-native/
[expo]:             https://expo.io/

[redux]:            http://redux.js.org/
[redux-logic]:      https://github.com/jeffbski/redux-logic

[astx-redux-util]:  https://astx-redux-util.js.org/
[`reducerHash()`]:  https://astx-redux-util.js.org/1.0.0/api.html#reducerHash

[Higher-Order Reducers]: https://redux.js.org/docs/recipes/reducers/ReusingReducerLogic.html#customizing-behavior-with-higher-order-reducers


