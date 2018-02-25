import {op}           from '../launchApp';  // module under test INTERNAL 
import {createFeature} from '../..';


describe('launchApp.op.helper.createApp(activeFeatures): app', () => {

  const feature1API = {
    subNode: {
      a: 'a',
      b: 'b',
    }, 
  };

  const feature3API = {
    otherStuff: {
      c: 'c',
      d: 'd',
    }, 
  };

  const expectedApp = {
    feature1: feature1API,
    feature2: {},
    feature3: feature3API,
  };

  test('test passthrough of feature Public API in the app object', () => {
    expect(op.helper.createApp([
      createFeature({
        name:       'feature1',
        publicFace: feature1API,
      }),
      createFeature({
        name:       'feature2', // has no API ... empty {}
      }),
      createFeature({
        name:       'feature3',
        publicFace: feature3API,
      }),
    ])).toEqual(expectedApp);
  });

});
