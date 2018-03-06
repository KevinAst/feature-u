import {op}                    from '../launchApp';    // module under test INTERNAL 
import createAspect$           from './createAspect$';
import {createFeature,
        extendFeatureProperty,
        managedExpansion}      from '../..';

const extension1 = createAspect$({
  name:     'extension1',
  genesis() {
    extendFeatureProperty('otherFeatureExtension1', 'myAspect');
  },

  validateFeatureContent(feature) {
    const featureName   = feature.name;
    const aspectContent = feature[this.name];
    if (aspectContent!=='good') {
      return `feature.name: '${featureName}' contains invalid feature.${this.name} AspectContent: ${aspectContent}`;
    }
  },
});

// NOTE: we must manually invoke genesis() BECAUSE this test is isolated from launchApp() run
extension1.genesis();

const aspectMap = {
  extension1,
};



describe('launchApp.op.alch.validateFeatureContent(features, aspectMap): void', () => {

  test('1: All builtin FeatureContent is valid', () => {
    expect(()=>op.alch.validateFeatureContent(
      [
        createFeature({
          name:         'feature1',
          enabled:      true,
          publicFace:   {my: 'public', face: ':-)'},
          appWillStart: ()=>'placebo-func',
          appDidStart:  ()=>'placebo-func',
        }),
      ], aspectMap)).not.toThrow();
  });

  test('2: Unrecognized Feature property', () => {
    expect(()=>op.alch.validateFeatureContent(
      [
        createFeature({
          name:    'feature2',
          badProp: 123,
        }),
      ], aspectMap)).toThrow(/contains unrecognized property.*badProp/);
    // THROW: createFeature() parameter violation: Feature.name: 'feature2' contains unrecognized property: badProp ... no Aspect is registered to handle this!
  });

  test('3: Aspect extension with recognized "valid" AspectContent', () => {
    expect(()=>op.alch.validateFeatureContent(
      [
        createFeature({
          name:         'feature3',
          extension1:   'good',
        }),
      ], aspectMap)).not.toThrow();
  });

  test('4: Aspect extension with recognized "invalid" AspectContent', () => {
    expect(()=>op.alch.validateFeatureContent(
      [
        createFeature({
          name:         'feature4',
          extension1:   'bad',
        }),
      ], aspectMap)).toThrow(/contains invalid feature.extension1 AspectContent: bad/);
    // THROW: createFeature() parameter violation: feature.name: 'feature4' contains invalid feature.extension1 AspectContent: bad
  });

  test('4B: Aspect extension with recognized "invalid" AspectContent BUT delayed validaion via managedExpansion()', () => {
    expect(()=>op.alch.validateFeatureContent(
      [
        createFeature({
          name:         'feature4B',
          extension1:   managedExpansion(()=>'bad'),
        }),
      ], aspectMap)).not.toThrow(/contains invalid feature.extension1 AspectContent: bad/);
  });

  test('5: Aspect extension with recognized "valid" AspectContent AND extended feature property', () => {
    expect(()=>op.alch.validateFeatureContent(
      [
        createFeature({
          name:                   'feature5',
          extension1:             'good',
          otherFeatureExtension1: 'WowZee',
        }),
      ], aspectMap)).not.toThrow();
  });

});
