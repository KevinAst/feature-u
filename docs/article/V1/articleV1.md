# feature-u V1 (Feature Based Project Organization for React)

This article is an introduction to a new JS library called
**[feature-u]**, that **facilitates feature-based project organization
in your [react] project**.  It provides tangible assistance in promoting
individual **plug-and-play** features within your project.

<p align="center"><img src="../../img/featureUSplash.jpg"  alt="Features" width="80%"></p>

Most developers would agree that organizing your project by feature is
much preferred over type-based patterns. Because **application domains
grow** in the real world, project **organization by type simply
doesn't scale**, _it just becomes unmanageable_!

There are many good articles on this topic with insights on
feature-based design and structure _(see: [References] below
TK:medium-resolve-internal-link)_.  However when it comes to the
implementation, you are pretty much left to fend for yourself.

This article is an introduction to **feature-u**, building concepts and
insights.  It makes a case for why **feature-u** was developed and gives
you a better understanding of it's benefits.

Check out the [full docs], [github source], and [npm package].

**[feature-u]** opens new doors into the exciting world of
feature-based development.  It frees you up to **focus your attention
on the "business end" of your features!** _Go forth and compute!!_

---

**Note**: On 8/14/2018 [feature-u V1] was released, that re-designed
[Cross Feature Communication] to include [UI Composition] as a core
offering.  This article covers the V1 release.  _(the first article,
based on [feature-u V0], can be found
[here](http://bit.ly/feature-u))_.  We are very excited about this
update, because it **promotes one solution for all feature
collaboration**!


## At a Glance

TK:medium-resolve-internal-links

- [Feature Based Development] ... _think of features as mini applications_
  - [Segregating Features] ... _divide your features into directories_
  - [Feature Goals] ... _what are the goals and hurdles of feature based development_
    - [Feature Runtime Consolidation] ... _how do multiple features run as one application?_
    - [Feature Collaboration] ... _how do features cross communicate without breaking encapsulation?_
- [The feature-u Solution] ... _how can **feature-u** help?_
  - [launchApp()]
  - [Feature Object]
  - [aspects]
  - [Running the App]
    - [App Initialization]
    - [Framework Configuration]
  - [Cross Feature Communication](#cross-feature-communication)
  - [Feature Based UI Composition]
    - [Resource Contracts]
  - [Feature Enablement]


TK:medium: The bulk of this article is extracted from our **Basic Concepts** section (`docs/concepts.md`).
_When mousing this into medium, insure you are on the correct docs version (probabally 1.0.1)_!


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



<!--- internal references ---> 

[Feature Based Development]:          #feature-based-development
 [Segregating Features]:              #segregating-features
 [Feature Goals]:                     #feature-goals
  [Feature Runtime Consolidation]:    #feature-runtime-consolidation
  [Feature Collaboration]:            #feature-collaboration
[The feature-u Solution]:             #the-feature-u-solution
 [launchApp()]:                       #launchapp
 [Feature Object]:                    #feature-object
 [aspects]:                           #aspects
 [Running the App]:                   #running-the-app
  [App Initialization]:               #app-initialization
  [Framework Configuration]:          #framework-configuration
 [Cross Feature Communication LOCAL]: #cross-feature-communication
 [Feature Based UI Composition]:      #feature-based-ui-composition
  [Resource Contracts]:               #resource-contracts
 [Feature Enablement]:                #feature-enablement

                                       
[References]:                         #references


<!--- feature-u ---> 
[feature-u]:          https://feature-u.js.org/
[full docs]:          https://feature-u.js.org/
[github source]:      https://github.com/KevinAst/feature-u
[npm package]:        https://www.npmjs.com/package/feature-u

[feature-u V0]:       https://feature-u.js.org/0.1.3/history.html#v0_1_3
[feature-u V1]:       https://feature-u.js.org/1.0.0/history.html#v1_0_0

[Cross Feature Communication]:  https://feature-u.js.org/1.0.0/crossCommunication.html
[UI Composition]:               https://feature-u.js.org/1.0.0/crossCommunication.html#ui-composition


<!--- external links ---> 
[react]:            https://reactjs.org/
