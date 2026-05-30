import Stack from "@mui/material/Stack";
import SvgIcon from "@mui/material/SvgIcon";
import BfLogotype from "@/assets/icons/bf-logotype.svg?react";
import { Link, Typography } from "@/components";
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
  console.log("AuthLayout.tsx TODO: Refactor SvgIcon");
  return (
    <Stack spacing={2.5}>
      <SvgIcon
        component={BfLogotype}
        inheritViewBox
        sx={{
          fontSize: "inherit",
          height: "40px",
          width: "auto",
          alignSelf: "center",
        }}
      />
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
