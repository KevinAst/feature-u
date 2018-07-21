import fassetValidations  from '../fassetValidations';  // module under test
import React              from 'react';
import createReactClass   from 'create-react-class'; // see: NOTE (below)

describe('fassetValidations', () => {

  const doTest = (type, arr) => {
    arr.forEach( ([fassetsValue, expected, testing]) => {
      test(`testing: ${testing}`, () => {
        expect( type(fassetsValue) ).toBe(expected);
      });
    });
  };

  const VALID = null;

  describe('any', () => {
    const INVALID = 'anthing but: undefined';
    doTest(fassetValidations.any, [
     // fassetsValue  expected  testing
     // ============  ========  =================
      [ '',           VALID,    'empty string',   ],
      [ 'myString',   VALID,    'string',         ],
      [ null,         VALID,    'null',           ],
      [ {},           VALID,    'object literal', ],
      [ 123,          VALID,    'number',         ],
      [ new Date,     VALID,    'Date',           ],
      [ [],           VALID,    'Array',          ],
      [ (p)=>p,       VALID,    'arrow function', ],
      [ function(){}, VALID,    'function',       ],
      [ undefined,    INVALID,  'undefined',      ],
    ]);
  });

  describe('comp', () => {
    const INVALID = 'React Component';

    class ClassComp extends React.Component{
      render() {
        return <p>Class Component (extending from React.Component)</p>;
      }
    }

    // NOTE: because this legacy technique has been deprecated (as of v16)
    //       it has been moved to a separate package: 'create-react-class'
    //       ... see: https://reactjs.org/docs/react-without-es6.html
    //       ... we are only using this for testing our isComponent() function
    //           SOOO: it can be a devDependency
    const ReactClassComponent = createReactClass({ // legacy: React.createClass()
      render() {
        return <p>Legacy React.createClass()</p>;
      }
    });

    doTest(fassetValidations.comp, [
     // fassetsValue          expected  testing
     // ============          ========  =================================================
      [ (p)=>p,               VALID,    'Stateless Functional Component (arrow function)', ],
      [ function(){},         VALID,    'Stateless Functional Component (function)',       ],
      [ ClassComp,            VALID,    'Class Component (extending from React.Component)',],
      [ ReactClassComponent,  VALID,    'Legacy React.createClass()', ],
      [ null,                 INVALID,  'null',                       ],
      [ undefined,            INVALID,  'undefined',                  ],
      [ 123,                  INVALID,  'number',                     ],
      [ new Date(),           INVALID,  'Date',                       ],
    ]);
  });

  describe('fn', () => {
    const INVALID = 'function';
    doTest(fassetValidations.fn, [
     // fassetsValue    expected  testing
     // ==============  ========  =================
      [ '',             INVALID,  'empty string',   ],
      [ 'myString',     INVALID,  'string',         ],
      [ null,           INVALID,  'null',           ],
      [ {},             INVALID,  'object literal', ],
      [ 123,            INVALID,  'number',         ],
      [ new Date,       INVALID,  'Date',           ],
      [ [],             INVALID,  'Array',          ],
      [ (p)=>p,         VALID,    'arrow function', ],
      [ function(){},   VALID,    'function',       ],
      [ new Function(), VALID,    'new Function()', ],
      [ undefined,      INVALID,  'undefined',      ],
    ]);
  });

  describe('str', () => {
    const INVALID = 'string';
    doTest(fassetValidations.str, [
      // fassetsValue   expected  testing
      // ============== ========  =================
      [ '',             VALID,    'empty string',   ],
      [ 'myString',     VALID,    'string',         ],
      [ new String(''), VALID,    'String object',  ],
      [ null,           INVALID,  'null',           ],
      [ {},             INVALID,  'object literal', ],
      [ 123,            INVALID,  'number',         ],
      [ new Date,       INVALID,  'Date',           ],
      [ [],             INVALID,  'Array',          ],
      [ (p)=>p,         INVALID,  'arrow function', ],
      [ function(){},   INVALID,  'function',       ],
      [ undefined,      INVALID,  'undefined',      ],
    ]);
  });

  describe('bool', () => {
    const INVALID = 'boolean';
    doTest(fassetValidations.bool, [
      // fassetsValue   expected  testing
      // ============== ========  =================
      [ '',             INVALID,  'empty string',   ],
      [ 'myString',     INVALID,  'string',         ],
      [ new String(''), INVALID,  'String object',  ],
      [ null,           INVALID,  'null',           ],
      [ {},             INVALID,  'object literal', ],
      [ 123,            INVALID,  'number',         ],
      [ new Date,       INVALID,  'Date',           ],
      [ [],             INVALID,  'Array',          ],
      [ (p)=>p,         INVALID,  'arrow function', ],
      [ function(){},   INVALID,  'function',       ],
      [ undefined,      INVALID,  'undefined',      ],
      [ true,           VALID,    'true',           ],
      [ false,          VALID,    'false',          ],
    ]);
  });

});
