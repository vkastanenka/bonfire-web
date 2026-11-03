export const labels = {
  displayName: "Display Name",
  bio: "Bio",
  submit: "Update Profile",
} as const;

export const formFields = {
  displayName: {
    name: "displayName",
    id: "displayName-input",
    label: labels.displayName,
    required: true,
    autoComplete: "displayName",
  },
  bio: {
    name: "bio",
    id: "bio-input",
    type: "bio",
    label: labels.bio,
    autoComplete: "bio",
    multiline: true,
    rows: 4,
    placeholder: "Tell us about yourself! (190 characters max)",
  },
} as const;
