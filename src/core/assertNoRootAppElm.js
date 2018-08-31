import verify    from '../util/verify';
import isString  from 'lodash.isstring';
import logf      from '../util/logf';

/**
 * A convenience function that asserts the supplied `rootAppElm` is NOT
 * defined.
 * 
 * When this constraint is not met, and error is thrown, after
 * emitting applicable context in the console log.
 *
 * For more information, please refer to
 * {{book.guide.injectingDomContent}}.
 *
 * @param {reactElm} rootAppElm the current react app element root to
 * check.
 *
 * @param {string} className the className on behalf of which this
 * assertion is performed.
 * 
 * @function assertNoRootAppElm
 */
export default function assertNoRootAppElm(rootAppElm, className) {

  // validate parameters
  const check = verify.prefix('assertNoRootAppElm() parameter violation: ');

  // ... className
  check(className,           'className is required');
  check(isString(className), 'className must be a string');

  // perform assertion
  if (rootAppElm) {
    const msg = `***ERROR*** ${className} does NOT support children ` +
                "but another feature/aspect is attempting to inject it's content. " +
                "Please resolve either by adjusting the feature expansion order, " +
                `or promoting ${className} through the conflicting artifact.`;

    logf.force(`${msg} ... conflicting artifact:`,
               logf.elm2html(rootAppElm));

    throw new Error(msg);
  }
}
