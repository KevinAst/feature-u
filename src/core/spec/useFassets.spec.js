import {useFassets} from '../useFassets';   // module under test

describe('useFassets()', () => {

  //***-------------------------------------------------------------------------
  describe('useFassets() ERRORS)', () => {

    test('single parameter IS required', () => {
      expect(()=> useFassets(null))
        .toThrow(/useFassets.* single parameter IS required/);
      // THROW:  useFassets() parameter violation: single parameter IS required
    });

    test('number parameter IS invalid', () => {
      expect(()=> useFassets(123))
        .toThrow(/useFassets.* single parameter must either be a string or a structure.* 123/);
      // THROW:  useFassets() parameter violation: single parameter must either be a string or a structure ... 123
    });

    test('function parameter IS invalid', () => {
      expect(()=> useFassets((p)=>p))
        .toThrow(/useFassets.* single parameter must either be a string or a structure.* function/);
      // THROW:  useFassets() parameter violation: single parameter must either be a string or a structure ... function (p)
    });

    test('fassetsKey string parameter IS OK', () => {
      expect(()=> useFassets('myFassetsKey'))
        .toThrow(/Hooks can only be called inside the body of a function component/);
      // THROW:  Invariant Violation: Hooks can only be called inside the body of a function component. (https://fb.me/react-invalid-hook-call)
    });

    test('mapFassetsToPropsStruct is OK', () => {
      expect(()=> useFassets({
        prop1: 'myFassetsKey1',
        prop2: 'myFassetsKey2',
      }))
        .toThrow(/Hooks can only be called inside the body of a function component/);
      // THROW:  Invariant Violation: Hooks can only be called inside the body of a function component. (https://fb.me/react-invalid-hook-call)
    });

    test('mapFassetsToPropsStruct props must catalog fassetsKey strings', () => {
      expect(()=> useFassets({
        prop1: 'myFassetsKey1',
        prop2: 123,
      }))
        .toThrow(/useFassets.* invalid mapFassetsToProps - all properties MUST reference a fassetsKey string ... at minimum prop2 does NOT/);
      // THROW:  useFassets() parameter violation: invalid mapFassetsToProps - all properties MUST reference a fassetsKey string ... at minimum prop2 does NOT
    });

  });


});
