export const LABELS = {
  title: "Reset your password",
  subtitle:
    "Enter your account's verified email address and we will send you a password reset link.",
  email: "Email Address",
  submit: "Send password reset email",
  login: "Don't need to reset your password? Log in",
  titleSuccess: "Email has been sent",
  subtitleSuccess: "We've sent recovery instructions to your inbox.",
  loginSuccess: "Return to login",
} as const;

export const FORM_FIELDS = {
  email: {
    name: "email",
    id: "email-input",
    label: LABELS.email,
    required: true,
  },
} as const;
