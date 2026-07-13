export interface BonfireHttpConfig {
  baseURL: string;
  timeout: number;
}

export const httpConfig: BonfireHttpConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  timeout: 10000,
};
