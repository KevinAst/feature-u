import {op}             from '../launchApp';  // module under test INTERNAL 
import {createFeature}  from '../..';

describe('launchApp.op.flch.appWillStart(app, activeFeatures, curRootAppElm): rootAppElm', () => {

  // NOTE 1: for our testing purposes, we really only care that
  //         feature.appWillStart({app, curRootAppElm})
  //         is invoked with the correct parameters ({app, curRootAppElm})!
  //         ... because we can't really test a client's implemantion of appWillStart()
  //         ... HOWEVER, by testing the return value of this implementation,
  //             we indirectly accomplish our desired goal!!
  // NOTE 2: we are actually dealing with react DOM elms, but for this isolated test
  //         we never render any DOM, so we work with simple strings!
  const activeFeatures = [

    createFeature({
      name:     'feature1', // NOTE: feature1 HAS an appWillStart()

      appWillStart({app, curRootAppElm}) {

        // include curRootAppElm ... and interpret the initial null value
        let rootAppElm = curRootAppElm || '';

        // accumulate our app
        // ... unconventional, but for our testing it proves that correct app was supplied
        rootAppElm += `App:${app}`;

        // accumulate our desired rootAppElm injection
        rootAppElm += `...rootAppElmFrom-feature1`;

        return rootAppElm;
      },
    }),

    createFeature({
      name:     'feature2', // NOTE: feature2 DOES NOT HAVE an appWillStart()
    }),

    createFeature({
      name:     'feature3', // NOTE: feature3 HAS an appWillStart()

      appWillStart({app, curRootAppElm}) {

        // include curRootAppElm ... and interpret the initial null value
        let rootAppElm = curRootAppElm || '';

        // accumulate our app
        // ... unconventional, but for our testing it proves that correct app was supplied
        rootAppElm += `App:${app}`;

        // accumulate our desired rootAppElm injection
        rootAppElm += `...rootAppElmFrom-feature3`;

        return rootAppElm;
      },
    }),

  ];

  const app = 'app-pass-through-for-testing';

  // function under test
  const rootAppElm = op.flch.appWillStart(app, activeFeatures, null);

  test('confirm the accumulated feature.appWillStart()', () => {
    expect(rootAppElm)
      .toBe('App:app-pass-through-for-testing...rootAppElmFrom-feature1' +
            'App:app-pass-through-for-testing...rootAppElmFrom-feature3');
  });

});
