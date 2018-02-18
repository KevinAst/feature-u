# Usage

The basic usage pattern of **feature-u** is to:

1. Choose the Aspects that you will need, based on your selected
   frameworks (i.e. your run-time stack).  This extends the aspect
   properties accepted by the Feature object (for example:
   `Feature.reducer` for {{book.ext.redux}}, or `Feature.logic` for
   {{book.ext.reduxLogic}}).

   Typically these Aspects are packaged separately in NPM, although you
   can create your own Aspects (if needed).

1. Organize your app into features.

   * Each feature should be located in it's own directory.

   * How you break your app up into features will take some time and
     thought.  There are many ways to approach this from a design
     perspective.

   * Each feature will promote it's aspect content through a Feature
     object (using {{book.api.createFeature}}).

1. Your mainline starts the app by invoking {{book.api.launchApp}},
   passing all Aspects and Features.

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

Each feature promotes it's aspect content through a
{{book.api.Feature}} object (using {{book.api.createFeature}}).

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
There is no real app-specific code in it ... **not even any global
initialization**!  That is because **each feature can inject their own
app-specific constructs**!!  The mainline merely accumulates the
Aspects and Features, and starts the app by invoking
{{book.api.launchApp}}:

**`src/app.js`**
```js
import ReactDOM          from 'react-dom';
import {launchApp}       from 'feature-u';
import {reducerAspect}   from 'feature-redux';
import {logicAspect}     from 'feature-redux-logic';
import {routeAspect}     from 'feature-router';
import features          from './feature';

// launch our app, exposing the App object (facilitating cross-feature communication)
export default launchApp({           // *4*

  aspects: [                         // *1*
    reducerAspect, // redux          ... extending: Feature.reducer
    logicAspect,   // redux-logic    ... extending: Feature.logic
    routeAspect,   // Feature Routes ... extending: Feature.route
  ],

  features,                          // *2*

  registerRootAppElm(rootAppElm) {   // *3*
    ReactDOM.render(rootAppElm,
                    getElementById('myAppRoot'));
  }
});
```

Here are some **important points of interest** _(match the numbers to
`*n*` in the code above)_:

1. the supplied Aspects _(pulled from separate npm packages)_ reflect
   the frameworks of our run-time stack _(in our example
   {{book.ext.redux}}, {{book.ext.reduxLogic}}, and
   {{book.ext.featureRouter}})_ and extend the acceptable Feature
   properties _(`Feature.reducer`, `Feature.logic`, and
   `Feature.route` respectively)_ ... _**see:**
   {{book.guide.detail_extendableAspects}}_

2. all of our app features are supplied (accumulated from the
   `features/` directory)

3. a {{book.api.registerRootAppElmCB}} callback is used to catalog the
   supplied `rootAppElm` to the specific React platform in use.
   Because this registration is accomplished by your app-specific
   code, **feature-u** can operate in any of the React platforms, such
   as: React Web, React Native, Expo, etc. ... _**see:**
   {{book.guide.detail_reactRegistration}}_

4. _as a bit of a preview_, the return value of {{book.api.launchApp}}
   is an {{book.api.App}} object, which promotes the accumulated
   Public API of all features.  The App object contains named feature
   nodes, and is exported to provide {{book.guide.crossCom}} ... _here
   is what app looks like (for this example):_

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

{{book.ext.eateryNod}} is the application _where **feature-u** was
conceived_.  It is a {{book.ext.reactNative}} {{book.ext.expo}} mobile
app, and is one of my sandbox applications that I use to test
frameworks.  _I like to develop apps that I can use, but have enough
real-world requirements to make it interesting._

**{{book.ext.eateryNod}}** randomly selects a "date night" restaurant
from a pool of favorites.  _My wife and I have a steady "date night",
and we are always indecisive on which of our favorite restaurants to
frequent :-)_ So **{{book.ext.eateryNod}}** provides the spinning
wheel!


