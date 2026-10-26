import { TextField, type TextFieldProps } from "@mui/material";
import {
  Controller,
  type FieldPath,
  type FieldValues,
  useFormContext,
} from "react-hook-form";
import { FormField } from "./FormField";
import { useFormStateContext } from "./Form";

interface FormTextFieldProps<TFieldValues extends FieldValues> extends Omit<
  TextFieldProps,
  "name"
> {
  name: FieldPath<TFieldValues>;
  id: string;
  label: string;
}

export const FormTextField = <TFieldValues extends FieldValues>({
  name,
  id,
  label,
  helperText,
  required,
  disabled,
  ...props
}: FormTextFieldProps<TFieldValues>) => {
  const { control } = useFormContext();
  const { disabled: formDisabled } = useFormStateContext();

  const isDisabled = disabled ?? formDisabled;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormField
          htmlFor={id}
          label={label}
          error={!!error}
          required={required}
        >
          <TextField
            variant="outlined"
            fullWidth
            {...field}
            {...props}
            id={id}
            error={!!error}
            helperText={error ? error.message : helperText}
            required={required}
            disabled={isDisabled}
          />
        </FormField>
      )}
    />
  );
};

FormTextField.displayName = "Form.TextField";
