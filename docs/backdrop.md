# Backdrop

Let's start by chronicling a typical starting point of feature-based
development ...

## out of the Starting Gate ...

_sooo ...  You have decided to structure your project by features_.
From a design perspective, there are a number of considerations in
determining the feature boundaries.  In general, you are feeling good
about the progress.

Your intuition is starting to realize concrete benefits ... **feature
segregation is going to result in code that much more manageable!**


## the Hurdles ...

However, there are a number of hurdles yet to be resolved ...

- How do you encapsulate and isolate your features, while still
  allowing them to collaborate with one another?

- How do selected features introduce start-up initialization (_even
  injecting utility at the root DOM_), without relying on some
  external startup process?

- How do you promote feature-based UI components in an isolated and
  autonomous way?

- How do you configure your chosen frameworks now that your code is
  so spread out?

- How do you enable/disable selected features which are either
  optional, or require a license upgrade?

- In short, how do you pull it all together so that your individual
  features operate as one application?


## what now? (the Goal) ...

The **overriding goal** of **feature-u** is actually two fold:

1. Allow features to **Plug-and-Play!** This encompasses many things,
   such as: encapsulation, cross communication, enablement,
   initialization, etc., etc.  We will build on these concepts
   throughout this documentation.

2. **Automate the startup of your application!!** You have the
   features.  Allow them to promote their characteristics, so a
   central utility can **automatically configure the frameworks** used
   in your app, thereby **launching your application!**

   This task **must be accomplished in an extendable way**, _because
   not everyone uses the same set of frameworks!_
