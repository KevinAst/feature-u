import verify             from '../util/verify';
import isString           from 'lodash.isstring';
import isPlainObject      from 'lodash.isplainobject';
import isFunction         from 'lodash.isfunction';
import fassetValidations  from './fassetValidations';

// ?? resolve all logfs (below) and add more

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
      regex:            {from_useKey},     // the resolved regex for this useKey (null when useKey has NO wildcards) ?? prob OBSOLETE
      required:         true/false,        // optionality (required takes precedence for multiple entries)
      validateFn:       func,              // validation function (based on registered keywords)
      definingFeatures: [{featureName}],   // what feature(s) defined this "use" contract
      resolution:       resourceVal,       // pre-resolved resource values matching useKey ?? OBSOLETE - handled with get() cache
                                           // ... wrapped in [] when wildcards in use
                                           // ... optionality, validation, and order applied (in later stage)
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
  // OK: We are now ready to interpret/accumulate all feature fassets!!
  //     - This requires multiple passes through our features.
  //       ... As a simple example:
  //           We cannot validate the usage contracts (found in fassets.use),
  //           until all resources are accumulated (via fassets.define/defineUse)
  //     - The comment blocks (below) breaks the process down in "stages".
  //       ... Think of the mighty Saturn V rocket, which powered the Apollo
  //           mission to the moon!
  //       ... OK: I know this is corny, but geeks have to have some fun :-)
  //     - Hopefully, this provides insight as to why there are multiple passes,
  //       and allows you to follow the code more intuitively.
  //*---------------------------------------------------------------------------


  //*---------------------------------------------------------------------------
  // T Minus 2: Maintain our "active features" indicator
  //            - in support of: fassets.isFeature()
  //*---------------------------------------------------------------------------

  activeFeatures.forEach( feature => {
    _isFeature[feature.name] = true;
  });


  //*---------------------------------------------------------------------------
  // T Minus 1: Validate the basic structure of all Feature.fassets
  //            - including the fassets directives (define/defineUse/use)
  //*---------------------------------------------------------------------------

  // filter features with the fassets aspect
  activeFeatures.filter(  feature => feature.fassets !== undefined )
                .forEach( feature => {
  { // HELP_EMACS: extra bracket - sorry to say, emacs web-mode can't handle indentation with nested filter/forEach (above) :-(

    const check = verify.prefix(`Feature.name: '${feature.name}' ... ERROR in "fassets" aspect: `);

    const fassets = feature.fassets;

    // fassets must be an object literal
    check(isPlainObject(fassets), `the fassets aspect MUST BE an object literal`);

    // insure all fassets directives are recognized
    const {define, use, defineUse, ...unknownDirectives} = fassets;
    const unknownDirectiveKeys = Object.keys(unknownDirectives);
    check(unknownDirectiveKeys.length === 0,
          `unrecognized fassets directive(s): ${unknownDirectiveKeys} ... expecting only: define/use/defineUse`);

    // verify at least ONE fassets directive is supplied
    // AI: We may want to relax this "empty" check
    check(define!==undefined || use!==undefined || defineUse!==undefined,
          `the fassets aspect is empty (at least one directive needed - define/use/defineUse)`);

  } // HELP_EMACS
  });


  //*---------------------------------------------------------------------------
  // Blast Off: Yeee Haaaa!!
  //            - We are now off-the-ground
  //*---------------------------------------------------------------------------


  //*---------------------------------------------------------------------------
  // Stage 1: Interpret fasset define/defineUse directive, accumulating resources
  //         - via fassets.define/defineUse directives
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
  //           * NOTE: resource validation is postponed to subsequent stage
  //                   ... because we need BOTH _resources and _usage
  //*---------------------------------------------------------------------------

  // filter features with the fassets aspect
  activeFeatures.filter(  feature => feature.fassets !== undefined )
                .forEach( feature => {
  { // HELP_EMACS: extra bracket - sorry to say, emacs web-mode can't handle indentation with nested filter/forEach (above) :-(

    const check = verify.prefix(`Feature.name: '${feature.name}' ... ERROR in "fassets" aspect, "define/defineUse" directive: `);

    const fassets = feature.fassets;

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

      // verify at least ONE definition is supplied
      // AI: We may want to relax this "empty" check
      const resourceKeys = Object.keys(defineDirective);
      check(resourceKeys.length > 0, `the ${directiveKey} directive is empty (at least one definition is needed)`);

      // iterpret each resource being defined
      // ... we attempt to process in same order defined within the fassets.define object literal
      //     - ditto discussion (above) on processing order
      resourceKeys.forEach( resourceKey => {
        const resource = defineDirective[resourceKey];

        // validate resource key
        // NOTE: resource validation is postponed to subsequent stage
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
  // Stage 2: Interpret fasset use directive, accumulating usage contract
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
  //                         the resource validation (subsequent stage).
  //*---------------------------------------------------------------------------

  // filter features with the "fassets" aspect -AND- "use" directive
  activeFeatures.filter(  feature => feature.fassets !== undefined && feature.fassets.use !== undefined )
                .forEach( feature => {
  { // HELP_EMACS: extra bracket - sorry to say, emacs web-mode can't handle indentation with nested filter/forEach (above) :-(

    const check = verify.prefix(`Feature.name: '${feature.name}' ... ERROR in "fassets" aspect, "use" directive: `);

    const useDirective = feature.fassets.use;

    // verify the use directive is an array
    check(Array.isArray(useDirective), `the use directive MUST BE an array`);

    // verify at least ONE usage contract is supplied
    // AI: We may want to relax this "empty" check
    check(useDirective.length > 0, `the use directive is empty (at least one usage contract is needed`);

    // process each "use" contract
    useDirective.forEach( useEntry => {

      // decipher the useEntry, validating, and applying default semantics
      const {useKey, required, validateFn} = decipherDefaultedUseEntry(useEntry, check);

      // logf `processing fassets.use directive: '${useEntry}'\n:`, {useKey, required, validateFn}

      // maintain each use contract in our _usage object
      // NOTE: The uniqueness of "use" keys is NOT a requirement
      //       IN OTHER WORDS: multiple features can specify the same (or overlapping) "use" keys
      //       HOWEVER, for duplicate keys: 
      //       - the optionality can vary (required simply takes precedence)
      //       - the expected data types MUST be the same
      //         NOTE: For overlapping wildcard items, there is an opportunity to have
      //               multiple expected types.  This will be caught (indirectly) through
      //               the resource validation (subsequent stage).
      if (_usage[useKey]) { // duplicate entry (from other features)
        // accumulate necessary items
        _usage[useKey].required = _usage[useKey].required || required; // required: true takes precedence
        _usage[useKey].definingFeatures.push(feature.name);

        // insure accumulation is possible
        check(_usage[useKey].validateFn===validateFn, `cannot accumulate duplicate 'use' contract from multiple features: [${_usage[useKey].definingFeatures}] ... the type validateFns are NOT the same`);
      }
      else { // initial entry (first time introduced)
        _usage[useKey] = {                   // ex: 'MainPage.*.link' ... wildcards allowed
          regex: 'L8TR??',                   // the resolved regex for this useKey (null when useKey has NO wildcards) ?? prob OBSOLETE
          required,                          // optionality (required takes precedence for multiple entries)
          validateFn,                        // validation function (based on registered keywords)
          definingFeatures: [feature.name],  // what feature(s) defined this "use" contract
          resolution: 'resourceVal??',       // pre-resolved resource values matching useKey ?? OBSOLETE - handled with get() cache
                                             // ... wrapped in [] when wildcards in use
                                             // ... optionality, validation, and order applied (in later stage)
        };
      }

      // logf console.log(`_usage['${useKey}']:`, _usage[useKey]);

    });

  } // HELP_EMACS
  });


  //*---------------------------------------------------------------------------
  // Stage 3: Validate resources
  //          >> this is done in our third stage, now that both resources and
  //             usage contracts (with it's validation constraints) are in place
  //          A: Apply client-supplied validation constraints
  //             ... defined in the "use" directive
  //          B: Insure "defineUse" resources match at least ONE usage contract
  //             ... this is a fail-fast technique, quickly giving problem insight
  //                 to the client
  //*---------------------------------------------------------------------------

  // ??$$ TEST POINT ****************************************************************************************************************************************************************

  // A: Apply client-supplied validation constraints
  //    ... defined in the "use" directive
  //        - for each _resources entry
  //          * for each "matching" _usage entry
  //            - validate
  //              * optionality
  //              * expected data types

  // ??

  // B: Insure "defineUse" resources match at least ONE usage contract
  //    ... this is a fail-fast technique, quickly giving problem insight to the client
  //        - for each _resources entry of 'defineUse' directive
  //          * key must match at least one _usage entry
  //            ... because "defineUse" directives are intended to fulfill a use contract

  // ??


  //*---------------------------------------------------------------------------
  // OK: Our Saturn V is "now in orbit"!!!
  //     - Ready for a trajectory to the moon
  //     - INTERPRETATION: the fassets object is ready for:
  //                       - client consumption
  //                       - and seeding the fassetsConnect() function
  //*---------------------------------------------------------------------------

  // logf: summarize _fassets resources (sorted), usage contracts (sorted), and json _fassets object (normalized) ... could be too much NOT SURE

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
 *   - valid:      "a"
 *                 "a1"
 *                 "a1.b"
 *                 "a1.b2.c"
 *   - invalid:    ""           // empty string
 *                 "123"        // must start with alpha
 *                 ".a"         // beginning empty string
 *                 "a."         // ending empty string
 *                 "a..b"       // embedded empty string
 *                 "a.b."       // ending empty string (again)
 *                 "a.b.1"      // each node must start with alpha
 *                 "a.b\n.c"    // cr/lf NOT supported
 *                 "a.b .c"     // spaces NOT supported
 *   - wildcards:
 *                 "a.*.c"      // depends on allowWildcards parameter
 *                 "*a.*.c*"    // depends on allowWildcards parameter
 * ```
 *
 * @param {string} key the key to validate.
 *
 * @param {assertionFn} check an assertion function (with context),
 * used to perform validation.
 *
 * @param {boolean} allowWildcards an indicator as to whether to 
 * allow wildcards (true) or not (false DEFAULT).
 * 
 * @private
 */
function checkProgrammaticStruct(key, check, allowWildcards=false) {

  const errMsg = `fassetsKey: '${key}' is invalid (NOT a programmatic structure) ...`;

  const regexAllowingWildcards    = /^[a-zA-Z\*][a-zA-Z0-9\*]*$/;
  const regexDisallowingWildcards = /^[a-zA-Z][a-zA-Z0-9]*$/;
  var   regexCheck = regexAllowingWildcards;

  // insure NO cr/lf
  check(key.match(/[\n\r]/)===null, `${errMsg} contains unsupported cr/lf`);

  // validate wildcards, per parameter
  // ... must also accomodate in our regex check (below) but this check provides a more explicit message
  if (!allowWildcards) {
    check(key.match(/\*/)===null, `${errMsg} wildcards are not supported`);
    regexCheck = regexDisallowingWildcards;
  }

  // analyze each node of the federated namespace
  const nodeKeys = key.split('.');
  nodeKeys.forEach( nodeKey => {
    check(nodeKey!=='', `${errMsg} contains invalid empty string`);
    check(nodeKey.match(regexCheck)!==null, `${errMsg} contains invalid chars, each node requires: alpha, followed by any number of alpha-numerics`);
  });

}



/**
 * An internal function that deciphers the supplied useEntry,
 * validating, applying default semantics, and interpreting the two
 * options:
 *
 * - a string
 * - a string/options in a two element array
 *
 * @param {string||[string,options]} useEntry the use entry to
 * decipher.
 *
 * @param {assertionFn} check an assertion function (with context),
 * used to perform validation.
 *
 * @return defaulted object with following entries: {useKey, required, validationFn}
 * 
 * @private
 */
function decipherDefaultedUseEntry(useEntry, check) {

  // decipher various formats of useEntry
  const use = {};
  if (isString(useEntry)) {
    use.useKey     = useEntry;
    use.required   = true;
    use.validateFn = fassetValidations.any;
  }
  else if (Array.isArray(useEntry)) {
    check(useEntry.length === 2, `"use" entry must either be a string or a string/options in a two element array ... incorrect array size: ${useEntry.length}`);

    const [useKey, useOptions] = useEntry;

    check(isString(useKey),          `"use" entry with options (two element array), first element is NOT a string`);
    check(isPlainObject(useOptions), `"use" entry with options (two element array), second element is NOT an object`);

    const {required = true, type:validateFn = fassetValidations.any, ...unknownOptions} = useOptions;

    const unknownOptionsKeys = Object.keys(unknownOptions);
    check(unknownOptionsKeys.length === 0, `"use" entry with options (two element array), options have unrecognized entries: ${unknownOptionsKeys} ... expecting only: required/type`);

    use.useKey     = useKey;
    use.required   = required;
    use.validateFn = validateFn;
  }
  else {
    // unconditional error
    check(false, `"use" entry must either be a string or a string/options in a two element array`);
  }

  // validate individual items
  // ... use.useKey
  checkProgrammaticStruct(use.useKey, check, true); // allowWildcards
  // ... use.required
  check(use.required===true || use.required===false, `"use" entry with options ('${use.useKey}'), 'required' entry must be true/false`);
  // ... use.validateFn
  check(isFunction(use.validateFn), `"use" entry with options ('${use.useKey}'), 'type' entry must be a fassetValidationFn`);

  // that's all folks
  return use;
}
