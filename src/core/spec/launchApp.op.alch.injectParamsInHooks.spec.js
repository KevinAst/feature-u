import {op}           from '../launchApp';  // module under test INTERNAL 
import createAspect$  from './createAspect$';

describe('launchApp.op.alch.injectParamsInHooks(fassets, aspects): namedParams', () => {

  // aspect1: has desired hook, returning valid namedParams
  const params1 = {a: 'aVal', b: 'bVal', c: 'cVal'};
  const aspect1 = createAspect$({ 
    name: 'aspect1',
    injectParamsInHooks: (fassets) => params1,
  });

  // aspect2: has desired hook, returning valid namedParams
  const params2 = {d: 'dVal', e: 'eVal', f: 'fVal'};
  const aspect2 = createAspect$({ 
    name: 'aspect2',
    injectParamsInHooks: (fassets) => params2,
  });

  // aspectNoHook: has NO desired hook
  const aspectNoHook = createAspect$({ 
    name: 'aspectNoHook',
  });

  // aspectConflict: has desired hook, returning valid namedParams IN CONFLICT WITH aspect1, aspect2
  const paramsConflict = {a: 'CONFLICT', f: 'CONFLICT', x: 'xVal'};
  const aspectConflict = createAspect$({ 
    name: 'aspectConflict',
    injectParamsInHooks: (fassets) => paramsConflict,
  });

  const fassets = 'fassets-pass-through-for-testing';

  describe('no Aspects, therefore no namedParams to accumulate', () => {
    // function under test
    const namedParams = op.alch.injectParamsInHooks(fassets, []);
    test('test', () => {
      expect(namedParams)
        .toEqual({});
    });
  });

  describe('no namedParams to accumulate', () => {
    // function under test
    const namedParams = op.alch.injectParamsInHooks(fassets, [aspectNoHook]);
    test('test', () => {
      expect(namedParams)
        .toEqual({});
    });
  });

  describe('successful namedParams accumulation', () => {
    // function under test
    const namedParams = op.alch.injectParamsInHooks(fassets, [aspect1, aspectNoHook, aspect2]);
    test('test', () => {
      expect(namedParams)
        .toEqual({...params1, ...params2});
    });
  });

  describe('test NO return (an error)', () => {
    const aspectInErr = createAspect$({ 
      name: 'aspectInErr',
      injectParamsInHooks: (fassets) => undefined,
    });
    test('test', () => {
      // function under test
      expect( () => op.alch.injectParamsInHooks(fassets, [aspect1, aspectNoHook, aspect2, aspectInErr]) )
        .toThrow(/aspectInErr.*return violation.*nothing was returned/);
      // THROW: Aspect.name:aspectInErr injectParamsInHooks() return violation: nothing was returned ... expecting namedParams (a plain object) ... use empty object {} for nothing
    });
  });

  describe('test INVALID return (an error)', () => {
    const aspectInErr = createAspect$({ 
      name: 'aspectInErr',
      injectParamsInHooks: (fassets) => 123, // BAD: should be a plain object
    });
    test('test', () => {
      // function under test
      expect( () => op.alch.injectParamsInHooks(fassets, [aspect1, aspectNoHook, aspect2, aspectInErr]) )
        .toThrow(/aspectInErr.*return violation.*expecting namedParams.*a plain object.*NOT: 123/);
      // THROW: Aspect.name:aspectInErr injectParamsInHooks() return violation: expecting namedParams (a plain object) ... NOT: 123
    });
  });

  describe('test INVALID return (an error)', () => {
    const aspectInErr = createAspect$({ 
      name: 'aspectInErr',
      injectParamsInHooks: (fassets) => new Date(), // BAD: should be a plain object
    });
    test('test', () => {
      // function under test
      expect( () => op.alch.injectParamsInHooks(fassets, [aspect1, aspectNoHook, aspect2, aspectInErr]) )
        .toThrow(/aspectInErr.*return violation.*expecting namedParams.*a plain object.*NOT/);
      // THROW: Aspect.name:aspectInErr injectParamsInHooks() return violation: expecting namedParams (a plain object) ... NOT: Thu Jan 30 2020 12:30:09 GMT-0600 (Central Standard Time)

    });
  });

  describe('test name clashes over various aspects (an error)', () => {
    test('test', () => {
      // function under test
      expect( () => op.alch.injectParamsInHooks(fassets, [aspect1, aspectNoHook, aspect2, aspectConflict]) )
        .toThrow(/aspectConflict.*return violation.*names clashed with other aspects: a,f/);
      // THROW: Aspect.name:aspectConflict injectParamsInHooks() return violation: the following parameter names clashed with other aspects: a,f

    });
  });

  describe('test reserved word name clashes (an error)', () => {
    const aspectWithReservedWords = createAspect$({ 
      name: 'aspectWithReservedWords',
      injectParamsInHooks: (fassets) => ({good: 'good', showStatus: 'RESERVED', fassets: 'RESERVED'}),
    });
    test('test', () => {
      // function under test
      expect( () => op.alch.injectParamsInHooks(fassets, [aspect1, aspectNoHook, aspectWithReservedWords, aspect2]) )
        .toThrow(/aspectWithReservedWords.*return violation.*reserved by feature-u.*showStatus,fassets/);
      // THROW: Aspect.name:aspectWithReservedWords injectParamsInHooks() return violation: the following parameter names are reserved by feature-u and cannot be used: showStatus,fassets

    });
  });

});
