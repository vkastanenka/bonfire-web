import type { ReactNode } from "react";
import Stack from "@mui/material/Stack";
import { BfLogotype, Text } from "@/components";

interface AuthLayoutProps {
  children: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <Stack
      sx={(t) => ({
        width: "100%",
        maxWidth: 400,
        mx: "auto",
        px: 2,
        py: t.spacingTokens.stack,
        gap: t.spacingTokens.stack,
      })}
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
          <Text.Heading>{title}</Text.Heading>
        ) : (
          title
        )}

        {subtitle &&
          (typeof subtitle === "string" ? (
            <Text color="text.secondary">{subtitle}</Text>
          ) : (
            subtitle
          ))}
      </Stack>

      {children}
    </Stack>
  );
};
