export interface AppConfig {
  baseURL: string;
  timeout: number;
}

export const resolveConfig = (overrides?: Partial<AppConfig>): AppConfig => {
  return {
    baseURL:
      overrides?.baseURL ??
      (typeof process !== "undefined" ? process.env.API_BASE_URL : undefined) ??
      "http://localhost:8080/api/v1",

    timeout:
      overrides?.timeout ??
      (typeof process !== "undefined"
        ? Number(process.env.API_TIMEOUT)
        : undefined) ??
      15000,
  };
};
