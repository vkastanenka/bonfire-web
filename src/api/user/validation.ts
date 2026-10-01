import { z } from "zod";

export const VALIDATION_ERRORS = {
  username:
    "Must start and end with a letter or number. May contain only letters, numbers, and non-consecutive underscores or periods.",
};

export const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9_.]?[a-zA-Z0-9])+$/;

export const emailSchema = z.email().max(255);

export const usernameSchema = z
  .string()
  .min(3)
  .max(32)
  .regex(usernameRegex, VALIDATION_ERRORS.username);

export const passwordSchema = z.string().min(12).max(255);

export const displayNameSchema = z.string().min(3).max(32);
