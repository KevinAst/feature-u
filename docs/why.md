# Why feature-u?

There are many things to consider when segregating your project code
into separate features.  How do you encapsulate your features while
pulling them back together so they operate as one application?

This list (below) provides some considerations that formed the basis
of why **feature-u** was developed!

I hope you enjoy this effort, and comments are always welcome.

**&lt;/Kevin&gt;**

**P.S.** The **feature-u** library was pulled from a sandbox project
{{book.ext.eateryNod}} that I use to study several technologies and
frameworks.  It is a {{book.ext.reactNative}} {{book.ext.expo}} mobile
app.

**P.P.S.** If you are wondering what the "-u" stands for, it is merely a
succinct suffix that distinguishes a number of my published
**utilities**.


## As promised, here is the list ...

1. **Feature Encapsulation:**

   Most characteristics of a feature strive to be self-sufficient and
   independent.  Where possible, they operate within their own
   isolated implementation.

   **Solution:** Various **feature-u** traits

1. **Feature Collaboration:**

   Even though a feature's implementation is encapsulated, it still
   needs to interact with it's surroundings.  There is a need for
   collaboration between features.  This however should be accomplished
   through a well-defined feature-based public interface.

   **Solution:** {{book.guide.crossCom}}

1. **Feature Initialization:**

   Any given feature should not have to rely on an external startup
   process to perform the initialization that it needs.  Rather, the
   feature should be able to spawn initialization that it depends on.

   This could be any number of things, such as:
   - initialize some service API
   - inject a utility react component at the root of the App
   - dispatch an action that kicks off some startup process
   - etc.

   **Solution:** {{book.guide.appLifeCycle}}

1. **Feature Enablement:**

   You may have the need for selected features to be dynamically
   enabled or disabled.  As an example, certain features may only be
   enabled with a license upgrade, or other features may only be used for
   diagnostic purposes.

   **Solution:** {{book.guide.enablement}}

1. **Resource Resolution during Code Expansion:**

   There are situations where resource access can be problematic. This
   is typically a **timing issue**, _during in-line code expansion_,
   where the resource is not fully defined YET.  This **ultimately is
   due to order dependencies** across features.  

   **_How can this problem be minimized?_**
   
   **Solution:** {{book.guide.crossCom_managedCodeExpansion}}

1. **Framework Integration:**

   Most likely your application employs a number of different
   frameworks (ex: {{book.ext.redux}}, {{book.ext.reduxLogic}}, etc.).
   As a result, your features are typically going to rely on these
   same frameworks.

   How are the resources needed by these frameworks accumulated and
   configured across the many features of your app?

   **Solution:** {{book.guide.detail_extendableAspects}} -and- {{book.guide.detail_launchingApp}}

1. **UI Component Promotion:**

   Features that maintain their own UI components need a way to promote
   them in the overall app's GUI.  How is this accomplished in an
   autonomous way?

   **Solution:** {{book.guide.featureRouter}} (via the plugable
   {{book.ext.featureRouter}} `routeAspect`)

1. **Single Source of Truth:**

   What are some **Best Practices** for "Single Source of Truth" as it
   relates to features, and how can **feature-u** help?

   **Solution:** see: {{book.guide.bestPractices}}

1. **Simplified App Startup:**

   After breaking your application into pieces (i.e. features), how do
   you pull it all together, and actually start your app running?

   At first glance, this may seem like a daunting task.  As it
   turns out, however, because of the structure promoted by **feature-u**,
   it actually is a very simple process.

   **Solution:** {{book.guide.detail_launchingApp}}
