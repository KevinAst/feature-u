import isString    from 'lodash.isstring';
import isFunction  from 'lodash.isfunction';

/**
 * A pre-defined set of fasset validation functions, which can be
 * employed in the `Feature.fassets.use` usage contract.
 *
 * These validation functions can be used as is, and additional ones
 * can be created by the client.
 *
 * The validation API should adhere to the following signature:
 *
 * ```
 *  + fassetValidationFn(fassetsValue): string || null
 *     ... A return value of null is valid, while a string
 *         specifies a validation error that feature-u
 *         will format as follows (see ${returnStr}):
 *
 *         `VALIDATION ERROR in resource: '${fassetsKey}',
 *            expecting: ${returnStr} ... 
 *            resource defined in Feature: '${resource.definingFeature}',
 *            usage contract '${useKey}' found in Feature: '${featureName}'`
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

function any(fassetsValue) {
  return fassetsValue!==undefined ? null : 'anthing but: undefined';
}

function comp(fassetsValue) {
  // TODO: handle all three of the various ways React components are defined
  //       - legacy React.createClass()
  //       - class derivation
  //       - Stateless Functional Component
  // for now, just punt with ANY:
  return fassetsValue!==undefined ? null : 'React Component';
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
