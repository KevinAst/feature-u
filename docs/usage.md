# Usage

The basic usage pattern of feature-u is to:

1. Choose the Aspects that you will need, based on your selected
   frameworks (i.e. your run-time stack).  This extends the aspect
   properties accepted by the Feature object (for example:
   `Feature.reducer` for [redux], or `Feature.logic` for
   [redux-logic]).

   Typically these Aspects are packaged separately in NPM, although you
   can create your own Aspects (if needed).

1. Organize your app into features.

   * Each feature should be located in it's own directory.

   * How you break your app up into features will take some time and
     thought.  There are many ways to approach this from a design
     perspective.

   * Each feature will promote it's aspect content through a Feature
     object (using `createFeature()`).

1. Your mainline starts the app by invoking `launchApp()`, passing all
   Aspects and Features.

**Easy Peasy!!**


## Directory Structure

Here is a sample directory structure of an app that uses **feature-u**:

```
src/
  app.js              ... launches app using launchApp()

  feature/
    index.js          ... accumulate/promote all app Feature objects

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

Each feature promotes it's aspect content through a Feature object
(using `createFeature()`).

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

We will fill in more detail a bit later, but for now notice that the
feature is conveying reducers, logic modules, routes, and does some
type of initialization (appWillStart/appDidStart).  It also promotes a
publicFace (open/close) that can be used by other features (i.e. the
feature's Public API).


## launchApp()

In **feature-u** the application mainline is very simple and generic.
There is no real app-specific code in it.  That is because we allow
each feature to inject their own app-specific constructs.  The
mainline merely accumulates the Aspects and Features, and starts the
app by invoking `launchApp()`:

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

Here are some **important points of interest** _(match `*n*` to the code
above)_:

`*1*`: the Aspect collection reflects the frameworks of our
run-time stack _(in our example [redux], [redux-logic], and
[feature-router])_ and extend the acceptable Feature properties
_(`Feature.reducer`, `Feature.logic`, and `Feature.route`
respectively)_ ... _**see:** [closer-look Extendable aspects]_

`*2*`: `launchApp()` uses a `registerRootAppElm()` callback to
catalog the supplied `rootAppElm` to the specific React platform in
use.  Because this registration is accomplished by your app-specific
code, **feature-u** can operate in any of the React platforms, such
as: React Web, React Native, Expo, etc. ... _**see:** [React
Registration](#react-registration))_

`*3*`: _as a bit of a preview_, the return value of `launchApp()` is
an App object, which promotes the accumulated Public API of all
features.  The App object contains named feature nodes, and is
exported to provide [Cross Feature Communication] ... _here is what
app looks like for this example:_

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

Hopefully this gives you a basic feel of how **feature-u** operates.
The subsequent sections will develop a more thorough understanding!


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


