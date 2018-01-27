# Usage

?? TODO: refine words from ARTICLE

The basic usage pattern of feature-u is to:

1. Determine the Aspects that you will be using, based on your
   frameworks in use (i.e. your run-time stack).  This determines the
   extended aspects accepted by the Feature object (for example:
   `Feature.reducer` for [redux], and `Feature.logic` for [redux-logic]).

   Typically these Aspects are packaged seperatly in NPM, although you
   can create your own Aspects (if needed).

1. Organize your app into features.

   * Each feature should be located in it's own directory.

   * How you break your app up into features will take some time and
     throught.  There are many ways to approach this from a design
     perspective.

   * Each feature promotes it's aspects through a formal Feature
     object (using `createFeature()`).

1. Your mainline starts the app by invoking `launchApp()`, passing all
   Aspects and Features.  **Easy Peasy!!**


## Directory Structure

Here is a sample directory structure of an app that uses **feature-u**:

```
src/
  app.js              ... launches app using launchApp()

  feature/
    index.js          ... accumulate/promote all app features

    featureA/         ... an app feature
      actions.js
      appDidStart.js
      appWillStart.js
      comp/
        ScreenA1.js
        ScreenA2.js
      index.js        ... promotes featureA object using createFeature()
      logic.js
      reducer.js
      route.js

    featureB/         ... another app feature
      ...

  util/               ... common utilities used across all features
    ...
```

Each feature is located in it's own directory, containing it's aspects
(actions, reducers, components, routes, logic, etc.).

## Feature Object

Each feature promotes it's aspects through a Feature object (using
`createFeature()`).

**`src/feature/featureA/index.js`**
```js
import {createFeature}  from 'feature-u';
import reducer          from './state';
import logic            from './logic';
import route            from './route';
import appWillStart     from './appWillStart';
import appDidStart      from './appDidStart';

export default createFeature({
  name:     'featureA',
  enabled:  true,

  publicFace: {
    api: {
      open:  () => ... implementation omitted,
      close: () => ... implementation omitted,
    },
  },

  reducer,
  logic,
  route,

  appWillStart,
  appDidStart,
});
```

We will fill in more detail a bit later, but for now notice that
featureA defines reducers, logic modules, routes, and does some type
of initialization (appWillStart/appDidStart).  It also promotes a
publicFace (open/close) to other features.


## launchApp()

The **application mainline**, merely collects all aspects and
features, and starts the app by invoking `launchApp()`:

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


// define our set of "plugable" feature-u Aspects, conforming to our app's run-time stack
const aspects = [
  routeAspect,   // StateRouter ... order: early, because <StateRouter> DOM injection does NOT support children
  reducerAspect, // redux       ... order: later, because <Provider> DOM injection should be on top
  logicAspect,   // redux-logic ... order: N/A,   because NO DOM injection
];


// configure our Aspects (as needed)
// ... StateRouter fallback screen (when no routes are in effect)
routeAspect.fallbackElm = <SplashScreen msg="I'm trying to think but it hurts!"/>;


// launch our app, exposing the feature-u App object (facilitating cross-feature communication)!
export default launchApp({
  aspects,
  features,
  registerRootAppElm(rootAppElm) {
    ReactDOM.render(rootAppElm,
                    getElementById('myAppRoot'));
  }
});
```

**NOTE:** The returned App object accumulates the publicFace of all
features (in named feature nodes), and is exported in order to support
cross-communication between features (_please refer to_ [Accessing the
App Object](#accessing-the-app-object)):

```js
app: {
  featureA: {
    api: {
      open(),
      close(),
    },
  },
  featureB: {
    ...
  },
}
```

**Also NOTE:** In the example above you can see that `launchApp()`
uses a `registerRootAppElm()` callback hook to register the supplied
`rootAppElm` to the specific React framework in use.  Because this
registration is accomplished by app-specific code, **feature-u** can
operate in any of the React flavors, such as: React Web, React Native,
Expo, etc. (_please refer to:_ [React
Registration](#react-registration)).


Hopefully this gives you the basic idea of how **feature-u** operates.
The following sections develop a more thorough understanding! _Go
forth and compute!!_


## Real Example

Want to see a real **feature-u** app?

[eatery-nod](https://github.com/KevinAst/eatery-nod) is the
application _where **feature-u** was conceived_.  It is a
[react-native](https://facebook.github.io/react-native/)
[Expo](https://expo.io/) mobile app, and is one of my sandbox
applications that I use to test frameworks.  _I like to develop apps
that I can use, but have enough real-world requirements to make it
interesting._

**eatery-nod** randomly selects a "date night" restaurant from a pool
of favorites.  _My wife and I have a steady "date night", and we are
always indecisive on which of our favorite restaurants to frequent
:-)_ So **eatery-nod** provides the spinning wheel!


