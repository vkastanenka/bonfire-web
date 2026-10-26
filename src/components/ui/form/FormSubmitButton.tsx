import { Button, type ButtonProps } from "@mui/material";
import { useFormContext } from "react-hook-form";
import { useFormStateContext } from "./Form";

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
  const { disabled: formDisabled } = useFormStateContext();

  const isLoading = isSubmitting || isValidating;
  const isDisabled = disabled ?? formDisabled;

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={isDisabled || isLoading}
      loading={isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {children}
    </Button>
  );
};
FormSubmitButton.displayName = "Form.SubmitButton";
