import verify             from '../util/verify';
import isString           from 'lodash.isstring';
import isPlainObject      from 'lodash.isplainobject';
import isFunction         from 'lodash.isfunction';
import fassetValidations  from './fassetValidations';
import {MyObj}            from '../util/mySpace';
import logf               from '../util/logf';

/**
 * An internal creator of the {{book.api.FassetsObject}}.  Accumulates
 * the {{book.api.fassetsAspect}} promoted by the set of supplied
 * `activeFeatures`.
 *
 * @param {Feature[]} activeFeatures the active features from which we
 * accumulate feature assets through the {{book.api.fassetsAspect$}}.
 *
 * @return {Fassets} a new Fassets object (promoted by launchApp()).
 * 
 * @private
 * 
 * @function createFassets
 */
export default function createFassets(activeFeatures) {

  // PRIVATE: active features (used in hasFeature())
  const _hasFeature = { /* dynamically maintained ... SAMPLE:
    feature1: true,
    feature2: true,
    ... */
  };


  // PRIVATE: fassets resources (with meta data)
  //          - defined via Feature.fassets.define/defineUse
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
  //          - maintained in feature expansion order
  //            ... the same order fassets.get() exposes multiple entries
  //          - highly optimal technique, where a single regexp search 
  //            is used per fassets.get(wildcard)
  //            ... for even better performance, get() also caches it's results!!
  var _fassetsKeysBlob = '';


  // PRIVATE: fassets usage contract (with meta data)
  //          - defined via Feature.fassets.use
  const _usage = { /* dynamically maintained ... SAMPLE:

    '{useKey}': {                          // ex: 'MainPage.*.link' ... wildcards allowed
      usingWildCard:    true/false         // does this usage contract employ wildcards?
      required:         true/false,        // optionality (required takes precedence for multiple entries)
      validateFn:       func,              // validation function (based on registered keywords)
      definingFeatures: [{featureName}],   // what feature(s) defined this "use" contract
    },
    ... */

  };


  // PRIVATE: cache all fassets.get() searches, providing a significant optimization
  //          - especially in the context of React Component usage, 
  //            which repeats frequently within each UI render
  //          - this is feasible because fasset resources are pre-loaded up-front,
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


  /**
   * @typedef {Object} Fassets
   *
   * The `fassets` object _(emitted from {{book.api.launchApp}})_ is
   * an accumulation of **public feature assets gathered from all
   * features**.  It facilitates {{book.guide.crossCom}} by promoting
   * the public resources of any given feature.
   * 
   * **SideBar**: The term `fassets` is a play on words.  While it is
   * pronounced "facet" _and is loosely related to this term_, it is
   * spelled fassets (i.e. feature assets).
   * 
   * There are 3 different ways to reference the resources contained
   * in the `fassets` object:
   *
   * 1. You may directly dereference them. As an example, an
   *    '`action.openView`' resource can be dereferenced as follows:
   *
   *    ```js
   *    fassets.action.openView('mainView');
   *    ```
   * 
   * 2. You may use the {{book.api.Fassets_get}} method, which
   *    can collect multiple resources (using {{book.guide.crossCom_wildcards}}).
   * 
   * 3. Your UI components may indirectly access `fassets` resources
   *    through the {{book.api.withFassets}} Higher-order Component
   *    (HoC).
   * 
   * **SideBar**: There are several ways to get a handle to the
   * `fassets` object _(see
   * {{book.guide.crossCom_obtainingFassetsObject}})_.
   * 
   * For more information, please refer to {{book.guide.crossCom}} and
   * {{book.guide.crossCom_fassetsBasics}}.
   */
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

    /**
     * Get (i.e. fetch) the resource(s) corresponding to the supplied
     * `fassetsKey`.
     * 
     * The `fassets.get()` method is an alternative to directly
     * dereferencing the `fassets` object ... the advantage being:
     * 
     *  1. it can accumulate a series of resources (when
     *     {{book.guide.crossCom_wildcards}} are used)
     * 
     *  2. and it can more gracefully return undefined at any level
     *     within the federated namespace path
     * 
     * Regarding the `fassetsKey`:
     * 
     * - It is case-sensitive _(as are the defined resources)_.
     * 
     * - It may contain {{book.guide.crossCom_wildcards}} (`*`), resulting in a
     *   multiple resources being returned (a resource array), matching the
     *   supplied pattern
     * 
     * - Matches are restricted to the actual fassetKeys registered through
     *   the {{book.api.fassetsAspect}} `define`/`defineUse` directives.  In
     *   other words, the matching algorithm will **not** drill into the
     *   resource itself (assuming it is an object with depth).
     * 
     * - The special **dot** keyword (`'.'`) will return the fassets
     *   object itself _(in the same tradition as "current directory")_.
     *
     * - `'@withKeys'`:
     * 
     *   In some cases, you may wish to know the corresponding
     *   `fassetsKey` of the returned resource.  This is especially true
     *   when multiple resources are returned _(using wildcards)_.  As
     *   an example, JSX requires unique keys for array injections _(the
     *   `fassetsKey` is a prime candidate for this, since it is
     *   guaranteed to be unique)_.
     * 
     *   To accomplish this, simply suffix the `fassetsKey` with the
     *   keyword: `'@withKeys'`.  When this is encountered, the
     *   resource returned is a two-element array: `[fassetsKey,
     *   resource]`.  _**SideBar**: We use this suffix technique (as
     *   opposed to an additional parameter) to be consistent with how
     *   {{book.api.withFassets}} operates._
     *
     * **SideBar**: The `fassets.get()` method is the basis of the
     * {{book.api.withFassets}} Higher-order Component (HoC).
     *
     * @param {string} fassetsKey the key of the resource(s) to fetch.
     * This may include wildcards (`*`), as well as the `'@withKeys'`
     * suffix _(see discussion above)_.
     *
     * @return {resource|resource[]} the requested fassets resource(s).
     *
     * - **without wildcards**, a single resource is returned
     *   _(`undefined` for none)_.
     *
     *   ```js
     *   'a.b.c':          abcResource
     *   'a.b.c@withKeys': ['a.b.c', abcResource]
     *   ```
     *
     * - **with wildcards**, the return is a resource array, in order
     *   of feature expansion _(empty array for none)_.
     *
     *   ```js
     *   'a.*':          [ab1Resource, ab2Resource, ...]
     *   'a.*@withKeys': [ ['a.b1', ab1Resource], ['a.b2', ab2Resource], ... ]
     *   ```
     * 
     * @method Fassets.get
     */
    get: (fassetsKey) => {

      // validate parameters
      const check = verify.prefix('fassets.get() parameter violation: ');

      check(fassetsKey,           'fassetsKey is required');
      check(isString(fassetsKey), `fassetsKey must be a string ... ${fassetsKey}`);

      // interpret optional @directive keywords suffixed in fassetsKey
      const [raw_fassetsKey, ...directives] = fassetsKey.split('@');

      check(raw_fassetsKey, `fassetsKey: '${fassetsKey}' cannot contain only directives`);

      const { withKeys=false } = directives.reduce( (accum, directive) => {
        if (directive === 'withKeys') { // @withKeys directive
          accum.withKeys = true;
        }
        else {
          check(false, `fassetsKey: '${fassetsKey}' contains an unrecognized keyword directive: '@${directive}'`);
        }
        return accum;
      }, {});


      // use cached value (when available)
      // ... NOTE: for cache purposes, fassetsKey correctly includes any @directives
      //           (which can alter the result)
      var result = _searchCache[fassetsKey];
      if (result) {
        return result===UNDEFINED ? undefined : result;
      }

      // resolve resource of supplied key
      const resolveResource = (key) => {
        const resource = key==='.'
                             ? _fassets // special DOT keyword ... return self (i.e. fassets)
                             : _resources[key]
                                 ? _resources[key].val // resource found
                                 : undefined;          // resource not found
        return withKeys // interpret @withKeys directive
                 ? [key, resource] // ... [fassetsKey, resource]
                 : resource;       // ... resource
      };

      // resolve get() when not seen before
      if (containsWildCard(raw_fassetsKey)) { // supplied fassetsKey has wildcards ... do regexp search

        // locate all keys matching the fassetsKey (with wildcards)
        // ... order is same as feature expansion order
        // ... empty array for NO match
        const keys = matchAll(_fassetsKeysBlob, createRegExp(raw_fassetsKey));
        
        // convert keys to actual resource values
        result = keys.map( key => resolveResource(key) );
      }
      else { // supplied fassetsKey has NO wildcards ... dereference directly

        // convert dereferenced resource (when found) to actual resource value
        // ... undefined for NOT found
        result = resolveResource(raw_fassetsKey);
      }

      // maintain cache
      // ... NOTE: for cache purposes, fassetsKey correctly includes any @directives
      //           (which can alter the result)
      _searchCache[fassetsKey] = result===undefined ? UNDEFINED : result;

      // that's all folks
      return result;
    },


    /**
     * Return an indicator as to whether the supplied feature is
     * active or not.
     *
     * **Note**: As an alternative to using this method, you can
     * conditionally reason over the existence of "well-known fasset
     * resources" specific to a given feature.
     *
     * @param {string} featureName the name of the feature to check.
     *
     * @return {boolean} **true**: is active, **false**: is not active
     * (or doesn't exist).
     * 
     * @method Fassets.hasFeature
     */
    hasFeature: (featureName) => {
      // validate parameters
      const check = verify.prefix('fassets.hasFeature() parameter violation: ');

      check(featureName,            'featureName is required');
      check(isString(featureName),  'featureName must be a string');

      // return indicator
      return _hasFeature[featureName] ? true : false;
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
  // T Minus 3: Insure client code is no longer using the obsolete publicFace
  //            built-in aspect
  //            - OBSOLETE as of feature-u@1
  //            - NOTE: publicFace is still registered as a builtin for the
  //                    sole purpose of generating more specific error
  //*---------------------------------------------------------------------------

  const featureNamesWithObsolete_publicFace = // locate features still using publicFace
    activeFeatures.filter(  feature => feature.publicFace !== undefined )
                  .map( feature => feature.name );
  if (featureNamesWithObsolete_publicFace.length > 0) {
    verify(false, `The OBSOLETE Feature.publicFace is still in-use in the following features: ${featureNamesWithObsolete_publicFace}\n` + 
                  '... as of feature-u@1 the publicFace builtin aspect has been replaced with fassets\n' +
                  '... see: https://feature-u.js.org/cur/history.html#v1_0_0');
  }


  //*---------------------------------------------------------------------------
  // T Minus 2: Maintain our "active features" indicator
  //            - in support of: fassets.hasFeature()
  //*---------------------------------------------------------------------------

  activeFeatures.forEach( feature => {
    _hasFeature[feature.name] = true;
  });


  //*---------------------------------------------------------------------------
  // T Minus 1: Validate the basic structure of all Feature.fassets aspects
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
    const {define, use, defineUse, ...unknownDirectives} = fassets; // eslint-disable-line no-unused-vars
    const unknownDirectiveKeys = Object.keys(unknownDirectives);
    check(unknownDirectiveKeys.length === 0,
          `unrecognized fassets directive(s): ${unknownDirectiveKeys} ... expecting only: define/use/defineUse`);

    // verify at least ONE fassets directive is supplied
    // ... potential to relax this "empty" check
    // RELAXED: check(define!==undefined || use!==undefined || defineUse!==undefined,
    //                `the fassets aspect is empty (at least one directive needed - define/use/defineUse)`);

  } // HELP_EMACS
  });


  //*---------------------------------------------------------------------------
  // Blast Off: Yeee Haaaa!!
  //            - We are now off-the-ground
  //*---------------------------------------------------------------------------


  //*---------------------------------------------------------------------------
  // Stage 1: Interpret fasset "define"/"defineUse" directive, accumulating resources
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
  { // HELP_EMACS

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
      // ... potential to relax this "empty" check
      const resourceKeys = Object.keys(defineDirective);
      // RELAXED: check(resourceKeys.length > 0, `the ${directiveKey} directive is empty (at least one definition is needed)`);

      // iterpret each resource being defined
      // ... we attempt to process in same order defined within the fassets.define object literal
      //     - ditto discussion (above) on processing order
      resourceKeys.forEach( resourceKey => {
        const resource = defineDirective[resourceKey];

        // validate resource key
        // NOTE: resource validation is postponed to subsequent stage
        //       ... because we need BOTH _resources and _usage

        // ... insure it will not overwrite our reserved fasset methods (get/hasFeature)
        check(resourceKey!=='get' && resourceKey!=='hasFeature', `fassets.${directiveKey}.'${resourceKey}' is a reserved word`);

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
  
  // purge last cr/lf from _fassetsKeysBlob to prevent an open wildcard '*'
  // from returning a rogue empty string key ('')
  // ... causing an internal run-time error
  if (_fassetsKeysBlob !== '') {
    _fassetsKeysBlob = _fassetsKeysBlob.slice(0, -1);
  }


  //*---------------------------------------------------------------------------
  // Stage 2: Interpret fasset "use" directive, accumulating usage contract
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
  { // HELP_EMACS

    const check = verify.prefix(`Feature.name: '${feature.name}' ... ERROR in "fassets" aspect, "use" directive: `);

    const useDirective = feature.fassets.use;

    // verify the use directive is an array
    check(Array.isArray(useDirective), `the use directive MUST BE an array`);

    // verify at least ONE usage contract is supplied
    // ... potential to relax this "empty" check
    // RELAXED: check(useDirective.length > 0, `the use directive is empty (at least one usage contract is needed`);

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
          usingWildCard:    containsWildCard(useKey), // does this usage contract employ wildcards?
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

  // accumulator of ALL validation errors, to show all at once
  const validationErrs = [];

  //***
  // A: Apply client-supplied validation constraints
  //    ... defined in the "use" directive
  //***

  // Feature.fassets.use: "type" validation
  MyObj.entries(_resources) // resource iteration
       .forEach( ([fassetsKey, resource]) => {

    MyObj.entries(_usage)   // "matching" usage contract iteration
         .filter(  ([useKey, usage]) => isMatch(fassetsKey, createRegExp(useKey)) )
         .forEach( ([useKey, usage]) => {
    { // HELP_EMACS

      // apply client-supplied validation constraints
      // NOTE: This also indirectly tests conflicts between overlapping usage contracts
      //       ... i.e. two usage contracts (with varying wildcards) that both match an
      //                entry can in fact specify different type checks
      const errStr = usage.validateFn(resource.val);
      if (errStr) {
        validationErrs.push(`VALIDATION ERROR in resource: '${fassetsKey}', expecting: ${errStr} ... resource defined in Feature: '${resource.definingFeature}', usage contract '${useKey}' found in Feature: '${usage.definingFeatures}'`);
        // EX: VALIDATION ERROR in resource: 'foo1', expecting: boolean ... resource defined in Feature: 'feature1', usage contract 'foo*' found in Feature: 'feature2'
      }

    } // HELP_EMACS
    });

  });
  
  // Feature.fassets.use: "required" validation
  MyObj.entries(_usage) // usage contract iteration
       .forEach( ([useKey, usage]) => {
  { // HELP_EMACS

    // when usage is contractually required, insure at least one matching resource is available
    if (usage.required) {
      const resource = _fassets.get(useKey);
      if (resource === undefined ||                         // resource NOT found
          (usage.usingWildCard && resource.length === 0)) { // empty wildcard usage
        validationErrs.push(`REQUIRED RESOURCE NOT FOUND, usage contract '${useKey}' (found in Feature: '${usage.definingFeatures}') specifies a REQUIRED resource, but NO matches were found`);
        // EX: REQUIRED RESOURCE NOT FOUND, usage contract '*a.*.c*' (found in Feature: 'featureTest') specifies a REQUIRED resource, but NO matches were found
      }
    }

  } // HELP_EMACS
  });


  //***
  // B: Insure "defineUse" resources match at least ONE usage contract
  //    ... this is a fail-fast technique, quickly giving problem insight to the client
  //***

  MyObj.entries(_resources) // defineUse resource iteration
       .filter(  ([fassetsKey, resource]) => resource.defineUse )
       .forEach( ([fassetsKey, definedUseResource]) => {
  { // HELP_EMACS

    // fassetsKey must match at least one usage entry
    // ... because "defineUse" directives are intended to fulfill a use contract
    var matchFound = false;
    for (const useKey in _usage) { // usage contract iteration
      if (isMatch(fassetsKey, createRegExp(useKey))) {
        matchFound = true;
        break;
      }
    }
    // ERROR, when NO usage contracts match defineUse
    if (!matchFound) {
      validationErrs.push(`ERROR defineUse '${fassetsKey}' directive MUST match at least one usage contract, but does NOT ... is this misspelled? (found in Feature: '${definedUseResource.definingFeature}')`);
      // EX: ERROR defineUse 'wow.bbb' directive MUST match at least one usage contract, but does NOT ... is this misspelled? (found in Feature: 'feature1')
    }

  } // HELP_EMACS
  });


  //***
  //*** expose ALL validation issues in ONE Error
  //***

  if (validationErrs.length===1) {    // for a single error, just spit it out
    verify(false, validationErrs[0]); 
  }
  else if (validationErrs.length>1) { // for multiple errors, combine all of them with a preamble
    verify(false, 
           `${validationErrs.length} validation errors were found during Feature.fasset resource accumulation:\n` +
           validationErrs.join('\n'));
  }


  //*---------------------------------------------------------------------------
  // OK: Our Saturn V is "now in orbit"!!!
  //     - Ready for a trajectory to the moon
  //     - INTERPRETATION: the fassets object is ready for:
  //                       - client consumption
  //                       - and seeding the fassetsConnect() function
  //*---------------------------------------------------------------------------

  // SideBar: To free up space, our regexp cache is deleted now that createFassets() is complete
  //          ... because the fassets.get() maintains it's own results cache, 
  //              the regexps built up in this cache will rarely be needed (if at all)
  _regExpCache = {};

  // log summary
  if (logf.isEnabled()) {
    const hookCount   = activeFeatures.reduce( (count, feature) => feature.fassets ? count+1 : count, 0);
    const hookSummary = activeFeatures.map( (feature) => `\n  Feature.name:${feature.name}${feature.fassets ? ' <-- defines: fassets' : ''}` );
    logf(`cross-feature-communication ... INTERPRETING: Feature.fassets ... ${hookCount} hooks:${hookSummary}`);

    logf('cross-feature-communication ... fassets define/defineUse directives: ', _resources); // ... see WHO defined WHAT
    logf('cross-feature-communication ... fassets use directives: ', _usage);                  // ... see WHO enabled usage contracts
    logf('cross-feature-communication ... resolved fassets object: ', _fassets);               // ... see consolated list of all fassets
  }

  // return our public fassets object (used in cross-feature-communication)
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
 * @param {Any} val the value to inject.
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
 * programmatic structure.
 *
 * feature-u's fassetKeys can be any JS identifier (less $ support - currently)
 *   TODO: Omition of $ support was due to concern about conflict in wildcard processing (never actually tried).
 *
 *   JavaScript Identifier Rules:
 *    - MAY CONTAIN:    alphas, digits, _, $
 *    - BEGINNING WITH: alphas,         _, $
 *    - ARE:            case-sensitive
 *    - JavaScript keywords cannot be used
 *
 * Examples:
 * ```
 *   - allow embedded DOTS "."
 *   - disallow wildcards "*"
 *   - valid:      "a"
 *                 "a1"
 *                 "a1.b"
 *                 "a1.b2.c"
 *                 "_a._b_.c_"
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

  const errMsg = `fassetsKey: '${key}' is invalid (NOT a JS identifier) ...`;

  const regExpAllowingWildcards    = /^[_a-zA-Z\*][_a-zA-Z0-9\*]*$/;
  const regExpDisallowingWildcards = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
  var   regExpCheck                = regExpAllowingWildcards;

  // insure NO cr/lf
  check(!isMatch(key, /[\n\r]/), `${errMsg} contains unsupported cr/lf`);

  // validate wildcards, per parameter
  // ... must also accomodate in our regexp check (below) but this check provides a more explicit message
  if (!allowWildcards) {
    check(!isMatch(key, /\*/), `${errMsg} wildcards are not supported`);
    regExpCheck = regExpDisallowingWildcards;
  }

  // analyze each node of the federated namespace
  const nodeKeys = key.split('.');
  nodeKeys.forEach( nodeKey => {
    check(nodeKey!=='', `${errMsg} contains invalid empty string`);
    check(isMatch(nodeKey, regExpCheck),
          `${errMsg} each node must conform to a JS indentifier (less $ support)`);
  });
}



/**
 * An internal function that deciphers the supplied useEntry,
 * validating, applying default semantics, and interpreting the two
 * formats:
 *
 * - a string
 * - a string/options in a two-element array
 *
 * @param {string-or-arrayOfStringOptionPairs} useEntry the use
 * entry to decipher.
 *
 * @param {assertionFn} check an assertion function (with context),
 * used to perform validation.
 *
 * @return {Object} defaulted object with following entries: {useKey,
 * required, validationFn}
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
    check(useEntry.length === 2, `"use" entry must either be a string or a string/options in a two-element array ... incorrect array size: ${useEntry.length}`);

    const [useKey, useOptions] = useEntry;

    check(isString(useKey),          `"use" entry with options (two-element array), first element is NOT a string`);
    check(isPlainObject(useOptions), `"use" entry with options (two-element array), second element is NOT an object`);

    const {required = true, type:validateFn = fassetValidations.any, ...unknownOptions} = useOptions;

    const unknownOptionsKeys = Object.keys(unknownOptions);
    check(unknownOptionsKeys.length === 0, `"use" entry with options (two-element array), options have unrecognized entries: ${unknownOptionsKeys} ... expecting only: required/type`);

    use.useKey     = useKey;
    use.required   = required;
    use.validateFn = validateFn;
  }
  else {
    // unconditional error
    check(false, `"use" entry must either be a string or a string/options in a two-element array`);
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
export function containsWildCard(str) { // ... exported for unit tests only
  // check for fassets-based wildcards (only *)
  return str.includes('*');
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
export function matchAll(str, regexp) { // ... exported for unit tests only

  // NOTE: Because we re-use our regexps (for optimization)
  //       -AND- we use the "global" regexp modifier, 
  //       WE MUST RESET IT (so as to NOT pick up where it last left off)
  regexp.lastIndex = 0;

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
export function isMatch(str, regexp) { // ... exported for unit tests only

  // NOTE: Because we re-use our regexps (for optimization)
  //       -AND- we use the "global" regexp modifier, 
  //       WE MUST RESET IT (so as to NOT pick up where it last left off)
  regexp.lastIndex = 0;

  return regexp.test(str); // simple pass-through
}


// regexp cache used by createRegExp()
//  - optimizes repeated iteration in createFassets() "Stage 3: VALIDATION"
//  - SideBar: To free up space, this cache is deleted at end of createFassets()
//             ... the fassets.get() maintains results cache, 
//                 so regexp will be rarely needed (if at all)
var _regExpCache = { /* dynamically maintained ... SAMPLE:
  'MainPage.*.link':      /^MainPage\..*\.link$/gm,
  'selector.currentView': /^selector\.currentView$/gm,
  ... */
};

/**
 * Creates a fassets-specific regular expression from the supplied
 * pattern string, employing all the heuristics required by fassets
 * usage.
 *
 * @param {string} pattern the string to seed the regexp from.
 *
 * @return {RegExp} the newly created regexp.
 * 
 * @private
 */
export function createRegExp(pattern) { // ... exported for unit tests only

  var wrkStr = pattern;

  // use cached value (when available)
  var regexp = _regExpCache[pattern];
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
  _regExpCache[pattern] = regexp;

  // that's all folks
  return regexp;
}
