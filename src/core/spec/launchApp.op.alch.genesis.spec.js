import {op}           from '../launchApp';    // module under test INTERNAL 
import createAspect$  from './createAspect$';

describe('launchApp.op.alch.genesis(aspects): aspectMap', () => {

  test('no aspects should return empty aspectMap', () => {
    expect(op.alch.genesis([]))
      .toEqual({});
  });

  test('aspects must be an array', () => {
    expect(()=>op.alch.genesis('Im not an array'))
      .toThrow(/aspects .* must be an .* array/);
  });

  test('aspect names must be unique', () => {
    expect(()=>op.alch.genesis([
      createAspect$({name: 'Im a dup'}),
      createAspect$({name: 'Im a dup'}),
    ])).toThrow(/NON-unique name.*'Im a dup'/);
  });

  test('aspects can inject their own validation (also proving aspect.genesis() is invoked)', () => {
    expect(()=>op.alch.genesis([
      createAspect$({
        name: 'TestValidationViaGenesis',
        genesis: () => 'this is an aspect configuration violation',
      })
    ])).toThrow(/aspect configuration violation/);
  });

  describe('validate returned aspectMap', () => {
    let aspect1, aspect2;
    beforeEach(() => {
      aspect1 = createAspect$({name: 'aspect1'});
      aspect2 = createAspect$({name: 'aspect2'});
    });

    test('check it', () => {
      expect(op.alch.genesis([aspect1, aspect2]))
        .toEqual({
          aspect1,
          aspect2,
        });
    });
  });

});
