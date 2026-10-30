export const LABELS = {
  DISPLAY_NAME: "Display Name",
  BIO: "Bio",
  SUBMIT: "Update Profile",
} as const;

export const formFields = {
  displayName: {
    name: "displayName",
    id: "displayName-input",
    label: LABELS.DISPLAY_NAME,
    required: true,
    autoComplete: "displayName",
  },
  bio: {
    name: "bio",
    id: "bio-input",
    type: "bio",
    label: LABELS.BIO,
    autoComplete: "bio",
    multiline: true,
    rows: 4,
    placeholder: "Tell us about yourself! (190 characters max)",
  },
} as const;
