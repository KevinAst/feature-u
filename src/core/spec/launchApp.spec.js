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

  // structure driving expected order of execution
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

  const execOrder = {
    alch:   {}, // aspect-life-cycle-hook
    flch:   {}, // feature-life-cycle-hook
  };

  beforeAll(() => {

    // the original op
    const opOriginal = {
      alch:   {}, // aspect-life-cycle-hook
      flch:   {}, // feature-life-cycle-hook
    };

    // our running counts
    let actualCount = 0;

    // reset execOrder
    execOrder.alch = {};
    execOrder.flch = {};

    // higher order function to monkey patch each life-cycle opertion ... keeping track of execution order
    function monkeyPatch(type,   // 'alch' or 'flch'
                         func) { // function
      opOriginal[type][func] = op[type][func]; // retain original function
      op[type][func] = function(...args) {   // monkey patched function
        execOrder[type][func] = ++actualCount;
        return opOriginal[type][func](...args);
      };
    }

    // monkey patch in order of expected execution
    expectedOrder.forEach( (e) => monkeyPatch(e.type, e.func) );

    // execute launchApp()
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

    // reset monkey patch, just in case (don't think is needed)
    expectedOrder.forEach( (e) => op[e.type][e.func] = opOriginal[e.type][e.func] ); // reset to original

  }); // end of ... beforeAll()

  // test order of execution
  expectedOrder.forEach( (e, indx) => {
    test(`op.${e.type}.${e.func}()`, () => {
      expect(indx+1).toBe(execOrder[e.type][e.func]);
    });
  });

});
