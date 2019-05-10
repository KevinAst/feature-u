import {isValidElementType} from 'react-is';

/**
 * Return an indicator as to whether the supplied parameter is a 
 * react component (true) or not (false).
 *
 * @private
 */
export default function isComponent(comp) {
  // NOTE: Our unit test checks all three forms of Component creation:
  //       - Stateless Functional Component
  //       - Class Component (extending from React.Component)
  //       - Legacy React.createClass()
  return isValidElementType(comp); 
}
