import {
  type CustomAxiosInstance,
  type BaseApiConfig,
  type BaseApiServiceConfig,
} from "./types";

export abstract class BaseApiService<T extends BaseApiConfig> {
  protected readonly instance: CustomAxiosInstance;
  protected readonly config: BaseApiServiceConfig<T>;

  constructor(instance: CustomAxiosInstance, config: BaseApiServiceConfig<T>) {
    this.instance = instance;
    this.config = config;
  }
}
