import createFassets      from '../createFassets';  // module under test
import fassetValidations  from '../fassetValidations';
import {createFeature}    from '../..';

describe('createFassets(activeFeatures): fassets', () => {

  describe('fassets.isFeature(featureName)', () => {
    // NOTE: this test does NOT require the Feature.fassets aspect
    const fassets = createFassets([
      createFeature({
        name:       'feature1',
      }),
      createFeature({
        name:       'feature2',
      }),
    ]);
    test('feature1', () => expect(fassets.isFeature('feature1')).toBe(true)  );
    test('feature2', () => expect(fassets.isFeature('feature2')).toBe(true)  );
    test('feature3', () => expect(fassets.isFeature('feature3')).toBe(false) );
    test('missing param', () => {
      expect(()=>fassets.isFeature())
        .toThrow(/fassets.isFeature().*parameter violation.*featureName is required*/);
      // THROW:  fassets.isFeature() parameter violation: featureName is required
    });
    test('invalid param', () => {
      expect(()=>fassets.isFeature(123))
        .toThrow(/fassets.isFeature().*parameter violation.*featureName must be a string*/);
      // THROW:  fassets.isFeature() parameter violation: featureName must be a string
    });
  });


  describe('Feature.fassets aspect', () => {

    describe('fassets basic structure (error conditions)', () => {

      // drive test with various invalid fassets (top level structure)
      [null, 0, 1, new Date(), 'BadString', 3.14].forEach( badFassets => {
        test('must be an object literal', () => {
          expect(()=> createFassets([
            createFeature({
              name:       'featureTest',
              fassets:    badFassets,
            }),
          ]) )
            .toThrow(/Feature.name: 'featureTest'.*fassets aspect MUST BE an object literal/);
          // THROW: Feature.name: 'featureTest' ... ERROR in "fassets" aspect: the fassets aspect MUST BE an object literal
        });
      });

      test('all fassets directives are recognized', () => {
        expect(()=> createFassets([
          createFeature({
            name:       'featureTest',
            fassets:    {
              define:        'recognized directive: content can be invalid BECAUSE unrecognized check is performed first',
              badDirective1: 123,
              defineUse:     'recognized directive: content can be invalid BECAUSE unrecognized check is performed first',
              use:           'recognized directive: content can be invalid BECAUSE unrecognized check is performed first',
              badDirective2: 456,
            },
          }),
        ]) )
          .toThrow(/Feature.name: 'featureTest'.*unrecognized fassets.*badDirective1.*badDirective2*/);
        // THROW:  Feature.name: 'featureTest' ... ERROR in "fassets" aspect: unrecognized fassets directive(s): badDirective1,badDirective2 ... expecting only: define/use/defineUse
      });

      test('at least ONE fassets directive is supplied', () => {
        expect(()=> createFassets([
          createFeature({
            name:       'featureTest',
            fassets:    {},
          }),
        ]) )
          .toThrow(/Feature.name: 'featureTest'.*at least one directive is required/);
        // THROW: Feature.name: 'featureTest' ... ERROR in "fassets" aspect: at least one directive is required (define/use/defineUse)
      });

      // test both define/defineUse
      ['define', 'defineUse'].forEach( directive => {
        // drive test with various invalid defines
        [null, 0, 1, new Date(), 'BadString', 3.14].forEach( badDefineValue => {
          test(`${directive} directive MUST BE an object literal`, () => {
            expect(()=> createFassets([
              createFeature({
                name:       'featureTest',
                fassets: {
                  [directive]: badDefineValue
                },
              }),
            ]) )
              .toThrow(/Feature.name: 'featureTest'.*the define.* directive MUST BE an object literal/);
            // THROW:  Feature.name: 'featureTest' ... ERROR in "fassets" aspect: the define/defineUse directive MUST BE an object literal
          });
        });
      });

      // drive test with all reserved words
      ['get', 'isFeature'].forEach( reservedWord => {
        test('fassets cannot overwrite a reserved word', () => {
          expect(()=> createFassets([
            createFeature({
              name:       'featureTest',
              fassets:    {
                define: {
                  [reservedWord]: 123,
                },
              },
            }),
          ]) )
            .toThrow(/Feature.name: 'featureTest'.*fassets.define.*is a reserved word/);
          // THROW: Feature.name: 'featureTest' ... ERROR in "fassets" aspect: fassets.define.'get' is a reserved word
        });
      });


      const programmaticTests = {
        '':          'contains invalid empty string',                    // empty string
        '123':       'alpha, followed by any number of alpha-numerics',  // must start with alpha
        '.a':        'contains invalid empty string',                    // beginning empty string
        'a.':        'contains invalid empty string',                    // ending empty string
        'a..b':      'contains invalid empty string',                    // embedded empty string
        'a.b.':      'contains invalid empty string',                    // ending empty string (again)
        'a.b.1':     'alpha, followed by any number of alpha-numerics',  // each node must start with alpha
        'a.b\n.c':   'contains unsupported cr/lf',                       // cr/lf NOT supported
        'a.b .c':    'alpha, followed by any number of alpha-numerics',  // spaces NOT supported
        'a.*.c':     'wildcards are not supported',                      // wildcards NOT supported
      };
      for (const fassetsKey in programmaticTests) {
        const expectedError = programmaticTests[fassetsKey];
        test(`fassets key programmatic structure check for '${fassetsKey}': ${expectedError}`, () => {
          expect(()=> createFassets([
            createFeature({
              name:       'featureTest',
              fassets:    {
                define: {
                  [fassetsKey]: 'value insignificant',
                },
              },
            }),
          ]) )
            .toThrow( new RegExp(`Feature.name: 'featureTest'.*ERROR in "fassets" aspect: fassetsKey.*\n*.*is invalid.*NOT a programmatic structure.*${expectedError}`) );
          // THROW: Feature.name: 'featureTest' ... ERROR in "fassets" aspect: fassetsKey: '' is invalid (NOT a programmatic structure) ... ${expectedError}
        });
      }

      test('fassets must be unique (cannot be defined more than once)', () => {
        expect(()=> createFassets([
          createFeature({
            name:       'feature1',
            fassets:    {
              define: {
                'myDoodle.bop': 123,
              },
            },
          }),
          createFeature({
            name:       'feature2',
            fassets:    {
              define: {
                'myDoodle.bop': 456,
              },
            },
          }),
        ]) )
          .toThrow(/Feature.name: 'feature2'.*fassets.define.'myDoodle.bop'.*NOT unique.*previously defined.*'feature1'/);
        // THROW: Feature.name: 'feature2' ... ERROR in "fassets" aspect: fassets.define.'myDoodle.bop' is NOT unique ... previously defined in Feature.name: 'feature1'
      });


    });

    describe('define/defineUse content consolidation', () => {

      const fassets = createFassets([
        createFeature({
          name:    'feature1',
          fassets: {
            define: {
              'foo': 123,
            },
            defineUse: {
              'wow.aaa': 111,
              'wow.bbb': { ccc: 333 },
            },
          },
        }),
        createFeature({
          name:    'feature2',
          fassets: {
            defineUse: {
              'bar': 999,
            },
            define: {
              'wow.bbb.ddd': 444, // NOTE: we can in fact add to the app-specific wow.bbb (above)
            },
          },
        }),
      ]);

      test('foo',         () => expect(fassets.foo         ).toBe(123) );
      test('bar',         () => expect(fassets.bar         ).toBe(999) );
      test('wow.aaa',     () => expect(fassets.wow.aaa     ).toBe(111) );
      test('wow.bbb.ccc', () => expect(fassets.wow.bbb.ccc ).toBe(333) );
      test('wow.bbb.ddd', () => expect(fassets.wow.bbb.ddd ).toBe(444) );
    });
    
  });

  describe('define/defineUse content overwrite errors', () => {

    test('intermediate node conflict', () => {
      expect(()=> createFassets([
        createFeature({
          name:       'feature1',
          fassets:    {
            define: {
              'foo.bar': 123,
            },
          },
        }),
        createFeature({
          name:       'feature2',
          fassets:    {
            define: {
              'foo.bar.baz': 456, // NOTE: cannot overwrite the foo.bar (above) ... because it can't be BOTH 123 and an object {baz:456}
            },
          },
        }),
      ]) )
        .toThrow(/Feature.name: 'feature2' ... ERROR in "fassets" aspect.*while normalizing the fassets 'foo.bar.baz' key, a conflict was detected with another feature at the 'bar' node.*it is NOT an object/);
      // THROW: Feature.name: 'feature2' ... ERROR in "fassets" aspect, "define" directive: while normalizing the fassets 'foo.bar.baz' key, a conflict was detected with another feature at the 'bar' node (it is NOT an object)
    });

    test('last node conflict', () => {
      expect(()=> createFassets([
        createFeature({
          name:       'feature1',
          fassets:    {
            define: {
              'foo.bar.baz': 456,
            },
          },
        }),
        createFeature({
          name:       'feature2',
          fassets:    {
            define: {
              'foo.bar': 123, // NOTE: cannot overwrite the foo.bar (above) ... because it can't be BOTH an object {baz:456} and 123
            },
          },
        }),
      ]) )
        .toThrow(/Feature.name: 'feature2' ... ERROR in "fassets" aspect.*while normalizing the fassets 'foo.bar' key, a conflict was detected with another feature at the 'bar' node.*overwriting existing data/);
      // THROW:   Feature.name: 'feature2' ... ERROR in "fassets" aspect, "define" directive: while normalizing the fassets 'foo.bar' key, a conflict was detected with another feature at the 'bar' node (overwriting existing data)
    });

    test('cannot overwrite app data', () => {
      expect(()=> createFassets([
        createFeature({
          name:       'feature1',
          fassets:    {
            define: {
              'aaa.bbb': { ccc: 333 },
            },
          },
        }),
        createFeature({
          name:       'feature2',
          fassets:    {
            define: {
              'aaa.bbb.ccc': 444, // NOTE: we can't overwrite aa.bb.ccc (above) ... even when it is app-defined
            },
          },
        }),
      ]) )
        .toThrow(/Feature.name: 'feature2' ... ERROR in "fassets" aspect.*while normalizing the fassets 'aaa.bbb.ccc' key, a conflict was detected with another feature at the 'ccc' node.*overwriting existing data/);
      // THROW:   Feature.name: 'feature2' ... ERROR in "fassets" aspect, "define" directive: while normalizing the fassets 'aaa.bbb.ccc' key, a conflict was detected with another feature at the 'ccc' node (overwriting existing data)
    });

  });




  describe('use directive tests', () => {

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

    const validTests = {
      'a':         'just because',
      'a1':        'just because',
      'a1.b':      'just because',
      'a1.b2.c':   'just because',
      'a.*.c':     'wildcards are supported',
      '*a.*.c*':   'wildcards are supported',
    };
    for (const useKey in validTests) {
      const reason = validTests[useKey];
      test(`useKey valid check '${useKey}': ${reason}`, () => {
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
          .not.toThrow();
      });
    }

    const invalidTests = {
      '':          'contains invalid empty string',                    // empty string
      '123':       'alpha, followed by any number of alpha-numerics',  // must start with alpha
      '.a':        'contains invalid empty string',                    // beginning empty string
      'a.':        'contains invalid empty string',                    // ending empty string
      'a..b':      'contains invalid empty string',                    // embedded empty string
      'a.b.':      'contains invalid empty string',                    // ending empty string (again)
      'a.b.1':     'alpha, followed by any number of alpha-numerics',  // each node must start with alpha
      'a.b\n.c':   'contains unsupported cr/lf',                       // cr/lf NOT supported
      'a.b .c':    'alpha, followed by any number of alpha-numerics',  // spaces NOT supported
    };
    for (const useKey in invalidTests) {
      const expectedError = invalidTests[useKey];
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
    }

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
