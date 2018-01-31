# Feature Enablement

By default all Features are active.  If however you wish to disable a
feature, you merely set it's `Feature.enabled` boolean property _(part
of the {{book.guide.detail_builtInAspects}})_:

```js
export default createFeature({
  name:     'sandbox',
  enabled:  false,
  ... snip snip
});
```

In this example, it is just as though the `sandbox` feature doesn't
exist.  In other words **it has been logically removed**.

Typically, this indicator is based on some run-time expression,
allowing packaged code to be dynamically enabled/disabled during the
application's start-up process:

```js
export default createFeature({
  name:     'sandbox',
  enabled:  inDevelopmentMode(),
  ... snip snip
});
```

This dynamic is useful in a number of different situations. For
example:

- some features may require a license upgrade

- other features may only be used for diagnostic purposes, and are
  disabled by default


### How does it work?

Because **feature-u** is responsible for aggregating assets across all
features, it's a very simple process to disable a feature ... the
features supplied to {{book.api.launchApp}} are merely pruned to a set
of **active** features.  It's just as though disabled features never
existed _(logically)_.

To fully understand how this works, consider the following
characteristics of a disabled feature _(read this table like a
sentence ... injecting the header in front of each column)_:

disabled features with ... | never registers the feature's ... | therefore, the feature's:
---                        | ---                               | ---
life cycle hooks           | callbacks                         | initialization code never executes
state management           | reducers                          | state doesn't exist
logic                      | logic modules                     | logic is never executed
feature routes             | routes                            | screens are never presented
etc.                       | etc.                              | etc.

The internal implementation of **Feature Enablement** is extremely
straightforward!  The underlying reason for this simplicity is that
**feature-u** is in charge of the setup and configuration of your
application.  **Easy Peasy!** _**I love it when a design comes
together!!**_


### Feature Existence and Dependencies

When a feature is completely self-contained _(i.e. it **has NO**
{{book.guide.crossCom_publicFace}})_, then there is no other
consideration in disabling it ... you **simply disable it** and **it
disappears!**

If however one feature depends on another _(i.e. it **has a**
{{book.guide.crossCom_publicFace}})_, then there are additional
factors to consider.

As you know, the {{book.api.App}} object is used to facilitate
{{book.guide.crossCom}}.  If a feature does not exist, or has been
disabled, the corresponding `app.{featureName}` will NOT exist.

You can use this to conditionally determine whether a feature is
present or not.

- It could be that `featureA` will conditionally use `featureB` if it
  is present.

  ```js
  if (app.featureB) {
    ... do something featureB related
  }
  ```

- It could be that `featureC` unconditionally requires that `featureD`
  is present.  This can be checked in the {{book.api.appWillStartCB}}
  {{book.guide.appLifeCycle}}.

  ```js
  appWillStart({app, curRootAppElm}) {
    assert(app.featureD, '***ERROR*** I NEED featureD');
  }
  ```
