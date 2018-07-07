import {containsWildCard,
        matchAll,
        isMatch,
        createRegExp}      from '../createFassets';  // module under test

describe('createFassets(): regexp tests', () => {

  //***-------------------------------------------------------------------------
  describe('containsWildCard(str): boolean', () => {

    [
     // str           expected
     // ===========   ========
      [ '',           false ],
      [ 'a',          false ],
      [ 'a.b',        false ],
      [ 'a.*.b',      true  ],
      [ '*a.*.b*',    true  ],
      [ '*',          true  ],
      [ '**',         true  ],
    ].forEach( ([str, expected]) => {
      test(`containsWildCard('${str}'): ${expected}`, () => {
        expect(containsWildCard(str)).toBe(expected);
      });
    });

  });

  // resources used in various tests
  const cartLink   = 'MainPage.cart.link';
  const cartBody   = 'MainPage.cart.body';
  const searchLink = 'MainPage.search.link';
  const searchBody = 'MainPage.search.body';
  
  const blob = `
${cartLink}
${cartBody}
${searchLink}
${searchBody}
`;


  //***-------------------------------------------------------------------------
  // matchAll(str, regexp): []
  // isMatch(str, regexp):  boolean
  describe('match tests', () => {

    [
      // str           pattern                 expected
      // ===========   ===================     =====================
                                                                        // **BLOB TESTS**
      [  blob,         'MainPage.search.body', [searchBody]          ], // no wildcards
      [  blob,         'MainPage.*.link',      [cartLink,searchLink] ], // inner wildcard
      [  blob,         '*Page.*.li*',          [cartLink,searchLink] ], // outer wildcards (both sides)
      [  blob,         '*Page.*.li',           []                    ], // mismatch on right
      [  blob,         'NOT-FOUND',            []                    ], // outright mismatch

                                                                        // **SINGLE LINE TESTS**
      [  searchBody,   'MainPage.search.body', [searchBody]          ], // no wildcards
      [  cartLink,     'MainPage.*.link',      [cartLink]            ], // inner wildcard
      [  cartLink,     '*Page.*.li*',          [cartLink]            ], // outer wildcards (both sides)
      [  cartLink,     '*Page.*.li',           []                    ], // mismatch on right
      [  cartLink,     'NOT-FOUND',            []                    ], // outright mismatch
    ].forEach( ([str, pattern, expected]) => {
      test(`matchAll() pattern: '${pattern}'`, () => {
        expect( matchAll(str, createRegExp(pattern))).toEqual(expected);
      });
      test(`isMatch() pattern: '${pattern}'`, () => {
        expect( isMatch(str, createRegExp(pattern))).toBe(expected.length===0 ? false : true);
      });
    });

  });


  //***-------------------------------------------------------------------------
  // createRegExp(pattern): RegExp
  // ... tested indirectly (above)
  // ... NOTE: tests (above) excersise BOTH single and multi-line cases (i.e. our blob)


  //***-------------------------------------------------------------------------
  describe('insure our regexp can be re-used', () => {

    // NOTE: Because we re-use our regexps (for optimization)
    //       -AND- we use the "global" regexp modifier, 
    //       IT MUST BE RESET (so as to NOT pick up where it last left off)

    const regexp = createRegExp('MainPage.*.link');

    test(`FIRST isMatch() should work`, () => {
      expect( isMatch(blob, regexp) ).toBe(true);
    });

    test(`SECOND isMatch() should work`, () => {
      expect( isMatch(blob, regexp) ).toBe(true);
    });
    
    test(`FIRST matchAll() should work`, () => {
      expect( matchAll(blob, regexp).length).toBe(2);
    });
    
    test(`SECOND matchAll() should work`, () => {
      expect( matchAll(blob, regexp).length).toBe(2);
    });


  });

});
