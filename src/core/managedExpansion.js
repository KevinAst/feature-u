import verify      from '../util/verify';
import isFunction  from 'lodash.isfunction';

/**
 * @function managedExpansion
 * @description
 *
 * Mark the supplied managedExpansionCB as a "managed expansion
 * callback", distinguishing it from other functions (such as reducer
 * functions).
 *
 * Features may communicate AspectContent directly, or through a
 * managedExpansionCB.  The latter:
 * 
 *  1. supports cross-feature communication (through app object
 *     injection), and 
 *  2. minimizes circular dependency issues (of ES6 modules).
 *
 * Managed Expansion Callbacks are used when a fully resolved `app`
 * object is requried during in-line code expansion.  They are merely
 * functions that are passed the `app` object and return the
 * expanded AspectContent (ex: reducer, logic modules, etc.).
 *
 * The managedExpansionCB function should conform to the following
 * signature:
 *
 * ```js
 * API: managedExpansionCB(app): AspectContent
 * ```
 *
 * Example (feature-redux `reducerAspect`):
 * ```js
 *   export default slicedReducer('foo', managedExpansion( (app) => combineReducers({...reducer-code-requiring-app...} ) ));
 * ```
 *
 * SideBar: For reducer aspects, slicedReducer() should always wrap
 *          the the outer function passed to createFunction(), even
 *          when managedExpansion() is used.
 *
 * Example (feature-redux-logic `logicAspect`):
 * ```js
 *   export const startAppAuthProcess = managedExpansion( (app) => createLogic({
 *     ...logic-code-requiring-app...
 *   }));
 * ```
 *
 * Please refer to the feature-u `managedExpansion()` documentation
 * for more detail.
 *
 * @param {managedExpansionCB} managedExpansionCB the callback
 * function that when invoked (by feature-u) expands/returns the
 * desired AspectContent.
 *
 * @return {managedExpansionCB} the supplied managedExpansionCB,
 * marked as a "managed expansion callback".
 */
export default function managedExpansion(managedExpansionCB) {

  // validate parameters
  const check = verify.prefix('managedExpansion() parameter violation: ');

  check(managedExpansionCB,             'managedExpansionCB is required');
  check(isFunction(managedExpansionCB), 'managedExpansionCB must be a function');

  // mark the supplied function as a "managed expansion callback"
  // ... distinguishing it from other functions (such as reducers)
  managedExpansionCB.managedExpansion = true;

  // that's all folks
  return managedExpansionCB;
}


//***
//*** Specification: managedExpansionCB
//***

/**
 * A "managed expansion callback" (defined by `managedExpansion()`) that
 * when invoked (by feature-u) expands and returns the desired
 * AspectContent.
 *
 * @callback managedExpansionCB
 * 
 * @param {App} app - The feature-u app object, promoting the
 * publicFace of each feature.
 * 
 * @returns {AspectContent} The desired AspectContent (ex: reducer,
 * logic module, etc.).
 */
