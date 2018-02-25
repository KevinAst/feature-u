import {op}             from '../launchApp';  // module under test INTERNAL 
import createAspect$    from './createAspect$';
import {createFeature}  from '../..';

describe('launchApp.op.helper.defineRootAppElm(app, activeFeatures, aspects): rootAppElm', () => {

  // NOTE: throughout this test, we are actually dealing with react
  //       DOM elms, but for this isolated test we never render any DOM,
  //       so we work with simple strings!


  //***
  //*** Our Aspects
  //***

  const aspects = [ // NOTE: these aspects are registered in a reverse order from what they emit, proving correct processing

    // NOTE: extension3 HAS an injectRootAppElm()
    //       for our testing purposes, we really only care that
    //       aspect.injectRootAppElm(app, curRootAppElm)
    //       is invoked with the correct parameters (app, curRootAppElm)!
    //       ... because we can't really test a client's implemantion of injectRootAppElm()
    //       ... HOWEVER, by testing the return value of this implementation,
    //           we indirectly accomplish our desired goal!!
    createAspect$({
      name:     'extension3',

      injectRootAppElm(app, curRootAppElm) {

        // include curRootAppElm ... and interpret the initial null value
        let rootAppElm = curRootAppElm || '';

        // accumulate our app
        // ... unconventional, but for our testing it proves that correct app was supplied
        rootAppElm += `App:${app}`;

        // accumulate our desired rootAppElm injection
        rootAppElm += `...rootAppElmFrom-extension3`;

        return rootAppElm;
      },
    }),

    // NOTE: extension2 DOES NOT HAVE ANY extensions
    createAspect$({
      name:     'extension2',
    }),

    // NOTE: extension1 HAS an initialRootAppElm()
    //       for our testing purposes, we really only care that
    //       aspect.initialRootAppElm(app, curRootAppElm)
    //       is invoked with the correct parameters (app, curRootAppElm)!
    //       ... because we can't really test a client's implemantion of initialRootAppElm()
    //       ... HOWEVER, by testing the return value of this implementation,
    //           we indirectly accomplish our desired goal!!
    createAspect$({
      name:     'extension1',

      initialRootAppElm(app, curRootAppElm) {

        // include curRootAppElm ... and interpret the initial null value
        let rootAppElm = curRootAppElm || '';

        // accumulate our app
        // ... unconventional, but for our testing it proves that correct app was supplied
        rootAppElm += `App:${app}`;

        // accumulate our desired rootAppElm injection
        rootAppElm += `...rootAppElmFrom-extension1`;

        return rootAppElm;
      },
    }),

  ];


  //***
  //*** Our Features
  //***

  // NOTE: for our testing purposes, we really only care that
  //       feature.appWillStart({app, curRootAppElm})
  //       is invoked with the correct parameters ({app, curRootAppElm})!
  //       ... because we can't really test a client's implemantion of appWillStart()
  //       ... HOWEVER, by testing the return value of this implementation,
  //           we indirectly accomplish our desired goal!!
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


  //***
  //*** Our App
  //***

  const app = 'app-pass-through-for-testing';


  //***
  //*** Our function under test
  //***

  const rootAppElm = op.helper.defineRootAppElm(app, activeFeatures, aspects);


  //***
  //*** Our test confirmation ... FINALLY
  //***

  test('confirm the accumulated rootAppElm from a combination of Aspects/Features', () => {
    expect(rootAppElm)
      .toBe('App:app-pass-through-for-testing...rootAppElmFrom-extension1' +
            'App:app-pass-through-for-testing...rootAppElmFrom-feature1'   +
            'App:app-pass-through-for-testing...rootAppElmFrom-feature3'   +
            'App:app-pass-through-for-testing...rootAppElmFrom-extension3');

  });

});
