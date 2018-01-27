# Single Source of Truth

Each of your feature implementations should strive to follow the
single-source-of-truth principle.  In doing this, a single line
modification can propagate to many areas of your implementation.

Please note that this discussion is merely a **best practice**,
because it is up to you to implement (i.e. feature-u is not in control
of this).

In regard to features, there are two single-source items of interest:
 - [Feature Name](#feature-name)
 - [Feature State Location](#feature-state-location)


## Feature Name

The featureName is a critical item that can be used throughout your
feature implementation to promote a consistent feature identity.

A key aspect of the featureName is that feature-u guarantees it's
uniqueness.  As a result, it can be used to qualify the identity of
several feature aspects.  For example:

 - prefixing all action types with featureName, guaranteeing their uniqueness app-wide
 - prefixing all logic module names with featureName, helps to identify where that module lives
 - depending on the context, the featureName can be used as the root of your feature state's shape

While the feature name is part of the Feature object (emitted from
createFeature()), there are race conditions where the Feature object
will not be defined (during in-line code expansion).

As a result, a best practice is to expose the featureName as a
constant, through a `featureName.js` mini-meta module that is
"importable" in all use-cases (i.e. a single-source-of-truth).

**`src/feature/foo/featureName.js`**
```js
/**
 * Expose our featureName through a mini-meta module that is
 * "importable" in all use-cases (a single-source-of-truth).
 */
export default 'foo';
```

## Feature State Location

Because feature-u relies on `slicedReducer()`, a best practice is to
use the reducer's embellished selector to qualify your feature state
root in all your selector definitions.  As a result the slice
definition is maintained in one spot.

Here is an example: 

```js
                             /** Our feature state root (a single-source-of-truth) */
const getFeatureState      = (appState) => reducer.getSlicedState(appState);

                             /** Is device ready to run app */
export const isDeviceReady = (appState) => getFeatureState(appState).status === 'READY';

... more selectors
```

