import React, {useContext} from 'react';
import {FassetsContext,
        fassetsProps}      from './withFassets';
import verify              from '../util/verify';
import isPlainObject       from 'lodash.isplainobject';
import isString            from 'lodash.isstring';
import {MyObj}             from '../util/mySpace';


/**
 * A {{book.ext.reactHook}} that provides functional component access
 * to **feature-u** {{book.api.fassets}}.
 *
 * **Hooks** allow you to **"hook into"** React state and lifecycle
 * aspects _from functional components_.  They greatly simplify the UI
 * implementation _as opposed to the alternative of Higher Order
 * Components (see: {{book.api.withFassets}})_.
 * 
 * There are three ways to invoke `useFassets()` _(examples can be
 * found at {{book.guide.crossCom_uiComposition}})_:
 * 
 * 1. Passing NO parameters, returns the
 *    {{book.api.FassetsObject}}:
 * 
 *    ```js
 *    + useFassets(): fassets
 *    ```
 * 
 * 2. Passing a `fassetsKey` _(a string)_, returns the resolved
 *    fassets resource:
 * 
 *    ```js
 *    + useFassets('MainPage.*.link@withKeys'): [] ... an array of cataloged links
 *    ```
 * 
 *    The `fassetsKey` parameter is identical _(in usage)_ to the
 *    {{book.api.Fassets_get}} method.
 * 
 * 3. Passing a {{book.api.mapFassetsToPropsStruct}}, returns a set of
 *    resolved fassetsProps:
 * 
 *    ```js
 *    + useFassets({
 *        mainBodies: 'MainPage.*.body',
 *        mainLinks:  'MainPage.*.link@withKeys'
 *      }): {  // ... return structure:
 *        mainBodies: ... resolved cataloged resource
 *        mainLinks:  ... ditto
 *      }
 *    ```
 * 
 *    The {{book.api.mapFassetsToPropsStruct}} allows you to return
 *    more than one resolved fassets resources.
 * 
 * **SideBar**: For `useFassets()` to operate,
 * `<FassetsContext.Provider>` must be rendered at the root of your
 * application DOM.  This is really a moot point, because
 * **feature-u** automatically performs this initialization, so you
 * really don't have to worry about this detail _(automating
 * configuration is a Hallmark of **feature-u** - reducing boilerplate
 * code)_.
 * 
 * @param {string|mapFassetsToPropsStruct} p the parameter controlling
 * what `useFassets` does _(see explanation above)_.
 *    
 * @returns {Fassets|fassets-resource|fassetsProps} _see explanation above_.
 * 
 * @function useFassets
 */
export function useFassets(p='.') {

  useFassetsCheck(p);

  const fassets = useContext(FassetsContext);

  return isString(p) ? fassets.get(p) : fassetsProps(p, fassets);
}

// check useFassets() usage in a way that is masked as a hook
// (useXyz()), so as to allow execution before real hooks
// ... i.e. fake out the lint rule!!
// ... this includes BOTH verifying:
//     - hooks is available in this version of react
//     - parameter validation
function useFassetsCheck(p) {
  // verify that hooks are available in this version of react
  if (!useContext) {
    throw new Error(`feature-u useFassets() is only available in React versions that have HOOKS (React >=16.8) ... your React Version is: ${React.version}`);
  }

  // parameter validation
  const check = verify.prefix('useFassets() parameter violation: ');

  check(p,                               'single parameter IS required');
  check(isString(p) || isPlainObject(p), `single parameter must either be a string or a structure ... ${p}`);

  // when a mapFassetsToProps is supplied, it must be a set of key/value pairs cataloging strings
  if (isPlainObject(p)) {
    MyObj.entries(p).forEach( ([propKey, fassetsKey]) => {
      check(isString(fassetsKey),
            `invalid mapFassetsToProps - all properties MUST reference a fassetsKey string ... at minimum ${propKey} does NOT`);
    });
  }
}
