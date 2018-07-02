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
* PROCEDURE for maintaining LINKS in history.md
*-----------------------------------------------

1. for latest running work-in-progress: it is OK to use the gitbook templates
   - EX:       bla bla {{book.api.createFeature}}
   - template: bla bla [`createFeature()`](/api.md#createFeature)
   - gens:     bla bla <a href="api.html#createFeature"><code>createFeature()</code></a>
   - NOTES:
     a) clicking link STAYS ON SAME PAGE (as for all links of this type)
 
2. for RELEASE: expand them in-line using a VERSION RELATIVE SYNTAX:
   - EX:       bla bla [`createFeature()`](../v.v.v/api.md#createFeature)
               NOTES:
                - start with template definition
                - pre-pend ../v.v.v/
   - gens:     bla bla <a href="../v.v.v/api.html#createFeature"><code>createFeature()</code></a>
   - NOTES:
     a) clicking link STAYS ON SAME PAGE
     b) because these notes are copied to all release history.md, 
        thy MUST reference the appropriate version
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
[v0.1.3](#v0_1_3) | Establish Polyfill Strategy            | *July 2, 2018*
[v0.1.0](#v0_1_0) | Initial Release                        | *March 6, 2018*



<br/><br/><br/>
## Details:


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
   [`Potential Need for Polyfills`](../0.1.3/start.md#potential-need-for-polyfills) for more information.
   
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
