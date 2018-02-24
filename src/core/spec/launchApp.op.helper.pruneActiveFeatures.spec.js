import {op}            from '../launchApp';  // module under test INTERNAL 
import {createFeature} from '../..';

const feature1 = createFeature({
  name: 'feature1',
});

const feature2 = createFeature({
  name: 'feature2',
});

const feature2Dup = createFeature({
  name: 'feature2',
});

const feature3Inactive = createFeature({
  name:    'feature3',
  enabled: false,
});


describe('launchApp.op.helper.pruneActiveFeatures(features): activeFeatures', () => {

  test('Test inactive feature pruning', () => {
    expect(op.helper.pruneActiveFeatures([feature1, feature2, feature3Inactive]))
      .toEqual([feature1, feature2]);
  });

  test('Test non-unique features', () => {
    expect(()=>op.helper.pruneActiveFeatures([feature1, feature2, feature2Dup]))
      .toThrow(/feature.name.*feature2.*NOT unique/);
    // THROW: launchApp() parameter violation: feature.name: 'feature2' is NOT unique
  });

});
