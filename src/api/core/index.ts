import { HttpClient } from "./client";
import { httpConfig } from "./config";
import { AuthService } from "./services";

const httpClient = new HttpClient(httpConfig);

export const authService = new AuthService(
  httpClient.createScope("/auth", "AuthService"),
);

export * from "./errors";
export * from "./schema";
