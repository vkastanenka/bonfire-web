import { z } from "zod";

export const errors = {
  required: "This field is required.",
  whitespace: "Cannot consist entirely of whitespace.",
  email: "Must be a valid email address.",
  alphanum: "Must contain only letters and numbers.",
  hexColor: "Must be a valid 6-character hex color (e.g. #FF5733).",
  phone: "Must be a valid E.164 phone number (e.g. +14155552671).",

  minString: (val: number | bigint) => `Must be at least ${val} characters.`,
  minNumeric: (val: number | bigint) => `Must be ${val} or greater.`,
  minCollection: (val: number | bigint) =>
    `Must contain at least ${val} items.`,

  maxString: (val: number | bigint) =>
    `Cannot be longer than ${val} characters.`,
  maxNumeric: (val: number | bigint) => `Must be ${val} or less.`,
  maxCollection: (val: number | bigint) =>
    `Cannot contain more than ${val} items.`,
} as const;

z.config({
  customError: (issue) => {
    if (
      issue.code === "invalid_type" &&
      (issue.input === undefined || issue.input === null)
    ) {
      return errors.required;
    }

    if (issue.code === "invalid_format" && issue.format === "email") {
      return errors.email;
    }

    if (issue.code === "too_small") {
      switch (issue.origin) {
        case "string":
          return errors.minString(issue.minimum);
        case "number":
        case "bigint":
          return errors.minNumeric(issue.minimum);
        case "array":
        case "set":
          return errors.minCollection(issue.minimum);
      }
    }

    if (issue.code === "too_big") {
      switch (issue.origin) {
        case "string":
          return errors.maxString(issue.maximum);
        case "number":
        case "bigint":
          return errors.maxNumeric(issue.maximum);
        case "array":
        case "set":
          return errors.maxCollection(issue.maximum);
      }
    }

    return undefined;
  },
});

export const hexColorRegex = /^#[0-9a-fA-F]{6}$/;
export const phoneRegex = /^\+[1-9]\d{1,14}$/;

export const emailSchema = z.email().min(6).max(255);
export const hexColorSchema = z.string().regex(hexColorRegex, errors.hexColor);
export const phoneSchema = z.string().regex(phoneRegex, errors.phone);
export const urlSchema = z.url().max(2048);
export const jwtString = z.string().max(2048);

export { z };
