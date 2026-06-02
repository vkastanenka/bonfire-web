import Typography, { type TypographyProps } from "@mui/material/Typography";

const TextHeading = (props: TypographyProps) => {
  return (
    <Typography
      variant="h5"
      component="h1"
      sx={{ fontWeight: "bold" }}
      {...props}
    ></Typography>
  );
};

export const Text = Object.assign(Typography, {
  Heading: TextHeading,
});
