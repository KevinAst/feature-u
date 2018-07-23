import {createAspect} from '../..';

// convenience unit-test helper that fills in required params with defaults
export default function createAspect$({validateFeatureContent = (feature) => null,
                                       assembleFeatureContent = (fassets, activeFeatures) => null,
                                       ...passthrough}) {
  return createAspect({
    validateFeatureContent,
    assembleFeatureContent,
    ...passthrough
  });
}
