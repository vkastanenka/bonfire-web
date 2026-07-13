import { useAppInitializer } from "@/api/react/ws.hooks";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  useAppInitializer();

  return <>{children}</>;
};
