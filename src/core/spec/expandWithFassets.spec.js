import expandWithFassets  from '../expandWithFassets';

describe('expandWithFassets() tests', () => {

  //***--------------------------------------------------------------------------------
  describe('VERIFY parameters', () => {

    test('expandWithFassetsCB is required', () => {
      expect(()=>expandWithFassets())
        .toThrow(/expandWithFassetsCB is required/);
      // THROW: expandWithFassets() parameter violation: expandWithFassetsCB is required
    });

    test('expandWithFassetsCB must be a function', () => {
      expect(()=>expandWithFassets(123))
        .toThrow(/expandWithFassetsCB must be a function/);
      // THROW: expandWithFassets() parameter violation: expandWithFassetsCB must be a function
    });

  });


  //***--------------------------------------------------------------------------------
  describe('VERIFY adornment', () => {

    const myFunc  = () => 'verify passthrough';

    const rtnFunc = expandWithFassets(myFunc);

    test('VERIFY adornment', () => {
      expect(myFunc.expandWithFassets)
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
