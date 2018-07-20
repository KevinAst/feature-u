/**
 * Return an indicator as to whether the supplied parameter is a 
 * react component (true) or not (false).
 *
 * @private
 */
export default function isComponent(comp) {
  // NOTE: This seems too simple, 
  //       but it was taken from react-redux: src/components/connectAdvanced.js
  // NOTE: Our unit test checks all three forms of Component creation:
  //       - Stateless Functional Component
  //       - Class Component (extending from React.Component)
  //       - Legacy React.createClass()
  return typeof comp == 'function';
}
