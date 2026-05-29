import { type Control, Controller, type FieldPath } from "react-hook-form";
import {
  Stack,
  InputLabel,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { type ForgotPasswordInputs } from "./forgot-password.validation";

interface ForgotPasswordTextFieldProps extends Omit<TextFieldProps, "name"> {
  name: FieldPath<ForgotPasswordInputs>;
  control: Control<ForgotPasswordInputs>;
  label: string;
}

export const ForgotPasswordTextField = ({
  name,
  control,
  label,
  id,
  ...props
}: ForgotPasswordTextFieldProps) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState: { error } }) => (
      <Stack spacing={1}>
        <InputLabel
          htmlFor={id}
          sx={{ fontWeight: "bold", color: "text.primary" }}
        >
          {label}
        </InputLabel>
        <TextField
          {...field}
          {...props}
          id={id}
          error={!!error}
          helperText={error?.message}
          variant="outlined"
          fullWidth
        />
      </Stack>
    )}
  />
);
