import createFassets      from '../createFassets';  // module under test
import {createFeature}    from '../..';

describe('createFassets(): fassets define/defineUse directive accumulation', () => {

  describe('define/defineUse basic structure error conditions', () => {

    // test both define/defineUse
    ['define', 'defineUse'].forEach( directive => {

      // drive test with various invalid defines
      [null, 0, 1, new Date(), 'BadString', 3.14].forEach( badDefineValue => {
        test(`${directive} directive MUST BE an object literal`, () => {
          expect(()=> createFassets([
            createFeature({
              name:    'featureTest',
              fassets: {
                [directive]: badDefineValue
              },
            }),
          ]) )
            .toThrow(/Feature.name: 'featureTest'.*the define.* directive MUST BE an object literal/);
          // THROW:  Feature.name: 'featureTest' ... ERROR in "fassets" aspect: the define/defineUse directive MUST BE an object literal
        });
      });

      test(`${directive} directive should NOT be empty`, () => {
        expect(()=> createFassets([
          createFeature({
            name:    'featureTest',
            fassets: {
              [directive]: {}
            },
          }),
        ]) )
          .toThrow(/Feature.name: 'featureTest'.*the define.*directive is empty/);
        // THROW:   Feature.name: 'featureTest' ... ERROR in "fassets" aspect, "define/defineUse" directive: the defineUse directive is empty (at least one definition is needed)
      });

    });

    // drive test with all reserved words
    ['get', 'isFeature'].forEach( reservedWord => {
      test('resource cannot overwrite a reserved word', () => {
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
      test(`resource key programmatic structure check for '${fassetsKey}': ${expectedError}`, () => {
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
          .toThrow( new RegExp(`Feature.name: 'featureTest'.*ERROR in "fassets" aspect.*fassetsKey.*\n*.*is invalid.*NOT a programmatic structure.*${expectedError}`) );
        // THROW: Feature.name: 'featureTest' ... ERROR in "fassets" aspect, "define/defineUse" directive: fassetsKey: 'a.*.c' is invalid (NOT a programmatic structure) ... wildcards are not supported
      });
    }

    test('resource must be unique (cannot be defined more than once)', () => {
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

  describe('define/defineUse content consolidation (normalized in fassets)', () => {

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


  describe('define/defineUse content consolidation overwrite errors', () => {

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

});
