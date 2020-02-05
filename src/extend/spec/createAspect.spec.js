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

    describe('invalid positional params', () => {

      test('no params', () => {
        expect(()=>createAspect())
          .toThrow(/name is required/);
        // THROW: createAspect() parameter violation: name is required
      });

      test('params: (undefined)', () => { // NOTE: `(undefined)` is the same as `()` ... because of JavaScript defaulting semantics
        expect(()=>createAspect(undefined))
        .toThrow(/name is required/);
        // THROW: createAspect() parameter violation: name is required
      });

      test('params: (null)', () => {
        expect(()=>createAspect(null))
          .toThrow(/only named parameters may be supplied/);
        // THROW: createAspect() parameter violation: only named parameters may be supplied
      });

      test('params: (123)', () => {
        expect(()=>createAspect(123))
          .toThrow(/only named parameters may be supplied/);
        // THROW: createAspect() parameter violation: only named parameters may be supplied
      });

      test('params: (new Date())', () => {
        expect(()=>createAspect(new Date()))
          .toThrow(/only named parameters may be supplied/);
        // THROW: createAspect() parameter violation: only named parameters may be supplied
      });

      test('params: (123, 456)', () => {
        expect(()=>createAspect(123, 456))
          .toThrow(/only named parameters may be supplied/);
        // THROW: createAspect() parameter violation: only named parameters may be supplied
      });

      test('params: ({name: "hello"}, 456)', () => { // NOTE: this has the `Aspect.name` identity in our error :-)
        expect(()=>createAspect({name: 'hello'}, 456))
          .toThrow(/Aspect.name:hello.*unrecognized positional parameters/);
        // THROW: createAspect() parameter violation: Aspect.name:hello ... unrecognized positional parameters (only named parameters can be specified) ... 2 positional parameters were found
      });

      test('params: ({}, 456)', () => { // NOTE: name check takes precedence to facilitate `Aspect.name` identity in our error :-)
        expect(()=>createAspect({}, 456))
          .toThrow(/name is required/);
        // THROW: createAspect() parameter violation: name is required
      });

    });

    describe('all methods MUST be functions (when supplied)', () => {

      const primePump = {
        name: 'myAspectName'
      };

      ['genesis',
       'validateFeatureContent',
       'expandFeatureContent',
       'assembleFeatureContent',
       'assembleAspectResources',
       'initialRootAppElm',
       'injectRootAppElm',
       'injectParamsInHooks'].forEach( (methName) => {

         test(`${methName} is NOT function`, () => {
           const params = {...primePump};
           params[methName] = 123; // NOT a function
           expect(()=>createAspect(params))
             .toThrow(/Aspect.name:myAspectName.*must be a function/);
           // THROW: Aspect.name:myAspectName ... createAspect() parameter violation: ...methName... (when supplied) must be a function
         });

         test(`${methName} is IS function`, () => {
           const params = {...primePump};
           params[methName] = identityFn; // IS a function
           expect(()=>createAspect(params))
             .not.toThrow();
         });

       } );
    
    });

    describe('aspect.config', () => {
      const primePump = {
        name: 'myAspectName',
      };
    
      test('config is required', () => {
        expect(()=>createAspect({...primePump, config:null}))
          .toThrow(/Aspect.name:myAspectName.*config is required/);
        // THROW: Aspect.name:myAspectName createAspect() parameter violation: config is required
      });
    
      test('config must be a plain object', () => {
        expect(()=>createAspect({...primePump, config:()=>1}))
          .toThrow(/Aspect.name:myAspectName.*config must be a plain object literal/);
        // THROW: Aspect.name:myAspectName createAspect() parameter violation: config must be a plain object literal
      });
    });

    describe('at least ONE method MUST BE SUPPLIED', () => {
      test('go for it', () => {
        expect(()=>createAspect({name: 'hello'}))
          .toThrow(/Aspect.name:hello.*at least one method must be supplied/);
        // THROW: Aspect.name:hello createAspect() parameter violation: at least one method must be supplied ... an empty Aspect plugin does nothing!
      });
    });

  });

  //***--------------------------------------------------------------------------------
  describe('test extended Aspect properties', () => {

    test("isAspectProperty() builtin props are included", () => {
      expect(isAspectProperty('name'))
        .toBe(true);
    });

    test("extendAspectProperty() name is required", () => {
      expect(()=>extendAspectProperty())
        .toThrow(/name is required/);
      // THROW: extendAspectProperty() parameter violation: name is required
    });

    test("extendAspectProperty() name must be a string", () => {
      expect(()=>extendAspectProperty(123))
        .toThrow(/name must be a string/);
      // THROW: extendAspectProperty() parameter violation: name must be a string
    });

    test("extendAspectProperty() owner is required", () => {
      expect(()=>extendAspectProperty('MyNewProp'))
        .toThrow(/owner is required/);
      // THROW: extendAspectProperty() parameter violation: owner is required
    });
    
    test("extendAspectProperty() owner must be a string", () => {
      expect(()=>extendAspectProperty('MyNewProp', 456))
        .toThrow(/owner must be a string/);
      // THROW: extendAspectProperty() parameter violation: owner must be a string
    });

    test("extendAspectProperty() on builtin prop is already reserved", () => {
      expect(()=>extendAspectProperty('name', 'myAspect'))
        .toThrow(/is already reserved/);
      // THROW: **ERROR** extendAspectProperty('name', 'myAspect') ... 'Aspect.name' is already reserved by different owner.
    });

    test("isAspectProperty('MyNewProp'): false", () => {
      expect(isAspectProperty('MyNewProp'))
        .toBe(false);
    });

    test("isAspectProperty('MyNewProp', 'myAspect'): true (after extending)", () => {
      extendAspectProperty('MyNewProp', 'myAspect');
      expect(isAspectProperty('MyNewProp'))
        .toBe(true);
    });

    test("duplicate extendAspectProperty() is OK with same owner", () => {
      expect(()=>extendAspectProperty('MyNewProp', 'myAspect'))
        .not.toThrow();
    });

    test("duplicate extendAspectProperty() throws exception with different owner", () => {
      expect(()=>extendAspectProperty('MyNewProp', 'differentAspect'))
        .toThrow(/is already reserved/);
      // THROW: **ERROR** extendAspectProperty('MyNewProp', 'differentAspect') ... 'Aspect.MyNewProp' is already reserved by different owner.
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
      injectParamsInHooks:     () => 'MY injectParamsInHooks',
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

    test('aspect.injectParamsInHooks', () => {
      expect(aspect.injectParamsInHooks()).toEqual('MY injectParamsInHooks');
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
