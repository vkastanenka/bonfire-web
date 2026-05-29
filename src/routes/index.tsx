import { createFileRoute } from "@tanstack/react-router";
import { Typography } from "@mui/material";

export const HomePage = () => {
  return <Typography>Bonfire</Typography>;
};

export const Route = createFileRoute("/")({
  component: HomePage,
});
