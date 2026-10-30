import { useRef, useState } from "react";
import { Box, ButtonBase, useTheme } from "@mui/material";
import { Overlay } from "@/components";
import { type Presence } from "@/presence";
import { UserAvatar, type UserAvatarSize } from "./UserAvatar";

const LABELS = {
  COLOR_ARIA: "Change banner color",
} as const;

export interface BannerProps {
  username: string;
  presence: Presence;
  bannerColor?: string;
  avatarSrc?: string;
  avatarSize?: UserAvatarSize;
  editable?: boolean;
  onColorChange?: (color: string) => void;
}

export const Banner = ({
  username,
  presence,
  bannerColor,
  avatarSrc,
  avatarSize = "lg",
  editable = false,
  onColorChange,
}: BannerProps) => {
  const theme = useTheme();
  const colorInputRef = useRef<HTMLInputElement>(null);

  const getHexColor = (color?: string) => {
    if (!color) return theme.palette.primary.main;
    if (color.startsWith("#")) return color;
    return color;
  };

  const activeColor = bannerColor || "primary.main";
  const hexValue = getHexColor(bannerColor);

  const handleClick = () => {
    if (editable) {
      colorInputRef.current?.click();
    }
  };

  return (
    <Box sx={{ px: 2, pt: 5, position: "relative" }}>
      {editable && (
        <ColorInput
          ref={colorInputRef}
          value={hexValue}
          onColorChange={onColorChange}
        />
      )}

      <BannerBackground
        editable={editable}
        activeColor={activeColor}
        onClick={handleClick}
      />

      <UserAvatar
        src={avatarSrc}
        username={username}
        presence={presence}
        size={avatarSize}
        bgColor={activeColor}
      />
    </Box>
  );
};

interface BannerBackgroundProps {
  editable: boolean;
  activeColor: string;
  onClick: () => void;
}

const BannerBackground = ({
  editable,
  activeColor,
  onClick,
}: BannerBackgroundProps) => {
  return (
    <Box
      component={editable ? ButtonBase : "div"}
      onClick={editable ? onClick : undefined}
      aria-label={editable ? LABELS.COLOR_ARIA : undefined}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "70%",
        bgcolor: activeColor,
      }}
    >
      {editable && <Overlay showIcon />}
    </Box>
  );
};

interface ColorInputProps {
  ref: React.RefObject<HTMLInputElement | null>;
  value: string;
  onColorChange?: (color: string) => void;
}

const ColorInput = ({ ref, value, onColorChange }: ColorInputProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [prevPropsValue, setPrevPropsValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (value !== prevPropsValue) {
    setPrevPropsValue(value);
    setLocalValue(value);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setLocalValue(newColor);

    if (!onColorChange) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onColorChange(newColor);
    }, 50);
  };

  return (
    <input
      type="color"
      ref={ref}
      value={localValue}
      onChange={handleChange}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 0,
        height: 0,
        opacity: 0,
        pointerEvents: "none",
        border: 0,
        padding: 0,
      }}
    />
  );
};
