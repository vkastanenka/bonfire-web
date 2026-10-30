import { Box, type BoxProps } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

export type OverlayPositionY = "top" | "center" | "bottom";
export type OverlayPositionX = "left" | "center" | "right";

export interface OverlayProps extends BoxProps {
  children?: React.ReactNode;
  icon?: React.ElementType;
  showIcon?: boolean;
  iconY?: OverlayPositionY;
  iconX?: OverlayPositionX;
}

const alignItemsMap: Record<OverlayPositionY, string> = {
  top: "flex-start",
  center: "center",
  bottom: "flex-end",
};

const justifyContentMap: Record<OverlayPositionX, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

export const Overlay = ({
  children,
  icon: Icon = EditIcon,
  showIcon = false,
  iconY = "top",
  iconX = "right",
  sx,
  ...props
}: OverlayProps) => {
  const alignItems = alignItemsMap[iconY] || "flex-start";
  const justifyContent = justifyContentMap[iconX] || "flex-end";

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        bgcolor: "rgba(0, 0, 0, 0.25)",
        opacity: 0,
        transition: "opacity 0.2s ease",
        display: "flex",
        p: 1,
        alignItems,
        justifyContent,
        "&:hover": {
          opacity: 1,
        },
        ...sx,
      }}
      {...props}
    >
      {children ? (
        children
      ) : showIcon ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: "rgba(0, 0, 0, 0.5)",
            color: "white",
          }}
        >
          <Icon sx={{ fontSize: 16 }} />
        </Box>
      ) : null}
    </Box>
  );
};
