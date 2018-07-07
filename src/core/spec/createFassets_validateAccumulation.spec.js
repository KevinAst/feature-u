import createFassets      from '../createFassets';  // module under test
// import fassetValidations  from '../fassetValidations'; ?? L8TR
import {createFeature}    from '../..';

describe('createFassets(): validation', () => {

  describe('client-supplied validations (via use)', () => {

    createFassets([
      createFeature({
        name:    'feature1',
        fassets: {
          define: {
            'foo1': 'foo1 resource',
          },
          defineUse: {
            'foo2': 'foo2 resource',
          },
        },
      }),
      createFeature({
        name:    'feature2',
        fassets: {
          use: [
            'foo*',
            // ? ['foo*', {required: true, type: fassetValidations.bool}], // ?? temp volation ... required: bool, actual: string
          ]
        },
      }),
    ]);


    // ?? KOOL: for ANY: null OK (as expected) and undefined is an error (as expected)
    //    ?? add a test for this

    // ?? AI: must have tests where the error is detected on a second matching define
    //    ... temporarly disable ... regexp.lastIndex = 0 in two spots to prove this is being done

    test(`?? L8TR: required at least one test`, () => {
      expect(1).toBe(1);
    });

  });

});
