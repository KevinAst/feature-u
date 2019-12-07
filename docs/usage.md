# Usage

The basic usage pattern of **feature-u** is to:

1. Organize your app into features.

   * Each feature should be located in it's own directory, typically
     within a `features/` parent directory.

   * How you break your app up into features will take some time and
     thought.  There are many ways to approach this from a design
     perspective.

   * Each feature will promote it's characteristics through a
     {{book.api.Feature}} object (using {{book.api.createFeature}}).

   * A `features/index.js` module will accumulate and promote all of
     the {{book.api.Features}} that make up your entire application.

1. Choose the {{book.api.Aspects}} that you will need, based on your
   selected frameworks (i.e. your run-time stack).

   * Typically these {{book.api.Aspects}} are packaged separately in
     NPM, although you can create your own (if needed).

   * Each {{book.api.Aspect}} will extend the properties accepted by
     the Feature object (for example: `Feature.reducer` for
     {{book.ext.redux}}, or `Feature.logic` for
     {{book.ext.reduxLogic}}).

   * A best practice is to organize an `aspects/` directory, mimicking
     the same pattern as your `features/` directory.

   * An `aspects/index.js` module will accumulate and promote all of
     the aspects used by your application.

1. Your mainline will start the app by invoking {{book.api.launchApp}},
   passing all {{book.api.Features}} and {{book.api.Aspects}}.

**Easy Peasy!!**


## Directory Structure

Here is a sample directory structure of an app that uses **feature-u**:

```
src/
  app.js              ... launches app using launchApp()

  aspects/
    index.js          ... accumulate/promote all Aspect objects (used by the app)

                      ... NOTE: the aspects/ dir can contain local Aspects, however
                                because most Aspects are pulled from external 
                                NPM packages, this directory is typically empty!

  features/
    index.js          ... accumulate/promote all Feature objects (for the entire app)

    featureA/         ... a feature (within the app)
      actions.js
      appDidStart.js
      appWillStart.js
      comp/
        ScreenA1.js
        ScreenA2.js
      feature.js      ... promotes featureA object using createFeature()
      index.js        ... redirect parent dir import to the feature object
      logic.js
      reducer.js
      route.js

    featureB/         ... another feature
      ...

  util/               ... common utilities used across all features
    ...
```

Each feature is located in it's own directory, containing it's aspects
(actions, reducers, components, routes, logic, etc.).

## Feature Object

Each feature promotes it's aspect content through a
{{book.api.Feature}} object (using {{book.api.createFeature}}).

**src/features/featureA/feature.js**
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

  fassets: {
    define: {
      'api.openA':  () => ... implementation omitted,
      'api.closeA': () => ... implementation omitted,
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
type of initialization (appWillStart/appDidStart).  It also promotes
something called `fassets` (feature assets - the Public Face of a
feature) with `openA()` and `closeA()` functions which will be publicly
promoted to other features.

**Note**: Feature directory imports are redirected to the feature
object reference ... for example:

**src/features/featureA/index.js**
```js
// redirect parent dir import to the feature reference
export {default} from './feature';
```


## Feature Accumulation

All {{book.api.Features}} are accumulated in a single `index.js`
module, allowing them to be promoted through a single import.

**src/features/index.js**
```js
import featureA  from './featureA';
import featureB  from './featureB';

// promote ALL app features through a single import (accumulated in an array)
export default [
  featureA,
  featureB,
];
```

**Note**: While this represents a complete list of all app features,
some of them may be disabled (i.e. logically removed) ... see:
{{book.guide.enablement}}.


## Aspect Accumulation

A best practice is to accumulate all {{book.api.Aspects}} in a single
`aspects/index.js` module, allowing them to be promoted through a
single import.

**src/aspects/index.js**
```js
import React                  from 'react';
import {createReducerAspect}  from 'feature-redux';
import {createLogicAspect}    from 'feature-redux-logic';
import {createRouteAspect}    from 'feature-router';
import SplashScreen           from 'util/SplashScreen';

// define/configure the aspects representing the app's run-time stack
// ... redux - extending: Feature.reducer
const reducerAspect = createReducerAspect();
// ... redux-logic - extending: Feature.logic
const logicAspect   = createLogicAspect();
// ... Feature Routes - extending: Feature.route
const routeAspect   = createRouteAspect();
// ... CONFIG: define fallback screen (used when no routes are in effect)
routeAspect.config.fallbackElm$ = <SplashScreen msg="I'm trying to think but it hurts!"/>;

// promote the aspects representing the app's run-time stack
export default [
  reducerAspect,
  logicAspect,
  routeAspect,
];
```

These {{book.api.Aspects}} _(pulled from external npm packages)_
reflect the frameworks of the app's run-time stack _(in this example
{{book.ext.redux}}, {{book.ext.reduxLogic}}, and
{{book.ext.featureRouter}})_ and extend the acceptable Feature
properties _(`Feature.reducer`, `Feature.logic`, and `Feature.route`
respectively)_ ... _**see:** {{book.guide.detail_extendableAspects}}_

**Note**: The main difference in this module (vs. `features/index.js`)
is that it is typically pulling/configuring resources from external
NPM packages, rather than locally defined within the project
_(although you can create your own if needed)_.


## launchApp()

In **feature-u** the application mainline is very simple and generic.
There is no real app-specific code in it ... **not even any global
initialization**!  That is because **each feature can inject their own
app-specific constructs**!!  The mainline merely accumulates the
{{book.api.Features}} and {{book.api.Aspects}}, and starts the app by
invoking {{book.api.launchApp}}:

**src/app.js**
```js
import ReactDOM     from 'react-dom';
import {launchApp}  from 'feature-u';
import features     from 'features';
import aspects      from 'aspects';

// launch our app, exposing the Fassets object (facilitating cross-feature-communication)
export default launchApp({          // *4*
                                    
  features,                         // *1*
  aspects,                          // *2*

  registerRootAppElm(rootAppElm) {  // *3*
    ReactDOM.render(rootAppElm,
                    document.getElementById('root'));
  },
});
```

Here are some **important points of interest** _(match the numbers to
`*n*` in the code above)_:

1. all app features are supplied (accumulated from the `features/`
   directory) ... _**see:** {{book.guide.usage_featureAccumulation}}_

2. the app aspects (i.e. the run-time stack) are supplied (accumulated
   from the `aspects/` directory) ... _**see:** {{book.guide.usage_aspectAccumulation}}_

3. a {{book.api.registerRootAppElmCB}} callback is used to catalog the
   supplied `rootAppElm` to the specific React platform in use.
   Because this registration is accomplished by your app-specific
   code, **feature-u** can operate in any of the React platforms, such
   as: {{book.ext.reactWeb}}, {{book.ext.reactNative}}, and
   {{book.ext.expo}} ... _**see:** {{book.guide.detail_reactRegistration}}_

4. _as a bit of a preview_, the return value of {{book.api.launchApp}}
   is a {{book.api.FassetsObject}}, which promotes the accumulated
   Public Face of all features, and is exported to provide
   {{book.guide.crossCom}} ... _here is what the `fassets` looks like
   (in this example):_

   ```js
   fassets: {
     api: {
       openA(),
       closeA(),
     },
   }
   ```

Hopefully this gives you a basic feel of how **feature-u** operates.
The subsequent sections will develop a more thorough understanding!


## Real Example

Want to see a real **feature-u** app?

{{book.ext.eateryNodW}} is the application _where **feature-u** was
conceived_.  It is a {{book.ext.pwa}}, and is one of my sandbox
applications that I use to test frameworks.  _I like to develop apps
that I can use, but have enough real-world requirements to make it
interesting._

**{{book.ext.eateryNodW}}** randomly selects a "date night" restaurant
from a pool of favorites.  _My wife and I have a steady "date night",
and we are always indecisive on which of our favorite restaurants to
frequent :-)_ So **{{book.ext.eateryNodW}}** provides the spinning
wheel!
