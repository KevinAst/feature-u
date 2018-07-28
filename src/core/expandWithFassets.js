import verify      from '../util/verify';
import isFunction  from 'lodash.isfunction';

/**
 * Mark the supplied {{book.api.expandWithFassetsCB}} as a "Managed
 * Expansion Callback", distinguishing it from other functions _(such
 * as reducer functions)_.
 *
 * Features may communicate {{book.api.AspectContent}} directly, or
 * through a {{book.api.expandWithFassetsCB}}.  In other words, the
 * {{book.api.AspectContent}} can either be the actual content itself
 * _(ex: reducer, logic modules, etc.)_, or a function that returns
 * the content.  The latter:
 * 
 *  1. supports {{book.guide.crossCom}} _(through fassets object
 *     injection)_, and
 *  2. minimizes circular dependency issues (of ES6 modules).
 *
 * Managed Expansion Callbacks are used when a fully resolved
 * {{book.api.Fassets}} object is required during in-line code expansion.
 * They are merely functions that when invoked _(under the control of
 * **feature-u**)_, are supplied the {{book.api.Fassets}} object and
 * return the expanded {{book.api.AspectContent}} _(ex: reducer, logic
 * modules, etc.)_.
 *
 * **For more information _(with examples)_**, please refer to
 * {{book.guide.crossCom_managedCodeExpansion}}.
 *
 * The {{book.api.expandWithFassetsCB}} function should conform to the
 * following signature:
 *
 * **API:** {{book.api.expandWithFassetsCB$}}
 *
 * @param {expandWithFassetsCB} expandWithFassetsCB the callback
 * function that when invoked (by **feature-u**) expands/returns the
 * desired {{book.api.AspectContent}}.
 *
 * @return {expandWithFassetsCB} the supplied expandWithFassetsCB,
 * marked as a "managed expansion callback".
 *
 * @function expandWithFassets
 */
export default function expandWithFassets(expandWithFassetsCB) {

  // validate parameters
  const check = verify.prefix('expandWithFassets() parameter violation: ');

  check(expandWithFassetsCB,             'expandWithFassetsCB is required');
  check(isFunction(expandWithFassetsCB), 'expandWithFassetsCB must be a function');

  // mark the supplied function as a "managed expansion callback"
  // ... distinguishing it from other functions (such as reducers)
  expandWithFassetsCB.expandWithFassets = true;

  // that's all folks
  return expandWithFassetsCB;
}


//***
//*** Specification: expandWithFassetsCB
//***

/**
 * A "managed expansion callback" (defined by
 * {{book.api.expandWithFassets}}) that when invoked (by **feature-u**)
 * expands and returns the desired {{book.api.AspectContent}}.
 *
 * **For more information _(with examples)_**, please refer to
 * {{book.guide.crossCom_managedCodeExpansion}}.
 *
 * @callback expandWithFassetsCB
 * 
 * @param {Fassets} fassets the Fassets object used in cross-feature-communication.
 * 
 * @returns {AspectContent} The desired AspectContent (ex: reducer,
 * logic module, etc.).
 */
