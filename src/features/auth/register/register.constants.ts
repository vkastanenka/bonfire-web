export const LABELS = {
  title: "Create an account",
  email: "Email Address",
  displayName: "Display Name",
  username: "Username",
  password: "Password",
  submit: "Create Account",
  login: "Already have an account? Log in",
} as const;

export const VALIDATION_LABELS = {
  displayName: "Display name must be at least 6 characters long",
  username: "Username must be at least 6 characters long",
  password: "Password must be at least 6 characters long",
} as const;

export const FORM_FIELDS = {
  email: {
    name: "email",
    id: "email-input",
    label: LABELS.email,
  },
  display_name: {
    name: "display_name",
    id: "display_name-input",
    label: LABELS.displayName,
  },
  username: {
    name: "username",
    id: "username-input",
    label: LABELS.username,
  },
  password: {
    name: "password",
    id: "password-input",
    label: LABELS.password,
  },
} as const;
