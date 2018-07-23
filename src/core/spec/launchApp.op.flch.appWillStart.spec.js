import {op}             from '../launchApp';  // module under test INTERNAL 
import {createFeature}  from '../..';

describe('launchApp.op.flch.appWillStart(fassets, activeFeatures, curRootAppElm): rootAppElm', () => {

  // NOTE 1: for our testing purposes, we really only care that
  //         feature.appWillStart({fassets, curRootAppElm})
  //         is invoked with the correct parameters ({fassets, curRootAppElm})!
  //         ... because we can't really test a client's implemantion of appWillStart()
  //         ... HOWEVER, by testing the return value of this implementation,
  //             we indirectly accomplish our desired goal!!
  // NOTE 2: we are actually dealing with react DOM elms, but for this isolated test
  //         we never render any DOM, so we work with simple strings!
  const activeFeatures = [

    createFeature({
      name:     'feature1', // NOTE: feature1 HAS an appWillStart()

      appWillStart({fassets, curRootAppElm}) {

        // include curRootAppElm ... and interpret the initial null value
        let rootAppElm = curRootAppElm || '';

        // accumulate our app
        // ... unconventional, but for our testing it proves that correct fassets was supplied
        rootAppElm += `App:${fassets}`;

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

      appWillStart({fassets, curRootAppElm}) {

        // include curRootAppElm ... and interpret the initial null value
        let rootAppElm = curRootAppElm || '';

        // accumulate our app
        // ... unconventional, but for our testing it proves that correct fassets was supplied
        rootAppElm += `App:${fassets}`;

        // accumulate our desired rootAppElm injection
        rootAppElm += `...rootAppElmFrom-feature3`;

        return rootAppElm;
      },
    }),

  ];

  const fassets = 'fassets-pass-through-for-testing';

  // function under test
  const rootAppElm = op.flch.appWillStart(fassets, activeFeatures, null);

  test('confirm the accumulated feature.appWillStart()', () => {
    expect(rootAppElm)
      .toBe('App:fassets-pass-through-for-testing...rootAppElmFrom-feature1' +
            'App:fassets-pass-through-for-testing...rootAppElmFrom-feature3');
  });

});
