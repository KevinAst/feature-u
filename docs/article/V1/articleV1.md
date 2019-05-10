# Unleash the Power of Feature Based JS Development - with feature-u V1

This article is an introduction to a new JS library called
**[feature-u]**, that _facilitates feature-based development
in your [react] project_.  

<p align="center"><img src="../../img/featureUSplash.jpg"  alt="Features" width="80%"></p>

**Note**: On 8/14/2018 [feature-u V1] was released, that re-designed
[Cross Feature Communication] to include [UI Composition] as a core
offering.  This article covers the V1 release _(the first article,
based on [feature-u V0], can be found
[here](http://bit.ly/feature-u))_.  We are very excited about this
update because it **promotes one solution for all feature
collaboration**!

Most developers would agree that organizing your project by feature is
much preferred over type-based patterns.  Because **application
domains grow** in the real world, project **organization by type
simply doesn't scale**, _it just becomes unmanageable_!

There are a number of good articles that discuss this topic _with
insight on feature-based design and structure_ _(see: [References]
below TK:medium-resolve-internal-link)_.  However when it comes to the
implementation, you are pretty much left to fend for yourself.

**[feature-u]** is a utility library that manages and streamlines this
process.  It automates the mundane details of managing features
and helps to promote features that are truly **plug-and-play**.

This article provides a foundation of **[feature-u]** concepts and
terminology, building insight into how you can promote individual
**plug-and-play** features within your project.  It makes the case for
why **feature-u** was developed and gives you a better understanding
of it's benefits.

Check out the [full docs], [source], and [npm package].

**[feature-u]** opens new doors into the exciting world of
feature-based development.  It frees you up to **focus your attention
on the "business end" of your features!**


---

## At a Glance #e98c

_For your convenience, this **Table of Contents** (TOC) links directly
to each section.  Also note that **each section title links back to
the TOC**_.

TK:medium-resolve-internal-links 
   NOTE: These LINKS only exist in medium (because we piece the
         article together from separate sources)

TK:medium: INDENTED TEXT IS NOT AVIALABLE IN MEDIUM
           - simply use quoted text (medium still allows individual links)
```
#05bc   Feature Based Development      <<< IMAGE: water drip dance: https://pixabay.com/en/water-drip-dance-drop-of-water-1757781/ <<< featureDevWaterDance.jpg
#bbe8     Segregating Features
#f296     Feature Goals
#c8d1       Feature Runtime Consolidation  KJB: links ref internal article
#abbc       Feature Collaboration          KJB: links ref internal article
        ...
#219e   The feature-u Solution         <<< IMAGE: kool 3d puzzel: https://pixabay.com/en/puzzle-share-3d-task-solution-1721464/ <<< img/solutionPuzzle.jpg
#7f85     launchApp()
#d46e     Feature Object
#d09c     aspects
#5467     Running the App
#d44a       App Initialization             KJB: links ref internal article
#c339       Framework Configuration        KJB: links ref internal article
#13d0       Launching Your Application
#5369     Cross Feature Communication      KJB: links ref internal article
#a480     Feature Based UI Composition     KJB: links ref internal article
#e0e4       Resource Contracts
#6a02     Feature Enablement
#2ad3   In Summary
        ...
#0cd6   Benefits                       <<< IMAGE: closup drip of water: https://pixabay.com/en/drip-water-drop-of-water-1037806/ <<< img/benefitsSpash.jpg
        ...
#8e25   References
```

Please help me get the word out on **feature-u**.  Your claps
determine the distribution/promotion of this article.  If you think
**feature-u** has potential, please give this article multiple claps :-)

**SideBar**: TODO (not in article yet): This article is published in [freeCodeCamp] to harness
their most excellent distribution channels.  As it turns out the
content can also be found directly in the **feature-u** docs _(see:
[Basic Concepts])_.  Some may prefer this format, _because of it's
full integration to other parts of the docs_.  Whichever form you
choose, **don't forget to come back and clap** _(if you enjoyed the
article)_.


## Feature Based Development

TK:medium: The bulk of this article is extracted from our **Basic
           Concepts** section (`docs/concepts.md`).  _When mousing
           this into medium, insure you are on the correct docs
           version (currently 1.0.1)_!

TK:medium: from these pros CHANGE "This will be the focus of this section." TO "article"



## Benefits

TK:medium: Pull from docs



## References

- [A feature based approach to React development](http://ryanlanciaux.com/blog/2017/08/20/a-feature-based-approach-to-react-development/)
  _... Ryan Lanciaux_
  <!--
  KJB: very good high level stuff ... NOTED BY Jeff
       * general discussion
       * structure (SAME AS MINE)
           src
             features/
               cart/
                 components/
                 actionCreators.js
                 index.js
                 reducer.js
                 selectors.js
               product/
               other/
       * talks about a Feature Flag
         ... a technique to turn some functionality of your application off,
             via configuration, without deploying new code
  -->

- [How to better organize your React applications?](https://medium.com/@alexmngn/how-to-better-organize-your-react-applications-2fd3ea1920f1)
  _... Alexis Mangin_
  <!--
  KJB: more general discussion of react (without redux) ... NOTED BY Jeff
       * discusses scenes
  -->

- [How to use Redux on highly scalable javascript applications?](https://medium.com/@alexmngn/how-to-use-redux-on-highly-scalable-javascript-applications-4e4b8cb5ef38)
  _... Alexis Mangin_
  <!--
  KJB: very good discussion of breaking redux up into features (exactly what I am doing)
       * same author of above article: Alexis Mangin
  -->

- [The 100% correct way to structure a React app (or why there’s no such thing)](https://hackernoon.com/the-100-correct-way-to-structure-a-react-app-or-why-theres-no-such-thing-3ede534ef1ed)
  _... David Gilbertson_
  <!--
  KJB: more interested in file usage/accessibility (large hit count)
  -->

- [Redux for state management in large web apps](https://blog.mapbox.com/redux-for-state-management-in-large-web-apps-c7f3fab3ce9b)
  _... David Clark_
  <!--
  KJB: NOT directly feature related, HOWEVER points out several feature-based items, such as sliced reducers
  -->

  <!-- KJB: OMIT: marginal value
- [How to structure real world Redux/React application](https://medium.com/@yiquanzhou/how-to-structure-real-world-redux-react-application-d61e66a7dd36)
  _... Yiquan Zhou_
  -->



<!--- feature-u ---> 
[feature-u]:          https://feature-u.js.org/
[full docs]:          https://feature-u.js.org/
[source]:             https://github.com/KevinAst/feature-u
[npm package]:        https://www.npmjs.com/package/feature-u

[feature-u V0]:       https://feature-u.js.org/0.1.3/history.html#v0_1_3
[feature-u V1]:       https://feature-u.js.org/1.0.0/history.html#v1_0_0

[Basic Concepts]:               https://feature-u.js.org/1.0.1/concepts.html
[Cross Feature Communication]:  https://feature-u.js.org/1.0.1/crossCommunication.html
[UI Composition]:               https://feature-u.js.org/1.0.1/crossCommunication.html#ui-composition


<!--- external links ---> 
[react]:            https://reactjs.org/
[freeCodeCamp]:     https://www.freecodecamp.org/
