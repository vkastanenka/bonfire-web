import Stack from "@mui/material/Stack";
import { BfLogotype, Link, Typography } from "@/components";
import type { AppRoute } from "@/types";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footerLink?: AppRoute;
}

export const AuthLayout = ({
  children,
  title,
  subtitle,
  footerLink,
}: AuthLayoutProps) => {
  return (
    <Stack spacing={2.5}>
      <BfLogotype sx={{ alignSelf: "center" }} />
      <Stack spacing={1} sx={{ textAlign: "center" }}>
        <Typography.Heading>{title}</Typography.Heading>
        {subtitle && <Typography>{subtitle}</Typography>}
      </Stack>
      {children}
      {footerLink && (
        <Link.Text to={footerLink.path}>{footerLink.label}</Link.Text>
      )}
    </Stack>
  );
};
