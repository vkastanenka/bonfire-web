import { InputLabel, Stack, type StackProps } from "@mui/material";

interface FormFieldProps extends StackProps {
  children: React.ReactNode;
  error: boolean;
  htmlFor: string;
  label: string;
}

export const FormField = ({
  children,
  htmlFor,
  label,
  error,
  spacing = 1,
  ...props
}: FormFieldProps) => {
  return (
    <Stack spacing={spacing} {...props}>
      {label && (
        <InputLabel
          htmlFor={htmlFor}
          sx={{ fontWeight: "bold", color: "text.primary" }}
          error={error}
        >
          {label}
        </InputLabel>
      )}
      {children}
    </Stack>
  );
};
