import {op}             from '../launchApp';  // module under test INTERNAL 
import {createFeature}  from '../..';

describe('launchApp.op.flch.appDidStart(fassets, activeFeatures, additionalHooksParams): void', () => {

  function applyTest({additionalHooksParams, expected}) { // reusable function

    // NOTE: for our testing purposes, we really only care that
    //       feature.appDidStart({fassets, getState, dispatch})
    //       is invoked with the correct parameters!
    //       ... because we can't really test a client's implementation of appDidStart()
    //       ... HOWEVER, by testing an accumulation value of this implementation,
    //           we indirectly accomplish our desired goal!!

    let accumFromAppDidStart = '';

    function appDidStart({fassets, getState, dispatch}) { // reusable function
      accumFromAppDidStart += `appDidStart for feature: ${this.name} (fassets: ${fassets}, getState: ${getState}, dispatch: ${dispatch})\n`;
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
    op.flch.appDidStart(fassets, activeFeatures, additionalHooksParams);

    test('confirm appDidStart() invoked properly', () => {
      expect(accumFromAppDidStart)
        .toBe(expected);
    });

  }


  describe('WITHOUT redux store', () => {

    applyTest({
      additionalHooksParams: ({}),
      expected:
`appDidStart for feature: feature1 (fassets: fassets-pass-through-for-testing, getState: undefined, dispatch: undefined)
appDidStart for feature: feature3 (fassets: fassets-pass-through-for-testing, getState: undefined, dispatch: undefined)
`,
    });

  });

  describe('WITH redux store', () => {

    applyTest({
      additionalHooksParams: ({getState: 'pretendState', dispatch: 'pretendDispatch'}),
      expected:
`appDidStart for feature: feature1 (fassets: fassets-pass-through-for-testing, getState: pretendState, dispatch: pretendDispatch)
appDidStart for feature: feature3 (fassets: fassets-pass-through-for-testing, getState: pretendState, dispatch: pretendDispatch)
`,
    });

  });

});
