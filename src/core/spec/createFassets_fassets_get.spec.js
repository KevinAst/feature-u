import createFassets      from '../createFassets';     // module under test
import {createFeature}    from '../..';

describe('fassets.get() method', () => {

  // setup our fassets object to test
  const fassets = createFassets([
    createFeature({
      name: 'main',
      fassets: {
        define: {
          'first':          'first entry',
          'company.logo':   'logo',
          'case.sensitive': 'case sensitive entry',
        },
      },
    }),

    createFeature({
      name: 'cart',
      fassets: {
        define: {
          'MainPage.cart.link': 'cartLink',
          'MainPage.cart.body': 'cartBody',
          'Case.Sensitive': 'Case Sensitive Entry',  // insure keys -AND- wildcard searches are case sensitive
        },
      },
    }),

    createFeature({
      name: 'search',
      fassets: {
        define: {
          'MainPage.search.link': 'searchLink',
          'MainPage.search.body': 'searchBody',
          'last':                 'last entry',
        },
      },
    }),

  ]);

  // test helper
  const testFassetsGet = (arr) => {
    arr.forEach( ([fassetsKey, expected, testing='']) => {
      test(`get('${fassetsKey}') ... ${testing}`, () => {
        expect( fassets.get(fassetsKey) ).toEqual(expected);
      });
    });
  };

  // perform ALL our tests
  testFassetsGet([
   // fassetsKey               expected                      testing (optional)
   // =======================  ============================  =====================
    [ 'MainPage.*.link',       ['cartLink', 'searchLink'],   ],
    [ 'MainPage.*.body',       ['cartBody', 'searchBody'],   ],
    [ '*.logo',                ['logo'],                     ],
    [ 'company.logo',          'logo',                       ],
    [ 'undefined.entry',       undefined,                    'not found single entry search: undefined'],
    [ 'undefined.*.wildcard',  [],                           'not found single wildcard search: empty array'],
    [ 'first',                 'first entry',                'first entry (in terms of feature expansion)'],
    [ 'last',                  'last entry',                 'last entry (in terms of feature expansion)'],
    [ 'case.sensitive',        'case sensitive entry',       ],
    [ 'Case.Sensitive',        'Case Sensitive Entry',       ],
    [ '*.sensitive',           ['case sensitive entry'],     ],
    [ '*.Sensitive',           ['Case Sensitive Entry'],     ],
    [ '*', [
      'first entry',
      'logo',
      'case sensitive entry',
      'cartLink',
      'cartBody',
      'Case Sensitive Entry',
      'searchLink',
      'searchBody',
      'last entry',],                                        'retrieve ALL entries (in feature expansion order)'],
  ]);

  // more tests
  test('get() missing parameter', () => {
    expect(()=> fassets.get())
      .toThrow('fassets.get() parameter violation: fassetsKey is required');
    // THROW:  fassets.get() parameter violation: fassetsKey is required
  });
  test('get(123) parameter type check', () => {
    expect(()=> fassets.get(123))
      .toThrow('fassets.get() parameter violation: fassetsKey must be a string ... 123');
    // THROW:   fassets.get() parameter violation: fassetsKey must be a string ... 123
  });

});
