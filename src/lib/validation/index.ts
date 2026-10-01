import { z } from "zod";

export const ERRORS = {
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
} as const;

z.config({
  customError: (issue) => {
    if (
      issue.code === "invalid_type" &&
      (issue.input === undefined || issue.input === null)
    ) {
      return ERRORS.required;
    }

    if (issue.code === "invalid_format" && issue.format === "email") {
      return ERRORS.email;
    }

    if (issue.code === "too_small") {
      switch (issue.origin) {
        case "string":
          return ERRORS.minString(issue.minimum);
        case "number":
        case "bigint":
          return ERRORS.minNumeric(issue.minimum);
        case "array":
        case "set":
          return ERRORS.minCollection(issue.minimum);
      }
    }

    if (issue.code === "too_big") {
      switch (issue.origin) {
        case "string":
          return ERRORS.maxString(issue.maximum);
        case "number":
        case "bigint":
          return ERRORS.maxNumeric(issue.maximum);
        case "array":
        case "set":
          return ERRORS.maxCollection(issue.maximum);
      }
    }

    return undefined;
  },
});

export { z };
