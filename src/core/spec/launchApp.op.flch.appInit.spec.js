import {op}             from '../launchApp';  // module under test INTERNAL 
import {createFeature}  from '../..';

describe('launchApp.op.flch.appInit(fassets, activeFeatures, aspects, showStatus): void', () => {

  function applyTest({expected}) { // reusable function

    // NOTE: for our testing purposes, we really only care that
    //       feature.appInit({showStatus, fassets, appState, dispatch}): promise | void
    //       is invoked with the correct parameters!
    //       ... because we can't really test a client's implementation of appInit()
    //       ... HOWEVER, by testing an accumulation value of this implementation,
    //           we indirectly accomplish our desired goal!!

    let accumFromAppInit = '';

    async function appInit({showStatus, fassets, appState, dispatch}) { // reusable function
      showStatus(`${this.name} status`);
      accumFromAppInit += `appInit for feature: ${this.name}\n`;
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
    const aspects = [];
    const showStatus = (msg='', err=null) => accumFromAppInit += `showStatus('${msg}')\n`;

    // an async jest test (by returning a promise, jest will block)
    test('confirm appInit() invoked properly', () => {
      return op.flch.appInit(fassets, activeFeatures, aspects, showStatus) // module under test (returns a promise)
        .then( () => {
          expect(accumFromAppInit)
            .toBe(expected);
        });
    });
  }


  describe('sync test', () => {

    applyTest({
      aspects: [], // no aspects
      expected: 
`appInit for feature: feature1
appInit for feature: feature3
showStatus('feature1 status')
showStatus('feature3 status')
showStatus('')
`,
    });

  });

});
