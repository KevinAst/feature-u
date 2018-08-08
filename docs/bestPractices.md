# Best Practices

This section will highlight some **feature-based best practices**,
including some **single-source-of-truth** principles.

Each of your feature implementations should strive to follow the
**single-source-of-truth** principle.  In doing this, a single line
modification can propagate to many areas of your implementation.

This discussion is a guideline.  It's up to you to implement these
items _because **feature-u** is not in control of this_.


## Avoid Cross Feature Imports

A **best practice** is to treat each of your features as isolated
implementations.

As a result, a given feature **should never** directly import
resources from other features.  This is tempting because typically the
code is right there!

If one feature requires resources from other features, simply use the
{{book.guide.crossCom}} mechanism provided by **feature-u** _(exposing
a smaller cross section of the **Feature's Public Face**)_.

The reason for this is two fold:

1. it is **more controlled** ... _a feature can formally declare it's
Public Facing points_

2. your features truly become **plug-and-play**


## Feature Name

The featureName is a critical item that can be used throughout your
feature implementation to promote a consistent feature identity.

A key aspect of the featureName is that **feature-u** guarantees it's
uniqueness.  As a result, it can be used to qualify the identity of
several feature aspects.  For example:

- prefix action types with featureName, guaranteeing their uniqueness app-wide
  _(see: [`feature-redux`](https://github.com/KevinAst/feature-redux#action-uniqueness-single-source-of-truth) docs)_

- prefix logic module names with featureName, identifying where that module lives
  _(see: [`feature-redux-logic`](https://github.com/KevinAst/feature-redux-logic#single-source-of-truth) docs)_

- depending on the context, the featureName can be used as the root of your feature state's shape
  _(see: [`feature-redux`](https://github.com/KevinAst/feature-redux#state-root-single-source-of-truth) docs)_

While `Feature.name` is part of the {{book.api.Feature}} object
(emitted from {{book.api.createFeature}}, there are race conditions
where the {{book.api.Feature}} object will not be defined during
in-line code expansion.

As a result, a best practice is to expose a featureName constant,
through a `featureName.js` mini-meta module that is "importable" in
all use-cases (i.e. a **single-source-of-truth**).

**`src/feature/foo/featureName.js`**
```js
/**
 * Expose our featureName through a mini-meta module that is
 * "importable" in all use-cases (a single-source-of-truth).
 */
export default 'foo';
```

## Feature State Location

Because **feature-u** relies on
[`slicedReducer()`](https://github.com/KevinAst/feature-redux#slicedreducer)
(in the {{book.ext.featureRedux}} package), a best practice is to use
the reducer's embellished selector to qualify your feature state root
in all your selector definitions.  As a result the slice definition is
maintained in one spot (i.e. a **single-source-of-truth**).

Here is an example: 

```js
                             /** Our feature state root (a single-source-of-truth) */
const getFeatureState      = (appState) => reducer.getSlicedState(appState);

                             /** Is device ready to run app */
export const isDeviceReady = (appState) => getFeatureState(appState).status === 'READY';

... more selectors
```

For more information, please refer to the
[feature-redux](https://github.com/KevinAst/feature-redux#feature-state-location-single-source-of-truth)
docs.
