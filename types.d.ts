declare module "feature-u" {
  export function launchApp(launchArgs: LaunchArguments): FeatureAssets;
  export function createFeature(featureArgs: FeatureArguments): Feature;
  export function createAspect(aspectArgs: AspectArguments): Aspect;
  export function useFassets<T>(fassetsKey?: string): T | undefined;
  export function assertNoRootAppElm(
    rootElm: React.ReactNode,
    className: string
  ): void;

  interface LaunchArguments {
    features: Feature[];
    registerRootAppElm(rootElm: React.ReactNode, fassets: FeatureAssets): void;
    aspects?: Aspect[];
    showStatus?(message?: string, error?: Error): void;
  }

  interface FeatureArguments {
    name: string;
    enabled: boolean;
    fassets?: {
      define?: Record<string, any>;
      defineUse?: Record<string, any>;
      use?: string[];
    };
    appWillStart?(context: {
      fassets: FeatureAssets;
      curRootAppElm?: React.ReactNode;
    }): React.ReactNode | void;
    appInit?(context: {
      fassets: FeatureAssets;
      showStatus?(message?: string, error?: Error): void;
      curRootAppElm?: React.ReactNode;
    }): Promise<void> | void;
  }

  interface AspectArguments {
    name: string;
    genesis?(): string | undefined;
    validateFeatureContent?(feature: Feature): string | undefined;
    expandFeatureContent?(
      fassets: FeatureAssets,
      feature: Feature
    ): string | undefined;
    assembleFeatureContent?(
      fassets: FeatureAssets,
      activeFeatures: Feature[]
    ): void;
    assembleAspectResources?(fassets: FeatureAssets, aspects: Aspect[]): void;
    initialRootAppElm?(
      fassets: FeatureAssets,
      curRootAppElm: React.ReactNode
    ): React.ReactNode;
    injectRootAppElm?(
      fassets: FeatureAssets,
      curRootAppElm: React.ReactNode
    ): React.ReactNode;
    injectParamsInHooks?(fassets: FeatureAssets): any; // TODO: Improve
    config?: any;
    additionalMethods?: any;
  }

  interface Feature {
    name: string;
  }
  interface Aspect {}

  /**
   * Feature assets catalog
   */
  interface FeatureAssets {
    get<T = any>(fassetsKey: string): T | Array<T>;
    hasFeature(fassetsKey: string): boolean;
  }
}
