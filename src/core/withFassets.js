import React                from 'react';
import React_createContext  from 'create-react-context'; // ponyfill react context, supporting older version of react
import verify               from '../util/verify';
import isFunction           from 'lodash.isfunction';
import isPlainObject        from 'lodash.isplainobject';
import isString             from 'lodash.isstring';
import {MyObj}              from '../util/mySpace';
import isComponent          from '../util/isComponent';
import logf                 from '../util/logf';


const fassetsNotDefined = 'NO FassetsContext.Provider';

// report the React Context that is in-use
const contextImpl = React.createContext === React_createContext ? 'native (React >16.3)' : 'ponyfilled (React <16.3)';
logf.force(`Context in-use: ${contextImpl}... React Version: ${React.version}`);

// publically exposed (in rare case when app code defines their own DOM via registerRootAppElm())
export const FassetsContext = React_createContext(fassetsNotDefined); // specify a defaultValue we can detect ERROR conditions (need FassetsContext.Provider at root)

/**
 * Promotes a "wrapped" Component (an HoC - Higher-order Component)
 * that injects fasset props into a `CompToWrap`, as specified by the
 * `mapFassetsToProps` parameter.
 * 
 * Central to this process, a Higher-order Function (HoF) is created
 * that encapsulates this "mapping knowledge".  Ultimately, this
 * HoF must be invoked (passing the `CompToWrap`), which exposes the HoC
 * (the "wrapped" Component).
 * 
 * ```js
 * + withFassetsHoF(CompToWrap): HoC
 * ```
 * 
 * There are two ways to use `withFassets()`:
 * 
 * 1. By directly passing the `CompToWrap` parameter, the HoC will be
 *    returned _(internally invoking the HoF)_.  This is the most
 *    common use case.
 * 
 * 2. By omitting the `CompToWrap` parameter, the HoF will be
 *    returned.  This is useful to facilitate "functional composition"
 *    _(in functional programming)_.  In this case it is the client's
 *    responsibility to invoke the HoF _(either directly or
 *    indirectly)_ in order to expose the HoC.
 * 
 * **Please Note** this function uses named parameters.
 *
 * @param {mapFassetsToPropsStruct|mapFassetsToPropsFn}
 * mapFassetsToProps the structure defining the prop/fassetsKey
 * mapping, from which fasset resources are injected into
 * `CompToWrap`.  This can either be a direct structure
 * ({{book.api.mapFassetsToPropsStruct}}) or a function returning the
 * structure ({{book.api.mapFassetsToPropsFn}}).
 *
 * @param {ReactComp} [CompToWrap] optionally, the React Component to
 * be wrapped _(see discussion above)_.
 *    
 * @returns {HoC|HoF} either the HoC (the "wrapped" Component) when
 * `CompToWrap` is supplied, otherwise the HoF _(see discussion
 * above)_.
 *
 * **Examples**:
 *
 * 1. Inject fasset resources from a **static structure**
 *    ({{book.api.mapFassetsToPropsStruct}}), **auto wrapping** the
 *    MainPage Component ...
 *  
 *    ```js
 *    function MainPage({Logo, mainLinks, mainBodies}) {
 *      return (
 *        <div>
 *          <div>
 *            <Logo/>
 *          </div>
 *          <div>
 *            {mainLinks.map( (MainLink, indx) => <MainLink key={indx}/>)}
 *          </div>
 *          <div>
 *            {mainBodies.map( (MainBody, indx) => <MainBody key={indx}/>)}
 *          </div>
 *        </div>
 *      );
 *    }
 *    
 *    export default withFassets({
 *      CompToWrap: MainPage,  // NOTE: auto wrap MainPage
 *      mapFassetsToProps: {   // NOTE: static structure (mapFassetsToPropsStruct)
 *        Logo:       'company.logo',
 *                    // Logo:  companyLogoResource,
 *
 *        mainLinks:  'MainPage.*.link@withKeys',
 *                    // mainLinks:  [['MainPage.cart.link',   cartLinkResource],
 *                    //              ['MainPage.search.link', searchLinkResource]],
 *        mainBodies: 'MainPage.*.body'
 *                    // mainBodies: [cartBodyResource, searchBodyResource],
 *      }
 *    });
 *    ```
 *    
 * 2. Inject fasset resources from a **functional directive**
 *    ({{book.api.mapFassetsToPropsFn}}), **returning the HoF** -
 *    immediately invoked ...
 *    
 *    ```js
 *    function MainPage({mainLinks, mainBodies}) {
 *      return (
 *        ... same as prior example
 *      );
 *    }
 *    
 *    export default withFassets({
 *      mapFassetsToProps(ownProps) { // NOTE: functional directive (mapFassetsToPropsFn)
 *        ... some conditional logic based on ownProps
 *        return {
 *          Logo:       'company.logo',
 *                      // Logo:  companyLogoResource,
 *          
 *          mainLinks:  'MainPage.*.link@withKeys',
 *                      // mainLinks:  [['MainPage.cart.link',   cartLinkResource],
 *                      //              ['MainPage.search.link', searchLinkResource]],
 *          mainBodies: 'MainPage.*.body'
 *                      // mainBodies: [cartBodyResource, searchBodyResource],
 *        };
 *      }
 *    })(MainPage); // NOTE: immediatly invoke the HoF, emitting the wrapped MainPage Component
 *    ```
 * 
 * @function withFassets
 */
export function withFassets({mapFassetsToProps, CompToWrap, ...unknownArgs}={}) {

  // validate params
  const check = verify.prefix('withFassets() parameter violation: ');

  // ... mapFassetsToProps
  check(mapFassetsToProps,
        'mapFassetsToProps is required');
  const mappingIsFunction = isFunction(mapFassetsToProps);
  check(mappingIsFunction || isPlainObject(mapFassetsToProps),
        'mapFassetsToProps must be a mapFassetsToPropsFn or mapFassetsToPropsStruct');

  // ... CompToWrap
  if (CompToWrap) {
    check(isComponent(CompToWrap),
          'CompToWrap, when supplied, must be a React Component - to be wrapped');
  }

  // ... unrecognized named parameter
  const unknownArgKeys = Object.keys(unknownArgs);
  check(unknownArgKeys.length === 0,
        `unrecognized named parameter(s): ${unknownArgKeys}`);

  // ... unrecognized positional parameter
  check(arguments.length === 1,
        'unrecognized positional parameters (only named parameters can be specified)');

  // define our HoF that when invoked will expose our HoC wrapper
  // ... this "second level of indirection" is required to interpret our mapFassetsToProps
  function withFassetsHoF(CompToWrap) {

    // verify CompToWrap is supplied and is a valid component
    verify(isComponent(CompToWrap),
           'You must pass a React Component to the function returned by withFassets()');

    // return our HoC wrapper that injects selected fassets props
    // ... this function has access to everything we need:
    //     - fassets (via the context consumer)
    //     - the app-specific mapping operation (from above)
    //     - the outlying properties supplied to the connected component (ownProps)
    return function FassetsComponent(ownProps) {

      // resolve our mapping ... either directly supplied, or by function invocation
      // ex: {
      //   propKey      fassetsKey
      //   ===========  =================
      //   mainLinks:   'MainPage.*.link',
      //   mainBodies:  'MainPage.*.body',
      // }
      const fassetsToPropsMap = mappingIsFunction ? mapFassetsToProps(ownProps) : mapFassetsToProps;
      // ... verify resolved mapping is an Object
      check(isPlainObject(fassetsToPropsMap),
            'mapFassetsToProps resolved to an invalid structure, MUST be a mapFassetsToPropsStruct');
      // ... WITH string values
      MyObj.entries(fassetsToPropsMap).forEach( ([propKey, fassetsKey]) => {
        check(isString(fassetsKey),
              `mapFassetsToProps resolved to an invalid structure - all properties MUST reference a fassetsKey string ... at minimum ${propKey} does NOT`);
      });

      // wrap the supplied CompToWrap with the context consumer (providing access to fassets)
      // and inject the desired fassets props
      return (
        <FassetsContext.Consumer> 
          { (fassets) => {  // React Context Consumer expects single function, passing it's context value (i.e. our fassets)

              // ERROR when fassets is NOT defined
              verify(fassets !== fassetsNotDefined,
                     'withFassets() cannot be used when no <FassetsContext.Provider> is in the root DOM.  ' +
                     'Normally feature-u auto configures this, except when NO Aspects/Features inject UI content.  ' + 
                     'In this case the app must do this in launchApp() registerRootAppElm() callback.  ' + 
                     '... see: https://feature-u.js.org/cur/detail.html#react-registration');
              
              // inject fasset resource props into the supplied CompToWrap
              // ... THIS IS WHAT WE ARE HERE FOR!!
              return <CompToWrap {...fassetsProps(fassetsToPropsMap, fassets)} {...ownProps}/>;
            }
          }
        </FassetsContext.Consumer>
      );
    };
  }

  // either return the HoC "wrapped" Component or HoF
  // ... depending on whether the CompToWrap parameter is supplied
  return CompToWrap ? withFassetsHoF(CompToWrap) : withFassetsHoF;
}

// helper function that translates supplied fassetsToPropsMap to fassetsProps
export function fassetsProps(fassetsToPropsMap, fassets) { // export for testing only
  return Object.assign(...MyObj.entries(fassetsToPropsMap).map( ([propKey, fassetsKey]) => ({[propKey]: fassets.get(fassetsKey)}) ));
}


//***
//*** Specification: mapFassetsToPropsStruct
//***

/**
 * @typedef {Object} mapFassetsToPropsStruct
 *
 * A structure (used by {{book.api.withFassets}}) defining a
 * prop/fassetsKey mapping, from which fasset resources are
 * injected into a Component.
 * 
 * The injected Component properties will reference the fasset
 * resource corresponding to the fassetsKey.
 *
 * **Wildcards**
 *
 * Wildcards (`*`) are supported in the fassetsKey, accumulating
 * multiple resources (a resource array), matching the supplied
 * pattern:
 *
 * - **without wildcards**, a single resource is injected
 *   _(`undefined` for none)_.
 *
 * - **with wildcards**, a resource array is injected, in order of
 *   feature expansion _(empty array for none)_.
 *
 * _Example ..._
 *
 * ```js
 * mapFassetsToProps: {
 *   Logo:       'company.logo',
 *               // Logo:  companyLogoResource,
 *
 *               // NOTE: wildcard usage ...
 *   mainLinks:  'MainPage.*.link',
 *               // mainLinks:  [cartLinkResource, searchLinkResource],
 *   mainBodies: 'MainPage.*.body'
 *               // mainBodies: [cartBodyResource, searchBodyResource],
 * }
 * ```
 *
 * **@withKeys**
 *
 * In some cases, you may wish to know the corresponding
 * `fassetsKey` of the returned resource.  This is especially true
 * when multiple resources are returned _(using wildcards)_.
 *
 * As an example, JSX requires unique keys for array injections _(the
 * `fassetsKey` is a prime candidate for this, since it is guaranteed
 * to be unique)_.
 *
 * To accomplish this, simply suffix the `fassetsKey` with the
 * keyword: `'@withKeys'`.  When this is encountered, the resource
 * returned is a two-element array: `[fassetsKey, resource]`.
 *
 * _Example ..._
 *
 * ```js
 * mapFassetsToProps: {
 *   Logo:       'company.logo',
 *               // Logo:  companyLogoResource,
 *
 *   mainLinks:  'MainPage.*.link@withKeys', // NOTE: @withKeys directive
 *               // mainLinks:  [['MainPage.cart.link',   cartLinkResource],
 *               //              ['MainPage.search.link', searchLinkResource]],
 *   mainBodies: 'MainPage.*.body'
 *               // mainBodies: [cartBodyResource, searchBodyResource],
 * }
 * ```
 */


//***
//*** Specification: mapFassetsToPropsFn
//***

/**
 * A function (used by {{book.api.withFassets}}) that returns a
 * {{book.api.mapFassetsToPropsStruct}}, defining a prop/fassetsKey
 * mapping, from which fasset resources are injected into a Component.
 *
 * @callback mapFassetsToPropsFn
 * 
 * @param {obj} ownProps the outlying properties supplied to the
 * connected component.
 *
 * @return {mapFassetsToPropsStruct} the structure defining a
 * prop/fassetsKey mapping, from which fasset resources are injected
 * into a Component.
 */
