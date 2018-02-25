import launchApp, {op}  from '../launchApp';  // module under test INTERNAL 
import {createFeature}  from '../..';


describe('launchApp() parameter validation)', () => {

  test('features is required', () => {
    expect( () => launchApp({
    })).toThrow(/features is required/);
    // THROW: launchApp() parameter violation: features is required
  });

  test('features must be a Feature[] array', () => {
    expect( () => launchApp({
      features: 'Im NOT an array',
    })).toThrow(/features must be .* array/);
    // THROW: launchApp() parameter violation: features must be a Feature[] array
  });

  test('registerRootAppElm is required', () => {
    expect( () => launchApp({
      features: [],
    })).toThrow(/registerRootAppElm is required/);
    // THROW: launchApp() parameter violation: registerRootAppElm is required
  });

  test('registerRootAppElm must be a function', () => {
    expect( () => launchApp({
      features: [],
      registerRootAppElm: 'Im NOT a function',
    })).toThrow(/registerRootAppElm must be a function/);
    // THROW: launchApp() parameter violation: registerRootAppElm must be a function
  });

  test('unrecognized named parameter', () => {
    expect( () => launchApp({
      features: [],
      registerRootAppElm: (p) => p,
      badParm: 'Im a bad parameter',
    })).toThrow(/unrecognized named parameter.*badParm/);
    // THROW: launchApp() parameter violation: unrecognized named parameter(s): badParm
  });

  test('unrecognized positional parameter', () => {
    expect( () => launchApp({
      features: [],
      registerRootAppElm: (p) => p,
    },'badPositionalParm')).toThrow(/unrecognized positional parameters/);
    // THROW: launchApp() parameter violation: unrecognized positional parameters (only named parameters can be specified)
  });

});


describe('launchApp() verify execution order of life cycle hooks (both Aspects and Features)', () => {

  beforeAll(() => {
    // execute launchApp()
    // ... ALOWING it to populate the executionOrder property of each life-cycle helper function
    launchApp({
      // NO Aspects 
      features: [
        createFeature({
          name: 'feature1',
        }),
      ],
      registerRootAppElm(rootAppElm) {
      },
    });
  });

  // structure driving the expected order of execution
  const expectedOrder = [
    { type: 'alch', func: 'genesis' },
    { type: 'alch', func: 'validateFeatureContent' },
    { type: 'alch', func: 'expandFeatureContent' },
    { type: 'alch', func: 'assembleFeatureContent' },
    { type: 'alch', func: 'assembleAspectResources' },
    { type: 'alch', func: 'initialRootAppElm' },
    { type: 'flch', func: 'appWillStart' },
    { type: 'alch', func: 'injectRootAppElm' },
    { type: 'flch', func: 'appDidStart' },
  ];

  // test order of execution
  expectedOrder.forEach( (e, indx) => {
    test(`op.${e.type}.${e.func}()`, () => {
      expect(indx+1).toBe(op[e.type][e.func].executionOrder);
    });
  });

});
