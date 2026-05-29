import { Link as RouterLink } from "@tanstack/react-router";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import SvgIcon from "@mui/material/SvgIcon";
import RawBfLogotype from "@/assets/icons/bonfire/logotype.svg?react";

export const HomePage = () => {
  return (
    <Stack spacing={2.5}>
      <SvgIcon
        component={RawBfLogotype}
        inheritViewBox
        sx={{
          fontSize: "inherit",
          height: "40px",
          width: "auto",
        }}
      />
      <Typography
        variant="h5"
        component="h1"
        sx={{ fontWeight: "bold", textAlign: "center" }}
      >
        Bonfire
      </Typography>
      <Link component={RouterLink} to="/login" variant="body2">
        Login
      </Link>
      <Link component={RouterLink} to="/register" variant="body2">
        Register
      </Link>
    </Stack>
  );
};
