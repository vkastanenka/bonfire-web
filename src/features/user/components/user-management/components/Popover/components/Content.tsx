import { Typography, Stack } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

export interface ContentProps {
  icon?: React.ElementType;
  iconColor?: string;
  iconSize?: number;
  gap?: number;
  children?: React.ReactNode;
  label?: string;
  description?: string;
  hasSubmenu?: boolean;
}

export const Content = ({
  icon: Icon,
  iconColor,
  iconSize = 16,
  gap = 1,
  children,
  label,
  description,
  hasSubmenu,
}: ContentProps) => (
  <>
    <Stack direction="row" sx={{ alignItems: "center", gap }}>
      {Icon && (
        <Icon
          sx={{
            fontSize: iconSize,
            ...(iconColor && { color: iconColor }),
          }}
        />
      )}
      {children ? (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {children}
        </Typography>
      ) : (
        <Stack>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
          {description && (
            <Typography variant="caption">{description}</Typography>
          )}
        </Stack>
      )}
    </Stack>
    {hasSubmenu && <KeyboardArrowRightIcon sx={{ fontSize: 16 }} />}
  </>
);
