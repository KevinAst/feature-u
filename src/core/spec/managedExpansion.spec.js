import managedExpansion  from '../managedExpansion';

describe('managedExpansion() tests', () => {

  //***--------------------------------------------------------------------------------
  describe('VERIFY parameters', () => {

    test('managedExpansionCB is required', () => {
      expect(()=>managedExpansion())
        .toThrow(/managedExpansionCB is required/);
      // THROW: managedExpansion() parameter violation: managedExpansionCB is required
    });

    test('managedExpansionCB must be a function', () => {
      expect(()=>managedExpansion(123))
        .toThrow(/managedExpansionCB must be a function/);
      // THROW: managedExpansion() parameter violation: managedExpansionCB must be a function
    });

  });


  //***--------------------------------------------------------------------------------
  describe('VERIFY adornment', () => {

    const myFunc  = () => 'verify passthrough';

    const rtnFunc = managedExpansion(myFunc);

    test('VERIFY adornment', () => {
      expect(myFunc.managedExpansion)
        .toBe(true);
    });

    test('VERIFY same function returned', () => {
      expect(myFunc)
        .toBe(rtnFunc);
    });

    test('VERIFY passthrough', () => {
      expect(myFunc())
        .toBe('verify passthrough');
    });

  });

});
