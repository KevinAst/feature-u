import {op}                    from '../launchApp';    // module under test INTERNAL 
import createAspect$           from './createAspect$';
import {createFeature,
        managedExpansion}      from '../..';

const extension1 = createAspect$({
  name:     'extension1',
  validateFeatureContent(feature) {
    const featureName   = feature.name;
    const aspectContent = feature[this.name];
    if (!aspectContent.includes('good')) {
      return `feature.name: '${featureName}' contains invalid feature.${this.name} AspectContent: ${aspectContent}`;
    }
  },
  expandFeatureContent(app, feature) {
    // default expansion here
    feature[this.name] = feature[this.name](app);
  
    // apply additional specialized validation (as needed in feature-redux)
    const featureName   = feature.name;
    const aspectContent = feature[this.name];
    if (aspectContent==='goodExceptForSpecialValidation') {
      return `feature.name: '${featureName}' contains SPECIALIZED invalid feature.${this.name} AspectContent: ${aspectContent}`;
    }
  },
});

const app = 'app: for testing, all we need is a pass-through';

const aspects = [
  extension1,
];

describe('launchApp.op.alch.expandFeatureContent(app, activeFeatures, aspects): void', () => {

  test('test delayed expansion', () => {

    const feature1 = createFeature({
      name:         'feature1',
      extension1:   managedExpansion(()=>'really good'),
    });

    op.alch.expandFeatureContent(app, [feature1], aspects);

    expect(feature1.extension1)
      .toBe('really good');
  });

  test('test delayed expansion validation', () => {

    const feature1 = createFeature({
      name:         'feature1',
      extension1:   managedExpansion(()=>'bad'),
    });

    expect(()=>op.alch.expandFeatureContent(app, [feature1], aspects))
      .toThrow(/contains invalid feature.extension1 AspectContent: bad/);
    // THROW: createFeature() parameter violation: feature.name: 'feature1' contains invalid feature.extension1 AspectContent: bad
  });


  test('test delayed specialized expandFeatureContent() valiation (as needed in feature-redux)', () => {
  
    const feature1 = createFeature({
      name:         'feature1',
      extension1:   managedExpansion(()=>'goodExceptForSpecialValidation'),
    });
  
    expect(()=>op.alch.expandFeatureContent(app, [feature1], aspects))
      .toThrow(/contains SPECIALIZED invalid feature.extension1 AspectContent: goodExceptForSpecialValidation/);
    // THROW: createFeature() parameter violation: feature.name: 'feature1' contains SPECIALIZED invalid feature.extension1 AspectContent: goodExceptForSpecialValidation
  });

});
