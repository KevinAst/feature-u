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
 * Create a Higher-order Component (HoC) function that injects fasset
 * props into a `Component` as specified by the `mapFassetsToProps`
 * parameter.
 *
 * **Please Note** this function uses named parameters.
 *
 * @param {ReactComp} [Component] optionally, the React Component to
 * be wrapped.  **When supplied**, it will be automatically wrapped
 * and returned.  **When not supplied**, the HoC function will be
 * returned _(suitable to be "composed")_.
 *
 * @param {mapFassetsToPropsStruct|mapFassetsToPropsFn}
 * mapFassetsToProps the structure defining the prop/fassetsKey
 * mapping, from which fasset resources are injected into a `Component`.
 * Can either be a direct structure
 * ({{book.api.mapFassetsToPropsStruct}}) or a function returning the
 * structure ({{book.api.mapFassetsToPropsFn}}).
 *
 * @return {WrappedComp|HoC} either the WrappedComp or HoC function,
 * depending on whether the `Component` parameter is supplied:
 *
 * - **when `Component` is supplied**: return the WrappedComp _(by invoking the
 *   HoC - passing `Component`)_.
 *
 * - **when `Component` is NOT supplied**: return the HoC function.  Use this
 *   option if you wish to "compose" the HoC with yet another function.
 *   Ultimately, this HoC must be invoked _(directly or indirectly)_,
 *   passing the `Component` to be wrapped.
 *
 * **Examples**:
 *
 * 1. Inject fasset resources from a **static structure**
 *    ({{book.api.mapFassetsToPropsStruct}}), **auto wrapping** a
 *    `Component` ...
 *  
 *    ```js
 *    function MainPage({mainLinks, mainBodies}) {
 *      return (
 *        <div>
 *          <div>
 *            {mainLinks.map(MainLink => <MainLink/>)}
 *          </div>
 *          <div>
 *            {mainBodies.map(MainBody => <MainBody/>)}
 *          </div>
 *        </div>
 *      );
 *    }
 *    
 *    export default withFassets({
 *      Component: MainPage,   // NOTE: auto wrap MainPage
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
 *    ({{book.api.mapFassetsToPropsFn}}), **returning the HoC** -
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
 *    })(MainPage); // NOTE: immediatly invoke the HoC return function (wrapping MainPage)
 *    ```
 * 
 * @function withFassets
 */
export function withFassets({Component, mapFassetsToProps, ...unknownArgs}={}) {

  // validate params
  const check = verify.prefix('withFassets() parameter violation: ');

  // ... Component
  if (Component) {
    check(isComponent(Component),
          'Component when supplied, must be a React Component - to be wrapped');
  }

  // ... mapFassetsToProps
  check(mapFassetsToProps,
        'mapFassetsToProps is required');
  const mappingIsFunction = isFunction(mapFassetsToProps);
  check(mappingIsFunction || isPlainObject(mapFassetsToProps),
        'mapFassetsToProps must be a mapFassetsToPropsFn or mapFassetsToPropsStruct');

  // ... unrecognized named parameter
  const unknownArgKeys = Object.keys(unknownArgs);
  check(unknownArgKeys.length === 0,
        `unrecognized named parameter(s): ${unknownArgKeys}`);

  // ... unrecognized positional parameter
  check(arguments.length === 1,
        'unrecognized positional parameters (only named parameters can be specified)');

  // define our second-level HoC that when invoked will expose our HoC wrapper
  // ... this "second level of indirection" is required to interpret our mapFassetsToProps
  function withFassetsHoC(Component) {

    // verify Component is supplied and is a valid component
    verify(isComponent(Component),
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

      // wrap the supplied Component with the context consumer (providing access to fassets)
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
              
              // inject fasset resource props into the supplied Component
              // ... THIS IS WHAT WE ARE HERE FOR!!
              return <Component {...fassetsProps(fassetsToPropsMap, fassets)} {...ownProps}/>;
            }
          }
        </FassetsContext.Consumer>
      );
    };
  }

  // either return the WrappedComp or HoC function, depending on whether the Component parameter is supplied
  return Component ? withFassetsHoC(Component) : withFassetsHoC;
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
