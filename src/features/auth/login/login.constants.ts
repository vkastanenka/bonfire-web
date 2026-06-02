export const LABELS = {
  title: "Welcome back!",
  subtitle: "Come get warm around the fire!",
  email: "Email Address",
  password: "Password",
  submit: "Log In",
  forgotPassword: "Forgot your password?",
} as const;

export const PATHS = {
  forgotPassword: {
    label: LABELS.forgotPassword,
    path: "/forgot-password",
  },
  register: {
    label: "Need an account? Register",
    path: "/register",
  },
} as const;

export const VALIDATION_LABELS = {
  password: "Password must be at least 6 characters long",
} as const;

export const FORM_FIELDS = {
  email: {
    name: "email",
    id: "email-input",
    label: LABELS.email,
  },
  password: {
    name: "password",
    id: "password-input",
    label: LABELS.password,
  },
} as const;
