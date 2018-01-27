# Basic Concepts

The basic process of feature-u is that each feature promotes a
`Feature` object that contains various aspects of that feature
... _things like: the feature's name, it's Public API, whether it is
enabled, initialization constructs, and resources used in configuring
it's slice of the frameworks in use._ 

In turn, these Feature objects are supplied to `launchApp()`, which
configures and starts your application, returning an [App
Object](#app-object) (_which promotes the public API of each
feature_).

In **feature-u**, "aspect" is a generalized term used to refer to the
various ingredients that (when combined) constitute your application.
Aspects can take on many different forms: **UI Components** and **Routes**
&bull; **State Management** _(actions, reducers, selectors)_ &bull;
**Business Logic** &bull; **Startup Initialization Code** &bull;
_etc. etc. etc._

**Not all aspects are of interest to feature-u** ...  _only those that
are needed to setup and launch the app_ ... all others are
considered to be an internal implementation detail of the feature.  As
an example, consider the redux state manager: while it uses actions,
reducers, and selectors ... only reducers are needed to setup and
configure redux.

A fundemental goal of **feature-u** is to **automatically configure
the framework(s)** used in your run-time-stack _(by accumulating the
necessary resources across all your features)_.  Because not everyone
uses the same frameworks, **feature-u** accomplishes this through
**Extendable Aspects** _(you can find them in external packages, or
you can create your own)_.  

It is important to understand that the interface to your chosen
frameworks is not altered in any way.  You use them the same way you
always have.  **feature-u** merely provides a well defined
organizational layer, where the frameworks are automatically setup and
configured by accumulating the necessary resources across all your
features.
