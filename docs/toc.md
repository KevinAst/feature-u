# Table of content 

### feature-u (0.1.0)
* [Getting Started](start.md)

----
* [Basic Concepts](concepts.md)
* [Usage](usage.md)
  * [Directory Structure](usage.md#directory-structure)
  * [Feature Object](usage.md#feature-object)
  * [launchApp()](usage.md#launchapp)
  * [Real Example](usage.md#real-example)
* [A Closer Look](closerLook.md)
  * [aspects](closerLook.md#aspects)
  * [Feature Object (relaying aspects)](closerLook.md#feature-object-relaying-aspects)
    * [Built-In aspects](closerLook.md#built-in-aspects)
    * [Extendable aspects](closerLook.md#extendable-aspects)
  * [Launching Your Application](closerLook.md#launching-your-application)
    * [React Registration](closerLook.md#react-registration)
  * [App Object](closerLook.md#app-object)
    * [Promoting Feature's Public API (via App)](closerLook.md#promoting-features-public-api-via-app)
    * [Checking Feature Dependencies (via App)](closerLook.md#checking-feature-dependencies-via-app))
* [Application Life Cycle Hooks](appLifeCycle.md)
  * [appWillStart](appLifeCycle.md#appwillstart)
  * [appDidStart](appLifeCycle.md#appDidStart)
* [Feature Enablement](enablement.md)
* [Cross Feature Communication](crossCommunication.md)
  * [publicFace and the App Object](crossCommunication.md#publicface-and-the-app-object)
  * [Accessing the App Object](crossCommunication.md#accessing-the-app-object)
    * [Managed Code Expansion](crossCommunication.md#managed-code-expansion)
    * [App Access Summary](crossCommunication.md#app-access-summary)
* [Single Source of Truth](truth.md)
  * [Feature Name](truth.md#feature-name)
  * [Feature State Location](truth.md#feature-state-location)

----
* [Core API](coreApi.md)
  * [createFeature()](api.md#createFeature)
  * [launchApp()](api.md#launchApp)
  * [managedExpansion()](api.md#managedExpansion)

----
* [Extending feature-u](extending.md)
  * [Locating Extensions](extending.md#locating-extensions)
  * [Aspect Object](extending.md#aspect-object-extending-feature-u)

* [Extension API](extensionApi.md)
  * [createAspect()](api.md#createAspect)
  * [addBuiltInFeatureKeyword()](api.md#addBuiltInFeatureKeyword)

----
* [Distribution](dist.md)
* [Why feature-u?](why.md)
* [Revision History](history.md)
* [MIT License](LICENSE.md)
