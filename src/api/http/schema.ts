import { z } from "zod";

const ERROR_TEMPLATES = {
  required: "This field is required.",
  whitespace: "Cannot consist entirely of whitespace.",
  email: "Must be a valid email address.",
  alphanum: "Must contain only letters and numbers.",
  username:
    "Must start and end with a letter or number. May contain only letters, numbers, and non-consecutive underscores or periods.",

  minString: (val: number | bigint) => `Must be at least ${val} characters.`,
  minNumeric: (val: number | bigint) => `Must be ${val} or greater.`,
  minCollection: (val: number | bigint) =>
    `Must contain at least ${val} items.`,

  maxString: (val: number | bigint) =>
    `Cannot be longer than ${val} characters.`,
  maxNumeric: (val: number | bigint) => `Must be ${val} or less.`,
  maxCollection: (val: number | bigint) =>
    `Cannot contain more than ${val} items.`,
};

z.config({
  customError: (issue) => {
    if (issue.code === "invalid_type" && issue.input === undefined) {
      return ERROR_TEMPLATES.required;
    }

    if (issue.code === "invalid_format" && issue.format === "email") {
      return ERROR_TEMPLATES.email;
    }

    if (issue.code === "too_small") {
      switch (issue.origin) {
        case "string":
          return ERROR_TEMPLATES.minString(issue.minimum);
        case "number":
        case "bigint":
          return ERROR_TEMPLATES.minNumeric(issue.minimum);
        case "array":
        case "set":
          return ERROR_TEMPLATES.minCollection(issue.minimum);
      }
    }

    if (issue.code === "too_big") {
      switch (issue.origin) {
        case "string":
          return ERROR_TEMPLATES.maxString(issue.maximum);
        case "number":
        case "bigint":
          return ERROR_TEMPLATES.maxNumeric(issue.maximum);
        case "array":
        case "set":
          return ERROR_TEMPLATES.maxCollection(issue.maximum);
      }
    }

    return undefined;
  },
});

export const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9_.]?[a-zA-Z0-9])+$/;

export const identityEmail = z.email().max(255);

export const identityUsername = z
  .string()
  .min(3)
  .max(32)
  .regex(usernameRegex, ERROR_TEMPLATES.username);

export const identityPassword = z.string().min(12).max(255);

export const profileDisplayName = z.string().min(3).max(32);

export const emptyToUndefined = <T extends z.ZodString>(stringSchema: T) =>
  z
    .string()
    .optional()
    .transform((val) => (val?.trim() === "" ? undefined : val))
    .pipe(stringSchema.optional());

export const registerRequestSchema = z.object({
  email: identityEmail,
  display_name: emptyToUndefined(profileDisplayName),
  username: identityUsername,
  password: identityPassword,
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const registerResponseSchema = z.object({
  access_token: z.string(),
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;

export const loginRequestSchema = z.object({
  email: identityEmail,
  password: identityPassword,
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const loginResponseSchema = z.object({
  access_token: z.string(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const refreshResponseSchema = z.object({
  access_token: z.string(),
});

export type RefreshResponse = z.infer<typeof refreshResponseSchema>;

export const wsTicketResponseSchema = z.object({
  ticket: z.uuid(),
});

export type WSTicketResponse = z.infer<typeof wsTicketResponseSchema>;

export const presenceSchema = z.enum([
  "online",
  "offline",
  "idle",
  "dnd",
  "offline",
  "invisible",
]);

export type Presence = z.infer<typeof presenceSchema>;

export const meSchema = z.object({
  id: z.uuid(),
  email: identityEmail,
  username: identityUsername,
  display_name: profileDisplayName,
  avatar_url: z.url().nullable().optional(),
  presence: presenceSchema.nullable().optional(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export type Me = z.infer<typeof meSchema>;
