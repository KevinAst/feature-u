# Feature Based Routes

Once your application grows to more than a few pages, the need for a
routing solution becomes critical.  Which one do you use?  There are
so many!

True to **feature-u**'s ideology, no one routing solution is mandated.
You are free to pick and choose whichever of the many solutions meet
your needs.

With the advent of **feature-u**'s **V1** approach to
{{book.guide.crossCom}}, it is now possible to integrate to a number
of the routing solutions available today **out-of-the-box**!

By using a {{book.guide.crossCom_pull}} philosophy in accumulating
resources over your features, you can easily gather a collection of
links for your menus and the route components themselves.  This
solution employs {{book.guide.crossCom_resourceContracts}} and
{{book.guide.crossCom_wildcardProcessing}} through the
{{book.api.Fassets_get}} and {{book.api.withFassets}} access points.

Using this technique, you can accumulate your routing resources
autonomously, allowing your app to grow feature by feature, not
needing to know everything in advance.  All that is needed is to adopt
a naming convention _(publicly promoted through the
{{book.api.fassetsAspect}} `use` directive - a
{{book.guide.crossCom_resourceContract}})_ for your links and route
components.

**SideBar**: While your routing solution may involve a **feature-u**
plugin ({{book.guide.detail_extendableAspects}}), for the most part
**feature-u**'s {{book.guide.crossCom}} should go a long way in
support of **router integration out-of-the-box**.

This section will briefly look at how **feature-u** projects can
integrate with two different routing solutions (the "tried and true"
{{book.guide.featureRouter_reactRouter}}, and a "new approach" based
on state: {{book.guide.featureRouter_featureRouter}}).



## react-router

{{book.ext.reactRouter}} **V4** makes it very simple to perform
routing. By injecting a `<Router>` component at the root of your
application, your `<Route>` components can can live anywhere in the
tree. In turn, `<Link>` components make it easy to navigate to the
various routes.

In this example, we employ an `app` feature that has two
responsibilities:
1. promote our top-level `<App>` component, and
2. manage our application routes.

Let's walk through this implementation, step by step ...

**Step One** _(basic `<App>` injection)_:
---

The first goal of our `app` feature is to promote the top-level
`<App>` component.  This is easily accomplished by using
**feature-u**'s {{book.guide.appLifeCycles}}.

Here are the code snippets that implement this first goal.

**features/app/featureName.js** _see: Best Practices {{book.guide.bestPractices_featureName}}_
```js
/**
 * Expose our featureName through a mini-meta module that is
 * "importable" in all use-cases (a single-source-of-truth).
 */
export default 'app';
```

**features/app/comp/App.js** _our top-level `<App>` component_
```js
import React from 'react';

/**
 * Our top-level App component (just a start).
 */
export default App = () => <div>Hello World</div>;
```

Now we simply promote the `<App>` component into the DOM using our
{{book.guide.appWillStartCB}} {{book.guide.appLifeCycle}}.

**features/app/index.js** _our `app` Feature, promoting the `<App>` component_
```js
import React           from 'react';
import {createFeature} from 'feature-u';
import App             from './comp/App;
import featureName     from './featureName';

export default createFeature({

  name: featureName,

  appWillStart({fassets, curRootAppElm}) {
    // insure we don't clobber any supplied content
    if (curRootAppElm) {
      throw new Error('***ERROR*** Please register the "app" feature ' +
                      'before other features that inject content in the rootAppElm ' +
                      '... <App> does NOT support children.');
    }
    return <App/>;
  }
});
```

**Step Two** _(adding links and routes)_:
---

The second goal of our `app` feature is to manage our application
links and routes.

Our `app` feature accomplishes this by introducing a
{{book.guide.crossCom_resourceContract}}, where we pull in links and
routes under the following naming convention:

- `*.link.comp` - any fasset resource suffixed with `.link.comp` is
  expected to be a `<Link>` component, and will be displayed in the
  App header menu.

- `*.route.comp` - any fasset resource suffixed with `.route.comp` is
  expected to be a `<Route>` component, which will be rendered when
  the application navigates to a matching route.

Here is our `app` feature with it's newly enhanced usage contract (see
`use` directive):

**features/app/index.js** _our `app` Feature, enhanced with the new usage contract_
```js
import React           from 'react';
import {createFeature} from 'feature-u';
import App             from './comp/App;
import featureName     from './featureName';

export default createFeature({

  name: featureName,

  fassets: {          // NEW:
    use: [            // our usage contract
      '*.link.comp',  // ... link components
      '*.route.comp'  // ... route components
    ]
  },

  appWillStart({fassets, curRootAppElm}) {
    // insure we don't clobber any supplied content
    if (curRootAppElm) {
      throw new Error('***ERROR*** Please register the "app" feature ' +
                      'before other features that inject content in the rootAppElm ' +
                      '... <App> does NOT support children.');
    }
    return <App/>;
  }
});
```

And here is the fulfillment of our contract ... the enhanced `<App>`
component _(with links and routes)_.

**features/app/comp/App.js** _our top-level `<App>` component **with** links and routes_
```js
import React           from 'react';
import {BrowserRouter} from 'react-router-dom';

/**
 * Our top-level App component (with links and routes)!
 */
const App = ({linkComps, routeComps}) => (
  <BrowserRouter>
    <div className="app">
      <header>
        <h1>My App</h1>
        { linkComps.map( (LinkComp, indx) => <LinkComp key={indx}/>) }
      </header>
      <main>
        { routeComps.map( (RouteComp, indx) => <RouteComp key={indx}/>) }
      </main>
    </div>
  </BrowserRouter>
);

export default withFassets({
  component: App,
  mapFassetsToProps: {
    linkComps:  '*.link.comp',
    routeComps: '*.route.comp'
  }
});
```

Notice that in support of {{book.ext.reactRouter}}, we wrap everything
with `<BrowserRouter>`.

Also notice that we inject the needed fasset resources using the
{{book.api.withFassets}} HoC.

Because our mapping uses wildcards, many resources will match
(accumulated into arrays).  We simply inject the resources into our
component using array iteration.
_**SideBar**: In regard to the react key using an array indices, please
 see: {{book.guide.crossCom_reactKeys$}}_.


**Suppliers** _(supplying content to the resource contract)_
---

By employing wildcards, **these links and routes can be supplied by
any of our features - autonomously**!!

The order in which these resources appear _(when using wildcards)_ are
feature expansion order _(i.e. the same order that features are
registered)_.

Here is a `foo` feature that supplies it's own link and route
components.

**features/foo/index.js** _a `foo` feature **supplying** links and routes_
```js
import React           from 'react';
import {createFeature} from 'feature-u';
import {Link, Route}   from 'react-router-dom';
import featureName     from './featureName'; // 'foo' ... a single-source-of-truth mini-meta module

const featureURLPath = `/${featureName}`; // the URL path is /foo

const link      = () => <Link to={featureURLPath}>Foo</Link>;
const component = () => <Route path={featureURLPath} render={() => <div>Foo</div> }/>;

export default createFeature({
  name: featureName,

  fassets: {
    defineUse: { // KEY: supply content under contract of the app feature
      [`${featureName}.link.comp`]:  link,
      [`${featureName}.route.comp`]: component
    }
  }

});
```

Notice that we are using the `defineUse` directive (even though a
`define` would technically work).  This indicates that we are
supplying this resource "under contract" (i.e. it should match a
corresponding `use` directive).  This allows **feature-u** to fail
fast if there is a problem (for example a misspelling).


**Summing it up**:
---

That's all there is to it. As we add features with links and route
components, they are **automatically picked up and rendered to our
app**!!

**feature-u**'s wildcard support **makes it easy to support most any
use case you might need**.  It is nice that we don't have to keep
modifying `<App>` when we want to add a new menu link or another
route. Just by adhering to our naming convention they are
automatically pulled in and used.


## feature-router

{{book.ext.featureRouter}} _(a **feature-u** plugin, packaged
separately)_ represents a new twist on routing.

**Feature Routes** are _based on a very simple concept_: **allow the
application state to drive the routes**!

It operates through a series of feature-based routing functions that
reason about the appState, and either return a rendered component, or
null to allow downstream routes the same opportunity.  Basically the
first non-null return wins.

In feature based routing, you will not find the typical "route path to
component" mapping catalog, where (_for example_) some pseudo
`route('signIn')` directive causes the SignIn screen to display
_(which in turn causes the system to accommodate the request by
adjusting it's state)_.

In other words, you will never see application logic that re-routes to
a signIn screen after checking to see if the user is authenticated.
Rather, **the appState is king**!  If the user is NOT authenticated
_(based on the route's analysis of the appState)_ the SignIn screen is
automatically displayed ... **Easy Peasy!**

Depending on your perspective, this approach can be **more robust and
natural**.

**Want to see an example**?  _Because {{book.ext.featureRouter}} was
built as a **feature-u** plugin, you can find examples directly in
it's documentation._

**Please Note** that it is possible to use {{book.ext.featureRouter}}
in conjunction with other routing solutions!

**SideBar**: Another characteristic of this routing plugin is **it
allows features to promote their own screens in an encapsulated and
autonomous way**!  As we have seen, this goal can also be accomplished
through **feature-u**'s **V1** approach to {{book.guide.crossCom}}

This discussion is obviously an introduction.  There is more to this
plugin that we haven't touched on.  Should you choose to use it,
please refer to the {{book.ext.featureRouter}} docs.
