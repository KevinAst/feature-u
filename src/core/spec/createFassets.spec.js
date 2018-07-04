import createFassets   from '../createFassets';  // module under test
import {createFeature} from '../..';

describe('createFassets(activeFeatures): fassets', () => {

  describe('fassets.isFeature(featureName)', () => {
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

});
