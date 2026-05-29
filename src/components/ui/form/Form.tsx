import Stack, { type StackProps } from "@mui/material/Stack";

export const Form = ({ spacing = 2.5, ...props }: StackProps) => {
  return <Stack component="form" spacing={spacing} {...props} />;
};
