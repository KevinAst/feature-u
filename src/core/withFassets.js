import React                from 'react';
import React_createContext  from 'create-react-context'; // ponyfill react context, supporting older version of react
import verify               from '../util/verify';
import isFunction           from 'lodash.isfunction';
import isPlainObject        from 'lodash.isplainobject';
import isString             from 'lodash.isstring';
import {MyObj}              from '../util/mySpace';
import isComponent          from '../util/isComponent';

// ?? OVERALL TEST:
// 0) create fassets
// 1) create component withFassets()
// 2) inject Provider at root
//    <FassetsContext.Provider value={fassets}>
//      {curRootAppElm}
//    </FassetsContext.Provider>
// 3) ?? I think we may need to use jest snapshot

// publically exposed (in rare case when app code defines their own DOM via registerRootAppElm())
export const FassetsContext = React_createContext(); // ?? defaultValue ... provide a defaultValue that we can reason about for ERROR


/**
 * Create a Higher-order Component (HoC) class that injects fasset
 * props into a Component as specified by the mapFassetsToProps
 * parameter.
 *
 * The HoC function returned from `withFassets()` must be invoked,
 * passing the Component to be wrapped (injecting fasset resource props).
 *
 * **Examples**:
 *
 * **Inject fasset resource props from a static structure** ({{book.api.mapFassetsToPropsStruct}}) ...
 *
 * ```js
 * function MainPage({mainLinks, mainBodies}) {
 *   return (
 *     <div>
 *       <div>
 *         {mainLinks.map(MainLink => <MainLink/>)}
 *       </div>
 *       <div>
 *         {mainBodies.map(MainBody => <MainBody/>)}
 *       </div>
 *     </div>
 *   );
 * }
 * 
 * export default withFassets({
 *   mapFassetsToProps: {
 *     mainLinks:  'MainPage.*.link',
 *     mainBodies: 'MainPage.*.body'
 *   }
 * })(MainPage);
 * ```
 *
 * **Inject fasset resource props from a functional directive** ({{book.api.mapFassetsToPropsFn}}) ...
 *
 * ```js
 * function MainPage({mainLinks, mainBodies}) {
 *   return (
 *     ... same as prior example
 *   );
 * }
 * 
 * export default withFassets({
 *   mapFassetsToProps(props) {
 *     ... some conditional logic based on props
 *     return {
 *       mainLinks:  'MainPage.*.link',
 *       mainBodies: 'MainPage.*.body'
 *     };
 *   }
 * })(MainPage);
 * ```
 *
 * @param {mapFassetsToPropsStruct|mapFassetsToPropsFn} mapFassetsToProps the structure defining the
 * prop/fassetsKey mapping, from which fasset resources are
 * injected into a Component.  Can either be a direct structure
 * ({{book.api.mapFassetsToPropsStruct}}) or a function returning the
 * structure ({{book.api.mapFassetsToPropsFn}}).
 *
 * @return {HoC} the function to be invoked, passing the Component to
 * be wrapped (injecting fasset resource props).
 * 
 * @function withFassets
 */
export function withFassets({mapFassetsToProps, ...unknownArgs}={}) {

  // validate params
  const check = verify.prefix('withFassets() parameter violation: ');

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


  // return our second-level HoC that when invoked will expose our HoC wrapper
  // ... this "second level of indirection" is required to interpret our mapFassetsToProps
  return function withFassetsHoC(Component) {

    // verify Component is supplied and is a valid component
    verify(isComponent(Component),
           'You must pass a component to the function returned by withFassets()');

    // return our HoC wrapper that injects selected fassets props
    // ... this function has access to everything we need:
    //     - fassets (via the context consumer)
    //     - the app-specific mapping operation (from above)
    //     - our parent props
    return function FassetsComponent(props) {

      // resolve our mapping ... either directly supplied, or by function invocation
      // ex: {
      //   propKey      fassetsKey
      //   ===========  =================
      //   mainLinks:   'MainPage.*.link',
      //   mainBodies:  'MainPage.*.body',
      // }
      const fassetsToPropsMap = mappingIsFunction ? mapFassetsToProps(props) : mapFassetsToProps;
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
          // ??$$ TEST point
          // ?? ERROR if fassets not there
          return <Component {...fassetsProps(fassetsToPropsMap, fassets)} {...props}/>;
        }}
        </FassetsContext.Consumer>
      );
    };
  };
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
 * resource corresponding to the fassetsKey.  Wildcards are supported
 * in the fassetsKey, accumulating multiple resources:
 *
 * - **without wildcards**, a single resource is injected
 *   _(`undefined` for none)_.
 *
 * - **with wildcards**, a resource array is injected, in order of
 *   feature expansion _(empty array for none)_.
 *
 * **Example**:
 *
 * ```js
 * mapFassetsToProps: {
 *   Logo:       'company.logo',    // single resource
 *
 *   mainLinks:  'MainPage.*.link', // resource[] (via wildcards)
 *   mainBodies: 'MainPage.*.body'
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
 * @param {obj} props the outlying properties supplied to this
 * Component.
 *
 * @return {mapFassetsToPropsStruct} the structure defining a
 * prop/fassetsKey mapping, from which fasset resources are injected
 * into a Component.
 */
