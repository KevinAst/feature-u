# Revision History

The **feature-u** project adheres to [Semantic
Versioning](http://semver.org/).  Each release is documented on this
page *(in addition to the [Github Release
Notes](https://github.com/KevinAst/feature-u/releases))*, and
**contains migration instructions**.

<!--- Badges for CI Builds ---> 
[![Build Status](https://travis-ci.org/KevinAst/feature-u.svg?branch=master)](https://travis-ci.org/KevinAst/feature-u)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c063a6e2859148e8baa89e9369b0fa5d)](https://www.codacy.com/app/KevinAst/feature-u?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=KevinAst/feature-u&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/c063a6e2859148e8baa89e9369b0fa5d)](https://www.codacy.com/app/KevinAst/feature-u?utm_source=github.com&utm_medium=referral&utm_content=KevinAst/feature-u&utm_campaign=Badge_Coverage)
[![Known Vulnerabilities](https://snyk.io/test/github/kevinast/feature-u/badge.svg?targetFile=package.json)](https://snyk.io/test/github/kevinast/feature-u?targetFile=package.json)
[![NPM Version Badge](https://img.shields.io/npm/v/feature-u.svg)](https://www.npmjs.com/package/feature-u)


## Versioned Docs

**feature-u** maintains version-specific documentation for all of it's
releases _(linked below)_ ... ex: https://feature-u.js.org/0.1.0/.
This allows you to match the correct documentation to the specific
version you are using.
For your convenience the base https://feature-u.js.org/ will always
reference the most current release.



<!-- 


*-----------------------------------------------
* Adorn bullets with following bolded prefix
*-----------------------------------------------

**Added**:      ... for new features
**Changed**:    ... for changes in existing functionality
**Deprecated**: ... for soon-to-be removed features
**Removed**:    ... for now removed features
**Fixed**:      ... for any bug fixes
**Enhanced**:   ... for enhancements
**Security**:   ... in case of vulnerabilities
**Docs**:       ... changes in documentation
**Review**:     ... requires review
**Internal**:   ... internal change NOT affecting user/client

*-----------------------------------------------
* PROCEDURE for maintaining LINKS in history.md
*-----------------------------------------------

1. for latest running work-in-progress: it is OK to use the gitbook templates
   - EX:       bla bla {{book.api.createFeature}}
   - template: bla bla [`createFeature()`](/api.md#createFeature)
   - gens:     bla bla <a href="api.html#createFeature"><code>createFeature()</code></a>
   - NOTES:
     a) clicking link STAYS ON SAME PAGE (as for all links of this type)
 
2. for RELEASE: expand them in-line using a VERSION RELATIVE SYNTAX -AND- change .md to .html:
   - EX:       bla bla [`createFeature()`](../v.v.v/api.html#createFeature)
               NOTES:
                - start with template definition
                - pre-pend ../v.v.v/
                - change .md to .html (BECAUSE WE ARE TAKING the generation process out-of-the-picture)
   - gens:     bla bla <a href="../v.v.v/api.html#createFeature"><code>createFeature()</code></a>
   - NOTES:
     a) clicking link STAYS ON SAME PAGE
     b) because these notes are copied to all release history.md, 
        they MUST reference the appropriate version
        so they will be guaranteed the reference has not been removed/changed
 
3. for GITHUB release page (when copying these notes), fully qualify the VERSIONED relative references
   - EX:       bla bla [`createFeature()`](https://feature-u.js.org/v.v.v/api.html#createFeature)
               NOTES:
                - from prior rendition
                - REPLACE ../v.v.v WITH https://feature-u.js.org/v.v.v
                - change .md TO .html
   - NOTES:
     a) this allows it to stand alone (in the external github page)
     b) because these notes reference a versioned site
        they will be guaranteed the reference has not been removed/changed
-->


## Summary:

Release           | What                                   | *When*
------------------|----------------------------------------|------------------
[v3.0.0](#v3_0_0) | Hooks and Aspect Plugin Changes        | *February, 5, 2020*
[v2.1.1](#v2_1_1) | Playful Features                       | *December 9, 2019*
[v2.1.0](#v2_1_0) | appInit() Life Cycle Hook              | *July 19, 2019*
[v2.0.0](#v2_0_0) | React Hooks                            | *May 10, 2019*
[v1.0.1](#v1_0_1) | Docs Update                            | *September 5, 2018*
[v1.0.0](#v1_0_0) | UI Composition                         | *August 14, 2018*
[v0.1.3](#v0_1_3) | Establish Polyfill Strategy            | *July 2, 2018*
[v0.1.0](#v0_1_0) | Initial Release                        | *March 6, 2018*


<br/><br/><br/>
## Details:

<!-- ************************************************************* -->
<br/><br/><br/>
<h3 id="v3_0_0" style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  v3.0.0 - Hooks and Aspect Plugin Changes <i>(February, 5, 2020)</i>
</h3>

[Full Docs](https://feature-u.js.org/3.0.0/)
&bull;
[GitHub Release](https://github.com/KevinAst/feature-u/releases/tag/v3.0.0)
&bull;
[GitHub Content](https://github.com/KevinAst/feature-u/tree/v3.0.0)
&bull;
[Diff](https://github.com/KevinAst/feature-u/compare/v2.1.1-docs...v3.0.0)

**NOTE**: This release contains **minor breaking changes** from prior
releases.  _A trivial retrofit of client code may be necessary
(depending on your usage)_.

1. **Changed**: For redux users, the {{book.guide.appLifeCycles}} that
   promote the redux `appState` parameter, are now being passed the
   redux `getState` function. To obtain the `appState` you merely
   invoke: `getState()`. This gives async long-running processes
   access to the most current state changes (over time) **... thanks
   [@sylvainlg](https://github.com/sylvainlg)!!**

   **Please Note**: Prior to this release, these parameters were
   promoted directly by **feature-u** _(using conditional logic that
   detected the **feature-redux** aspect)_.  This coupling has been
   removed.  These parameters are now promoted though the
   **feature-redux** aspect, using the new
   {{book.guide.injectParamsInHooksMeth}} hook _(mentioned below)_.
   As a result, you must update {{book.ext.featureRedux}} to **V3** or
   greater.

2. **Added**: For Aspect Extension users, a new
   {{book.guide.injectParamsInHooksMeth}} **Aspect Life Cycle Method**
   has been added that allows the Aspect to promote `namedParams` into
   the feature's {{book.guide.appLifeCycles}}.

3. **Changed**: For Aspect Extension users, Aspect Plugins no longer
   have one specific method that is required.  Rather the requirement
   is to **specify something** _(so as to not have an empty plugin
   that does nothing)_.  Please refer to the **"No Single Aspect Method
   is Required"** discussion in the
   {{book.guide.extending_aspectLifeCycleMethods}}.

4. **Docs**: Documentation improvements include:

   - For Aspect Extension users, a new section was added that
     highlights how {{book.guide.extending_customAspectPlugins}} are
     typically promoted _through a constructor_.


<!-- ************************************************************* -->
<br/><br/><br/>
<h3 id="v2_1_1" style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  v2.1.1 - Playful Features <i>(December 9, 2019)</i>
</h3>

[Full Docs](https://feature-u.js.org/2.1.1/)
&bull;
[GitHub Release](https://github.com/KevinAst/feature-u/releases/tag/v2.1.1)
&bull;
[GitHub Content](https://github.com/KevinAst/feature-u/tree/v2.1.1)
&bull;
[Diff](https://github.com/KevinAst/feature-u/compare/v2.1.0-docs...v2.1.1)

**NOTE**: This release is a **non-breaking change** _(i.e. no prior
API was impacted)_.

1. **Added**: The [`Playful Features Video`](../2.1.1/presentation.html) was added ... a
   **feature-u** presentation that builds concepts, and demonstrates them
   in a real world app ([`eatery-nod-w`](https://github.com/KevinAst/eatery-nod-w)).

2. **Security**: Address potential security vulnerabilities in dependent libs
   (mostly devDependencies completely unrelated to deployment)!

3. **Docs**: Documentation improvements include:

   - Sample code for the app's mainline startup process was simplified
     by extracting `Aspect` plugin accumulation/configuration through
     an `aspects/` directory (see: [`Aspect Accumulation`](../2.1.1/usage.html#aspect-accumulation)
     and [`launchApp()`](../2.1.1/usage.html#launchapp)).  This is consistent with how
     features are accumulated.



<!-- ************************************************************* -->
<br/><br/><br/>
<h3 id="v2_1_0" style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  v2.1.0 - appInit() Life Cycle Hook <i>(July 19, 2019)</i>
</h3>

[Full Docs](https://feature-u.js.org/2.1.0/)
&bull;
[GitHub Release](https://github.com/KevinAst/feature-u/releases/tag/v2.1.0)
&bull;
[GitHub Content](https://github.com/KevinAst/feature-u/tree/v2.1.0)
&bull;
[Diff](https://github.com/KevinAst/feature-u/compare/v2.0.0-docs...v2.1.0)

**NOTE**: This release is a **non-breaking change** _(i.e. no prior
API was impacted)_.

1. **Added**: A new [`Feature.appInit()`](../2.1.0/appLifeCycle.html#appinit) Application Life Cycle
   Hook was added, supporting blocking async initialization.

2. **Added**: In support of [`Feature.appInit()`](../2.1.0/appLifeCycle.html#appinit), the
   [`showStatus()`](../2.1.0/api.html#showStatusCB) optional callback parameter was added to
   [`launchApp()`](../2.1.0/api.html#launchApp) allowing the application domain to
   communicate blocking "persistent" status messages to the end user.

3. **Docs**: Documentation improvements include:

   - Changed the sample application reference to
     [`eatery-nod-w`](https://github.com/KevinAst/eatery-nod-w) _(from [`eatery-nod`](https://github.com/KevinAst/eatery-nod))_.



<!-- ************************************************************* -->
<br/><br/><br/>
<h3 id="v2_0_0" style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  v2.0.0 - React Hooks <i>(May 10, 2019)</i>
</h3>

[Full Docs](https://feature-u.js.org/2.0.0/)
&bull;
[GitHub Release](https://github.com/KevinAst/feature-u/releases/tag/v2.0.0)
&bull;
[GitHub Content](https://github.com/KevinAst/feature-u/tree/v2.0.0)
&bull;
[Diff](https://github.com/KevinAst/feature-u/compare/v1.0.1-docs...v2.0.0)

**NOTE**: This release is a **non-breaking change** _(i.e. no prior
API was impacted)_.  A major V2 version bump strictly reflects the
significance of this hooks enhancement.

1. **Added**: The [`useFassets()`](../2.0.0/api.html#useFassets) function has been added in
   support of [React Hooks](https://reactjs.org/docs/hooks-intro.html),
   providing functional component access to the
   [`Fassets object`](../2.0.0/api.html#Fassets).  This is an alternative to accessing
   `fassets` through Higher Order Components _(using:
   [`withFassets()`](../2.0.0/api.html#withFassets))_.

   This greatly simplifies the UI implementation, and can be seen in
   action in the [eatery-nod-w](https://github.com/KevinAst/eatery-nod-w) project
   _(see the [React Hooks](https://github.com/KevinAst/eatery-nod-w#react-hooks)
   section)_.

2. **Fixed**: React Component validation has been shored up by using
   the `react-is` package.

   This impacts components passed to the [`withFassets()`](../2.0.0/api.html#withFassets) API,
   and the [`fassetValidations.comp`](../2.0.0/api.html#fassetValidations) validation utility.

   **Background**: As of react-redux V7, `connect()` returns a
   React.memo() component type, which is an object and NOT a
   function ... breaking **feature-u**'s _prior_ component validation.

3. **Docs**: Documentation improvements include:

   - Improved the concepts and feature-segregation diagrams.

   - Added a fundamental artifacts introduction to the [`Benefits`](../2.0.0/benefits.html) chapter.

4. **Internal**: Docs generation now uses the formal [folding-menu
   gitbook plugin](https://github.com/KevinAst/gitbook-plugin-folding-menu)



<!-- ************************************************************* -->
<br/><br/><br/>
<h3 id="v1_0_1" style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  v1.0.1 - Docs Update <i>(September 5, 2018)</i>
</h3>

[Full Docs](https://feature-u.js.org/1.0.1/)
&bull;
[GitHub Release](https://github.com/KevinAst/feature-u/releases/tag/v1.0.1)
&bull;
[GitHub Content](https://github.com/KevinAst/feature-u/tree/v1.0.1)
&bull;
[Diff](https://github.com/KevinAst/feature-u/compare/v1.0.0-docs...v1.0.1)

**NOTE**: This release is a **non-breaking change** _(i.e. no API was affected)_.

1. **Docs**: Documentation improvements include:

   - The [`Basic Concepts`](../1.0.1/concepts.html) chapter has been completely re-written
     to fully introduce you to **all feature-u concepts and terminology**.

     Diagrams are used to put everything in perspective _("with
     circles and arrows and a paragraph on the back of each one
     explaining what each one was to be used as evidence against us"
     ... Arlo Guthrie – [Alice's
     Restaurant](https://www.letras.com/guthrie-arlo/17170/))_.

     This is a **must read** to get you "up to speed" quickly!

   - All diagrams are now styled to be visible in all themes _(including
     dark mode)_.

   - All code samples utilize a feature.js module _(previously
     index.js)_.

   - The `src/app.js` sample (found in
     [`Launching Your Application`](../1.0.1/detail.html#launching-your-application)), has been streamlined.

2. **Added**: A new [`assertNoRootAppElm()`](../1.0.1/api.html#assertNoRootAppElm) convenience function
   has been added _(see: [`Injecting DOM Content`](../1.0.1/appLifeCycle.html#injecting-dom-content))_.


<!-- ************************************************************* -->
<br/><br/><br/>
<h3 id="v1_0_0" style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  v1.0.0 - UI Composition <i>(August 14, 2018)</i>
</h3>

[Full Docs](https://feature-u.js.org/1.0.0/)
&bull;
[GitHub Release](https://github.com/KevinAst/feature-u/releases/tag/v1.0.0)
&bull;
[GitHub Content](https://github.com/KevinAst/feature-u/tree/v1.0.0)
&bull;
[Diff](https://github.com/KevinAst/feature-u/compare/v0.1.3-docs...v1.0.0)
&bull;
[Migration Notes](https://feature-u.js.org/1.0.0/migration.1.0.0.html)

**NOTE**: This release contains **breaking changes** from prior
releases.  _A retrofit of client code is necessary (see the
**Migration Notes** link above)_.

1. **Review**: New **UI Composition**

   Beginning with **feature-u V1**
   [`Cross Feature Communication`](../1.0.0/crossCommunication.html)
   has been completely re-designed to include
   [`UI Composition`](../1.0.0/crossCommunication.html#ui-composition)
   as a core offering of **feature-u** _(thanks [@jeffbski](https://github.com/jeffbski) for
   the design collaboration)_!

   - This refactor promotes **one solution** for all 
     [`Cross Feature Communication`](../1.0.0/crossCommunication.html)
     _(i.e. Actions, Selectors, UI Components, API, etc.)_, **making it
     comprehensive and universal**.
     
   - This is an **extremely powerful enhancement**, and even extends to
     things like [`Feature Based Routes`](../1.0.0/featureRouter.html).
     
   - It **represents a significant step forward** in providing seamless
     feature-based development!

   At a high level, the following items have been impacted _(more
   detail can be found at [`Cross Feature Communication`](../1.0.0/crossCommunication.html))_:
   
   - In an effort to standardize terminology _(and remove ambiguity)_,
     the term `fassets` _(feature assets)_ is being used throughout,
     replacing `publicFace` _(on the aspect definition side)_ and `app`
     _(on the usage side)_.

   - The [`Feature.fassets`](../1.0.0/api.html#fassets) aspect replaces
     [`Feature.publicFace`](../0.1.3/crossCommunication.html#publicface-and-the-app-object),
     providing a more formal set of directives, supporting things like
     **contractual arrangements** _(of usage and definition)_, and
     **validation of resources**.

   - The [`fassets`](../1.0.0/api.html#Fassets) object replaces the
     [`app`](../0.1.3/api.html#App) object, to programmatically
     access cross-feature resources.

   - The [`managedExpansion()`](../0.1.3/api.html#managedExpansion)
     function has been renamed to
     [`expandWithFassets()`](../1.0.0/api.html#expandWithFassets).
   
   - The new [`withFassets()`](../1.0.0/api.html#withFassets)
     higher-order component (HOC) auto-wires named feature assets as
     component properties.

   In addition, if you are using any of the **feature-u** extended
   aspect plugins, you must install the latest version, as they now
   pass through the new [`fassets`](../1.0.0/api.html#Fassets) object.

2. **Docs**: Documentation improvements include:

   - The docs have been enhanced in several areas, including API
     clarifications, improved cross-navigation between API/Guide,
     additional points of interest, examples, etc.  Take a peek
     (always improving).

   - Several diagrams have been added to the docs.  You know what they
     say: "a picture is worth a thousand words"!

   - Our docs now employ a dynamic left-nav menu, that only exposes
     sub-sections of the active section.  As a result, we now promote
     more left-nav sub-section links, improving the visualization of
     "where you are at" in larger topics.


<!-- ************************************************************* -->
<br/><br/><br/>
<h3 id="v0_1_3" style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  v0.1.3 - Establish Polyfill Strategy <i>(July 2, 2018)</i>
</h3>

[Full Docs](https://feature-u.js.org/0.1.3/)
&bull;
[GitHub Release](https://github.com/KevinAst/feature-u/releases/tag/v0.1.3)
&bull;
[GitHub Content](https://github.com/KevinAst/feature-u/tree/v0.1.3)
&bull;
[Diff](https://github.com/KevinAst/feature-u/compare/v0.1.0-docs...v0.1.3)

**NOTE**: This release is a **non-breaking change** _(i.e. no API was affected)_.

1. **Review**: A new policy is in affect where **polyfills are the
   responsibility of the client app**, when the target JavaScript
   engine is inadequate _(such as the IE browser)_.  Please refer to
   [`Potential Need for Polyfills`](../0.1.3/start.html#potential-need-for-polyfills) for more information.
   
   As a result, all previous code patches related to es2015+ polyfill
   issues were removed, in favor of **polyfilling at the app-level**.
   
1. **Internal**: The most current babel version/configuration is now
   used to transpile the library's es5 distribution.

1. **Internal**: The most current docs version/configuration
   (i.e. GitBook, JSDoc) is now used to generate our documentation.


<!-- ************************************************************* -->
<br/><br/><br/>
<h3 id="v0_1_0" style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  v0.1.0 - Initial Release <i>(March 6, 2018)</i>
</h3>

[Full Docs](https://feature-u.js.org/0.1.0/)
&bull;
[GitHub Release](https://github.com/KevinAst/feature-u/releases/tag/v0.1.0)
&bull;
[GitHub Content](https://github.com/KevinAst/feature-u/tree/v0.1.0)

**This is where it all began ...**

1. Holy Guacamole Batman! ... _This commit has no parents!!_
