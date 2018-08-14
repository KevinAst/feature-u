import isString    from 'lodash.isstring';
import isFunction  from 'lodash.isfunction';
import isComponent from '../util/isComponent';


/**
 * @typedef {Object} fassetValidations
 *
 * A pre-defined container of fasset validation functions, which can
 * be employed in the {{book.api.fassetsAspect}} `use` directive.
 * This allows the `use` directive to specify data type and content
 * validation constraints.
 *
 * These validations are available as a convenience.  Additional
 * validations can be created as needed.
 *
 * The validation API should adhere to the following signature:
 *
 * ```
 *  + fassetValidationFn(fassetsValue): string || null
 * ```
 * 
 * A return value of null represents a valid value, while a string
 * specifies a validation error that feature-u will format as follows
 * (see ${returnStr}):
 *
 * ```
 *   VALIDATION ERROR in resource: '${fassetsKey}',
 *     expecting: ${returnStr} ... 
 *     resource defined in Feature: '${resource.definingFeature}',
 *     usage contract '${useKey}' found in Feature: '${featureName}'
 * ```
 *
 * The following pre-defined validations are promoted through `fassetValidations`:
 *  - `any`:  any type (except undefined)
 *  - `comp`: a react component
 *  - `fn`:   a function
 *  - `str`:  a string
 *  - `bool`: a boolean
 *
 * **Example**:
 * ```js
 * createFeature({
 *   fassets: {
 *     use: [
 *        'MainPage.*.link', // DEFAULT: required of type any
 *       ['MainPage.*.body', {required: false, type: fassetValidations.comp}],
 *     ],
 *   },
 * });
 * ```
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
  return isComponent(fassetsValue) ? null : 'React Component';
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
