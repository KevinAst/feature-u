# Basic Concepts

In order to get a high level understanding of feature-u, let's start
by chronicling a typical feature-based development quandary ...


### out of the Starting Gate ...

_sooo ...  You have decided to structure your project by features_.
From a design perspective, there are a number of considerations in
determining the feature boundaries.  Your code has been separated into
individual feature directories, and in general, you are feeling good
about the progress.

Your intuition is starting to realize concrete benefits ... **feature
segregation is going to result in code that much more manageable!**


### the Hurdles ...

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


### what now? (the Goal) ...

The **overriding goal** of **feature-u** is two fold:

1. Allow features to **Plug-and-Play!** This encompasses many things,
   such as: encapsulation, cross communication, enablement,
   initialization, etc., etc.  We will build on these concepts
   throughout this documentation.

2. **Automate the startup of your application!!** You have the
   features.  Allow them to promote their characteristics, so a
   central utility can **automatically configure the frameworks** used
   in your app, thereby **launching your application!**
   _This task **must be accomplished in an extendable way**, because
   not everyone uses the same set of frameworks!_


## feature-u Basics

The basic process of feature-u is that each feature promotes a
`Feature` object that contains various aspects of that feature
... _things like: the feature's name, it's Public API, whether it is
enabled, initialization constructs, and resources used to configure
it's slice of the frameworks in use._ 

In turn, these Feature objects are supplied to `launchApp()`, which
configures and starts your application, returning an [App
Object](#app-object) (_which promotes the public API of each
feature_).

### aspects ...

In **feature-u**, "aspect" is a generalized term used to refer to the
various ingredients that (when combined) constitute your application.
Aspects can take on many different forms: **UI Components** and **Routes**
&bull; **State Management** _(actions, reducers, selectors)_ &bull;
**Business Logic** &bull; **Startup Initialization Code** &bull;
_etc. etc. etc._

**Not all aspects are of interest to feature-u** ...  _only those that
are needed to setup and launch the app_ ... all others are considered
an internal implementation detail of the feature.  As an example,
consider the redux state manager: while it uses actions, reducers, and
selectors ... only reducers are needed to setup and configure redux.

### framework integration ...

A fundamental goal of **feature-u** is to **automatically configure
the framework(s)** used in your run-time-stack _(by accumulating the
necessary resources across all your features)_.  Because not everyone
uses the same frameworks, **feature-u** accomplishes this through
**Extendable Aspects** _(you can find them in external NPM packages,
or you can create your own)_.

It is important to understand that the interface to your chosen
frameworks is not altered in any way.  You use them the same way you
always have _(just within your feature boundary)_.  **feature-u**
merely provides a well defined organizational layer, where the
frameworks are automatically setup and configured by accumulating the
necessary resources across all your features.
