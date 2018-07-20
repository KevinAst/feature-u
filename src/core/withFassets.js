import React                from 'react';
import React_createContext  from 'create-react-context'; // ponyfill react context, supporting older version of react
import verify               from '../util/verify';
import isFunction           from 'lodash.isfunction';
import isPlainObject        from 'lodash.isplainobject';
import isString             from 'lodash.isstring';
import {MyObj}              from '../util/mySpace';
import isComponent          from '../util/isComponent';

// ?? TEST OVERALL:
// 0) create fassets
// 1) create component withFassets()
// 2) inject Provider at root
//    <FassetsContext.Provider value={fassets}>
//      {curRootAppElm}
//    </FassetsContext.Provider>
// 3) ?? I think I need to use jest snapshot

// ?? publically exposed (in rare case when app code defines their own DOM via registerRootAppElm())
export const FassetsContext = React_createContext(); // ?? defaultValue

// ?? in launchApp() ... inject THIS at the end of the process ?? will prob need React
//    <FassetsContext.Provider value={fassets}>
//      {curRootAppElm}
//    </FassetsContext.Provider>


// ?? publically expose
// ?? JavaDoc
// ?? formal defs: mapFassetsToPropsFn -and- mapFassetsToPropsStruct
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


  // return our second-level HOC that when invoked will expose our HOC wrapper
  // ... this "second level of indirection" is required to interpret our mapFassetsToProps
  return function withFassetsHOC(Component) {

    // verify Component is supplied and is a valid component
    verify(isComponent(Component),
           'You must pass a component to the function returned by withFassets()');

    // return our HOC wrapper that injects selected fassets props
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
