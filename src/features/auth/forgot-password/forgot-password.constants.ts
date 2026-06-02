export const LABELS = {
  title: "Reset your password",
  subtitle:
    "Enter your account's verified email address and we will send you a password reset link.",
  email: "Email Address",
  submit: "Send password reset email",
  login: "Don't need to reset your password? Log in",
} as const;

export const PATHS = {
  login: {
    label: "Don't need to reset your password? Log in",
    path: "/login",
  },
} as const;

export const FORM_FIELDS = {
  email: {
    name: "email",
    id: "email-input",
    label: LABELS.email,
  },
} as const;
