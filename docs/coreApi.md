# Core API

* [`createFeature({name, [enabled], [publicFace], [appWillStart], [appDidStart], [pluggableAspects]}): Feature`](api.md#createFeature)
  * [`appWillStartCB({app, curRootAppElm}): rootAppElm || null`](api.md#appWillStartCB)
  * [`appDidStartCB({app, [appState], [dispatch]}): void`](api.md#appDidStartCB)


* [`launchApp({[aspects], features, registerRootAppElm}): App`](api.md#launchApp)
  * [`registerRootAppElmCB(rootAppElm): void`](api.md#registerRootAppElmCB)


* [`managedExpansion(managedExpansionCB): managedExpansionCB`](api.md#managedExpansion)
  * [`managedExpansionCB(app): AspectContent`](api.md#managedExpansionCB)
