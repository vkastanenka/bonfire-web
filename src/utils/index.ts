export * from "./form-handler";

export const isMobileOS = (os: string): boolean => {
  const normalized = os.toLowerCase();
  return (
    normalized.includes("android") ||
    normalized.includes("ios") ||
    normalized.includes("iphone") ||
    normalized.includes("ipad")
  );
};

export const mergeUniqueIds = (
  existingIds: string[],
  ...newIds: string[]
): string[] => Array.from(new Set([...existingIds, ...newIds]));
