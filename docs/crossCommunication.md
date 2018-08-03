# Cross Feature Communication

A **best practice** of feature-based development _(to the extent
possible)_ is to **treat each feature as an isolated implementation**.
Most aspects of a feature are internal to that feature's
implementation _(for example, actions are typically created and
consumed exclusively by logic/reducers/components that are internal to
that feature)_.

From this perspective, you can think of each feature as it's **own
isolated mini application**.

With that said however, we know that _"**no man is an island**"_!  There
are cases where a feature needs to promote a limited subset of it's
aspects to other features.  For example, a feature may need to:

 - be knowledgeable of some external state (via a selector)
 - emit or monitor actions of other features
 - consolidate component resources from other features - as in **UI Composition**
 - invoke the API of other features
 - etc. etc. etc.

These items form the basis of why **Cross Feature Communication** is
needed.

To complicate matters, as a general rule, **JS imports should NOT
cross feature boundaries**.  The reason being that this
cross-communication should be limited to public access points -
helping to **facilitate true plug-and-play**.

Given all this then, **how is Cross Feature Communication achieved**?

Features need a way to promote their **Public Face** to other
features, and consume other feature's **Public Assets**.


## Basic Concepts: fassets

**feature-u** promotes feature-based resources through something
called `fassets` (feature assets).  This is how all **Cross Feature
Communication** is accomplished.  You can think of this as the **Public
Face** of a feature.

**SideBar**: The term `fassets` is a play on words.  While it is
pronounced "facet" _and is loosely related to this term_, it is spelled
fassets (i.e. feature assets).

The `fassets` terminology is consistently used in both:

- the definition of resources (through the built-in
  {{book.api.fassetsAspect$}})

- and in their usage (through the {{book.api.FassetsObject}} and the
  {{book.api.withFassets}} HoC)


### fassets definition

A feature can expose whatever it deems necessary through the built-in
{{book.api.fassetsAspect$}}).  There is no real constraint on this
resource.  It is truly open.  Typically it is a set of functions or UI
Components, but is not limited to that.  It can be a combination of UI
Components, actions, selectors, API functions, constants, or whatever
your feature needs to promote.

Here is a simple example of how `fassets` are defined:

```js
export default createFeature({

  name:     'featureA',

  fassets: {
    define: {
     'openView':      actions.view.open,      // openView(viewName): Action
     'currentView':   selector.currentView,   // currentView(appState): viewName
     'isDeviceReady': selector.isDeviceReady, // isDeviceReady(appState): boolean
    },
  },

  ...
});
```

As you can see, the {{book.api.fassetsAspect}} has a `define`
directive where resources are cataloged.

In this example, **featureA** is publicly promoting **only three** of
it's many internal aspects ...  one action creator (`openView`) and
two selectors (`currentView`, and `isDeviceReady`).


### fassets usage

To use these public resources, **feature-u** accumulates them from all
active features, and promotes them through the
{{book.api.FassetsObject}} _(emitted from {{book.api.launchApp}})_.

**SideBar**: There are several ways to access the `Fassets object`
_(discussed later - {{book.guide.crossCom_accessingFassets}})_.

To reference a `fassets` resource, simply dereference it as any other
object reference.  Here is a usage example (using the definition
above):

```js
  fassets.isDeviceReady(appState)
```

**NOTE**: In addition to directly dereferencing a resource on the
`fassets` object, you can also use the {{book.api.Fassets_get}} method
and the {{book.api.withFassets}} HoC _(discussed later)_.  One
advantage of these alternatives is you can utilize wildcards to match
multiple fasset resources.


### federated namespace

fasset keys may contain a federated namespace (using dots -
`.`). When this is done, **feature-u** will normalize them in a
structure with depth.

You can use federated names however you wish, or not at all.  In
general it helps categorize or qualify assets in some way.  You may
want to qualify by feature name, or process type, or any app-specific
structure.

As an example, the following `define` was enhanced _(from above)_ to
include some qualifiers:

```js
export default createFeature({

  name:     'featureA',

  fassets: {
    define: {
     'action.openView':        actions.view.open,      // openView(viewName): Action
     'selector.currentView':   selector.currentView,   // currentView(appState): viewName
     'selector.isDeviceReady': selector.isDeviceReady, // isDeviceReady(appState): boolean
    },
  },

  ...
});
```

and would be referenced as follows:

```js
  fassets.selector.isDeviceReady(appState)
```


## UI Composition

A major benefit of working with React is components.  Components allow
you to split your UI into independent, reusable pieces.

Depending on your feature boundaries, it is very common for a given
component to be an accumulation of sub-components that span several
features.  As a result, **UI Composition is a very important part of
Cross Feature Communication**.

Let's build some concepts by looking at series of examples.

Consider a `common` feature that promotes a series of central
resources, used throughout our application.  The following snippet
demonstrates how a company logo could be promoted to several UI
components.

```js
createFeature({

  name: 'common',

  fassets: {
    define: {
     'company.logo': () => <img src="logo.png"/>, // a react component
    },
  },
  ... snip snip
});
```

So far nothing new has been introduced in this example.  This is the
same type of resource definition that we have seen previously ... it's
just the resource happens to be a react component.

### withFassets() HoC

{{book.api.withFassets}} ia a **feature-u** Higher-order Component
(HoC) that auto-wires fasset properties into a component.  This is a
common pattern popularized by redux `connect()` _(simplifying
component access to application state)_.

Here is how a component would access the `company.logo` _(defined
above)_:

```js
function MyComponent({Logo}) {
  return (
    <div>
      <Logo/>
    </div>
    ... snip snip
  );
}

export default withFassets({
  component: MyComponent,
  mapFassetsToProps: {
    Logo: 'company.logo',
  }
});
```

The {{book.api.withFassets}} HoC auto-wires named feature assets as
component properties through the `mapFassetsToProps` hook.  In this
example, because the `Logo` property is a component, `MyComponent` can
simply reference it using JSX.


## Resource Contracts

It is common for UI Composition to be represented as a contract, where
a component in one feature has a series of injection needs that are to
be supplied by other features.

The {{book.api.fassetsAspect}} has additional constructs to facilitate
this contractual arrangement, allowing **feature-u** to provide more
validation in the process.

Rather than just defining resources in one feature and using them in
another:

- A given feature can specify a series of injection needs using the
  `fassets.use` directive.  This identifies a set of **injection keys**
  that uniquely identify these resources.

- Other features will supply this content using the `fassets.defineUse`
  directive, by referencing these same **injection keys**.

This gives **feature-u** more knowledge of the process, allowing it to
verify that supplied resources are correct.

**SideBar**: The `define` and `defineUse` directives are very similar,
and in some cases can be used interchangeably.  The `defineUse`
directive does everything `define` does but enforces the additional
constraint that it must match a corresponding `use` request.
Therefore, if your intent is to to supply content that is formally
requested by another feature (via the `use` directive), `defineUse` is
preferred _(even though it can be accomplished by `define`)_,
**because typos can be caught on the definition side**.

Following is a composition example that uses this more formal definition.
In this example our application has a **MainPage**, that promotes a
variety of sub-components: a **ShoppingCart** and a **Search** screen.
Because these sub-components are managed by separate features, we need
a way to pull them into the **MainPage**.

Here is our `main` feature:

- **main feature**

  `src/features/main/index.js`
  ```js
  createFeature({
    name: 'main',
  
    fassets: {
      use: [ // <--- use externally sourced sub-content
         'MainPage.cart.link',
         'MainPage.cart.body',
  
         'MainPage.search.link',
         'MainPage.search.body',
      ],
    },
    ... snip snip
  });
  ```
  
  The `main` feature simply specifies it's need for externally sourced
  sub-content.  This is a contract _(so to speak)_ stating that it plans
  to render this content.
  
  Here is the manifestation of this contract:
  
  `src/features/main/comp/MainPage.js`
  ```js
  function MainPage({Logo, CartLink, SearchLink, CartBody, SearchBody,}) {
    return (
      <div>
        <div> {/* header section */}
          <Logo/>
        </div>
  
        <div> {/* left-nav section */}
          <CartLink/>
          <SearchLink/>
        </div>
  
        <div> {/* body section */}
          <CartBody/>
          <SearchBody/>
        </div>
      </div>
    );
  }
  
  export default withFassets({
    component: MainPage,
    mapFassetsToProps: {
      Logo:       'company.logo', // from our prior example
  
      CartLink:   'MainPage.cart.link',
      CartBody:   'MainPage.cart.body',
  
      SearchLink: 'MainPage.search.link',
      SearchBody: 'MainPage.search.body',
    },
  });
  ```

The following snippets are taken from other features that supply the
definitions for the content to inject:

- **cart feature**

  `src/features/cart/index.js`
  ```js
  createFeature({
    name: 'cart',

    fassets: {
      defineUse: {
       'MainPage.cart.link': () => <Link to="/cart">Cart</Link>,
       'MainPage.cart.body': () => <Route path="/cart" component={ShoppingCart}/>,
      },
    },
    ... snip snip
  });
  ```

- **search feature**

  `src/features/search/index.js`
  ```js
  createFeature({
    name: 'search',

    fassets: {
      defineUse: {
       'MainPage.search.link': () => <Link to="/search">Search</Link>,
       'MainPage.search.body': () => <Route path="/search" component={Search}/>,
      },
    },
    ... snip snip
  });
  ```

Two external features (**cart** and **search**) define the content
that is requested by the **main** feature.

The `fassets.defineUse` directive requires that the resource keys match a
`fassets.use` feature request.  This is the contract that provides
**feature-u** insight when enforcing it's validation.

**SideBar**: Because we are also dealing with navigation, we introduce
{{book.ext.reactRouter}} into the mix (with the `Link` and `Route`
components).  Because of RR's V4 design, our routes are also handled
through component composition.


## Wildcards (adding dynamics)

In our prior example we explicitly define each injection key, and
strategically place it in our parent component.  While this may be
necessary in some cases, typically more dynamics are required
_(allowing features to introduce their content autonomously)_.

This can be accomplished by using wildcards in the specification and
usage of the injection keys.

Here is our **refined** `main` feature _(**NOTE**: the **sub-feature**
definitions are the same, so they are not repeated)_:

- **main feature**

  `src/features/main/index.js`
  ```js
  createFeature({
    name: 'main',

    fassets: {
      use: [
         'MainPage.*.link',
         'MainPage.*.body',
      ],
    },
    ... snip snip
  });
  ```

  Because our specification includes wildcards, a series of injection
  definitions will match!

  Here is our **refined** `MainPage` component:

  `src/features/main/comp/MainPage.js`
  ```js
  function MainPage({Logo, mainLinks, mainBodies}) {
    return (
      <div>
        <div> {/* header section */}
          <Logo/>
        </div>

        <div> {/* left-nav section */}
          {mainLinks.map( (MainLink, indx) => <MainLink key={indx}/>)}
        </div>

        <div> {/* body section */}
          {mainBodies.map( (MainBody, indx) => <MainBody key={indx}/>)}
        </div>
      </div>
    );
  }

  export default withFassets({
    component: MainPage,
    mapFassetsToProps: {
      Logo:       'company.logo',    // from our prior example

      mainLinks:  'MainPage.*.link', // find matching
      mainBodies: 'MainPage.*.body',
    },
  });
  ```

When {{book.api.withFassets}} encounters wildcards, it merely
accumulates all matching injection definitions, and promotes them as
arrays.  Our **MainPage** component no longer explicitly reasons about
each injection.

Through this implementation, **any feature may dynamically inject itself
in the process autonomously**!  This dynamic also recognizes the case
where a feature is dynamically disabled _**(very kool indeed)**_!!

- **JSX Array Injection Keys**

  JSX requires array injections to use keys.  You may have noticed in
  the prior example, we are using the array index for the key.

  Normally this is **not recomended**.  However, for fasset usage, this
  **will in fact work** in most cases - assuming there is no variability in
  the set of promoted fasset resources (a normal case).

  If however there is some conditional logic involved, you may request
  {{book.api.withFassets}} to supply a `[fassetsKey, resource]` pair, by
  using the `@withKeys` suffix.  This is an ideal solution because
  **feature-u** gaurentees `fassetsKey` to be unique.

  ```js
  // mapping snippet ...
     mainLinks:  'MainPage.*.link@withKeys', // @withKeys: request [fassetsKey, resource] pairs
                  // mainLinks:  [['MainPage.cart.link',   cartLinkResource],
                  //              ['MainPage.search.link', searchLinkResource]],

  // array injection snippet ...
     {mainLinks.map( ([fassetsKey, MainLink]) => <MainLink key={fassetsKey}/>)}
  ```


- **Resource Order** _(in wildcard processing)_

  The order in which resources are promoted _when wildcards are in use_,
  is feature expansion order.  In other words, the **same order that
  features are registered**.


## Validating Resources

Resource validations can optionally be specified through the
{{book.api.fassetsAspect}} `use` directive.  This includes:

- optionality _(required/optional)_ 
- and data type/content

By default, the `use` directive simply accepts an array of strings
_(the resources keys which will be used)_.  This represents resources
that are **required** of type **any**.  You can change this default by
replacing each string with a two element array containing the resource
key followed by an options object:

```js
[ '$fassetsKey', {           // resource key with options object
  required:   true/false,    // DEFAULT: true
  type:       $validationFn, // DEFAULT: any
}]
```

- Required items disallow the `undefined` value.

- Type/content validation is specified through a function reference.
  You may define your own validations, or use one of the canned
  validators provided by **feature-u**.  Please refer to
  {{book.api.fassetValidations}} for a list of the pre-defined
  validators, as well as the validation API.

Here is an example that employs validations.  Notice the mix of both
strings _(with their default semantics)_, and the options object
_(specifying the validation constraints)_:

```js
createFeature({
  fassets: {
    use: [
       'MainPage.*.link', // DEFAULT: required of type any
      ['MainPage.*.body', {required: false, type: fassetValidations.comp}],
    ],
  },
});
```


## Does Feature Exist

The {{book.api.FassetsObject}} can be used to determine if a feature
is present or not.  If a feature does not exist, or has been disabled,
the {{book.api.Fassets_hasFeature}} will return false.

 - It could be that `featureA` will conditionally use `featureB` if it
   is present.

   ```js
   if (fassets.hasFeature('featureB') {
     ... do something featureB related
   }
   ```

 - It could be that `featureC` unconditionally requires that `featureD`
   is present.  This can be checked in the {{book.api.appWillStartCB}}
   {{book.guide.appLifeCycle}}.

   ```js
   appWillStart({fassets, curRootAppElm}) {
     assert(fassets.hasFeature('featureD'), '***ERROR*** I NEED featureD');
   }
   ```

**NOTE**: In addition to `fassets.hasFeature(featureName)` it is also
possible to reason over the existence of well-known fasset resources
that are specific to a feature.


## Accessing fassets

Broadly speaking, Public Facing feature resources can be obtained
either by:

- using the {{book.api.withFassets}} HoC (for UI Components),

- or by directly referencing the {{book.api.FassetsObject}}
  programmatically.

The former, implicitly accesses `fassets` _(under the covers)_ using
a {{book.ext.reactContext}}.  The latter requires direct programatic
access to the {{book.api.FassetsObject}} ... of which there are three
ways to achieve:

1. Simply import `fassets` _(a technique used by run-time
   functions that are outside the control of **feature-u**)_
   ... see: {{book.guide.crossCom_importFassets}}

2. Use the `fassets` parameter supplied through **feature-u**'s programmatic
   APIs (_for example, live-cycle hooks, or logic hooks, etc._)
   ... see: {{book.guide.crossCom_fassetsParameter}}

3. Use {{book.api.expandWithFassets}} to inject the `fassets`
   parameter (_when `fassets` are required during in-line expansion of
   code_)
   ... see: {{book.guide.crossCom_managedCodeExpansion}}

Let's take a closer look at each of these access points.


### import fassets

The simplest way to access the {{book.api.FassetsObject}} is to
merely import it.

Your application mainline exports the {{book.api.launchApp}} return
value ... which is the {{book.api.FassetsObject}}.

**`src/app.js`**
```js
// launch our app, exposing the feature-u Fassets object (facilitating cross-feature communication)!
export default launchApp({
  ...
});
```

As it turns out, importing `fassets` is not usually necessary, because
most cases are covered through alternate means.

For sake of example, let's consider a somewhat contrived example,
where a piece of code needs to close the leftNav menu.  This function
is provided by a Public Facing resource defined in the leftNav
feature.

```js
import fassets from '../app';

function closeSideBar() {
  fassets.leftNav.close();
}
```


### fassets parameter

Another way to access the {{book.api.FassetsObject}} is through the
programmatic APIs of **feature-u**, where `fassets` is supplied as a
parameter.

- app life-cycle hooks:
  
  - {{book.api.appWillStartCB$}}
  - {{book.api.appDidStartCB$}}


- route hooks (PKG: {{book.ext.featureRouter}}):
  ```js
  routeCB({fassets, appState}): rendered-component (null for none)
  ```
  
- logic hooks (PKG: {{book.ext.reduxLogic}}):
  ```js
  createLogic({
    ...
    transform({getState, action, fassets}, next) {
      ...
    },
    process({getState, action, fassets}, dispatch, done) {
      ...
    }
  })
  ```


### Managed Code Expansion

The last technique to access the {{book.api.FassetsObject}},
provides **early access** _during code expansion time_, through the
{{book.api.expandWithFassets}} utility.

There are two situations that make accessing `fassets` problematic,
which are: **a:** _in-line code expansion (where `fassets` may not
be fully defined)_, and **b:** _order dependencies (across
features)_.

To illustrate this, the following {{book.ext.reduxLogic}} module is
monitoring an action defined by an external feature (see `*1*`).
Because this `fassets` reference is made during code expansion time, the
import will not work, because the `fassets` object has not yet been fully
defined.  This is a timing issue.

```js
import fassets from '~/app'; // *1*

export const myLogicModule = createLogic({

  name: 'myLogicModule',
  type: String(fassets.featureB.actions.fooBar), // *1* fassets NOT defined during in-line expansion
  
  process({getState, action}, dispatch, done) {
    ... 
  },

});
```

When aspect content definitions require the {{book.api.FassetsObject}} at code
expansion time, you can wrap the definition in a
{{book.api.expandWithFassets}} function.  In other words, your aspect
content can either be the actual content itself _(ex: a reducer)_, or a
function that returns the content.

Your callback function should conform to the following signature:

**API**: {{book.api.expandWithFassetsCB$}}

When this is done, **feature-u** will invoke the
{{book.api.expandWithFassetsCB}} in a controlled way, passing the fully
resolved {{book.api.FassetsObject}} as a parameter.

To accomplish this, you must wrap your expansion function with the the
{{book.api.expandWithFassets}} utility.  The reason for this is that
**feature-u** must be able to distinguish a
{{book.api.expandWithFassetsCB}} function from other functions (ex:
reducers).

Here is the same example (from above) that that fixes our
problem by replacing the `fassets` import with {{book.api.expandWithFassets}}:

```js
                             // *1* we replace fassets import with expandWithFassets()
export const myLogicModule = expandWithFassets( (fassets) => createLogic({

  name: 'myLogicModule',
  type: String(fassets.featureB.actions.fooBar), // *1* fassets now is fully defined
  
  process({getState, action}, dispatch, done) {
    ... 
  },

}) );
```

Because {{book.api.expandWithFassetsCB}} is invoked in a controlled way
(by **feature-u**), the supplied `fassets` parameter is guaranteed to be
defined (_issue **a**_).  Not only that, but the supplied `fassets` object
is guaranteed to have all public facing feature definitions resolved
(_issue **b**_).

**_SideBar_**: A secondary reason {{book.api.expandWithFassets}} may be
used (_over and above `fassets` injection during code expansion_) is to
**delay code expansion**, which can avoid issues related to
(_legitimate but somewhat obscure_) circular dependencies.


### Fassets Access Summary

Programmatic access to the {{book.api.FassetsObject}} boils down to
two scenarios:

1. Either the reference is needed during code-expansion time _(which
   also includes functions that are executed in code-expansion)_

2. or they are needed at run-time _(i.e. after code-expansion)_

The fact that the feature accumulation process assimilates fasset
resources _(within {{book.api.launchApp}})_ means that the `fassets`
object is not available during code-expansion time.

Furthermore, the goal of restricting cross-feature imports requires
that the `fassets` object be used in their place.

In spite of these seemingly conflicting artifacts, **the goal of
restricting cross-feature imports is most certainly a worthy
objective!**

The bottom line is that {{book.api.expandWithFassets}} comes to the
rescue, and "fills the gap" when needed.

Accessing feature resources in a seamless way is a **rudimentary
benefit of feature-u** that alleviates a number of problems in your
code, **making your features truly plug-and-play**.

**NOTE**: It is possible that a module may be using more than one of
these access techniques.  As an example a logic module may have to use
{{book.api.expandWithFassets}} to access `fassets` at code-expansion
time, but is also supplied `fassets` as a parameter in it's functional
hook.  This is perfectly fine, as they will be referencing the exact
same `fassets` object instance.

