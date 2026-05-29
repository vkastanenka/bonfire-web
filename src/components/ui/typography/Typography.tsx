import MuiTypography, { type TypographyProps } from "@mui/material/Typography";

const TypographyHeading = (props: TypographyProps) => {
  return (
    <Typography
      variant="h5"
      component="h1"
      sx={{ fontWeight: "bold" }}
      {...props}
    ></Typography>
  );
};

export const Typography = Object.assign(MuiTypography, {
  Heading: TypographyHeading,
});
