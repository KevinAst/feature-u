import createFassets      from '../createFassets';  // module under test
import {createFeature}    from '../..';

describe('createFassets(): fassets basic structure', () => {

  describe('fassets basic structure error conditions', () => {

    // drive test with various invalid top-level fassets (must be an object literal)
    [null, 0, 1, new Date(), 'BadString', 3.14].forEach( badFassets => {
      test('must be an object literal', () => {
        expect(()=> createFassets([
          createFeature({
            name:       'featureTest',
            fassets:    badFassets,
          }),
        ]) )
          .toThrow(/Feature.name: 'featureTest'.*fassets aspect MUST BE an object literal/);
        // THROW: Feature.name: 'featureTest' ... ERROR in "fassets" aspect: the fassets aspect MUST BE an object literal
      });
    });

    test('all fassets directives are recognized', () => {
      expect(()=> createFassets([
        createFeature({
          name:       'featureTest',
          fassets:    {
            define:        'recognized directive: here, content can be invalid BECAUSE unrecognized check is performed first',
            badDirective1: 123,
            defineUse:     'ditto',
            use:           'ditto',
            badDirective2: 456,
          },
        }),
      ]) )
        .toThrow(/Feature.name: 'featureTest'.*unrecognized fassets.*badDirective1.*badDirective2*/);
      // THROW:  Feature.name: 'featureTest' ... ERROR in "fassets" aspect: unrecognized fassets directive(s): badDirective1,badDirective2 ... expecting only: define/use/defineUse
    });

    test('at least one directive needed - define/use/defineUse', () => {
      expect(()=> createFassets([
        createFeature({
          name:       'featureTest',
          fassets:    {},
        }),
      ]) )
        .toThrow(/Feature.name: 'featureTest'.*fassets aspect is empty/);
      // THROW: Feature.name: 'featureTest' ... ERROR in "fassets" aspect: the fassets aspect is empty (at least one directive needed - define/use/defineUse)
    });

  });

});
