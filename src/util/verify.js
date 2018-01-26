/**
 * A convenience assertion utility, typically used to validate
 * pre-conditions of a routine.
 *
 * **Advanced**: verify.prefix(msgPrefix) returns a higher-order
 *               verify() function where all messages are prefixed.
 *
 * @param {truthy} condition - a "truthy" condition which
 * must be satisfied.
 *
 * @param {string} msg - a message clarifying the condition being
 * checked.
 * 
 * @throws {Error} an Error is thrown when the supplied condition is
 * NOT met.
 */
export default function verify(condition, msg) {
  if (!condition) {
    // TODO: don't think there is any benefit in logging this console.error 
    // console.error(`verify() constraint issue: ${msg}`); // supplement exception with error log (for react-native exposure)
    throw new Error(msg);
  }
}

verify.prefix = function(msgPrefix) {
  return (condition, msg) => verify(condition, msgPrefix+msg);
};
