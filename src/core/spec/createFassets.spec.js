import createFassets   from '../createFassets';  // module under test
import {createFeature} from '../..';

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


      // TODO: ?? test cannot contain wildcards (when implemented) ?? and other constraints

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
        .toThrow(`Feature.name: 'feature2' ... ERROR in "fassets" aspect: while normalizing the fassets 'foo.bar.baz' key, a conflict was detected with another feature at the 'bar' node (it is NOT an object)`);
      // THROW: Feature.name: 'feature2' ... ERROR in "fassets" aspect: while normalizing the fassets 'foo.bar.baz' key, a conflict was detected with another feature at the 'bar' node (it is NOT an object)
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
        .toThrow(`Feature.name: 'feature2' ... ERROR in "fassets" aspect: while normalizing the fassets 'foo.bar' key, a conflict was detected with another feature at the 'bar' node (overwriting existing data)`);
      // THROW: Feature.name: 'feature2' ... ERROR in "fassets" aspect: while normalizing the fassets 'foo.bar' key, a conflict was detected with another feature at the 'bar' node (overwriting existing data)
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
        .toThrow(`Feature.name: 'feature2' ... ERROR in "fassets" aspect: while normalizing the fassets 'aaa.bbb.ccc' key, a conflict was detected with another feature at the 'ccc' node (overwriting existing data)`);
      // THROW: Feature.name: 'feature2' ... ERROR in "fassets" aspect: while normalizing the fassets 'aaa.bbb.ccc' key, a conflict was detected with another feature at the 'ccc' node (overwriting existing data)
    });

  });
  
});
