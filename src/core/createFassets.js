import verify        from '../util/verify';
import isString      from 'lodash.isstring';
import isPlainObject from 'lodash.isplainobject';

// ?? is it OK to have empty directives (define/use/defineUse)
// ?? Wow: must introduce diagnostic logs to track what the heck this is doing :-(

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
  const _resources = { /* dynamically maintained ... SAMPLE:

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
  const _usage = { /* dynamically maintained ... SAMPLE:

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
  const _fassets = {

    // ***
    // *** normalized fassets accumulation over all features
    // ***

    /* dynamically maintained ... SAMPLE:

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
  //         - maintain _resources entries (with meta data)
  //         - normalize resource directly in _fassets object
  //         - validation:
  //           * may contain federated namespace (with dots ".")
  //             ... ex: 'MainPage.launch'
  //           * MAY NOT contain wildcards
  //             ... must be defined completely
  //           * must be unique
  //             ... cannot be defined more than once
  //             ... these are individual "single-use" keys
  //                 In other words, we do NOT support the "pull" (bucket) philosophy
  //           * NOTE: resource validation is postponed to subsequent Pass
  //                   ... because we need BOTH _resources and _usage
  //*---------------------------------------------------------------------------

  activeFeatures.filter(  feature => feature.fassets !== undefined ) // filter features with the fassets aspect
                .forEach( feature => {
  { // HELP_EMACS: extra bracket - sorry to say, emacs web-mode can't handle indentation with nested filter/forEach (above) :-(

    const check = verify.prefix(`Feature.name: '${feature.name}' ... ERROR in "fassets" aspect: `);

    const fassets = feature.fassets;

    // validate the fassets basic structure
    // ... fassets must be an object literal
    check(isPlainObject(fassets), `the fassets aspect MUST BE an object literal`);
    const {define, use, defineUse, ...unknownDirectives} = fassets;
    // ... all fassets directives are recognized
    const unknownDirectiveKeys = Object.keys(unknownDirectives);
    check(unknownDirectiveKeys.length === 0,  `unrecognized fassets directive(s): ${unknownDirectiveKeys} ... expecting only: define/use/defineUse`);
    // ... at least ONE fassets directive is supplied
    check(define!==undefined || use!==undefined || defineUse!==undefined,
          `at least one directive is required (define/use/defineUse)`);

    // interpret BOTH define/defineUse directives
    // ... we attempt to process in same order defined within the fassets object literal
    //     - by using Object.keys()
    //     - HOWEVER: I do NOT believe this is universally possible (for all JS engines)
    //     - In general, traversal of object literal property keys is NOT guaranteed
    //       ... or at least the order may NOT be what the user expects (when key is interpreted as an integer)
    //       ... see: http://2ality.com/2015/10/property-traversal-order-es6.html
    //     - While this may work in a majority of cases, I DO NOT ADVERTISE THIS!!!
    const directiveKeys = Object.keys(fassets);
    directiveKeys.filter(  directiveKey => directiveKey === 'define' || directiveKey === 'defineUse' ) // filter all define directives
                 .forEach( directiveKey => {
    { // HELP_EMACS
      const defineDirective = fassets[directiveKey];

      // validate that defineDirective is an object literal
      check(isPlainObject(defineDirective), `the ${directiveKey} directive MUST BE an object literal`);

      // iterpret each resource being defined
      // ... we attempt to process in same order defined within the fassets.define object literal
      //     - ditto discution (above) on processing order
      const resourceKeys = Object.keys(defineDirective);
      resourceKeys.forEach( resourceKey => {
        const resource = defineDirective[resourceKey];

        // validate resource key
        // NOTE: resource validation is postponed to subsequent Pass
        //       ... because we need BOTH _resources and _usage

        // ... insure it will not overwrite our reserved fasset methods (get/isFeature)
        check(resourceKey!=='get' && resourceKey!=='isFeature', `fassets.${directiveKey}.'${resourceKey}' is a reserved word`);

        // ... restrict to a programmatic structure, because we normalize it (with depth)
        checkProgrammaticStruct(resourceKey, check);

        // ... must be unique (i.e. cannot be defined more than once)
        //     ... these are individual "single-use" keys
        //         In other words, we do NOT support the "pull" (bucket) philosophy
        const resourcePreviouslyDefined = _resources[resourceKey];
        if (resourcePreviouslyDefined) // conditional required to prevent template literal (next line) from referencing undefined.definingFeature
          check(!resourcePreviouslyDefined, `fassets.${directiveKey}.'${resourceKey}' is NOT unique ... previously defined in Feature.name: '${resourcePreviouslyDefined.definingFeature}'`);

        // retain in _resources
        // ... NOTE: currently this structure is tested indirectly
        //           - can't really export it without attaching it to the fassets object
        _resources[resourceKey] = {                        // ex: 'action.openView' ... NO wildcards allowed
          val:             resource,                       // resource value
          definingFeature: feature.name,                   // the feature defining this resource
          defineUse:       directiveKey === 'defineUse',   // directive used in defining this resource (false: define. true: defineUse)
          order:           ++_runningExpansionOrder,       // order of feature expansion and fassets aspects (within feature)
                                                           // ... used in ordering wildcard accumulation
        };

        // inject resource directly in our _fassets object (normalized)
        injectFassetsResource(resourceKey, resource, _fassets, check);

      });
                   
    } // HELP_EMACS
    });

  } // HELP_EMACS
  });


  //*---------------------------------------------------------------------------
  // Pass 3: accumulate usage contracts
  //         - via fassets.use directive
  //         - maintain _usage entries
  //         - interpret options directives (used in validation of optionality and type)
  //         - validation:
  //           * may contain federated namespace (with dots ".")
  //             ... ex: 'MainPage.launch'
  //           * may contain wildcards (with "*")
  //             ... ex: 'MainPage.*.link'
  //           * the uniqueness of "use" keys is NOT a requirement
  //             ... IN OTHER WORDS: multiple features can specify the same (or overlapping) "use" keys
  //             ... HOWEVER, for duplicate keys: 
  //                 - the optionality can vary (required simply takes precedence)
  //                 - the expected data types MUST be the same
  //                   NOTE: For overlapping wildcard items, there is an opportunity to have
  //                         multiple expected types.  This will be caught (indirectly) through
  //                         the resource validation (Pass 4).
  //*---------------------------------------------------------------------------

  // ??$$ TEST POINT ****************************************************************************************************************************************************************



  // maintain each use contract in our _usage object
  // ??
  _usage.temp = '??temporary remove lint error';

  // _usage = {
  // 
  // ? '{useKey}': {                          // ex: 'MainPage.*.link' ... wildcards allowed
  // ?   regex:            {from_useKey},     // the resolved regex for this useKey (null when useKey has NO wildcards)
  // ?   required:         true/false,        // optionality (required takes precedence for multiple entries)
  // ?   validateFn:       func,              // validation function (based on registered keywords)
  // ?   definingFeatures: [{featureName}],   // what feature(s) defined this "use" contract
  // ?   resolution:       resourceVal,       // pre-resolved resource values matching useKey
  //                                          // ... wrapped in [] when wildcards in use
  //                                          // ... optionality, validation, and order applied (in Pass 4)
  //   },
  // };



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
  return _fassets;
}


/**
 * An internal function that injects the supplied key/val into obj,
 * normalized into a structure with depth (by interpreting the key's
 * federated namespace).
 *
 * @param {string} key the injection key.  Can contain DOTs (.) which
 * will be normalized into a structure with depth.
 *
 * @param {Any} valdobj the value to inject.
 *
 * @param {Object} obj the injection object.
 *
 * @param {assertionFn} check an assertion function (with context),
 * used to perform validation.
 * 
 * @private
 */
function injectFassetsResource(key, val, obj, check) {

  const nodeKeys   = key.split('.'); // interpret federated namespace (delimited with DOTs)
  const lastNode   = nodeKeys.pop(); // extract last node (reducing the size of nodeKeys array)
  const runningObj = nodeKeys.reduce( (accum, nodeKey) => {
    if (accum[nodeKey]) {
      // appending to existing structure
      // ... must be a plain object ... otherwise it represents a conflict
      check(isPlainObject(accum[nodeKey]), `while normalizing the fassets '${key}' key, a conflict was detected with another feature at the '${nodeKey}' node (it is NOT an object)`);
    }
    else {
      // introduce new intermediate node
      accum[nodeKey] = {};
    }
    return accum[nodeKey];
  }, obj);

  // inject the val indexed by the lastNode
  // ... cannot clober (i.e. cover up or overwrite) existing data
  check(!runningObj[lastNode],  `while normalizing the fassets '${key}' key, a conflict was detected with another feature at the '${lastNode}' node (overwriting existing data)`);
  runningObj[lastNode] = val;

}

/**
 * An internal function that validates supplied key, to be a
 * programmatic structure, as follows:
 *
 * ```
 *   - allow embedded DOTS "."
 *   - dissallow wildcards "*"
 *   - valid:   "a"
 *              "a1"
 *              "a1.b"
 *              "a1.b2.c"
 *   - invalid: ""           // empty string
 *              "123"        // must start with alpha
 *              ".a"         // beginning empty string
 *              "a."         // ending empty string
 *              "a..b"       // embedded empty string
 *              "a.b."       // ending empty string (again)
 *              "a.b.1"      // each node must start with alpha
 *              "a.b\n.c"    // cr/lf NOT supported
 *              "a.b .c"     // spaces NOT supported
 *              "a.*.c"      // wildcards NOT supported
 *              ""
 * ```
 *
 * @param {string} key the key to validate.
 *
 * @param {assertionFn} check an assertion function (with context),
 * used to perform validation.
 * 
 * @private
 */
function checkProgrammaticStruct(key, check) {

  const errMsg = `fassetsKey: '${key}' is invalid (NOT a programmatic structure) ...`;

  // insure NO cr/lf
  check(key.match(/[\n\r]/)===null, `${errMsg} contains unsupported cr/lf`);

  // insure NO wildcards
  // ... this is covered through our regex (below) but we want a more explicit message
  check(key.match(/\*/)===null, `${errMsg} wildcards are not supported`);

  // analyze each node of the federated namespace
  const nodeKeys = key.split('.');
  nodeKeys.forEach( nodeKey => {
    check(nodeKey!=='', `${errMsg} contains invalid empty string`);
    check(nodeKey.match(/^[a-zA-Z][a-zA-Z0-9]*$/)!==null, `${errMsg} contains invalid chars, each node requires: alpha, followed by any number of alpha-numerics`);
  });

}
