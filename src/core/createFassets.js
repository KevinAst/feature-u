import verify        from '../util/verify';
import isString      from 'lodash.isstring';
import isPlainObject from 'lodash.isplainobject';

/**
 * An internal creator of the {{book.api.fassets}} object, by
 * accumulating the public fassets promoted by the set of supplied
 * `activeFeatures`.
 *
 * @param {Feature[]} activeFeatures the active features from which we
 * accumulate feature assets through the `Feature.fassets` aspect.
 *
 * @return {Fassets} a new Fassets object (promoted by launchApp()).
 * 
 * @private
 * 
 * @function createFassets
 */
export default function createFassets(activeFeatures) {

  // PRIVATE: running order of feature expansion and fassets aspects (within feature)
  //          ... used in ordering wildcard accumulation
  var _runningExpansionOrder = 0;


  // PRIVATE: active features (used in isFeature())
  const _isFeature = { /* dynamically maintained ... SAMPLE:
    feature1: true,
    feature2: true,
    ... */
  };


  // PRIVATE: fassets resources (with meta data)
  // ... maintained via Feature.fassets.define/defineUse
  const _resources = { /* dynamically maintained ... SAMPLE: TODO: ?? fill in

    '{fassetsKey}': {                    // ex: 'action.openView' ... NO wildcards allowed
      val:             {whatever},       // resource value
      definingFeature: {featureName},    // the feature defining this resource
      defineUse:       boolean,          // directive used in defining this resource (false: define. true: defineUse)
      order:           {num},            // order of feature expansion and fassets aspects (within feature)
                                         // ... used in ordering wildcard accumulation
    },
    ... */

  };


  // PRIVATE: fassets usage contract (with meta data)
  // ... maintained via Feature.fassets.use
  const _usage = { /* dynamically maintained ... SAMPLE: TODO: ?? fill in

    '{useKey}': {                          // ex: 'MainPage.*.link' ... wildcards allowed
      regex:            {from_useKey},     // the resolved regex for this useKey (null when useKey has NO wildcards)
      required:         true/false,        // optionality (required takes precedence for multiple entries)
      validateFn:       func,              // validation function (based on registered keywords)
      definingFeatures: [{featureName}],   // what feature(s) defined this "use" contract
      resolution:       resourceVal,       // pre-resolved resource values matching useKey
                                           // ... wrapped in [] when wildcards in use
                                           // ... optionality, validation, and order applied (in Pass 4)
    },
    ... */

  };


  // PUBLIC: fassets object used in cross-communication between features
  const fassets = {

    // ***
    // *** normalized fassets accumulation over all features
    // ***

    /* dynamically maintained ... SAMPLE: TODO: ?? fill in

    MainPage: {
      cart: {
        link: () => <Link to="/cart">Cart</Link>,
        body: () => <Route path="/cart" component={ShoppingCart}/>,
      },
      search: {
        link: () => <Link to="/search">Search</Link>,
        body: () => <Route path="/search" component={Search}/>,
      },
    },
    ... */

    // ***
    // *** pre-defined API (methods)
    // ***

    // fassets.get(fassetsKey): resource || resource[]
    // TODO: ?? add this

    // fassets.isFeature(featureName): boolean
    isFeature: (featureName) => {
      // validate parameters
      const check = verify.prefix('fassets.isFeature() parameter violation: ');

      check(featureName,            'featureName is required');
      check(isString(featureName),  'featureName must be a string');

      // return indicator
      return _isFeature[featureName] ? true : false;
    },
  };


  //*---------------------------------------------------------------------------
  // Pass 1: maintain "active features" indicator (in support of isFeature())
  //*---------------------------------------------------------------------------

  activeFeatures.forEach( feature => {
    _isFeature[feature.name] = true;
  });


  //*---------------------------------------------------------------------------
  // Pass 2: gather/pre-process all resource definitions
  //         - BOTH via fassets.define/defineUse directives
  //         - maintain _resources entries
  //         - validation:
  //           * cannot contain wildcards
  //           * must be unique (i.e. cannot be defined more than once)
  //             ... these are individual "single-use" keys
  //                 In other words, we do NOT support the "pull" (bucket) philosophy
  //           * NOTE: resource validation is postponed to subsequent Pass
  //                   ... because we need BOTH _resources and _usage
  //         - normalize resource directly in fassets object
  //*---------------------------------------------------------------------------

  activeFeatures.filter(  feature => feature.fassets ) // filter features with the fassets aspect
                .forEach( feature => {

  { // ?? remove once complete ... emacs messes up indentation

    const check = verify.prefix(`Feature.name: '${feature.name}' ... ERROR in "fassets" aspect: `);

    const fassets = feature.fassets;

    // validate that fassets contain only "known" directives
    // ??$$ TEST POINT ****************************************************************************************************************************************************************
    const {define, use, defineUse, ...unknownDirectives} = fassets;
    const unknownDirectiveKeys = Object.keys(unknownDirectives);
    check(unknownDirectiveKeys.length === 0,  `unrecognized fassets sub-directive(s): ${unknownDirectiveKeys} ... expecting only: define/use/defineUse`);

    // interpret BOTH define/defineUse directives
    // ... we attempt to process in same order defined within the fassets object literal
    //     - by using Object.keys()
    //     - HOWEVER: I do NOT believe this is universally possible (for all JS engines)
    //     - In general, traversal of object literal property keys is NOT guaranteed
    //       ... or at least the order may NOT be what the user expects (when key is interpreted as an integer)
    //       ... see: http://2ality.com/2015/10/property-traversal-order-es6.html
    //     - While this may work in a majority of cases, I DO NOT ADVERTISE THIS!!!
    const directiveKeys = Object.keys(fassets);
    directiveKeys.filter(  directiveKey => directiveKey === 'define' || directiveKey === 'defineUse' ) // filter both define directives
                 .forEach( directiveKey => {

    { // ?? remove once complete ... emacs messes up indentation

      const defineDirective = fassets[directiveKey];

      // validate that defineDirective is an object literal
      check(isPlainObject(defineDirective), `the ${directiveKey} sub-directive MUST BE an object literal`);

      // iterpret each resource being defined
      // ... we attempt to process in same order defined within the fassets.define object literal
      //     - ditto discution (above) on processing order
      const resourceKeys = Object.keys(defineDirective);
      resourceKeys.forEach( resourceKey => {
        const resource = defineDirective[resourceKey];

        // validate resource key
        // NOTE: resource validation is postponed to subsequent Pass
        //       ... because we need BOTH _resources and _usage

        // ... cannot contain wildcards
        // ?? do it

        // ... must be unique (i.e. cannot be defined more than once)
        //     ... these are individual "single-use" keys
        //         In other words, we do NOT support the "pull" (bucket) philosophy
        const resourcePreviouslyDefined = _resources[resourceKey];
        check(!resourcePreviouslyDefined, `fassets.${directiveKey}.${resourceKey} is NOT unique ... previously defined in Feature.name: '${resourcePreviouslyDefined.definingFeature}'`);

        // retain in _resources
        _resources[resourceKey] = {
          val:             resource,
          definingFeature: feature.name,
          defineUse:       directiveKey === 'defineUse',
          order:           ++_runningExpansionOrder,
        };

        // normalize resource directly in fassets object
        // ?? do it

      });
                   
    } // ?? remove once complete ... emacs messes up indentation
    });

  } // ?? remove once complete ... emacs messes up indentation
  });


  //   const _resources = {
  //   
  // ?   '{fassetsKey}': {                    // ex: 'action.openView' ... NO wildcards allowed
  // ?     val:             {whatever},       // resource value
  // ?     definingFeature: {featureName},    // the feature defining this resource
  // ?     defineUse:       boolean,          // directive used in defining this resource (false: define. true: defineUse)
  // ?     order:           {num},            // order of feature expansion and fassets aspects (within feature)
  //                                          // ... used in ordering wildcard accumulation
  //     },



  //*---------------------------------------------------------------------------
  // Pass 3: accumulate usage contracts
  //         - via fassets.use directive
  //         - maintain _usage entries (minus _usage.resolution)
  //         - interpret options directives (used in validation of optionality and type)
  //         - validation:
  //           * the uniqueness of "use" keys is NOT a requirement
  //             ... IN OTHER WORDS: multiple features can specify the same (or overlapping) "use" keys
  //           * HOWEVER, for duplicate keys: 
  //             - the optionality can vary (required simply takes precedence)
  //             - the expected data types MUST be the same
  //               NOTE: For overlapping wildcard items, there is an opportunity to have
  //                     multiple expected types.  This will be caught (indirectly) through
  //                     the resource validation (Pass 4).
  //*---------------------------------------------------------------------------

  // ??


  //*---------------------------------------------------------------------------
  // Pass 4: insure _resources "defineUse" directives matches at least ONE usage contract
  //         - for each _resources entry of 'defineUse' directive
  //           * key must match at least one _usage entry
  //             ... because "defineUse" directives are intended to fulfill a use contract
  //*---------------------------------------------------------------------------

  // ?? can combine with Pass 5


  //*---------------------------------------------------------------------------
  // Pass 5: validate _resources 
  //         - now that we have resolved BOTH _resources and _usage
  //         - for each _resources entry
  //           * for each "matching" _usage entry
  //             - validate
  //               * optionality
  //               * expected data types
  //*---------------------------------------------------------------------------

  // ??



  // return our public fassets object (used in cross-communication between features)
  return fassets;
}
