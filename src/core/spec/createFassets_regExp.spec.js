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


  //***-------------------------------------------------------------------------
  // matchAll(str, regexp): []
  // isMatch(str, regexp):  boolean
  describe('match tests', () => {

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

});
