import {op}             from '../launchApp';  // module under test INTERNAL 
import {createFeature}  from '../..';

describe('launchApp.op.flch.appInit(fassets, activeFeatures, additionalHooksParams, showStatus): void', () => {

  function applyTest({additionalHooksParams, expected}) { // reusable function

    // NOTE: for our testing purposes, we really only care that
    //       feature.appInit({showStatus, fassets, getState, dispatch}): promise | void
    //       is invoked with the correct parameters!
    //       ... because we can't really test a client's implementation of appInit()
    //       ... HOWEVER, by testing an accumulation value of this implementation,
    //           we indirectly accomplish our desired goal!!

    let accumFromAppInit = '';

    async function appInit({showStatus, fassets, getState, dispatch}) { // reusable function
      showStatus(`${this.name} status`);
      accumFromAppInit += `appInit for feature: ${this.name} (fassets: ${fassets}, getState: ${getState}, dispatch: ${dispatch})\n`;
    }

    const activeFeatures = [

      createFeature({
        name:         'feature1',
        appInit,
      }),

      createFeature({
        name:         'feature2',
      }),

      createFeature({
        name:         'feature3',
        appInit,
      }),

    ];

    const fassets = 'fassets-pass-through-for-testing';
    const showStatus = (msg='', err=null) => accumFromAppInit += `showStatus('${msg}')\n`;

    // an async jest test (by returning a promise, jest will block)
    test('confirm appInit() invoked properly', () => {
      return op.flch.appInit(fassets, activeFeatures, additionalHooksParams, showStatus) // module under test (returns a promise)
        .then( () => {
          expect(accumFromAppInit)
            .toBe(expected);
        });
    });
  }


  describe('WITHOUT redux store', () => {

    applyTest({
      additionalHooksParams: {}, // no additionalHooksParams
      expected: 
`appInit for feature: feature1 (fassets: fassets-pass-through-for-testing, getState: undefined, dispatch: undefined)
appInit for feature: feature3 (fassets: fassets-pass-through-for-testing, getState: undefined, dispatch: undefined)
showStatus('feature1 status')
showStatus('feature3 status')
showStatus('')
`,
    });

  });


  describe('WITH redux store', () => {

    applyTest({
      additionalHooksParams: ({getState: 'pretendState', dispatch: 'pretendDispatch'}),
      expected: 
`appInit for feature: feature1 (fassets: fassets-pass-through-for-testing, getState: pretendState, dispatch: pretendDispatch)
appInit for feature: feature3 (fassets: fassets-pass-through-for-testing, getState: pretendState, dispatch: pretendDispatch)
showStatus('feature1 status')
showStatus('feature3 status')
showStatus('')
`,
    });

  });

});
