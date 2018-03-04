import {extendAspectProperty} from '../..';
import {op}                   from '../launchApp';  // module under test INTERNAL 
import createAspect$          from './createAspect$';

const placeboFn = (p) => p;

describe('launchApp.op.helper.validateAspectProperties(aspects): void', () => {

  test('NO Aspects is valid', () => {
    expect(()=>op.helper.validateAspectProperties([]))
      .not.toThrow();
  });

  test('All builtin hooks are valid', () => {
    expect(()=>op.helper.validateAspectProperties([
      createAspect$({
        name:                    'allBuiltInHooks',
        genesis:                 placeboFn,
        validateFeatureContent:  placeboFn,
        expandFeatureContent:    placeboFn,
        assembleFeatureContent:  placeboFn,
        assembleAspectResources: placeboFn,
        initialRootAppElm:       placeboFn,
        injectRootAppElm:        placeboFn,
      }),
    ])).not.toThrow();
  });

  test('Unrecognized Property', () => {
    expect(()=>op.helper.validateAspectProperties([
      createAspect$({
        name:    'badAspect',
        badHook: placeboFn,
      }),
    ])).toThrow(/unrecognized property.*badHook/);
  });

  describe('Extended properties are valid', () => {
    beforeEach(() => {
      extendAspectProperty('extendedHookTester', 'myAspect');
    });

    test('check it', () => {
      expect(()=>op.helper.validateAspectProperties([
        createAspect$({
          name:               'goodAspect',
          extendedHookTester: placeboFn,
        }),
      ])).not.toThrow();
    });

  });

});
