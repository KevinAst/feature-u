import {op}             from '../launchApp';  // module under test INTERNAL 
import createAspect$    from './createAspect$';
import {createFeature}  from '../..';

describe('launchApp.op.flch.appDidStart(fassets, activeFeatures, aspects): void', () => {

  function applyTest({aspects, expected}) { // reusable function

    // NOTE: for our testing purposes, we really only care that
    //       feature.appDidStart({fassets, appState, dispatch})
    //       is invoked with the correct parameters!
    //       ... because we can't really test a client's implemantion of appDidStart()
    //       ... HOWEVER, by testing an accumulation value of this implementation,
    //           we indirectly accomplish our desired goal!!

    let accumFromAppDidStart = '';

    function appDidStart({fassets, appState, dispatch}) { // reusable function
      accumFromAppDidStart += `appDidStart for feature: ${this.name} (fassets: ${fassets}, appState: ${appState}, dispatch: ${dispatch})`;
    }

    const activeFeatures = [

      createFeature({
        name:         'feature1',
        appDidStart,
      }),

      createFeature({
        name:         'feature2',
      }),

      createFeature({
        name:         'feature3',
        appDidStart,
      }),

    ];

    const fassets = 'fassets-pass-through-for-testing';


    // our function under test
    op.flch.appDidStart(fassets, activeFeatures, aspects);

    test('confirm appDidStart() invoked properly', () => {
      expect(accumFromAppDidStart)
        .toBe(expected);
    });

  }


  describe('WITHOUT redux store', () => {

    applyTest({
      aspects: [], // no aspects
      expected: 'appDidStart for feature: feature1 (fassets: fassets-pass-through-for-testing, appState: undefined, dispatch: undefined)' +
                'appDidStart for feature: feature3 (fassets: fassets-pass-through-for-testing, appState: undefined, dispatch: undefined)',
    });

  });

  describe('WITH redux store', () => {

    applyTest({
      aspects: [
        createAspect$({  // an Aspect WITH getReduxStore()
          name: 'aspect1',
          getReduxStore() {
            return { // simulated store
              getState: () => 'pretendState', // NOTE: our usage invokes this as a function
              dispatch: 'pretendDispatch',    // NOTE: here our usage simply passes this along (even though in real life it is a function)
            };
          },
        }),
      ],
      expected: 'appDidStart for feature: feature1 (fassets: fassets-pass-through-for-testing, appState: pretendState, dispatch: pretendDispatch)' +
                'appDidStart for feature: feature3 (fassets: fassets-pass-through-for-testing, appState: pretendState, dispatch: pretendDispatch)',
    });

  });

});
