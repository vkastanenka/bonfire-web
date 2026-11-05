export const labels = {
  loggedInDevices: "Logged-in Devices",
} as const;

export const screenLabels = {
  devices: labels.loggedInDevices,
} as const;

export type ScreenLabelKey = keyof typeof screenLabels;
