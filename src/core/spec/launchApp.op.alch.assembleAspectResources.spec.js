import {op}           from '../launchApp';  // module under test INTERNAL 
import createAspect$  from './createAspect$';

describe('launchApp.op.alch.assembleAspectResources(app, aspects): void', () => {

  const extension1 = createAspect$({
    name:     'extension1',

    // NOTE: for our testing purposes, we really only care that
    //       aspect.assembleAspectResources(app, aspects)
    //       was invoked with the correct parameters (app, aspects)!
    //       ... because we can't really test a client's implemantion of assembleAspectResources()
    //       ... HOWEVER, by testing self's simple accumulation (this.accum),
    //           we indirectly accomplish our desired goal!!
    assembleAspectResources(app, aspects) {
      // initialize our accumulation with app
      // ... unconventional, but for our testing it proves that correct app was supplied
      this.accum = app;
      // perform our cross-aspect accumulation
      this.accum = aspects.reduce( (accum, aspect) => {
        const forExtension1 = aspect.forExtension1;
        if (forExtension1) {
          accum += `+${forExtension1}`;
        }
        return accum;
      }, this.accum);
    },
  });

  const extension2 = createAspect$({
    name:          'extension2',
    forExtension1: 'here-is-extension2-stuff-used-in-extension1', // employ Aspect Cross Communication
  });

  const aspects = [
    extension1,
    extension2,
  ];

  const app = 'app-pass-through-for-testing';

  op.alch.assembleAspectResources(app, aspects); // function under test

  test('confirm the accumulated aspect content within each aspect', () => {
    expect(extension1.accum)
      .toBe('app-pass-through-for-testing+here-is-extension2-stuff-used-in-extension1');
  });

});
