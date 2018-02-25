import {op}           from '../launchApp';  // module under test INTERNAL 
import createAspect$  from './createAspect$';

describe('launchApp.op.alch.injectRootAppElm(app, aspects, curRootAppElm): rootAppElm', () => {

  // NOTE 1: for our testing purposes, we really only care that
  //         aspect.injectRootAppElm(app, curRootAppElm)
  //         is invoked with the correct parameters (app, curRootAppElm)!
  //         ... because we can't really test a client's implemantion of injectRootAppElm()
  //         ... HOWEVER, by testing the return value of this implementation,
  //             we indirectly accomplish our desired goal!!
  // NOTE 2: we are actually dealing with react DOM elms, but for this isolated test
  //         we never render any DOM, so we work with simple strings!
  const aspects = [
    createAspect$({
      name:     'extension1', // NOTE: extension1 HAS an injectRootAppElm()

      injectRootAppElm(app, curRootAppElm) {

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

    createAspect$({
      name:     'extension2', // NOTE: extension2 DOES NOT HAVE an injectRootAppElm()
    }),

    createAspect$({
      name:     'extension3', // NOTE: extension3 HAS an injectRootAppElm()

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

  ];

  const app = 'app-pass-through-for-testing';

  // function under test
  const rootAppElm = op.alch.injectRootAppElm(app, aspects, null);

  test('confirm the accumulated aspect.injectRootAppElm()', () => {
    expect(rootAppElm)
      .toBe('App:app-pass-through-for-testing...rootAppElmFrom-extension1' +
            'App:app-pass-through-for-testing...rootAppElmFrom-extension3');
  });

});
