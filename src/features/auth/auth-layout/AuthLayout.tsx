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
    <Stack
      sx={{
        width: "100%",
        maxWidth: 400,
        mx: "auto",
        gap: (t) => t.spacingTokens.stack,
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          textAlign: "center",
          gap: (t) => t.spacingTokens.group,
        }}
      >
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
