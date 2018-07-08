import fassetValidations  from '../fassetValidations';  // module under test

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
    doTest(fassetValidations.comp, [
     // fassetsValue  expected  testing
     // ============  ========  =================================================
      [ (p)=>p,       VALID,    'Stateless Functional Component (arrow function)', ],
      [ function(){}, VALID,    'Stateless Functional Component (function)',       ],
//    [ 123,          VALID,    'number',              ],
      [ undefined,    INVALID,  'undefined',           ],
      // TODO: This is just a placebo for now (implemented as ANY)
      //       MUST handle all three of the various ways React components are defined
      //       - legacy React.createClass()
      //       - class derivation
      //       - Stateless Functional Component
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
