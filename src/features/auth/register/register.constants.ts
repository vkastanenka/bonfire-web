export const LABELS = {
  title: "Create an account",
  email: "Email Address",
  displayName: "Display Name",
  username: "Username",
  password: "Password",
  submit: "Create Account",
} as const;

export const PATHS = {
  login: {
    label: "Already have an account? Log in",
    path: "/login",
  },
} as const;

export const VALIDATION_LABELS = {
  displayName: "Password must be at least 6 characters long",
  username: "Password must be at least 6 characters long",
  password: "Password must be at least 6 characters long",
} as const;
