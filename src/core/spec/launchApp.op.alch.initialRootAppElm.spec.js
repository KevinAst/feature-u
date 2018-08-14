import {op}           from '../launchApp';  // module under test INTERNAL 
import createAspect$  from './createAspect$';

describe('launchApp.op.alch.initialRootAppElm(fassets, aspects, curRootAppElm): rootAppElm', () => {

  // NOTE 1: for our testing purposes, we really only care that
  //         aspect.initialRootAppElm(fassets, curRootAppElm)
  //         is invoked with the correct parameters (fassets, curRootAppElm)!
  //         ... because we can't really test a client's implemantion of initialRootAppElm()
  //         ... HOWEVER, by testing the return value of this implementation,
  //             we indirectly accomplish our desired goal!!
  // NOTE 2: we are actually dealing with react DOM elms, but for this isolated test
  //         we never render any DOM, so we work with simple strings!
  const aspects = [
    createAspect$({
      name:     'extension1', // NOTE: extension1 HAS an initialRootAppElm()

      initialRootAppElm(fassets, curRootAppElm) {

        // include curRootAppElm ... and interpret the initial null value
        let rootAppElm = curRootAppElm || '';

        // accumulate our fassets
        // ... unconventional, but for our testing it proves that correct fassets was supplied
        rootAppElm += `Fassets:${fassets}`;

        // accumulate our desired rootAppElm injection
        rootAppElm += `...rootAppElmFrom-extension1`;

        return rootAppElm;
      },
    }),

    createAspect$({
      name:     'extension2', // NOTE: extension2 DOES NOT HAVE an initialRootAppElm()
    }),

    createAspect$({
      name:     'extension3', // NOTE: extension3 HAS an initialRootAppElm()

      initialRootAppElm(fassets, curRootAppElm) {

        // include curRootAppElm ... and interpret the initial null value
        let rootAppElm = curRootAppElm || '';

        // accumulate our fassets
        // ... unconventional, but for our testing it proves that correct fassets was supplied
        rootAppElm += `Fassets:${fassets}`;

        // accumulate our desired rootAppElm injection
        rootAppElm += `...rootAppElmFrom-extension3`;

        return rootAppElm;
      },
    }),
  ];

  const fassets = 'fassets-pass-through-for-testing';

  // function under test
  const rootAppElm = op.alch.initialRootAppElm(fassets, aspects, null);

  test('confirm the accumulated aspect.initialRootAppElm()', () => {
    expect(rootAppElm)
      .toBe('Fassets:fassets-pass-through-for-testing...rootAppElmFrom-extension1' +
            'Fassets:fassets-pass-through-for-testing...rootAppElmFrom-extension3');
  });

});
