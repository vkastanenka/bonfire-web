export interface Config {
  baseURL: string;
  timeout: number;
}

export const createConfig = (overrides?: Partial<Config>): Config => {
  return {
    baseURL: overrides?.baseURL ?? "http://localhost:8080/api/v1",
    timeout: overrides?.timeout ?? 15000,
  };
};
