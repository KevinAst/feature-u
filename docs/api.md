
<br/><br/><br/>

<a id="createFeature"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  createFeature(name, [enabled], [publicFace], [appWillStart], [appDidStart], [pluggableAspects]) ⇒ Feature</h5>
Create a new Feature object, accumulating Aspect content to be consumedby launchApp().**Please Note** `createFeature()` accepts named parameters.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | string |  | the identity of the feature.  Feature names are used to index the [App Object](#app-object) by feature _(in support of [Cross Feature Communication](#cross-feature-communication))_, and are therefore guaranteed to be unique.  Application code can also use [Feature Name](#feature-name) in various [Single Source of Truth](#single-source-of-truth) operations. |
| [enabled] | boolean | <code>true</code> | an indicator as to whether this feature is enabled (true) or not (false).  When used, this indicator is typically based on a dynamic expression, allowing packaged code to be dynamically enabled/disabled at run-time _(please refer to: [Feature Enablement](#feature-enablement))_. |
| [publicFace] | Any |  | an optional resource object that is the feature's Public API, promoting cross-communication between features.  This object is exposed through the App object as: `app.{featureName}.{publicFace}` _(please refer to: [publicFace and the App Object](#publicface-and-the-app-object))_. |
| [appWillStart] | appWillStartCB |  | an optional [Application Life Cycle Hook](#application-life-cycle-hooks) invoked one time, just before the app starts up.  This life-cycle hook can do any type of initialization, and/or optionally supplement the app's top-level content (using a non-null return) _(please refer to: [appWillStart](#appwillstart))_. |
| [appDidStart] | appDidStartCB |  | an optional [Application Life Cycle Hook](#application-life-cycle-hooks) invoked one time, immediately after the app has started.  Because the app is up-and-running at this time, you have access to the appState and the dispatch() function ... assuming you are using redux (when detected by feature-u's plugable aspects) _(please refer to: [appDidStart](#appdidstart))_. |
| [pluggableAspects] | Aspect |  | additional aspects, as defined by the feature-u's pluggable Aspect extension. |

**Returns**: Feature - a new Feature object (to be consumed by feature-ulaunchApp()).  
