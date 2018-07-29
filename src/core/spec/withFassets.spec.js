import {withFassets, fassetsProps} from '../withFassets';   // module under test
import React              from 'react';
import createFassets      from '../createFassets';
import {createFeature}    from '../..';

describe('withFassets()', () => {

  // setup our fassets object to test
  const fassets = createFassets([
    createFeature({
      name: 'main',
      fassets: {
        define: {
          'company.logo':   'theCompanyLogo',
        },
      },
    }),

    createFeature({
      name: 'cart',
      fassets: {
        define: {
          'MainPage.cart.link': 'cartLink',
          'MainPage.cart.body': 'cartBody',
        },
      },
    }),

    createFeature({
      name: 'search',
      fassets: {
        define: {
          'MainPage.search.link': 'searchLink',
          'MainPage.search.body': 'searchBody',
        },
      },
    }),

  ]);


  //***-------------------------------------------------------------------------
  describe('withFassets() ERRORS)', () => {

    test('mapFassetsToProps is required', () => {
      expect(()=> withFassets())
        .toThrow(/mapFassetsToProps is required/);
      // THROW:  withFassets() parameter violation: mapFassetsToProps is required
    });

    test('mapFassetsToProps as a function', () => {
      expect(()=> withFassets({mapFassetsToProps: (p)=>p }))
        .not.toThrow();
    });

    test('mapFassetsToProps as a structure', () => {
      expect(()=> withFassets({mapFassetsToProps: {} }))
        .not.toThrow();
    });

    test('invalid mapFassetsToProps', () => {
      expect(()=> withFassets({mapFassetsToProps: 123 }))
        .toThrow(/mapFassetsToProps.*must be.*mapFassetsToPropsFn.*or.*mapFassetsToPropsStruct/);
      // THROW:   withFassets() parameter violation: mapFassetsToProps must be a mapFassetsToPropsFn or mapFassetsToPropsStruct
    });

    test('unrecognized named parameters', () => {
      expect(()=> withFassets({mapFassetsToProps: {}, foo: 1, bar: 2 }))
        .toThrow(/unrecognized named parameter.*foo,bar/);
      // THROW: withFassets() parameter violation: unrecognized named parameter(s): foo,bar
    });

    test('unrecognized poisition parameters', () => {
      expect(()=> withFassets({mapFassetsToProps: {}}, 123))
        .toThrow(/unrecognized positional parameters.*only named parameters can be specified/);
      // THROW:  withFassets() parameter violation: unrecognized positional parameters (only named parameters can be specified)
    });

    test('must pass a component to the function returned by withFassets', () => {
      const hoc = withFassets({mapFassetsToProps: {prop1: 'fassetsKey'} });
      expect(()=> hoc('BadComponent') )
        .toThrow(/must pass a component to the function returned by withFassets/);
      // THROW:  You must pass a component to the function returned by withFassets
    });

    const props  = {prop1: 'prop1Val', prop2: 'prop2Val'};
    const MyComp = () => <p>My Component</p>;

    test('mapFassetsToProps resolved to a plain object', () => {
      const secondLevelHoc = withFassets({mapFassetsToProps: () => 'BAD mapFassetsToPropsStruct' });
      const wrappedComp    = secondLevelHoc(MyComp);
      expect(()=> wrappedComp(props) )
        .toThrow(/mapFassetsToProps resolved to an invalid structure.*MUST be a mapFassetsToPropsStruct/);
      // THROW:  withFassets() parameter violation: mapFassetsToProps resolved to an invalid structure, MUST be a mapFassetsToPropsStruct
    });

    test('mapFassetsToProps resolved to mapFassetsToPropsStruct', () => {
      const secondLevelHoc = withFassets({mapFassetsToProps: () => ({propX: 'fassetsKeyForX', propY: 123}) });
      const wrappedComp    = secondLevelHoc(MyComp);
      expect(()=> wrappedComp(props) )
        .toThrow(/mapFassetsToProps resolved to an invalid structure.*all properties MUST reference a fassetsKey string.*propY does NOT/);
      // THROW:  withFassets() parameter violation: mapFassetsToProps resolved to an invalid structure - all properties MUST reference a fassetsKey string ... at minimum propY does NOT
    });

  });


  //***-------------------------------------------------------------------------
  describe('INTERNAL fassetsProps()', () => {

    const fassetsToPropsMap = {
      logo:       'company.logo',
      nonEntry:   'not.there',
      mainLinks:  'MainPage.*.link',
      nonEntries: 'not.*.there',
      mainBodies: 'MainPage.*.body',
    };

    test('translate map to props', () => {
      expect( fassetsProps(fassetsToPropsMap, fassets) )
        .toEqual({
          logo:       'theCompanyLogo',
          nonEntry:   undefined,
          mainLinks:  ['cartLink', 'searchLink'],
          nonEntries: [],
          mainBodies: ['cartBody', 'searchBody'],
        });
    });
    
  });

  //***-------------------------------------------------------------------------
  describe('INTERNAL fassetsProps() @withKeys', () => {

    const fassetsToPropsMap = {
      logo:       'company.logo@withKeys',
      nonEntry:   'not.there@withKeys',
      mainLinks:  'MainPage.*.link@withKeys',
      nonEntries: 'not.*.there@withKeys',
      mainBodies: 'MainPage.*.body',           // NOTE: can mix and match @withKeys
    };

    test('translate map to props a MIX of @withKeys', () => {
      expect( fassetsProps(fassetsToPropsMap, fassets) )
        .toEqual({
          logo:       ['company.logo',          'theCompanyLogo'],
          nonEntry:   ['not.there',             undefined],
          mainLinks:  [['MainPage.cart.link',   'cartLink'],
                       ['MainPage.search.link', 'searchLink']],
          nonEntries: [],
          mainBodies: ['cartBody', 'searchBody'],
        });
    });
    
  });

});
