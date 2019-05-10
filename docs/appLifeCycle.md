# Application Life Cycle Hooks

Because **feature-u** is in control of launching the app, life cycle
hooks for the application can be introduced, allowing features to
perform app-specific initialization, and even inject components into
the root of the app.

Two hooks are provided through the following built-in
{{book.api.Feature}} aspects:

1. [`Feature.appWillStart`](#appwillstart) - invoked one time at app startup time
2. [`Feature.appDidStart`](#appdidstart)   - invoked one time immediately after app has started

Application Life Cycle Hooks **greatly simplify your app's mainline
startup process**, because _initialization specific to a given feature
**can be encapsulated in that feature**_.


## appWillStart

The Feature {{book.api.appWillStartCB}} life-cycle hook is invoked one
time, just before the app starts up.

**API**: {{book.api.appWillStartCB$}}

This life-cycle hook can do any type of initialization.  For example:
initialize your database:

```js
appWillStart({fassets, curRootAppElm}) {
  initFireBase();
}
```

### Injecting DOM Content

In addition, the {{book.api.appWillStartCB}} life-cycle hook can
optionally supplement the app's top-level root element (i.e. react
component instance).  Any significant return (truthy) is interpreted
as the app's new rootAppElm.

Here is an example that injects new root-level content:

```js
appWillStart({fassets, curRootAppElm}) {
  ... any other initialization ...
  return (
    <Drawer ...>
      {curRootAppElm}
    </Drawer>
  );
}
```

Here is an example of injecting a new sibling to `curRootAppElm` _(using
React Fragments)_:

```js
appWillStart: ({fassets, curRootAppElm}) => (
  <>
    <Notify/>
    {curRootAppElm}
  </>
)
```

**IMPORTANT**: 
---

When injecting DOM content (via the function return), the supplied
`curRootAppElm` parameter **must be included** as part of this
definition.
The `curRootAppElm` parameter (when non-null) represents content from
other features (within your app) or aspects (used by your app).
As a result, by including it in your injection, it accommodates the
accumulative process of other feature/aspect injections!

This is outside the control of **feature-u**, and if you neglect to do
it, you will be silently dropping content on the floor ... wondering
why some feature/aspect is NOT working.

**This constraint even extends to cases where the content you are
injecting doesn't support children**.  In this case you need to throw
an error, and emit applicable context in a log.
Here is an example:

```js
appWillStart({fassets, curRootAppElm}) {
  // MyContent does NOT support children
  // ... insure we don't clobber any supplied content
  if (curRootAppElm) {
    const msg = "***ERROR*** <MyContent> does NOT support children " +
                "but another feature/aspect is attempting to inject it's content. " +
                "Please resolve either by adjusting the feature expansion order, " +
                "or promoting <MyContent> through the conflicting artifact.";
    console.log(`${msg} ... conflicting artifact:`, curRootAppElm);
    throw new Error(msg);
  }
  return <MyContent .../>;
}
```

- In many cases _(such as a feature conflict)_, this can be resolved
  by adjusting the feature expansion order.

- In other cases, it may seem as though you have hit an impasse.  For
  example, if your content doesn't support children, and an aspect
  you are using doesn't support children.  Normally this doesn't mean
  that you can't use your component, it merely means that you must
  promote your component in a different way ... most likely through
  the Aspect in conflict.

Because this check is rather tedious, **feature-u** provides a
convenient {{book.api.assertNoRootAppElm}} function that performs this
check on your behalf.  The following code snippet is equivalent:

```js
appWillStart({fassets, curRootAppElm}) {
  assertNoRootAppElm(curRootAppElm, '<MyContent>'); // insure no content is clobbered (children NOT supported)
  return <MyContent .../>;
}
```


## appDidStart

The Feature {{book.api.appDidStartCB}} life-cycle hook is invoked one
time immediately after app has started.

**API**: {{book.api.appDidStartCB$}}

Because the app is up-and-running at this time, you have access to the
appState and dispatch() function ... assuming you are using redux
(when detected by **feature-u**'s plugable aspects).

A typical usage for this hook is to dispatch some type of bootstrap
action.  Here is a startup feature, that issues a bootstrap action:

```js
appDidStart({fassets, appState, dispatch}) {
  dispatch( actions.bootstrap() );
}
```
