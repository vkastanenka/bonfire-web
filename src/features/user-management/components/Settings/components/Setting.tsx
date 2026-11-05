import { useState, type ReactElement, type ReactNode } from "react";
import { Button, Stack, Typography } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const labels = {
  edit: "Edit",
  reveal: "Reveal",
  hide: "Hide",
};

interface SettingProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const Setting = ({ title, subtitle, children }: SettingProps) => {
  return (
    <Stack
      direction="row"
      sx={{
        gap: 2,
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Stack>
        <Typography sx={{ fontWeight: 500 }}>{title}</Typography>
        <Typography variant="body2">{subtitle}</Typography>
      </Stack>
      {children}
    </Stack>
  );
};

interface EditProps {
  onClick: () => void;
  children?: ReactElement;
}

export const Edit = ({ onClick, children }: EditProps) => {
  const button = (
    <Button onClick={onClick} variant="contained" sx={{ fontSize: 16 }}>
      {labels.edit}
    </Button>
  );

  if (!children) {
    return button;
  }

  return (
    <Stack
      direction="row"
      sx={{ gap: 2, justifyContent: "center", alignItems: "center" }}
    >
      {children}
      {button}
    </Stack>
  );
};

interface NavigateProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  onClick: () => void;
}

export const Navigate = ({
  title,
  subtitle,
  children,
  onClick,
}: NavigateProps) => {
  let icon = <ArrowForwardIosIcon />;

  if (children) {
    icon = (
      <Stack
        direction="row"
        sx={{ gap: 1, justifyContent: "center", alignItems: "center" }}
      >
        {children}
        <ArrowForwardIosIcon />
      </Stack>
    );
  }

  return (
    <Button
      onClick={onClick}
      color="inherit"
      sx={{ width: "calc(100% + 12px)", transform: "translateX(-6px)" }}
    >
      <Setting title={title} subtitle={subtitle}>
        {icon}
      </Setting>
    </Button>
  );
};

interface CensorProps {
  value: string;
  censoredValue: string;
}

export const Censor = ({ value, censoredValue }: CensorProps) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleClick = () => {
    setIsRevealed((prevState) => !prevState);
  };

  return (
    <Stack
      direction="row"
      sx={{
        gap: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography
        sx={{
          fontWeight: 500,
          overflowWrap: "anywhere",
        }}
      >
        {isRevealed ? value : censoredValue}
      </Typography>
      <Button onClick={handleClick} sx={{ fontSize: 16 }}>
        {isRevealed ? labels.hide : labels.reveal}
      </Button>
    </Stack>
  );
};
