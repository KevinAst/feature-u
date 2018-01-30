# Extending feature-u

**feature-u** is extendable!  It operates in an open plugable
architecture where Extendable Aspects integrate **feature-u** to other
frameworks, matching your specific run-time stack.  **This is good,**
_because not everyone uses the same frameworks_!

 - You want state management using {{book.ext.redux}}?  There is an
   Aspect for that: {{book.ext.featureRedux}}.

 - You want to maintain your logic using {{book.ext.reduxLogic}}?
   There is an Aspect for that: {{book.ext.featureReduxLogic}}.

 - You want your features to autonomously promote their screens within
   the application?  There is an Aspect for that:
   {{book.ext.featureRouter}}.

 - Can't find an Aspect that integrates the XYZ framework?  You can
   create one using {{book.api.createAspect}}!  For extra credit, you
   should publish your package, so other XYZ users can benefit from
   your work!

It is important to understand that **feature-u** does not alter the
interface to these frameworks in any way.  You use them the same way
you always have.  **feature-u** merely provides a well defined
organizational layer, where the frameworks are automatically
setup and configured by accumulating the necessary resources across all
your features.


## Locating Extensions

To locate the latest set of published **feature-u** extensions, simply
**search the npm registry** using a `'feature-u'` keyword.  All
packages that extend **feature-u** should include this keyword in
their package.

During **feature-u**'s initial release (3/2018), I published the three
Aspects mentioned above _(matching my preferred stack)_, so at that
time there were only three.  Assuming **feature-u** gains momentum,
hopefully other authors will contribute their work.

If you create your own extension and decide to publish it, don't
forget to include the `'feature-u'` keyword in your package, _so
others can easily locate your extension_.


## Aspect Object (extending feature-u)

To extend **feature-u** you merely define an {{book.api.Aspect}}
object (using {{book.api.createAspect}}).

The {{book.api.Aspect}} object promotes a series of life-cycle methods
that **feature-u** invokes in a controlled way.  This life-cycle is
controlled by {{book.api.launchApp}} _... it is supplied the Aspects,
and it invokes their methods._

The essential characteristics of the {{book.api.Aspect}} life-cycle is
to:

- accumulate {{book.api.AspectContent}} across all features
- perform the desired setup and configuration
- expose the framework in some way _(by injecting a component in the
  root DOM, or some "aspect cross-communication mechanism")_

Typically the {{book.api.Aspect}} object will need to retain state
between these life-cycle methods in order to do it's job.

Some Aspects may rely on an "Aspect Cross-Communication" mechanism to
accomplish it's work.  This is merely a proprietary
{{book.api.Aspect}} method which is documented and consumed by another
Aspect.  Please refer to the {{book.api.createAspect}}
`additionalMethods` parameter.

The following sections provide a complete description of
{{book.api.Aspect}} properties and life-cycle methods.  **Please
Note**: The order in which these methods are presented represents the
same order they are executed.

 - [`Aspect.name`](#aspectname)
 - [`Aspect.validateConfiguration(): string`](#aspectvalidateconfiguration)
 - [`Aspect.expandFeatureContent(app, feature): string`](#aspectexpandfeaturecontent)
 - [`Aspect.validateFeatureContent(feature): string`](#aspectvalidatefeaturecontent)
 - [`Aspect.assembleFeatureContent(app, activeFeatures): void`](#aspectassemblefeaturecontent)
 - [`Aspect.assembleAspectResources(app, aspects): void`](#aspectassembleaspectresources)
 - [`Aspect.injectRootAppElm(app, activeFeatures, curRootAppElm): reactElm`](#aspectinjectrootappelm)
 - [`Aspect.additionalMethods()`](#aspectadditionalmethods)

**Note on App Promotion**: You will notice that an `app` parameter is
consistently supplied throughout the various {{book.api.Aspect}}
life-cycle methods.  The App object is used in promoting
cross-communication between features.  While it is most likely an
anti-pattern to interrogate the {{book.api.App}} object directly in
the {{book.api.Aspect}}, it is required to "pass through" to
downstream processes (i.e. as an opaque object).  **This is the reason
the {{book.api.App}} object is supplied**.  As examples of this:

- The `Feature.logic` aspect _({{book.ext.featureReduxLogic}})_ will
  dependency inject (DI) the app object into the
  {{book.ext.reduxLogic}} process.
- The `Feature.route` aspect _({{book.ext.featureRouter}})_
  communicates the app in it's routing callbacks.
- etc.

### Aspect.name

The `Aspect.name` is used to "key" {{book.api.AspectContent}} of this
type in the {{book.api.Feature}} object.  

For example: an `Aspect.name: 'xyz'` would permit a `Feature.xyz:
xyzContent` construct.

As a result, Aspect names cannot clash with built-in aspects, and
they must be unique _(across all aspects that are in-use)_.


_**Best Practice ...**_

It is a good practice to allow your Aspect name to be re-configured at
run-time _because they must be unique, and externally published
Aspects cannot know the Aspect mix that is in-use_.  This can be
accomplished through a defensive Aspect implementation that references
feature properties by indexing the Aspect.name rather than hard coding
it.

As an example, the following code snippet assumes a context of an xyz
**Aspect method** ...

**`xyzAspect.someMethod()`:**
```js
  ...
  const feature = ...;

  // DO NOT HARD CODE:
  ... feature.xyz

  // RATHER INDEX:
  ... feature[this.name]
  
```

This allows your clientele to reset the Aspect.name as follows:

**`client code initialization`:**
```js
  xyzAspect.name = 'xyzFoo';
```


### Aspect.validateConfiguration()

**API:** {{book.api.validateConfigurationMeth$}}

{{book.api.validateConfigurationMeth}} is an optional validation hook
allowing this aspect to verify it's own required configuration (if
any).  Some aspects may require certain settings in self for them to
operate.

**RETURN**: an error message string when self is in an invalid state
(falsy when valid).  Because this validation occurs under the control
of `launchApp()`, any message is prefixed with: `'launchApp() parameter
violation: '`.


### Aspect.expandFeatureContent()

**API:** {{book.api.expandFeatureContentMeth$}}

{{book.api.expandFeatureContentMeth}} is an optional aspect expansion
hook, defaulting to the algorithm defined by `managedExpansion()`.
This function rarely needs to be overridden.  It provides a hook to
aspects that need to transfer additional content from the expansion
function to the expanded content.

This method (when used) should expand self's
{{book.api.AspectContent}} in the supplied feature (which is known to
contain this aspect **and** is in need of expansion), replacing that
content (within the feature).  Once expansion is complete, **feature-u**
will perform a delayed validation of the expanded content.

The default behavior simply implements the expansion algorithm
defined by {{book.api.managedExpansion}}:

```js
feature[this.name] = feature[this.name](app);
```

This default behavior rarely needs to change.  It however provides a
hook for aspects that need to transfer additional content from the
expansion function to the expanded content.  As an example, the
`reducer` aspect must transfer the slice property from the expansion
function to the expanded reducer.

**RETURN**: an optional error message string when the supplied feature
contains invalid content for this aspect (falsy when valid).  This is
a specialized validation of the expansion function, over-and-above
what is checked in the standard validateFeatureContent() hook.



### Aspect.validateFeatureContent()

**API:** {{book.api.validateFeatureContentMeth$}}

{{book.api.validateFeatureContentMeth}} is a validation hook allowing
this aspect to verify it's content on the supplied feature (which is
known to contain this aspect).

**RETURN**: an error message string when the supplied feature contains
invalid content for this aspect (falsy when valid).  Because this
validation conceptually occurs under the control of
{{book.api.createFeature}}, any message is prefixed with:
`'createFeature() parameter violation: '`.


### Aspect.assembleFeatureContent()

**API:** {{book.api.assembleFeatureContentMeth$}}

{{book.api.assembleFeatureContentMeth}} assembles content for this
aspect across all features, retaining needed state for subsequent ops.
This method is required because this is the primary task that is
accomplished by all aspects.


### Aspect.assembleAspectResources()

**API:** {{book.api.assembleAspectResourcesMeth$}}

{{book.api.assembleAspectResourcesMeth}} is an optional hook that
assemble resources for this aspect across all other aspects, retaining
needed state for subsequent ops.  This hook is executed after all the
aspects have assembled their feature content (i.e. after
{{book.api.assembleFeatureContentMeth}}).

This is an optional second-pass (so-to-speak) of Aspect data
gathering, that facilitates an "aspect cross-communication" mechanism.
It allows a given aspect to gather resources from other aspects,
through a documented API for a given {{book.api.Aspect}} (ex:
`Aspect.getXyz()`).

As an example of this, consider {{book.ext.featureRedux}}.  Because it
manages {{book.ext.redux}}, it must promote a technique by which other
Aspects can register their redux middleware.  This is accomplished
through the proprietary method: `Aspect.getReduxMiddleware():
middleware`.


### Aspect.injectRootAppElm()

**API:** {{book.api.injectRootAppElmMeth$}}

{{book.api.injectRootAppElmMeth}} is an optional callback hook that
promotes some characteristic of this aspect within the app root
element (i.e. react component instance).

All aspects will either promote themselves through this hook, -or-
through some "aspect cross-communication" mechanism.

**NOTE**: When this hook is used, the supplied curRootAppElm MUST be
included as part of this definition!

**RETURN**: a new react app element root (which in turn must contain
the supplied curRootAppElm), or simply the supplied curRootAppElm (if
no change).


### Aspect.additionalMethods()

Aspects may contain any number of additional "proprietary" methods,
supporting two different requirements:

- internal Aspect helper methods, and

- APIs used in "aspect cross-communication" ... a contract between one
  or more aspects.  This is merely an API specified by one
  {{book.api.Aspect}}, and used by another {{book.api.Aspect}},
  facilitated through the {{book.api.assembleAspectResourcesMeth$}}
  hook.

  As an example of this, consider {{book.ext.featureRedux}}.  Because
  it manages {{book.ext.redux}}, it must promote a technique by which
  other Aspects can register their redux middleware.  This is
  accomplished through the proprietary method:
  `Aspect.getReduxMiddleware(): middleware`.
