import { ResourceOptions, FeatureType } from 'admin-bro'

export type CreateResourceResult<T> = {
  resource: T;
  options: ResourceOptions;
  features: Array<FeatureType>;
};
