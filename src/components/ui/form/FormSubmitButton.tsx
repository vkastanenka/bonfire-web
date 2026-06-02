import { Button, type ButtonProps } from "@mui/material";
import { useFormContext } from "react-hook-form";

export interface FormSubmitButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const FormSubmitButton = ({
  children,
  variant = "contained",
  disabled,
  ...props
}: FormSubmitButtonProps) => {
  const {
    formState: { isSubmitting, isValidating },
  } = useFormContext();

  const isLoading = isSubmitting || isValidating;

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={disabled || isLoading}
      loading={isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {children}
    </Button>
  );
};

FormSubmitButton.displayName = "Form.SubmitButton";
