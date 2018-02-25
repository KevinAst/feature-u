import {op}             from '../launchApp';  // module under test INTERNAL 
import createAspect$    from './createAspect$';
import {createFeature}  from '../..';

describe('launchApp.op.alch.assembleFeatureContent(app, activeFeatures, aspects): void', () => {

  const extension1 = createAspect$({
    name:     'extension1',

    // NOTE: for our testing purposes, we really only care that
    //       aspect.assembleFeatureContent(app, activeFeatures) 
    //       was invoked with the correct parameters (app, activeFeatures)!
    //       ... because we can't really test a client's implemantion of assembleFeatureContent()
    //       ... HOWEVER, by testing self's simple accumulation (this.accum),
    //           we indirectly accomplish our desired goal!!
    assembleFeatureContent(app, activeFeatures) {
      // initialize our accumulation with app
      // ... unconventional, but for our testing it proves that correct app was supplied
      this.accum = app;
      // perform our accumulation
      for (const feature of activeFeatures) {
        const myAspectContent = feature[this.name];
        if (myAspectContent) {
          this.accum += `+${myAspectContent}`;
        }
      }
    },
  });

  const aspects = [
    extension1,
  ];

  const app = 'app-pass-through-for-testing';

  const activeFeatures = [

    createFeature({
      name:         'feature1',
      extension1:   'feature1-extension1',
    }),

    createFeature({
      name:         'feature2',
    }),

    createFeature({
      name:         'feature3',
      extension1:   'feature3-extension1',
    }),
  ];

  op.alch.assembleFeatureContent(app, activeFeatures, aspects); // function under test

  test('confirm the accumulated feature content within each aspect', () => {
    expect(extension1.accum)
      .toBe('app-pass-through-for-testing+feature1-extension1+feature3-extension1');
  });

});
