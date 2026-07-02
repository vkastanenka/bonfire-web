export const mutationKeys = {
  all: ["auth"] as const,
  register: () => [...mutationKeys.all, "register"] as const,
};
