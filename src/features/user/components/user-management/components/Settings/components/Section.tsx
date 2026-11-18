import { type ReactNode } from "react";
import { Stack, Typography } from "@mui/material";

interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const Section = ({ title, subtitle, children }: SectionProps) => {
  let titleEl = (
    <Typography variant="h6" sx={{ fontWeight: 500 }}>
      {title}
    </Typography>
  );

  if (subtitle) {
    titleEl = (
      <Stack>
        {titleEl}
        <Typography variant="body2">{subtitle}</Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ gap: 4 }}>
      {titleEl}
      {children}
    </Stack>
  );
};

interface SubSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const SubSection = ({ title, subtitle, children }: SubSectionProps) => {
  return (
    <Stack sx={{ gap: 2 }}>
      <Stack>
        <Typography sx={{ fontWeight: 500 }}>{title}</Typography>
        {subtitle && <Typography variant="body2">{subtitle}</Typography>}
      </Stack>
      {children}
    </Stack>
  );
};
