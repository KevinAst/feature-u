# Application Life Cycle Hooks

Because **feature-u** is in control of launching the app, application life
cycle hooks can be introduced, allowing features to perform
app-specific initialization, and even inject components into the
root of the app.

Two hooks are provided through the following built-in
{{book.api.Feature}} aspects:

1. [`Feature.appWillStart`](#appwillstart) - invoked one time at app startup time
2. [`Feature.appDidStart`](#appdidstart)   - invoked one time immediatly after app has started


## appWillStart

The Feature {{book.api.appWillStartCB}} life-cycle hook is invoked one
time, just before the app starts up.

**API**: {{book.api.appWillStartCB$}}

This life-cycle hook can do any type of initialization.  For example:
initialize FireBase _(say from a named DB feature's public API)_:

```js
appWillStart({app, curRootAppElm}) {
  app.DB.api.init();
}
```

In addition, this life-cycle hook can optionally supplement the app's
top-level root element (i.e. react component instance).  Any
significant return (truthy) is interpreted as the app's new
rootAppElm.  **IMPORTANT**: When this is used, the supplied
curRootAppElm MUST be included as part of this definition
(accommodating the accumulative process of other feature injections)!

Here is an example that injects new root-level content:

```js
appWillStart({app, curRootAppElm}) {
  ... any other initialization ...
  return (
    <Drawer ...>
      {curRootAppElm}
    </Drawer>
  );
}
```

Here is an example of injecting a new sibling to curRootAppElm:
```js
appWillStart: ({app, curRootAppElm}) => [React.Children.toArray(curRootAppElm), <Notify key="Notify"/>]
```


## appDidStart

The Feature {{book.api.appDidStartCB}} life-cycle hook is invoked one
time immediatly after app has started.

**API**: {{book.api.appDidStartCB$}}

Because the app is up-and-running at this time, you have access to the
appState and dispatch() function ... assuming you are using redux
(when detected by **feature-u**'s plugable aspects).

A typical usage for this hook is to dispatch some type of bootstrap
action.  Here is a startup feature, that issues a bootstrap action:

```js
appDidStart({app, appState, dispatch}) {
  dispatch( actions.bootstrap() );
}
```
