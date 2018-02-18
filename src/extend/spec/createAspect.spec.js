import {createAspect,     // module under test
        createFeature,
        managedExpansion} from '../../../tooling/ModuleUnderTest';

const identityFn = p => p;

describe('feature-u createAspect() tests', () => {

  describe('VERIFY content pass through', () => {
    const aspect = createAspect({
      name:                    'myAspectName',
      genesis:                 () => 'MY genesis',
      expandFeatureContent:    () => 'MY expandFeatureContent',
      validateFeatureContent:  () => 'MY validateFeatureContent',
      assembleFeatureContent:  () => 'MY assembleFeatureContent',
      assembleAspectResources: () => 'MY assembleAspectResources',
      injectRootAppElm:        () => 'MY injectRootAppElm',
    });

    test('aspect.name', () => {
      expect(aspect.name).toEqual('myAspectName');
    });

    test('aspect.genesis', () => {
      expect(aspect.genesis()).toEqual('MY genesis');
    });

    test('aspect.expandFeatureContent', () => {
      expect(aspect.expandFeatureContent()).toEqual('MY expandFeatureContent');
    });

    test('aspect.validateFeatureContent', () => {
      expect(aspect.validateFeatureContent()).toEqual('MY validateFeatureContent');
    });

    test('aspect.assembleFeatureContent', () => {
      expect(aspect.assembleFeatureContent()).toEqual('MY assembleFeatureContent');
    });

    test('aspect.assembleAspectResources', () => {
      expect(aspect.assembleAspectResources()).toEqual('MY assembleAspectResources');
    });

    test('aspect.injectRootAppElm', () => {
      expect(aspect.injectRootAppElm()).toEqual('MY injectRootAppElm');
    });
    
  });


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


  describe('VERIFY DEFAULT SEMANTICS', () => {
    const aspect = createAspect({
      name:                   'myAspectName',
      // expandFeatureContent,    // USE DEFAULT (tested in MANAGED EXPANSION - below)
      validateFeatureContent: identityFn,
      assembleFeatureContent: identityFn,
      // assembleAspectResources, // USE DEFAULT
      // injectRootAppElm,        // USE DEFAULT
    });

    test('aspect.assembleAspectResources', () => {
      expect(aspect.assembleAspectResources('app', 'aspects')).toEqual(null);
    });

    test('aspect.injectRootAppElm', () => {
      expect(aspect.injectRootAppElm('app', 'curRootAppElm')).toEqual('curRootAppElm');
    });
  });


  describe('VERIFY MANAGED EXPANSION DEFAULT SEMANTICS', () => {
    const aspect = createAspect({
      name:                   'myAspectName',
      // genesis:                 // USE DEFAULT
      // expandFeatureContent,    // DEFAULT SEMANTICS - UNDER TEST
      validateFeatureContent: identityFn,
      assembleFeatureContent: identityFn,
      // assembleAspectResources, // USE DEFAULT
      // injectRootAppElm,        // USE DEFAULT
    });

    const feature = createFeature({
      name:         'myFeatureName',
      myAspectName: managedExpansion( (app) => 'myAspectContent' ), // UNDER TEST: needs expansion
    });

    // const app = null; // null ok for this test ... just being passed through 

    test('aspect.expandFeatureContent', () => {

      // expand feature
      aspect.expandFeatureContent(null, feature);

      // prove the expansion has occurred
      expect(feature.myAspectName).toEqual('myAspectContent');
    });

  });


  describe('VERIFY aspect.name', () => {
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


  describe('VERIFY aspect.validateFeatureContent', () => {
    const genisis = {
      name: 'myAspectName'
    };

    test('validateFeatureContent is required', () => {
      expect(()=>createAspect({...genisis}))
        .toThrow(/validateFeatureContent is required/);
    });

    test('validateFeatureContent must be a function', () => {
      expect(()=>createAspect({...genisis, validateFeatureContent:123}))
        .toThrow(/validateFeatureContent must be a function/);
    });
  });


  describe('VERIFY aspect.assembleFeatureContent', () => {
    const genisis = {
      name:                   'myAspectName',
      validateFeatureContent: identityFn,
    };

    test('assembleFeatureContent is required', () => {
      expect(()=>createAspect({...genisis}))
        .toThrow(/assembleFeatureContent is required/);
    });

    test('assembleFeatureContent must be a function', () => {
      expect(()=>createAspect({...genisis, assembleFeatureContent:123}))
        .toThrow(/assembleFeatureContent must be a function/);
    });
  });


  describe('VERIFY aspect.assembleAspectResources', () => {
    const genisis = {
      name:                   'myAspectName',
      validateFeatureContent: identityFn,
      assembleFeatureContent: identityFn,
    };

    test('assembleAspectResources must be a function', () => {
      expect(()=>createAspect({...genisis, assembleAspectResources:123}))
        .toThrow(/assembleAspectResources.*must be a function/);
    });
  });


  describe('VERIFY aspect.injectRootAppElm', () => {
    const genisis = {
      name:                    'myAspectName',
      validateFeatureContent:  identityFn,
      assembleFeatureContent:  identityFn,
      assembleAspectResources: identityFn,
    };

    test('injectRootAppElm must be a function', () => {
      expect(()=>createAspect({...genisis, injectRootAppElm:123}))
        .toThrow(/injectRootAppElm.*must be a function/);
    });
  });

});
