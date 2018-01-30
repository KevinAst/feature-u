import verify      from '../util/verify';
import isFunction  from 'lodash.isfunction';

/**
 * Mark the supplied {{book.api.managedExpansionCB}} as a "Managed
 * Expansion Callback", distinguishing it from other functions _(such
 * as reducer functions)_.
 *
 * Features may communicate {{book.api.AspectContent}} directly, or
 * through a {{book.api.managedExpansionCB}}.  In other words, the
 * {{book.api.AspectContent}} can either be the actual content itself
 * _(ex: reducer, logic modules, etc.)_, or a function that returns
 * the content.  The latter:
 * 
 *  1. supports {{book.guide.crossCom}} _(through app object
 *     injection)_, and
 *  2. minimizes circular dependency issues (of ES6 modules).
 *
 * Managed Expansion Callbacks are used when a fully resolved
 * {{book.api.App}} object is required during in-line code expansion.
 * They are merely functions that when invoked _(under the control of
 * **feature-u**)_, are supplied the {{book.api.App}} object and
 * return the expanded {{book.api.AspectContent}} _(ex: reducer, logic
 * modules, etc.)_.
 *
 * **For more information _(with examples)_**, please refer to
 * {{book.guide.crossCom_managedCodeExpansion}}.
 *
 * The {{book.api.managedExpansionCB}} function should conform to the
 * following signature:
 *
 * **API:** {{book.api.managedExpansionCB$}}
 *
 * @param {managedExpansionCB} managedExpansionCB the callback
 * function that when invoked (by **feature-u**) expands/returns the
 * desired {{book.api.AspectContent}}.
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
 * expands and returns the desired {{book.api.AspectContent}}.
 *
 * **For more information _(with examples)_**, please refer to
 * {{book.guide.crossCom_managedCodeExpansion}}.
 *
 * @callback managedExpansionCB
 * 
 * @param {App} app - The **feature-u** app object, promoting the
 * publicFace of each feature.
 * 
 * @returns {AspectContent} The desired AspectContent (ex: reducer,
 * logic module, etc.).
 */
