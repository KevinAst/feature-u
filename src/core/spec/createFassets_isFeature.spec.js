import createFassets      from '../createFassets';  // module under test
import {createFeature}    from '../..';

describe('createFassets(): fassets.hasFeature() tests', () => {

  describe('fassets.hasFeature(featureName): boolean', () => {

    // NOTE: this test does NOT require the Feature.fassets aspect
    const fassets = createFassets([
      createFeature({
        name:       'feature1',
      }),
      createFeature({
        name:       'feature2',
      }),
    ]);

    test('feature1', () => expect(fassets.hasFeature('feature1')).toBe(true)  );
    test('feature2', () => expect(fassets.hasFeature('feature2')).toBe(true)  );
    test('feature3', () => expect(fassets.hasFeature('feature3')).toBe(false) );

    test('missing param', () => {
      expect(()=>fassets.hasFeature())
        .toThrow(/fassets.hasFeature().*parameter violation.*featureName is required*/);
      // THROW:  fassets.hasFeature() parameter violation: featureName is required
    });

    test('invalid param', () => {
      expect(()=>fassets.hasFeature(123))
        .toThrow(/fassets.hasFeature().*parameter violation.*featureName must be a string*/);
      // THROW:  fassets.hasFeature() parameter violation: featureName must be a string
    });

  });

});
