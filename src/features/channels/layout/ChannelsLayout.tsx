import { useAppInitializer } from "@/api/react/ws.hooks";

export const ChannelsLayout = ({ children }: { children: React.ReactNode }) => {
  useAppInitializer();

  return <>{children}</>;
};
