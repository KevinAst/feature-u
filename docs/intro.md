# feature-u

**feature-u** is a utility library that facilitates **Feature-Driven
Development** in your {{book.ext.react}} project.  It provides
tangible assistance in promoting features that are truly
**plug-and-play**.

You can quickly **"come up to speed"** with **feature-u** by viewing
the {{book.guide.playfulFeaturesVideo}}, that builds concepts, and
demonstrates them in a real world app ({{book.ext.eateryNodW}}).

<!--- Badges for CI Builds ---> 
[![Build Status](https://travis-ci.org/KevinAst/feature-u.svg?branch=master)](https://travis-ci.org/KevinAst/feature-u)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c063a6e2859148e8baa89e9369b0fa5d)](https://www.codacy.com/app/KevinAst/feature-u?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=KevinAst/feature-u&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/c063a6e2859148e8baa89e9369b0fa5d)](https://www.codacy.com/app/KevinAst/feature-u?utm_source=github.com&utm_medium=referral&utm_content=KevinAst/feature-u&utm_campaign=Badge_Coverage)
[![Known Vulnerabilities](https://snyk.io/test/github/kevinast/feature-u/badge.svg?targetFile=package.json)](https://snyk.io/test/github/kevinast/feature-u?targetFile=package.json)
[![NPM Version Badge](https://img.shields.io/npm/v/feature-u.svg)](https://www.npmjs.com/package/feature-u)


## Introduction

**Feature-Driven Development** (**FDD**) has become more prevalent in
today's landscape, and for good reason!  This is a lightweight Agile
technique, manifest in a project structure where your code is
organized by what it accomplishes (i.e. features), rather than lumping
all modules of like types into separate blobs of components, routes,
logic, actions, etc.  This technique greatly improves your code
comprehension because there is a direct correlation between the
**problem space** _(the requirements)_ and the **implementation**
_(the code)_!

Most developers would agree that organizing your project by feature is
much preferred over type-based patterns.  Because **application
domains grow** in the real world, project **organization by type
simply doesn't scale**, _it just becomes unmanageable_!

However, **FDD** involves more than just organizing your project's
directory structure into features. You want to encapsulate your
features into isolated and self-sufficient modules, and yet they must
also be able to collaborate with other features.

Truly isolated **FDD** is something that is **incredibly powerful**!
You can improve the modularity of your system by loosely coupling your
features, making your app easier to understand, develop, test, and
refactor.  If done right, your features actually become **"miniature
applications"** that simply **plug-and-play** _(where the mere
existence of a feature dynamically exudes the characteristics it
implements)_!
  
As it turns out there are a number of hurdles to overcome in order to
accomplish this. Rather than being left to fend for yourself,
**feature-u** has already tackled these hurdles.

**feature-u** promotes a new and unique approach to **code
organization** and **app orchestration**.

With **feature-u** ...

- your features can be encapsulated and isolated

- they can collaborate with other features in an extendable way

- your components can employ cross-feature composition (even injecting
  their content autonomously)

- your features can initialize themselves

- they can be activated or deactivated at run-time

- and as a bonus, your frameworks will even auto-configure with only
  the active features _(via a plugin architecture)_

**feature-u** opens new doors into the exciting world of **FDD**. It
frees you up to focus your attention on the "business end" of your
features!


## At a Glance

- {{book.guide.start}} ... _installation and access_

- {{book.guide.basicConcepts}} ... _a full introduction to **feature-u** concepts and terminology **(<span class="highlight">a must read</span>)**_

- {{book.guide.playfulFeaturesVideo}} ... _a **feature-u** presentation to get you started **(<span class="highlight">a must see</span>)**_

- {{book.guide.benefits}} ... _understand the benefits of **feature-u**_

- {{book.guide.usage}} ... _what is **feature-u**'s fundamental usage pattern_

- {{book.guide.detail}} ... _delve deeper into **feature-u** concepts_

- {{book.guide.appLifeCycle}} ... _learn how features can initialize themselves_

- {{book.guide.crossCom}} ... _promote truly **Plug-and-Play** features through a well-defined Public Face_

  - {{book.guide.crossCom_uiComposition}} ...  _facilitate seamless **cross-feature component composition**_


- {{book.guide.featureRouter}} ... _learn how navigation and routing can be integrated into your features_

- {{book.guide.enablement}} ... _dynamically enable/disable your features_

- {{book.guide.bestPractices}} ... _what are some feature-based **best practices** and **single-source-of-truth** principles_

- {{book.guide.coreApi}} ... _the detailed reference API_

- _Extending_ ...

  - {{book.guide.extending}} ... _learn how to extend **feature-u**_

  - {{book.guide.extensionApi}} ... _the detailed Extension API reference_

- _Misc_ ...

  - {{book.guide.dist}} ... _where to find **feature-u**_

  - {{book.guide.why}} ... _why was **feature-u** created?_

  - {{book.guide.history}} ... _peruse the various revisions of **feature-u**_

  - {{book.guide.LICENSE}} ... _legal stuff_
