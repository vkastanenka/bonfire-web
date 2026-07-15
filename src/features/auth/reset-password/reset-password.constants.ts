export const LABELS = {
  title: "Reset your password",
  subtitle: "Enter a new password for your account.",
  password: "Password",
  submit: "Reset password",
  login: "Don't need to reset your password? Log in",
} as const;

export const VALIDATION_LABELS = {
  password: "Password must be at least 6 characters long",
} as const;

export const FORM_FIELDS = {
  password: {
    name: "password",
    id: "password-input",
    label: LABELS.password,
    required: true,
  },
} as const;
