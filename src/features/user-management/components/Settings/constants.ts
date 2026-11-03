export const labels = {
  account: "Account",
  accountInfo: "Account Info",
  username: "Username",
  email: "Email",

  passwordSecurity: "Password & Security",
  password: "Password",
  loggedInDevices: "Logged-in Devices",
  loggedInDevicesDescription:
    "These are all the devices that are currently logged-in with your Bonfire account. Log out of devices that you don't recognize.",
  currentDevice: "Current Device",
  otherDevices: "Other Devices",
  logOutOfAllDevicesTitle: "Log out of all known devices",
  logOutOfAllDevicesSubtitle:
    "You'll have to log back in on all logged out devices.",
  logOutOfAllDevicesButton: "Log Out All Known Devices",

  accountClosure: "Account Closure",
  disableTitle: "Disable your account",
  disableSubtitle: "Temporarily disable your account.",
  disableButton: "Disable Account",
  closeTitle: "Close your account",
  closeSubtitle: "Permanently close your account.",
  closeButton: "Delete Account",

  edit: "Edit",
  reveal: "Reveal",
  hide: "Hide",
  device: "device",
  devices: "devices",
} as const;

export const screenLabels = {
  devices: labels.loggedInDevices,
} as const;

export type ScreenLabelKey = keyof typeof screenLabels;
