import { InputLabel, Stack, type StackProps } from "@mui/material";

interface FormFieldProps extends StackProps {
  children: React.ReactNode;
  error: boolean;
  htmlFor: string;
  label: string;
  required?: boolean;
}

export const FormField = ({
  children,
  htmlFor,
  label,
  error,
  required,
  sx,
  ...props
}: FormFieldProps) => {
  return (
    <Stack sx={{ gap: (t) => t.spacingTokens.group, ...sx }} {...props}>
      {label && (
        <InputLabel
          htmlFor={htmlFor}
          required={required}
          error={error}
          sx={{ fontWeight: "bold", color: "text.primary" }}
        >
          {label}
        </InputLabel>
      )}
      {children}
    </Stack>
  );
};
