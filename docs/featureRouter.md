# Feature Based Routes

feature-u recommends that you consider using **Feature Based Routes**
for your routing needs ... via the {{book.ext.featureRouter}}
extendable Aspect _(packaged separately)_.

You may be surprised to discover that **feature-u** recommends it's own
flavor of route management. There are so many!  Why introduce yet
another?

Obviously **feature-u** does not dictate any one navigation/router
solution _(the recommendation is even in a separate package)_.  You are
free to use whatever route/navigation solution that meets your
requirements.

- You can use the recommended **{{book.ext.featureRouter}}**
- You can use XYZ navigation (_fill in the blank with your chosen solution_)
- You can even use a combination of **Feature Routes** routes and XYZ routes


### Why Feature Routes?

The **big benefit** of **Feature Routes** (_should you choose to use
them_) is that **it allows features to promote their screens in an
encapsulated and autonomous way**!

A key aspect of any feature is to have the ability to inject itself
into the app's process autonomously _(as much as feasibly possible)_.
This may even include UI Component injection _(depending on your
philosophy)_.


### How do Feature Routes work?

**Feature Routes** are _based on a very simple concept_: **allow the
application state to drive the routes**!

It operates through a series of feature-based routing functions that
reason about the appState, and either return a rendered component, or
null to allow downstream routes the same opportunity.  Basically the
first non-null return wins.

In feature based routing, you will not find the typical "route path to
component" mapping catalog, where (_for example_) some pseudo
`route('signIn')` directive causes the SignIn screen to display, which
in turn causes the system to accommodate the request by adjusting it's
state appropriately.  Rather, the appState is analyzed, and if the
user is NOT authenticated, the SignIn screen is automatically
displayed ... **Easy Peasy!**

Depending on your perspective, this approach can be **more natural**,
but _more importantly_ (once again), **it allows features to promote
their own screens in an encapsulated and autonomous way**!


## How do I proceed?

This discussion is obviously merely an introduction.  There is more to
**Feature Routes** that we haven't touched on.  Should you choose to
use them, please refer to the {{book.ext.featureRouter}} docs.
