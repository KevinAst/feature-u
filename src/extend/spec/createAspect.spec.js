import {createAspect} from '../..'; // STOP USING: '../../../tooling/ModuleUnderTest';

import {isAspectProperty,
        extendAspectProperty} from '../createAspect';

const identityFn = p => p;


describe('createAspect() tests', () => {

  //***--------------------------------------------------------------------------------
  describe('VERIFY parameters', () => {

    describe('no params', () => {
      test('no params: name is required', () => {
        expect(()=>createAspect())
          .toThrow(/name is required/);
        // THROW: createAspect() parameter violation: name is required
      });
    });

    describe('aspect.name', () => {
      test('name is required', () => {
        expect(()=>createAspect({}))
          .toThrow(/name is required/);
      });

      test('name must be a string', () => {
        expect(()=>createAspect({name:123}))
          .toThrow(/name must be a string/);
      });

      test('name value is a reserved Feature keyword', () => {
        expect(()=>createAspect({name:'appWillStart'}))
          .toThrow(/Aspect.name: 'appWillStart' is a reserved Feature keyword/);
      });
    });

    describe('aspect.genesis', () => {
      const primePump = {
        name: 'myAspectName'
      };

      test('genesis must be a function', () => {
        expect(()=>createAspect({...primePump, genesis:123}))
          .toThrow(/genesis .* must be a function/);
        // THROW: createAspect() parameter violation: genesis (when supplied) must be a function
      });
    });

    describe('aspect.validateFeatureContent', () => {
      const primePump = {
        name: 'myAspectName'
      };

      test('validateFeatureContent is required', () => {
        expect(()=>createAspect({...primePump}))
          .toThrow(/validateFeatureContent is required/);
      });

      test('validateFeatureContent must be a function', () => {
        expect(()=>createAspect({...primePump, validateFeatureContent:123}))
          .toThrow(/validateFeatureContent must be a function/);
      });
    });

    describe('aspect.expandFeatureContent', () => {
      const primePump = {
        name:                   'myAspectName',
        validateFeatureContent: identityFn,
      };

      test('expandFeatureContent must be a function', () => {
        expect(()=>createAspect({...primePump, expandFeatureContent:123}))
          .toThrow(/expandFeatureContent .* must be a function/);
        // THROW: createAspect() parameter violation: expandFeatureContent (when supplied) must be a function
      });
    });

    describe('aspect.assembleFeatureContent', () => {
      const primePump = {
        name:                   'myAspectName',
        validateFeatureContent: identityFn,
      };

      test('assembleFeatureContent is required', () => {
        expect(()=>createAspect({...primePump}))
          .toThrow(/assembleFeatureContent is required/);
      });

      test('assembleFeatureContent must be a function', () => {
        expect(()=>createAspect({...primePump, assembleFeatureContent:123}))
          .toThrow(/assembleFeatureContent must be a function/);
      });
    });

    describe('aspect.assembleAspectResources', () => {
      const primePump = {
        name:                   'myAspectName',
        validateFeatureContent: identityFn,
        assembleFeatureContent: identityFn,
      };

      test('assembleAspectResources must be a function', () => {
        expect(()=>createAspect({...primePump, assembleAspectResources:123}))
          .toThrow(/assembleAspectResources.*must be a function/);
      });
    });

    describe('aspect.initialRootAppElm', () => {
      const primePump = {
        name:                    'myAspectName',
        validateFeatureContent:  identityFn,
        assembleFeatureContent:  identityFn,
      };

      test('initialRootAppElm must be a function', () => {
        expect(()=>createAspect({...primePump, initialRootAppElm:123}))
          .toThrow(/initialRootAppElm.*must be a function/);
      });
    });

    describe('aspect.injectRootAppElm', () => {
      const primePump = {
        name:                    'myAspectName',
        validateFeatureContent:  identityFn,
        assembleFeatureContent:  identityFn,
      };

      test('injectRootAppElm must be a function', () => {
        expect(()=>createAspect({...primePump, injectRootAppElm:123}))
          .toThrow(/injectRootAppElm.*must be a function/);
      });
    });

    describe('aspect.config', () => {
      const primePump = {
        name:                    'myAspectName',
        validateFeatureContent:  identityFn,
        assembleFeatureContent:  identityFn,
      };

      test('config is required', () => {
        expect(()=>createAspect({...primePump, config:null}))
          .toThrow(/config is required/);
        // THROW:  createAspect() parameter violation: config is required
      });

      test('config is required', () => {
        expect(()=>createAspect({...primePump, config:()=>1}))
          .toThrow(/config must be a plain object literal/);
        // THROW:  createAspect() parameter violation: config must be a plain object literal
      });
    });


  });

  //***--------------------------------------------------------------------------------
  describe('test extended Aspect properties', () => {

    test("isAspectProperty('name'): true", () => {
      expect(isAspectProperty('name'))
        .toBe(true);
    });

    test("extendAspectProperty('name'): THROW 'already in use' ERROR", () => {
      expect(()=>extendAspectProperty('name'))
        .toThrow(/Aspect.name.*is already in use/);
      // THROW: **ERROR** extendAspectProperty('name') ... 'Aspect.name' is already in use (i.e. it is already a valid Aspect property)!
    });

    test("isAspectProperty('MyNewProp'): false", () => {
      expect(isAspectProperty('MyNewProp'))
        .toBe(false);
    });

    test("isAspectProperty('MyNewProp'): true (after extending)", () => {
      extendAspectProperty('MyNewProp');
      expect(isAspectProperty('MyNewProp'))
        .toBe(true);
    });

  });

  //***--------------------------------------------------------------------------------
  describe('VERIFY content pass through', () => {
    const aspect = createAspect({
      name:                    'myAspectName',
      genesis:                 () => 'MY genesis',
      validateFeatureContent:  () => 'MY validateFeatureContent',
      expandFeatureContent:    () => 'MY expandFeatureContent',
      assembleFeatureContent:  () => 'MY assembleFeatureContent',
      assembleAspectResources: () => 'MY assembleAspectResources',
      initialRootAppElm:       () => 'MY initialRootAppElm',
      injectRootAppElm:        () => 'MY injectRootAppElm',
      config:                  { myConfig: 123 },
    });

    test('aspect.name', () => {
      expect(aspect.name).toEqual('myAspectName');
    });

    test('aspect.genesis', () => {
      expect(aspect.genesis()).toEqual('MY genesis');
    });

    test('aspect.validateFeatureContent', () => {
      expect(aspect.validateFeatureContent()).toEqual('MY validateFeatureContent');
    });

    test('aspect.expandFeatureContent', () => {
      expect(aspect.expandFeatureContent()).toEqual('MY expandFeatureContent');
    });

    test('aspect.assembleFeatureContent', () => {
      expect(aspect.assembleFeatureContent()).toEqual('MY assembleFeatureContent');
    });

    test('aspect.assembleAspectResources', () => {
      expect(aspect.assembleAspectResources()).toEqual('MY assembleAspectResources');
    });

    test('aspect.initialRootAppElm', () => {
      expect(aspect.initialRootAppElm()).toEqual('MY initialRootAppElm');
    });

    test('aspect.injectRootAppElm', () => {
      expect(aspect.injectRootAppElm()).toEqual('MY injectRootAppElm');
    });

    test('aspect.config', () => {
      expect(aspect.config).toEqual({ myConfig: 123 });
    });
    
  });

  //***--------------------------------------------------------------------------------
  describe('VERIFY additional content', () => {
    const aspect = createAspect({
      name:                   'myAspectName',
      validateFeatureContent: identityFn,
      assembleFeatureContent: identityFn,
      myAdditionalStuff:      'myAdditionalStuff',
    });
    
    test('aspect.myAdditionalStuff', () => {
      expect(aspect.myAdditionalStuff).toEqual('myAdditionalStuff');
    });
  });

});
