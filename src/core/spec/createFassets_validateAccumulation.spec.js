import createFassets      from '../createFassets';     // module under test
import fassetValidations  from '../fassetValidations';
import {createFeature}    from '../..';

// REGEXP-RESET-TEST: There was an obsecure problem where our regexp processor has to be reset
//                    in order to detect secondary entries.
//                    - This has been fixed:
//                      * see createFassets.js (two spots where: "regexp.lastIndex = 0")
//                    - HOWEVER the tests below should excercise this scenerio.
//                      * there are TWO vulnerable spots:
//                        1) multiple "use" that match a given entry, second one is error (matching via isMatch())
//                           ... actually this excercises the case where overlapping usage contracts are in conflict
//                           ... i.e. two usage contracts (with varying wildcards) that both match an
//                                    entry can in fact specify different type checks
//                        2) "defineUse" must match at least one contract (matching via isMatch())
//                           ... simply make the contract it matches a second one (not the first)
//                           .... we are using a sledge hammer here, marching down all "use" to see if a "defineUse" matches
//                    - It is a bit obsecure, because it is related to the "ordering"
//                      in which entries are specified.
//                      * KEY: The test code (below) will reference this note.
//                    

describe('createFassets(): validation', () => {

  //***--------------------------------------------------------------------------
  describe('usage contract fulfillment', () => {

    describe('"non wildcard - single resource" usage contract', () => {

      test('fulfilled', () => {
        expect(()=> createFassets([
          createFeature({
            name:      'feature1',
            fassets: {
              define: {
                'comp.ref': { length: 0 }, // a resource containing a length:0 property ... testing prior lax wildcard detection of zero elm array
              },
            },
          }),
          createFeature({
            name:      'feature2',
            fassets: {
              use: [
                'comp.ref', // UNDER TEST: expecting to use this "required: resource
              ]
            },
          }),
        ]) )
          .not.toThrow();
      });

      test('NOT fulfilled', () => {
        expect(()=> createFassets([
          createFeature({
            name:      'feature1',
            fassets: {
              define: {
                'comp.ref.NOT': 'this does NOT match usage contract',
              },
            },
          }),
          createFeature({
            name:      'feature2',
            fassets: {
              use: [
                'comp.ref', // UNDER TEST: expecting to use this "required: resource
              ]
            },
          }),
        ]) )
          .toThrow(/REQUIRED RESOURCE NOT FOUND.*'comp\.ref'.*in Feature: 'feature2'.*but NO matches were found/);
        // THROW:   REQUIRED RESOURCE NOT FOUND, usage contract 'comp.ref' (found in Feature: 'feature2') specifies a REQUIRED resource, but NO matches were found
      });

    });

    describe('"wildcard - multi resource" usage contract', () => {

      test('fulfilled', () => {
        expect(()=> createFassets([
          createFeature({
            name:      'feature1',
            fassets: {
              define: {
                'comp.ref': { length: 0 }, // a resource containing a length:0 property ... testing prior lax wildcard detection of zero elm array
              },
            },
          }),
          createFeature({
            name:      'feature2',
            fassets: {
              use: [
                'comp.*ref', // UNDER TEST: expecting to use this "required: resource
              ]
            },
          }),
        ]) )
          .not.toThrow();
      });

      test('NOT fulfilled', () => {
        expect(()=> createFassets([
          createFeature({
            name:      'feature1',
            fassets: {
              define: {
                'comp.ref.NOT': 'this does NOT match usage contract',
              },
            },
          }),
          createFeature({
            name:      'feature2',
            fassets: {
              use: [
                'comp.*ref', // UNDER TEST: expecting to use this "required: resource
              ]
            },
          }),
        ]) )
          .toThrow(/REQUIRED RESOURCE NOT FOUND.*'comp\.\*ref'.*in Feature: 'feature2'.*but NO matches were found/);
        // THROW:   REQUIRED RESOURCE NOT FOUND, usage contract 'comp.*ref' (found in Feature: 'feature2') specifies a REQUIRED resource, but NO matches were found

      });

    });

  });


  //***--------------------------------------------------------------------------
  describe('client-supplied type validation (via "use" directive)', () => {

    test('test default "any" type', () => {
      expect(()=> createFassets([
        createFeature({
          name:      'feature1',
          fassets: {
            define: {
              'wow.zee.woo.woo1': 123,
              'wow.zee.woo.woo2': undefined, // KEY TEST:  does NOT conform to "any" type
                                             // IMPORTANT: make this the SECOND "define" entry to prove obsecure fix ... see: REGEXP-RESET-TEST (above)
              'a.b.c':            456,
            },
          },
        }),
        createFeature({
          name:      'feature2',
          fassets: {
            use: [
              'a.*.c',
              'wow.zee.woo.*', // KEY TEST: defaults to "required" of type "any"
            ]
          },
        }),
      ]) )
        .toThrow(/VALIDATION ERROR.*'wow.zee.woo.woo2'.*expecting: anthing but: undefined/);
      // THROW:   VALIDATION ERROR in resource: 'wow.zee.woo.woo2', expecting: anthing but: undefined ... resource defined in Feature: 'feature1', usage contract 'wow.zee.woo.*' found in Feature: 'feature2'
    });

    test('test user specified "fn" type', () => { // NOTE: There is NO need to run through all the type checks, as that is tested in fassetValidations.spec.js
      expect(()=> createFassets([
        createFeature({
          name:      'feature1',
          fassets: {
            define: {
              'a.x.c':            (p)=>p, // KEY TEST:  DOES conform to "fn" type
              'a.y.c':            456,    // KEY TEST:  does NOT conform to "fn" type
                                          // IMPORTANT: make this the SECOND "define" entry to prove obsecure fix ... see: REGEXP-RESET-TEST (above)
            },
          },
        }),
        createFeature({
          name:      'feature2',
          fassets: {
            use: [             // client configured (two-element array)
              ['a.*.c', {type: fassetValidations.fn}], // KEY TEST: defaults to "required" of type "fn"
            ]
          },
        }),
      ]) )
        .toThrow(/VALIDATION ERROR.*'a.y.c'.*expecting: function/);
      // THROW:   VALIDATION ERROR in resource: 'a.y.c', expecting: function ... resource defined in Feature: 'feature1', usage contract 'a.*.c' found in Feature: 'feature2'
    });

  });


  //***--------------------------------------------------------------------------
  describe('client-supplied optionality (via "use" directive)', () => {

    test('test default "required" optionality', () => {
      expect(()=> createFassets([
        createFeature({
          name:      'feature1',
          fassets: {
            define: {
              'wow.zee.woo.woo1': 123,
              'wow.zee.woo.woo2': 456,

//            'a.b.c':            456, // KEY TEST: No 'a.*.c' is defined
            },
          },
        }),
        createFeature({
          name:      'feature2',
          fassets: {
            use: [
              'a.*.c', // KEY TEST: defaults to "required" of type "any"
            ]
          },
        }),
      ]) )
        .toThrow(/REQUIRED RESOURCE NOT FOUND.*'a.\*.c'.*but NO matches were found/);
      // THROW:   REQUIRED RESOURCE NOT FOUND, usage contract 'a.*.c' (found in Feature: 'feature2') specifies a REQUIRED resource, but NO matches were found
    });

    test('test "required" supplied', () => {
      expect(()=> createFassets([
        createFeature({
          name:      'feature1',
          fassets: {
            define: {
              'wow.zee.woo.woo1': 123,
              'wow.zee.woo.woo2': 456,

              'a.b.c':            456, // KEY TEST: 'a.*.c' IS defined
            },
          },
        }),
        createFeature({
          name:      'feature2',
          fassets: {
            use: [
              'a.*.c', // KEY TEST: defaults to "required" of type "any"
            ]
          },
        }),
      ]) )
        .not.toThrow();
    });

    test('test user specified "optional"', () => {
      expect(()=> createFassets([
        createFeature({
          name:      'feature1',
          fassets: {
            define: {
              'wow.zee.woo.woo1': 123,
              'wow.zee.woo.woo2': 456,

//            'a.b.c':            456, // KEY TEST: No 'a.*.c' is defined
            },
          },
        }),
        createFeature({
          name:      'feature2',
          fassets: {
            use: [
              ['a.*.c', {required: false}], // KEY TEST: make "optional"
            ]
          },
        }),
      ]) )
        .not.toThrow();
    });

  });


  //***--------------------------------------------------------------------------
  describe('"defineUse" must match at least ONE "use" contract', () => {

    test('test defineUse mismatch', () => {
      expect(()=> createFassets([
        createFeature({
          name:      'feature1',
          fassets: {
            defineUse: {
              'wom.bee.woo.loo': 123,
              'wow.zee.woo.woo': 456, // KEY TEST: matches NO "use" contract
            },
          },
        }),
        createFeature({
          name:      'feature2',
          fassets: {
            use: [
              '*loo', // KEY TEST: matches first defineUse
//            '*woo', // KEY TEST: NO "use" contract for second defineUse
            ]
          },
        }),
      ]) )
        .toThrow(/ERROR defineUse 'wow.zee.woo.woo'.*MUST match at least one usage contract.*but does NOT.*found in Feature: 'feature1'/);
      // THROW:   ERROR defineUse 'wow.zee.woo.woo' directive MUST match at least one usage contract, but does NOT ... is this misspelled? (found in Feature: 'feature1')
    });

    test('test defineUse ALL match', () => {
      expect(()=> createFassets([
        createFeature({
          name:      'feature1',
          fassets: {
            defineUse: {
              'wom.bee.woo.loo': 123,
              'wow.zee.woo.woo': 456, // KEY TEST: now matches "use" contract
            },
          },
        }),
        createFeature({
          name:      'feature2',
          fassets: {
            use: [
              '*loo', // KEY TEST: matches first defineUse
              '*woo', // KEY TEST: matches second defineUse
            ]
          },
        }),
      ]) )
        .not.toThrow();
    });

  });


  //***--------------------------------------------------------------------------
  describe('accumulate multiple validation errors in ONE exception', () => {

    test('test bunch of errors', () => {
      expect(()=> createFassets([
        createFeature({
          name:      'feature1',
          fassets: {
            define: {
              'wow.zee.woo.woo1': 123,    // KEY TEST: invalid type
              'wow.zee.woo.woo2': (p)=>p, // KEY TEST: valid

              'a.b.c':            456,
            },
          },
        }),
        createFeature({
          name:      'feature2',
          fassets: {
            defineUse: {
              'wow.zee.woo.woo3': 'bad bad', // KEY TEST: invalid type
              'ouch':             'hmmmm',   // KEY TEST: no matching "use" contract
            },
            use: [
              'a.*.c',
              'a.*.f',         // KEY TEST: required usage contract, and NO 'a.*.f' is defined
             ['wow.zee.woo.*', {type: fassetValidations.fn, required: false }],
            ]
          },
        }),
      ]) )
         // MULTI-LINE-MATCH: Too match over multi-lines, 
         //                   simplest way I found was to replace ".*" with "[\s\S]*"
         //                   ... finds any number of whitespace/non-whitespace chars INCLUDING newlines
         //                   ... "." does NOT include newlines
        .toThrow(/4 validation errors[\s\S]*'wow.zee.woo.woo1', expecting: function[\s\S]*'wow.zee.woo.woo3', expecting: function[\s\S]*RESOURCE NOT FOUND.*'a.*.f'[\s\S]*defineUse 'ouch' directive MUST match at least one usage contract/);
      // THROW: 4 validation errors were found during Feature.fasset resource accumulation:
      //        VALIDATION ERROR in resource: 'wow.zee.woo.woo1', expecting: function ... resource defined in Feature: 'feature1', usage contract 'wow.zee.woo.*' found in Feature: 'feature2'
      //        VALIDATION ERROR in resource: 'wow.zee.woo.woo3', expecting: function ... resource defined in Feature: 'feature2', usage contract 'wow.zee.woo.*' found in Feature: 'feature2'
      //        REQUIRED RESOURCE NOT FOUND, usage contract 'a.*.f' (found in Feature: 'feature2') specifies a REQUIRED resource, but NO matches were found
      //        ERROR defineUse 'ouch' directive MUST match at least one usage contract, but does NOT ... is this misspelled? (found in Feature: 'feature2')  

    });

  });

});
