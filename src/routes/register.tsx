import { createFileRoute } from "@tanstack/react-router";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

const RegisterPage = () => {
  return (
    <Stack
      sx={{
        alignItems: "center",
      }}
    >
      <Typography variant="h5" component="h1" sx={{ fontWeight: "700" }}>
        Create an account
      </Typography>
    </Stack>
  );
};

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});
