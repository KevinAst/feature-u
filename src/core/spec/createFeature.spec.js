import createFeature,
       {isFeatureProperty,
        extendFeatureProperty} from '../createFeature';


describe('createFeature() tests', () => {

  //***--------------------------------------------------------------------------------
  describe('VERIFY parameters', () => {

    describe('no params', () => {
      test('no params: name is required', () => {
        expect(()=>createFeature())
          .toThrow(/name is required/);
        // THROW: createFeature() parameter violation: name is required
      });
    });

    describe('feature.name', () => {
      test('name is required', () => {
        expect(()=>createFeature({}))
          .toThrow(/name is required/);
        // THROW: createFeature() parameter violation: name is required
      });

      test('name must be a string', () => {
        expect(()=>createFeature({name:123}))
          .toThrow(/name must be a string/);
        // THROW: createFeature() parameter violation: name must be a string
      });
    });

    describe('feature.enabled', () => {
      test('enabled must be a boolean', () => {
        expect(()=>createFeature({name: 'test', enabled:123}))
          .toThrow(/enabled must be a boolean/);
        // THROW: createFeature() parameter violation: enabled must be a boolean
      });
    });

    // publicFace: nothing to validate (it can be anything)

    describe('feature.appWillStart', () => {
      test('appWillStart must be a function', () => {
        expect(()=>createFeature({name: 'test', appWillStart:123}))
          .toThrow(/appWillStart .* must be a function/);
        // THROW: createFeature() parameter violation: appWillStart (when supplied) must be a function
      });
    });

    describe('feature.appDidStart', () => {
      test('appDidStart must be a function', () => {
        expect(()=>createFeature({name: 'test', appDidStart:123}))
          .toThrow(/appDidStart .* must be a function/);
        // THROW: createFeature() parameter violation: appDidStart (when supplied) must be a function
      });
    });

  });

  //***--------------------------------------------------------------------------------
  describe('VERIFY DEFAULT SEMANTICS', () => {
    const feature = createFeature({
      name: 'myFeatureName',
      // everything else is DEFAULTED
    });

    test('feature.name', () => {
      expect(feature.name).toBe('myFeatureName');
    });

    test('feature.enabled', () => {
      expect(feature.enabled).toBe(true);
    });

  });

  //***--------------------------------------------------------------------------------
  describe('VERIFY content pass through', () => {

    const publicFace = { my: 'public', face: ':-)' };

    const feature = createFeature({
      name:            'myFeatureName',
      enabled:         false,
      publicFace,
      appWillStart:    () => 'MY appWillStart',
      appDidStart:     () => 'MY appDidStart',
      additionalStuff: 'typically extended AspectContent',
    });
    
    test('feature.name', () => {
      expect(feature.name).toBe('myFeatureName');
    });

    test('feature.enabled', () => {
      expect(feature.enabled).toBe(false);
    });

    test('feature.publicFace', () => {
      expect(feature.publicFace).toEqual(publicFace);
    });
    
    test('feature.appWillStart', () => {
      expect(feature.appWillStart()).toEqual('MY appWillStart');
    });
    
    test('feature.appDidStart', () => {
      expect(feature.appDidStart()).toEqual('MY appDidStart');
    });

    test('feature.additionalStuff', () => {
      expect(feature.additionalStuff).toBe('typically extended AspectContent');
    });
    
  });


  //***--------------------------------------------------------------------------------
  describe('test extending Feature properties', () => {

    test("isFeatureProperty() builtin props are included", () => {
      expect(isFeatureProperty('name'))
        .toBe(true);
    });

    test("extendFeatureProperty() name is required", () => {
      expect(()=>extendFeatureProperty())
        .toThrow(/name is required/);
      // THROW: extendFeatureProperty() parameter violation: name is required
    });

    test("extendFeatureProperty() name must be a string", () => {
      expect(()=>extendFeatureProperty(123))
        .toThrow(/name must be a string/);
      // THROW: extendFeatureProperty() parameter violation: name must be a string
    });

    test("extendFeatureProperty() owner is required", () => {
      expect(()=>extendFeatureProperty('MyNewProp'))
        .toThrow(/owner is required/);
      // THROW: extendFeatureProperty() parameter violation: owner is required
    });
    
    test("extendFeatureProperty() owner must be a string", () => {
      expect(()=>extendFeatureProperty('MyNewProp', 456))
        .toThrow(/owner must be a string/);
      // THROW: extendFeatureProperty() parameter violation: owner must be a string
    });

    test("extendFeatureProperty() on builtin prop is already reserved", () => {
      expect(()=>extendFeatureProperty('name', 'myAspect'))
        .toThrow(/Feature.name.*is already reserved by different owner/);
      // THROW: **ERROR** extendFeatureProperty('name', 'myAspect') ... 'Feature.name' is already reserved by different owner.
    });

    test("isFeatureProperty('MyNewProp'): false", () => {
      expect(isFeatureProperty('MyNewProp'))
        .toBe(false);
    });

    test("isFeatureProperty('MyNewProp', 'myAspect'): true (after extending)", () => {
      extendFeatureProperty('MyNewProp', 'myAspect');
      expect(isFeatureProperty('MyNewProp'))
        .toBe(true);
    });

    test("duplicate extendFeatureProperty() is OK with same owner", () => {
      expect(()=>extendFeatureProperty('MyNewProp', 'myAspect'))
        .not.toThrow();
    });

    test("duplicate extendFeatureProperty() throws exception with different owner", () => {
      expect(()=>extendFeatureProperty('MyNewProp', 'differentAspect'))
        .toThrow(/is already reserved/);
      // THROW: **ERROR** extendFeatureProperty('MyNewProp', 'differentAspect') ... 'Feature.MyNewProp' is already reserved by different owner.
    });

  });


});
