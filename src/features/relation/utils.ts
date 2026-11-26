import { type Me, type User } from "@/bonfire-sdk";

const sanitizeDisplayName = (displayName: string): string => {
  return displayName.trim().toLowerCase();
};

const getUserDisplayName = (
  userId: string,
  users: Record<string, User>,
): string => {
  const displayName = users[userId]?.displayName;
  if (displayName) {
    return sanitizeDisplayName(displayName);
  }
  return userId.toLowerCase();
};

const getMemberDisplayName = (
  userId: string,
  me: Me | null,
  users: Record<string, User>,
): string => {
  if (me && me.id === userId) {
    return sanitizeDisplayName(me.displayName);
  }
  return getUserDisplayName(userId, users);
};

const sortUniqueIds = (
  ids: string[],
  resolveName: (id: string) => string,
): string[] => {
  const uniqueIds = Array.from(new Set(ids));
  return uniqueIds.sort((a, b) => {
    const cmp = resolveName(a).localeCompare(resolveName(b));
    return cmp !== 0 ? cmp : a.localeCompare(b);
  });
};

export const sortUserIdsByDisplayName = (
  ids: string[],
  users: Record<string, User>,
): string[] => {
  return sortUniqueIds(ids, (id) => getUserDisplayName(id, users));
};

export const sortUserIdsByDisplayNameWithMe = (
  ids: string[],
  me: Me | null,
  users: Record<string, User>,
): string[] => {
  return sortUniqueIds(ids, (id) => getMemberDisplayName(id, me, users));
};
