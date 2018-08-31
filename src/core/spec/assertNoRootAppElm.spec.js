import {assertNoRootAppElm}  from '../..';  // module under test INTERNAL 

describe('assertNoRootAppElm() tests', () => {

  describe('parameter validation', () => {

    test('className is required', () => {
      expect( () => assertNoRootAppElm() )
        .toThrow(/assertNoRootAppElm.*parameter violation.*className is required/);
      // THROW: assertNoRootAppElm() parameter violation: className is required
    });

    test('className must be a string', () => {
      expect( () => assertNoRootAppElm(null, 123) )
        .toThrow(/assertNoRootAppElm.*parameter violation.*className must be a string/);
      // THROW: assertNoRootAppElm() parameter violation: className must be a string
    });

    test('happy path', () => {
      expect( () => assertNoRootAppElm(null, '<MyClass>') )
        .not.toThrow();
    });

  });

  describe('assertion not met', () => {

    test('rootAppElm IS defined', () => {
      expect( () => assertNoRootAppElm('Simulated rootAppEwwlm', '<MyClass>') )
        .toThrow(/<MyClass> does NOT support children/);
      // THROW: ***ERROR*** <MyClass> does NOT support children but another feature/aspect is attempting to inject it's content. Please resolve either by adjusting the feature expansion order, or promoting <MyClass> through the conflicting artifact.
    });
  });

});
