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
 * managedExpansionCB.  In other words, the AspectContent can either
 * be the actual content itself _(ex: reducer, logic modules, etc.)_,
 * or a function that returns the content.  The latter:
 * 
 *  1. supports cross-feature communication (through app object
 *     injection), and 
 *  2. minimizes circular dependency issues (of ES6 modules).
 *
 * Managed Expansion Callbacks are used when a fully resolved App
 * object is requried during in-line code expansion.  They are merely
 * functions that when invoked (under the control of **feature-u**),
 * are supplied the App object and return the expanded AspectContent
 * _(ex: reducer, logic modules, etc.)_.
 *
 * The managedExpansionCB function should conform to the following
 * signature:
 *
 * **API:** {{book.api.managedExpansionCB$}}
 *
 * For more information _(with examples)_, please refer to
 * {{book.guide.crossCom_managedCodeExpansion}}.
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
 * A "managed expansion callback" (defined by
 * {{book.api.managedExpansion}}) that when invoked (by **feature-u**)
 * expands and returns the desired AspectContent.
 *
 * For more information _(with examples)_, please refer to
 * {{book.guide.crossCom_managedCodeExpansion}}.
 *
 * @callback managedExpansionCB
 * 
 * @param {App} app - The feature-u app object, promoting the
 * publicFace of each feature.
 * 
 * @returns {AspectContent} The desired AspectContent (ex: reducer,
 * logic module, etc.).
 */
