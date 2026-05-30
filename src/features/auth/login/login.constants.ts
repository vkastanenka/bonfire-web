export const LABELS = {
  title: "Welcome back!",
  subtitle: "Come get warm around the fire!",
  email: "Email Address",
  password: "Password",
  submit: "Log In",
  forgotPassword: "Forgot your password?",
} as const;

export const PATHS = {
  register: {
    label: "Need an account? Register",
    path: "/register",
  },
} as const;

export const VALIDATION_LABELS = {
  password: "Password must be at least 6 characters long",
} as const;
