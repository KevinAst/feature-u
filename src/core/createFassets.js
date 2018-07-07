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

  // PRIVATE: active features (used in isFeature())
  const _isFeature = { /* dynamically maintained ... SAMPLE:
    feature1: true,
    feature2: true,
    ... */
  };


  // PRIVATE: fassets resources (with meta data)
  //          - maintained via Feature.fassets.define/defineUse
  const _resources = { /* dynamically maintained ... SAMPLE:

    '{fassetsKey}': {                    // ex: 'action.openView' ... NO wildcards allowed
      val:             {whatever},       // resource value
      definingFeature: {featureName},    // the feature defining this resource
      defineUse:       boolean,          // directive used in defining this resource (false: define. true: defineUse)
    },
    ... */

  };


  // PRIVATE: a string blob of all resolved fassetKeys delimited by new-line
  //          - used by fassets.get() method to fetch all keys matching a regexp
  //          - maintained in feature expansion order - the same order fassets.get() exposes multiple entries
  //          - highly optimal technique, where a single regexp search is used per fassets.get(wildcard)
  //            ... and even that is cached!!
  var _fassetsKeysBlob = '';


  // PRIVATE: fassets usage contract (with meta data)
  //          - maintained via Feature.fassets.use
  const _usage = { /* dynamically maintained ... SAMPLE:

    '{useKey}': {                          // ex: 'MainPage.*.link' ... wildcards allowed
      required:         true/false,        // optionality (required takes precedence for multiple entries)
      validateFn:       func,              // validation function (based on registered keywords)
      definingFeatures: [{featureName}],   // what feature(s) defined this "use" contract
    },
    ... */

  };


  // PRIVATE: cache all fassets.get() searches, providing a significant optimization
  //          - especially in the context of React Component usage, 
  //            which repeats frequently within each UI render
  //          - this is feasable because fasset resources are pre-loaded up-front,
  //            and these set of resources will not change
  const _searchCache = { /* dynamically maintained ... SAMPLE:
                            'MainPage.*.link':      [...results],
                            'MainPage.*.body':      [],            // empty array for no results
                            'selector.currentView': result,
                            'selector.currentView': UNDEFINED,     // special UNDEFINED for no results (to distguish from entry NOT in cache)
                            ... */
  };


  // PRIVATE: special value used in cache to allow not-found (undefined) entry 
  //          to be cached in a recognizable way
  const UNDEFINED = 'UNDEFINED';


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
    get: (fassetsKey) => {
      // ??$$ TEST POINT ****************************************************************************************************************************************************************
      // use cached value (if exists)
      var result = _searchCache[fassetsKey];
      if (result) {
        return result===UNDEFINED ? undefined : result;
      }

      // resolve get() when not seen before
      if (containsWildCard(fassetsKey)) { // supplied fassetsKey has wildcards ... do regexp search

        // locate all keys matching the fassetsKey (with wildcards)
        // ... order is same as feature expansion order
        // ... empty array for NO match
        const keys = matchAll(_fassetsKeysBlob, createRegExp(fassetsKey));
        
        // convert keys to actual resource values
        result = keys.map( key => _resources[key].val );
      }
      else { // supplied fassetsKey has NO wildcards ... dereference directly

        // convert dereferenced resource (when found) to actual resource value
        // ... undefined for NOT found
        result = _resources[fassetsKey] ? _resources[fassetsKey].val : undefined;
      }

      // maintain cache
      _searchCache[fassetsKey] = result===undefined ? UNDEFINED : result;

      // that's all folks
      return result;
    },

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
        };

        // retain our key in our string blob (delimited by new-line)
        _fassetsKeysBlob += resourceKey + '\n';


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
          required,                          // optionality (required takes precedence for multiple entries)
          validateFn,                        // validation function (based on registered keywords)
          definingFeatures: [feature.name],  // what feature(s) defined this "use" contract
        };
      }

      // logf console.log(`_usage['${useKey}']:`, _usage[useKey]);

    });

  } // HELP_EMACS
  });


  //*---------------------------------------------------------------------------
  // Stage 3: VALIDATION: Apply client-supplied validation constraints
  //          >> this is done in our third stage, now that both resources and
  //             usage contracts are in place (with it's validation constraints)
  //          A: Apply client-supplied validation constraints
  //             ... defined in the "use" directive
  //          B: Insure "defineUse" resources match at least ONE usage contract
  //             ... this is a fail-fast technique, quickly giving problem insight
  //                 to the client
  //*---------------------------------------------------------------------------

  // ??$$ TEST POINT ****************************************************************************************************************************************************************

  //***
  // A: Apply client-supplied validation constraints
  //    ... defined in the "use" directive
  //***

  // ??$$ ** apply client-supplied validation constraints
  // iterate over all resources
/* ?? L8TR
  for (const fassetsKey in _resources) {
    const resource = _resources[fassetsKey];

    // iterate over all "matching" usage contracts
    for (const useKey in _usage) {
      const usage = _usage[useKey];

      // if fassetsKey MATCHES useKey
      // >>> ?? if (regexpTest(fassetsKey, createRegExp(useKey)) // ?? I think should work, regardless if useKey has wildcards or not
      {
        // ?? apply client-supplied validation constraints
        // ?? requires full fassetValidations.js -and- testing
        // NOTE: this also implicitly tests conflicts between overlapping usage contracts
      }
    }
  }

  // ??$$ ** validate optionality **
  // iterate over all usage contracts
  for (const useKey in _usage) {
    const usage = _usage[useKey];

    // when usage contract specifies an optionality of required, insure at least resource matches
    if (usage.required) {
      // ?? get(useKey); // ?? requires get implementation
      // ?? must be NOT undefined, or if array .length>0
    }
  }


  //***
  // B: Insure "defineUse" resources match at least ONE usage contract
  //    ... this is a fail-fast technique, quickly giving problem insight to the client
  //***

  // iterate over all "defineUse" resources
  for (const fassetsKey in _resources) {
    const resource = _resources[fassetsKey];
    if (resource.defineUse) {

      // key must match at least one _usage entry
      // ... because "defineUse" directives are intended to fulfill a use contract

      // iterate over all usage contracts
      for (const useKey in _usage) {
        const usage = _usage[useKey];

        // ?? check ... fassetsKey matches at least one _usage.useKey
        //    >>> fassetsKey.??
        // ?? gory set var and break ... employing wildcard stuff in prior step
        //    ?? alternative NONE WORKS
        //       1) forEach filter ... but must convert to array and it too would be messy
        //       2) is it possible for regEx to operate on an array <<< I don't think so

      }
    }
  }

??? L8TR */

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



//******************************************************************************
//******************************************************************************
//* Internal Utility Functions
//******************************************************************************
//******************************************************************************

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

  const regexpAllowingWildcards    = /^[a-zA-Z\*][a-zA-Z0-9\*]*$/;
  const regexpDisallowingWildcards = /^[a-zA-Z][a-zA-Z0-9]*$/;
  var   regexpCheck                = regexpAllowingWildcards;

  // insure NO cr/lf
  check(!isMatch(key, /[\n\r]/), `${errMsg} contains unsupported cr/lf`);

  // validate wildcards, per parameter
  // ... must also accomodate in our regexp check (below) but this check provides a more explicit message
  if (!allowWildcards) {
    check(!isMatch(key, /\*/), `${errMsg} wildcards are not supported`);
    regexpCheck = regexpDisallowingWildcards;
  }

  // analyze each node of the federated namespace
  const nodeKeys = key.split('.');
  nodeKeys.forEach( nodeKey => {
    check(nodeKey!=='', `${errMsg} contains invalid empty string`);
    check(isMatch(nodeKey, regexpCheck),
          `${errMsg} contains invalid chars, each node requires: alpha, followed by any number of alpha-numerics`);
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

/**
 * Return an indicator as to whether fassets-based wildcards are
 * present in supplied str.
 *
 * @param {string} str the string to check for wildcards.
 *
 * @return {boolean} true: wildcards present, false: no wildcards
 * detected
 * 
 * @private
 */
// ?? TESTED INDIRECTLY
function containsWildCard(str) {
  // check for fassets-based wildcards (only *)
  return str.includes('*'); // ?? question: see if transpiled code transforms to indexOf() !== -1 ... if not, a) use indexOf() b) require polyfill stratagy
}


/**
 * Perform a regular expression search of the supplied string using
 * the regexp, returning all matches.
 *
 * @param {string} str the string to search.
 *
 * @param {RegExp} regexp the regular expression to match.
 *
 * @return {string[]} a string array of all matches, empty array for
 * no match.
 * 
 * @private
 */
// ?? TESTED INDIRECTLY ??$$ unit test this and remove this comment
function matchAll(str, regexp) {
  return str.match(regexp) || []; // simple pass-through -BUT- convert null to empty array
}


/**
 * Return an indicator as to whether the supplied regexp has a match
 * in str.
 *
 * @param {string} str the string to search.
 *
 * @param {RegExp} regexp the regular expression to match.
 *
 * @return {boolean} true: match, false: no match
 * 
 * @private
 */
// ?? TESTED INDIRECTLY ??$$ unit test this and remove this comment
function isMatch(str, regexp) {
  return regexp.test(str); // simple pass-through
}


// regexp cache used by createRegExp()
//  - optimizes repeated iteration in createFassets() "Stage 3: VALIDATION"
//  - NOTE: ?? to free up space, this cache can be deleted at end of createFassets()
const _regexpCache = { /* dynamically maintained ... SAMPLE:
  'MainPage.*.link':      /^MainPage\..*\.link$/gm,
  'selector.currentView': /^selector\.currentView$/gm,
  ... */
};

/**
 * Creates a fassets-specific regular expression from the supplied
 * pattern string, employing all the heuristics required by fassets
 * usage.
 *
 * NOTE: This has been manually tested to work in both our single and
 *       multi-line cases (i.e. our blob). ??$$ unit test this and remove this comment
 *
 * @param {string} pattern the string to seed the regexp from.
 *
 * @return {RegExp} the newly created regexp.
 * 
 * @private
 */
function createRegExp(pattern) {

  var wrkStr = pattern;

  // utilize _regexpCache
  var regexp = _regexpCache[pattern];
  if (regexp) {
    return regexp;
  }

  // convert all federated namespace delimiters (DOT ".") to their literal representation
  wrkStr = wrkStr.replace(/\./g, '\\.');

  // convert all fasset wildcards ("*") to their RegExp equilivant (".*")
  wrkStr = wrkStr.replace(/\*/g, '.*');

  // start/end anchors are required to match entire entry
  // ... NOTE: the user is in control (can disable by placing * at beginning or end)
  wrkStr = `^${wrkStr}$`;

  // construct the RegExp
  // ... in support of multi-line blob, we require modifiers (g: global, m: multiline)
  //      NOTE: This has been manually tested to work in both our single and
  //      multi-line cases (i.e. our blob).
  regexp = new RegExp(wrkStr, 'gm');

  // maintain cache
  _regexpCache[pattern] = regexp;

  // that's all folks
  return regexp;
}
