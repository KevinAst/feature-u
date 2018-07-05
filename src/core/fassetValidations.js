import isString    from 'lodash.isstring';
import isFunction  from 'lodash.isfunction';

/**
 * A pre-defined set of fasset validation functions, which can be
 * employed in the `Feature.fassets.use` usage contract.
 *
 * Thes validation functions can be used as is, and additional ones
 * can be created by the client.
 *
 * The validation API should adhear to the following signature:
 *
 * ```
 *  + fassetValidationFn(fassetsValue): string || null
 *     ... A return value of null is valid, while a string specifies a
 *         validation error as follows: '$fassetsKey is invalid, expecting $return-value'.
 * ```
 *
 * The following predefined validation functions are promoted:
 *  - any:  any type (except undefined)
 *  - comp: a react component
 *  - fn:   a function
 *  - str:  a string
 *  - bool: a boolean
 */

export default {
  any,
  comp,
  fn,
  str,
  bool,
};

// ?? test each of these

function any(fassetsValue) {
  return fassetsValue!==undefined ? null : 'anthing but: undefined';
}

function comp(fassetsValue) {
  return isFunction(fassetsValue) ? null : 'react comp'; // ?? do more with this
}

function fn(fassetsValue) {
  return isFunction(fassetsValue) ? null : 'function';
}

function str(fassetsValue) {
  return isString(fassetsValue) ? null : 'string';
}

function bool(fassetsValue) {
  return fassetsValue===true || fassetsValue===false ? null : 'boolean';
}
