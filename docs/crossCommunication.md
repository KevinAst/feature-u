# Cross Feature Communication

Most aspects of a feature are internal to the feature's
implementation.  For example, as a general rule, actions are created
and consumed exclusively by logic and reducers that are internal to
that feature.

However, there are cases where a feature needs to publicly promote
some aspects to another feature.  As an example, featureA may:
 - need to know some aspect of featureB (say some state value through
   a selector),
 - or emit/monitor one of it's actions,
 - or in general anything (i.e. invoke some function that does xyz).

You can think of this as the feature's Public API, and it promotes
cross-communication between features.

A **best practice** is to treat each of your features as isolated
implementations.  As a result, a feature **should never** directly
import resources from other features, **rather** they should utilize
the public feature promotion of the {{book.api.App}} object
(_discussed here_).  In doing this **a:** only the public aspects of a
feature are exposed/used, and **b:** your features become truly
plug-and-play.

Let's see how Cross Communication is accomplished in **feature-u**:
  * [publicFace and the App Object](#publicface-and-the-app-object)
  * [Accessing the App Object](#accessing-the-app-object)
    - [Managed Code Expansion](#managed-code-expansion)
    - [App Access Summary](#app-access-summary)


## publicFace and the App Object

In **feature-u**, this cross-feature-communication is accomplished through
the `Feature.publicFace` built-in aspect property.

A feature can expose whatever it deems necessary through it's `publicFace`.
There are no real constraints on this resource.  It is truly open.
Typically it is a container of functions of some sort.

Here is a suggested sampling:

```js
export default createFeature({
  name:     'featureA',

  publicFace: {

    actions: {   // ... JUST action creators that need public promotion (i.e. NOT ALL)
      open: actions.view.open,
    },
    
    sel: { // ... JUST selectors that need public promotion (i.e. NOT ALL)
      currentView:   selector.currentView,
      isDeviceReady: selector.isDeviceReady,
    },

    api,

  },

  ...
});
```

The `publicFace` of all features are accumulated and exposed through
the {{book.api.App}} Object (emitted from {{book.api.launchApp}}), as
follows:

```js
App.{featureName}.{publicFace}
```

As an example, the sample above can be referenced like this: 

```js
  app.featureA.sel.isDeviceReady(appState)
```

## Accessing the App Object

The {{book.api.App}} object can be accessed in several different ways.

1. The simplest way to access the {{book.api.App}} object is to merely
   import it.

   Your application mainline exports the {{book.api.launchApp}} return
   value ... which is the App object.

   **`src/app.js`**
   ```js
   ...

   // launch our app, exposing the feature-u App object (facilitating cross-feature communication)!
   export default launchApp({
     ...
   });
   ```

   Importing the app object is a viable technique for run-time
   functions (_such as UI Components_), where the code is
   **a:** _not under the direct control of **feature-u**, and_
   **b:** _executed after all aspect expansion has completed._

   The following example is a UI Component that displays a
   `deviceStatus` obtained from an external `startup` feature
   ... **_accessing the app through an import:_**
   
   ```js
   import app from '~/app';
   
   function ScreenA({deviceStatus}) {
     return (
       <Container>
         ...
         <Text>{deviceStatus}</Text>
         ...
       </Container>
     );
   }
   
   export default connectRedux(ScreenA, {
     mapStateToProps(appState) {
       return {
         deviceStatus: app.device.sel.deviceStatus(appState),
       };
     },
   });
   ```

2. Another way to access the {{book.api.App}} object is through the
   programmatic APIs of **feature-u**, where the `app` object is supplied
   as a parameter.

   * app life-cycle hooks:
     ```js
     appWillStart({app, curRootAppElm}): rootAppElm || null
     appDidStart({app, appState, dispatch}): void                        
     ```
   
   * route hooks (PKG: {{book.ext.featureRouter}}):
     ```js
     routeCB({app, appState}): rendered-component (null for none)
     ```
   
   * logic hooks (PKG: {{book.ext.reduxLogic}}):
     ```js
     createLogic({
       ...
       transform({getState, action, app}, next) {
         ...
       },
       process({getState, action, app}, dispatch, done) {
         ...
       }
     })
     ```

3. There is a third technique to access the {{book.api.App}} object,
that provides **early access** _during code expansion time_, that is
provided through **Managed Code Expansion** (_see next section_).


## Managed Code Expansion

In the previous discussion, we detailed two ways to access the
{{book.api.App}} object, and referred to a third technique (_discussed
here_).

There are two situations that make accessing the `app` object
problematic, which are: **a:** _in-line code expansion (where the app
may not be fully defined)_, and **b:** _order dependencies (across
features)_.

To illustrate this, the following {{book.ext.reduxLogic}} module is
monitoring an action defined by an external feature (see `*1*`).
Because this `app` reference is made during code expansion time, the
import will not work, because the `app` object has not yet been fully
defined.  This is a timing issue.

```js
import app from '~/app'; // *1*

export const myLogicModule = createLogic({

  name: 'myLogicModule',
  type: String(app.featureB.actions.fooBar), // *1* app NOT defined during in-line expansion
  
  process({getState, action}, dispatch, done) {
    ... 
  },

});
```

When aspect content definitions require the `app` object at code
expansion time, you can wrap the definition in a
{{book.api.managedExpansion}} function.  In other words, your aspect
content can either be the actual content itself (ex: a reducer), or a
function that returns the content.

Your callback function should conform to the following signature:

**API**: {{book.api.managedExpansionCB$}}

When this is done, **feature-u** will invoke the
{{book.api.managedExpansionCB}} in a controlled way, passing the fully
resolved `app` object as a parameter.

To accomplish this, you must wrap your expansion function with the the
{{book.api.managedExpansion}} utility.  The reason for this is that
**feature-u** must be able to distinguish a
{{book.api.managedExpansionCB}} function from other functions (ex:
reducers).

Here is the same example (from above) that that fixes our
problem by replacing the `app` import with {{book.api.managedExpansion}}:

```js
                             // *1* we replace app import with managedExpansion()
export const myLogicModule = managedExpansion( (app) => createLogic({

  name: 'myLogicModule',
  type: String(app.featureB.actions.fooBar), // *1* app now is fully defined
  
  process({getState, action}, dispatch, done) {
    ... 
  },

}) );
```

Because {{book.api.managedExpansionCB}} is invoked in a controlled way
(by **feature-u**), the supplied `app` parameter is guaranteed to be
defined (_issue **a**_).  Not only that, but the supplied `app` object
is guaranteed to have all features publicFace definitions resolved
(_issue **b**_).

**_SideBar_**: A secondary reason {{book.api.managedExpansion}} may be
used (_over and above app injection during code expansion_) is to
**delay code expansion**, which can avoid issues related to
(_legitimate but somewhat obscure_) circular dependencies.


## App Access Summary

To summarize our discussion of how to access the {{book.api.App}}
object, it is really very simple:

1. Simply import the app (_for run-time functions outside the control
   of **feature-u**_).

2. Use the app parameter supplied through **feature-u**'s programmatic
   APIs (_when using route, live-cycle hooks, or logic hooks_).

3. Use the app parameter supplied through
   {{book.api.managedExpansion}} (_when app is required during in-line
   expansion of code_).

Accessing Feature Resources in a seamless way is a **rudimentary
benefit of feature-u** that alleviates a number of problems in your
code, making your features truly plug-and-play.

**NOTE**: It is possible that a module may be using more than one of
these techniques.  As an example a logic module may have to use
{{book.api.managedExpansion}} to access app at expansion time, but is
also supplied app as a parameter in it's functional hook.  This is
perfectly fine, as they will be referencing the exact same app object
instance.
