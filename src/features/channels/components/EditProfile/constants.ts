export const LABELS = {
  displayName: "Display Name",
  bio: "Bio",
  submit: "Update Profile",
} as const;

export const VALIDATION_LABELS = {
  password: "Password must be at least 12 characters long",
} as const;

export const FORM_FIELDS = {
  displayName: {
    name: "displayName",
    id: "displayName-input",
    label: LABELS.displayName,
    required: true,
    autoComplete: "displayName",
  },
  bio: {
    name: "bio",
    id: "bio-input",
    type: "bio",
    label: LABELS.bio,
    autoComplete: "bio",
    multiline: true,
    rows: 4,
    placeholder: "Tell us about yourself! (190 characters or less)",
  },
} as const;
