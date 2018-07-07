import createFassets      from '../createFassets';  // module under test
import fassetValidations  from '../fassetValidations';
import {createFeature}    from '../..';

describe('createFassets(): fassets use directive accumulation', () => {

  describe('use directive basic structure error conditions', () => {

    test(`use directive MUST BE an array`, () => {
      expect(()=> createFassets([
        createFeature({
          name:       'featureTest',
          fassets: {
            use: 123,
          },
        }),
      ]) )
        .toThrow(/Feature.name: 'featureTest'.*the use directive MUST BE an array/);
      // THROW:   Feature.name: 'featureTest' ... ERROR in "fassets" aspect, "use" directive: the use directive MUST BE an array
    });

    test(`use directive should NOT be empty`, () => {
      expect(()=> createFassets([
        createFeature({
          name:       'featureTest',
          fassets: {
            use: [],
          },
        }),
      ]) )
        .toThrow(/Feature.name: 'featureTest'.*the use directive is empty/);
      // THROW:   Feature.name: 'featureTest' ... ERROR in "fassets" aspect, "use" directive: the use directive is empty (at least one usage contract is needed
    });

    test(`use directive entries must either be a string or a string/options in a two element array`, () => {
      expect(()=> createFassets([
        createFeature({
          name:       'featureTest',
          fassets: {
            use: [
              new Date(),
            ]
          },
        }),
      ]) )
        .toThrow(/Feature.name: 'featureTest'.*entry must either be a string or a string.*options in a two element array/);
      // THROW:   Feature.name: 'featureTest' ... ERROR in "fassets" aspect, "use" directive: "use" entry must either be a string or a string/options in a two element array
    });

    test(`use directive with options must be a 2 element array`, () => {
      expect(()=> createFassets([
        createFeature({
          name:       'featureTest',
          fassets: {
            use: [
              [1, 2, 3],
            ]
          },
        }),
      ]) )
        .toThrow(/Feature.name: 'featureTest'.*incorrect array size: 3/);
      // THROW:   Feature.name: 'featureTest' ... ERROR in "fassets" aspect, "use" directive: "use" entry must either be a string or a string/options in a two element array ... incorrect array size: 3
    });

    test(`use directive with options first elm must be a string`, () => {
      expect(()=> createFassets([
        createFeature({
          name:       'featureTest',
          fassets: {
            use: [
              [1, 2],
            ]
          },
        }),
      ]) )
        .toThrow(/Feature.name: 'featureTest'.*first element is NOT a string/);
      // THROW:   Feature.name: 'featureTest' ... ERROR in "fassets" aspect, "use" directive: "use" entry with options (two element array), first element is NOT a string
    });

    test(`use directive with options second elm must be an object`, () => {
      expect(()=> createFassets([
        createFeature({
          name:       'featureTest',
          fassets: {
            use: [
              ["a.*.b", 2],
            ]
          },
        }),
      ]) )
        .toThrow(/Feature.name: 'featureTest'.*second element is NOT an object/);
      // THROW:   Feature.name: 'featureTest' ... ERROR in "fassets" aspect, "use" directive: "use" entry with options (two element array), second element is NOT an object
    });

    test(`use directive with options second elm object with unrecognized items`, () => {
      expect(()=> createFassets([
        createFeature({
          name:       'featureTest',
          fassets: {
            use: [
              ["a.*.b", {required: false, WowZee: 123, WooWoo: 456}],
            ]
          },
        }),
      ]) )
        .toThrow(/Feature.name: 'featureTest'.*options have unrecognized entries: WowZee,WooWoo/);
      // THROW:    Feature.name: 'featureTest' ... ERROR in "fassets" aspect, "use" directive: "use" entry with options (two element array), options have unrecognized entries: WowZee,WooWoo ... expecting only: required/type
    });

    [
     // useKey       reason
     // ===========  ========================
      [ 'a',         'just because'            ],
      [ 'a1',        'just because'            ],
      [ 'a1.b',      'just because'            ],
      [ 'a1.b2.c',   'just because'            ],
      [ 'a.*.c',     'wildcards are supported' ],
      [ '*a.*.c*',   'wildcards are supported' ],
    ].forEach( ([useKey, reason]) => {
      test(`useKey valid check '${useKey}': ${reason}`, () => {
        expect(()=> createFassets([
          createFeature({
            name:       'featureTest',
            fassets:    {
              use: [
                // make optional so as to not run into other validation constraints
                [useKey, {required: false}],
              ],
            },
          }),
        ]) )
          .not.toThrow();
      });
    });

    [
     // useKey       expectedError                                       reason
     // ===========  ==================================================  =================================
      [ '',          'contains invalid empty string',                    'empty string'                    ],
      [ '123',       'alpha, followed by any number of alpha-numerics',  'must start with alpha'           ],
      [ '.a',        'contains invalid empty string',                    'beginning empty string'          ],
      [ 'a.',        'contains invalid empty string',                    'ending empty string'             ],
      [ 'a..b',      'contains invalid empty string',                    'embedded empty string'           ],
      [ 'a.b.',      'contains invalid empty string',                    'ending empty string (again)'     ],
      [ 'a.b.1',     'alpha, followed by any number of alpha-numerics',  'each node must start with alpha' ],
      [ 'a.b\n.c',   'contains unsupported cr/lf',                       'cr/lf NOT supported'             ],
      [ 'a.b .c',    'alpha, followed by any number of alpha-numerics',  'spaces NOT supported'            ],
    ].forEach( ([useKey, expectedError, reason]) => {

      test(`useKey invalid check '${useKey}': ${expectedError}`, () => {
        expect(()=> createFassets([
          createFeature({
            name:       'featureTest',
            fassets:    {
              use: [
                useKey
              ],
            },
          }),
        ]) )
          .toThrow( new RegExp(`Feature.name: 'featureTest'.*ERROR in "fassets" aspect, "use" directive.*\n*.*is invalid.*NOT a programmatic structure.*${expectedError}`) );
        // THROW:  Feature.name: 'featureTest' ... ERROR in "fassets" aspect, "use" directive: fassetsKey: '' is invalid (NOT a programmatic structure) ... contains invalid empty string
      });

    });

    test(`use directive with options: 'required' must be a boolean`, () => {
      expect(()=> createFassets([
        createFeature({
          name:    'featureTest',
          fassets: {
            use: [
              ['a.*.b', {required: 'OUCH'}],
            ],
          },
        }),
      ]) )
        .toThrow(/Feature.name: 'featureTest' ... ERROR in "fassets" aspect.*"use" entry with options.*'a.*.b'.*'required' entry must be true.*false/);
      // THROW:    Feature.name: 'featureTest' ... ERROR in "fassets" aspect, "use" directive: "use" entry with options ('a.*.b'), 'required' entry must be true/false
    });

    test(`use directive with options: 'type' must be a fassetValidationFn`, () => {
      expect(()=> createFassets([
        createFeature({
          name:    'featureTest',
          fassets: {
            use: [
              ['a.*.b', {required: false, type: 'OUCH'}],
            ],
          },
        }),
      ]) )
        .toThrow(/Feature.name: 'featureTest' ... ERROR in "fassets" aspect.*"use".*'a.*.b'.*'type' entry must be a fassetValidationFn/);
      // THROW:   Feature.name: 'featureTest' ... ERROR in "fassets" aspect, "use" directive: "use" entry with options ('a.*.b'), 'type' entry must be a fassetValidationFn
    });

    test(`use directive can be duplicated across features, with varying required`, () => {
      expect(()=> createFassets([
        createFeature({
          name:    'feature1',
          fassets: {
            define: {
              'a.x.b': 'needed ... it is required in other feature',
            },
            use: [
              ['a.*.b', {required: false, type: fassetValidations.any}],
            ],
          },
        }),
        createFeature({
          name:    'feature2',
          fassets: {
            use: [
              ['a.*.b', {required: true, type: fassetValidations.any}],
            ],
          },
        }),
      ]) )
        .not.toThrow();
    });

    test(`use directive CANNOT be duplicated across features, with varying type`, () => {
      expect(()=> createFassets([
        createFeature({
          name:    'feature1',
          fassets: {
            use: [
              ['a.*.b', {required: false, type: fassetValidations.any}],
            ],
          },
        }),
        createFeature({
          name:    'feature2',
          fassets: {
            use: [
              ['a.*.b', {required: true, type: fassetValidations.str}],
            ],
          },
        }),
      ]) )
        .toThrow(/Feature.name: 'feature2'.*ERROR in "fassets" aspect, "use" directive: cannot accumulate duplicate 'use' contract from multiple features: \[feature1,feature2\].*the type validateFns are NOT the same/);
      // THROW:   Feature.name: 'feature2' ... ERROR in "fassets" aspect, "use" directive: cannot accumulate duplicate 'use' contract from multiple features: [feature1,feature2] ... the type validateFns are NOT the same
    });

  });

});
