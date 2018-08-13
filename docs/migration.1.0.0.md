# Migrating feature-u to V1

<!-- 
     NOTE: We know this document will ONLY be served within it's specific versioned dir/ (or cur/).
           Therefore, we can refer to any "current" content with the gitbook links.
           References to older versions use the MarkDown links to versioned docs.
-->

Beginning with **feature-u V1** {{book.guide.crossCom}} has been
completely re-designed to include
{{book.guide.crossCom_uiComposition}} as a core offering of
**feature-u** _(thanks {{book.ext.jeffbski}} for the design
collaboration)_!

- This refactor promotes **one solution** for all
  {{book.guide.crossCom}} _(i.e. Actions, Selectors, UI Components,
  API, etc.)_, **making it comprehensive and universal**.
     
- This is an **extremely powerful enhancement**, and even extends to
  things like {{book.guide.featureRouter}}.
    
- It **represents a significant step forward** in providing seamless
  feature-based development!


This guide will walk you through the details of migrating to
**feature-u V1** from an older release.

# At a Glance

- [What Has Changed](#what-has-changed)
- [Why such an abrupt change?](#why-such-an-abrupt-change)
- [feature-u migration](#feature-u-migration)
- [feature-redux migration](#feature-redux-migration)
- [feature-redux-logic migration](#feature-redux-logic-migration)
- [feature-router migration](#feature-router-migration)


# What Has Changed

At a high level, the following items have been impacted _(more detail
can be found at {{book.guide.crossCom}})_:

- In an effort to standardize terminology _(and remove ambiguity)_,
  the term `fassets` _(feature assets)_ is being used throughout,
  replacing `publicFace` _(on the aspect definition side)_ and `app`
  _(on the usage side)_.

- The {{book.api.fassetsAspect$}} replaces [`Feature.publicFace`],
  providing a more formal set of directives, supporting things like
  **contractual arrangements** _(of usage and definition)_, and
  **validation of resources**.

- The {{book.api.FassetsObject}} replaces the [`app object`], to
  programmatically access cross-feature resources.

- The [`managedExpansion()`] function has been renamed to
  {{book.api.expandWithFassets}}.

- The new {{book.api.withFassets}} higher-order component (HOC)
  auto-wires named feature assets as component properties.


# Why such an abrupt change?

You may be wondering why V1 introduced such an abrupt breaking change,
with no deprecation.

The internal magnitude of this change was fairly significant.
Obviously we could have published intermediate versions with
deprecation notices, while difficult (due to the nature of this
change) not impossible.

Ultimately, we decided to take advantage of the pre-production status
(0.1.3), and the relatively small distribution, and go cold turkey
with the change.

We take your usage of **feature-u** seriously, along with the impact
of this change.

We are excited about the V1 release.  It represents a significant step
forward in providing seamless feature-based development.

**SideBar**: To give you some background, the V1 design progressed
from a simple plugin to a full core offering:

- Initially, the focus was on a new navigation plugin that supported
  react-router.

- With react-router's V4 release, we realized our plugin could broaden
  it's scope to overall UI Composition - because that is how RR V4
  works.

- As a further progression, we realized that
  {{book.guide.crossCom_uiComposition}} was simply one part of the
  overall {{book.guide.crossCom}}.  By incorporating this into a core
  **feature-u** offering, all cross-communication could use the same
  mechanism.

  In addition, this seemed like a good time to to standardize some
  ambiguous terms from our initial cross-communication attempt.



# feature-u migration

1. The return of {{book.api.launchApp}} is now the
   {{book.api.FassetsObject}}.  Per the recomendation to export this,
   please note that this is no longer the [`app object`], rather the
   {{book.api.FassetsObject}}.

2. Any **feature-u** API that was passing the [`app object`] as a
   parameter, is NOW the {{book.api.FassetsObject}}.

   Depending on your IDE and dev environment, this can be a tedious
   proces to retrofit.  If you are using some type of search, the
   "app" nominclature is going to appear in many different contexts.

   - Either work through your code base, one by one (searching for app
     parameters/variables)

   - Or focus on the various APIs summarized in the {{book.guide.coreApi}}
     (focusing on the signatures with `fassets` parameters).

     If you are retrofitting an Aspect plugin, do the same thing with
     the {{book.guide.extensionApi}}.

3. Any [`Feature.publicFace`] aspect must be converted to the new
   {{book.api.fassetsAspect$}}.

   While it is possible to translate a one-to-one mapping (between the
   old `publicFace` and the new `fassets` aspect) you are encourged to
   employ the new enhancments of {{book.guide.crossCom}}, such as:

   - Full {{book.guide.crossCom_uiComposition}} via the
     {{book.api.withFassets}} HoC.

   - {{book.guide.crossCom_resourceContracts}}, via the `fassets.use`
     and `fassets.defineUse` directives.

   - Depending on the circumstances, refactor out the featureName
     resource qualifier.

   Here is an example that translates `publicFace` to `fassets` with
   an equivilant mapping:


   **OLD `publicFace`**
   ```js
   publicFace: { // OBSOLETE in feature-u V1
     api,
     sel: {
       areFontsLoaded,
       isDeviceReady,
       getDeviceLoc,
     },
     actions: {
       ready: actions.ready,
     },
   },
   ```

   <!--- GEEZE: There is something about the following code snippet that is causing gitbook to go to hell
         ... I have tried 1 hr of combinations with NO LUCK
         ... The only thing I can do to fix is a DOUBLE-BLANK line (just before OLD)
             WHICH breaks the indentation of bullet 3, but it is the only thing that half way works!!
         ---> 
   **NEW `fassets.define` equivalent**
   ```js
   fassets: { // NEW feature-u V1
     define: {
       [`${featureName}.api`]:                api,
     
       [`${featureName}.sel.areFontsLoaded`]: areFontsLoaded,
       [`${featureName}.sel.isDeviceReady`]:  isDeviceReady,
       [`${featureName}.sel.getDeviceLoc`]:   getDeviceLoc,
     
       [`${featureName}.actions.ready`]:      actions.ready,
     },
   },
   ```


# feature-redux migration

If you are using the {{book.ext.featureRedux}} plugin, you must
install the latest version.

1. This plugin has eliminated singletons in favor of creators _(to
   facilitate testing and server-side rendering)_.

   ```js
    // in place of this:
    import {reducerAspect}   from 'feature-redux';

    // do this:
    import {createReducerAspect} from 'feature-redux';
    const reducerAspect = createReducerAspect();
   ```

# feature-redux-logic migration

If you are using the {{book.ext.featureReduxLogic}} plugin, you must
install the latest version.

1. Because {{book.ext.featureReduxLogic}} auto injects the
   {{book.api.FassetsObject}} as a dependency in your logic modules
   (promoting full {{book.guide.crossCom}}, the logic modules in your
   application code must reflect this change by renaming this named
   parameter from `app` to `fassets`, and utilize the new fassets API
   accordingly.

1. This plugin has eliminated singletons in favor of creators _(to
   facilitate testing and server-side rendering)_.

   ```js
    // in place of this:
    import {logicAspect}   from 'feature-redux-logic';

    // do this:
    import {createLogicAspect} from 'feature-redux-logic';
    const logicAspect = createLogicAspect();
   ```

# feature-router migration

If you are using the {{book.ext.featureRouter}} plugin, you must
install the latest version.

1. Because {{book.ext.featureRouter}} auto injects the
   {{book.api.FassetsObject}} as a dependency in your routes (promoting
   full {{book.guide.crossCom}}), the routes in your application code
   must reflect this change by renaming this named parameter from `app`
   to `fassets`, and utilize the new fassets API accordingly.

1. This plugin has eliminated singletons in favor of creators _(to
   facilitate testing and server-side rendering)_.

   ```js
    // in place of this:
    import {routeAspect}   from 'feature-router';

    // do this:
    import {createRouteAspect} from 'feature-router';
    const routeAspect = createRouteAspect();
   ```


<!--- *** REFERENCE LINKS to OBSOLETE items (found only in older versions) ... see note at top *** ---> 

[`Feature.publicFace`]:  https://feature-u.js.org/0.1.3/crossCommunication.html#publicface-and-the-app-object
[`app object`]:          https://feature-u.js.org/0.1.3/api.html#App
[`managedExpansion()`]:  https://feature-u.js.org/0.1.3/api.html#managedExpansion
