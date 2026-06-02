import type { ReactNode } from "react";
import Stack from "@mui/material/Stack";
import { BfLogotype, Typography } from "@/components";

interface AuthLayoutProps {
  children: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <Stack spacing={2.5} sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
      <Stack spacing={1} sx={{ alignItems: "center", textAlign: "center" }}>
        <BfLogotype />

        {typeof title === "string" ? (
          <Typography.Heading>{title}</Typography.Heading>
        ) : (
          title
        )}

        {subtitle &&
          (typeof subtitle === "string" ? (
            <Typography color="text.secondary">{subtitle}</Typography>
          ) : (
            subtitle
          ))}
      </Stack>

      {children}
    </Stack>
  );
};
