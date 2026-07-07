export interface AppConfig {
  baseURL: string;
  timeout: number;
}

export const createConfig = (overrides?: Partial<AppConfig>): AppConfig => {
  return {
    baseURL: overrides?.baseURL ?? "http://localhost:8080/api/v1",
    timeout: overrides?.timeout ?? 15000,
  };
};
