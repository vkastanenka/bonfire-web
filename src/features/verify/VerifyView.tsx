import { Link as RouterLink } from "@tanstack/react-router";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import SvgIcon from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";
import BfLogotype from "@/assets/icons/bf-logotype.svg?react";
import { LABELS } from "./verify.constants";

export const VerifyView = () => {
  return (
    <Stack spacing={2.5}>
      <SvgIcon
        component={BfLogotype}
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
        {LABELS.title}
      </Typography>
      <Alert severity="success">{LABELS.success}</Alert>
      <Button variant="contained" component={RouterLink} to="/login">
        {LABELS.login}
      </Button>
    </Stack>
  );
};
