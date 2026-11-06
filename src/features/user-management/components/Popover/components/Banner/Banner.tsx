import { useRef, useState } from "react";
import { Box, ButtonBase, useTheme } from "@mui/material";
import { useAuthStore, useEffectivePresence } from "@/bonfire";
import { Overlay } from "@/components";
import { Avatar, type AvatarSizeKey } from "@/features/components";

const labels = {
  colorAria: "Change banner color",
} as const;

export interface BannerProps {
  color?: string;
  avatarSize?: AvatarSizeKey;
  canEdit?: boolean;
  onColorChange?: (color: string) => void;
}

export const Banner = ({
  color,
  avatarSize = "lg",
  canEdit = false,
  onColorChange,
}: BannerProps) => {
  const me = useAuthStore((state) => state.me)!;
  const presence = useEffectivePresence();

  const theme = useTheme();
  const colorInputRef = useRef<HTMLInputElement>(null);

  const getHexColor = (color?: string) => {
    if (!color) return theme.palette.primary.main;
    if (color.startsWith("#")) return color;
    return color;
  };

  const resolvedColor = color ?? me.bannerColor;
  const activeColor = resolvedColor || "primary.main";
  const hexValue = getHexColor(resolvedColor);

  const handleClick = () => {
    if (canEdit) {
      colorInputRef.current?.click();
    }
  };

  return (
    <Box sx={{ px: 2, pt: 5, position: "relative" }}>
      {canEdit && (
        <ColorInput
          ref={colorInputRef}
          value={hexValue}
          onColorChange={onColorChange}
        />
      )}

      <BannerBackground
        canEdit={canEdit}
        activeColor={activeColor}
        onClick={handleClick}
      />

      <Avatar
        src={me.avatarUrl}
        username={me.username}
        presence={presence}
        size={avatarSize}
        bgColor={activeColor}
      />
    </Box>
  );
};

interface BannerBackgroundProps {
  canEdit: boolean;
  activeColor: string;
  onClick: () => void;
}

const BannerBackground = ({
  canEdit,
  activeColor,
  onClick,
}: BannerBackgroundProps) => {
  return (
    <Box
      className="overlay-container"
      component={canEdit ? ButtonBase : "div"}
      onClick={canEdit ? onClick : undefined}
      aria-label={canEdit ? labels.colorAria : undefined}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "70%",
        bgcolor: activeColor,
      }}
    >
      {canEdit && <Overlay showIcon />}
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
      tabIndex={-1}
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
