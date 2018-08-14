import isComponent       from '../isComponent';     // module under test
import React             from 'react';
import createReactClass  from 'create-react-class'; // see: NOTE (below)

describe('isComponent() tests', () => {

  test('null', () => {
    expect(isComponent(null)).toBe(false);
  });

  test('undefined', () => {
    expect(isComponent(undefined)).toBe(false);
  });

  test('number', () => {
    expect(isComponent(123)).toBe(false);
  });

  test('Date', () => {
    expect(isComponent(new Date())).toBe(false);
  });

  test('Stateless Functional Component (arrow)', () => {
    const MyComponent = () => <p>Stateless Functional Component (arrow)</p>;
    expect(isComponent(MyComponent)).toBe(true);
  });

  test('Stateless Functional Component (function)', () => {
    function MyComponent() {
      return <p>Stateless Functional Component (function)</p>;
    }
    expect(isComponent(MyComponent)).toBe(true);
  });

  test('Class Component (extending from React.Component)', () => {
    class MyComponent extends React.Component{
      render() {
        return <p>Class Component (extending from React.Component)</p>;
      }
    }
    expect(isComponent(MyComponent)).toBe(true);
  });

  // NOTE: because this legacy technique has been deprecated (as of v16)
  //       it has been moved to a separate package: 'create-react-class'
  //       ... see: https://reactjs.org/docs/react-without-es6.html
  //       ... we are only using this for testing our isComponent() function
  //           SOOO: it can be a devDependency
  test('Legacy React.createClass()', () => {
    const MyComponent = createReactClass({ // legacy: React.createClass()
      render() {
        return <p>Legacy React.createClass()</p>;
      }
    });
    expect(isComponent(MyComponent)).toBe(true);
  });

});
