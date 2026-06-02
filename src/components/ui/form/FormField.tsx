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
  sx,
  ...props
}: FormFieldProps) => {
  return (
    <Stack sx={{ gap: (t) => t.spacingTokens.group, ...sx }} {...props}>
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
