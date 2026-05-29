import { type Control, Controller, type FieldPath } from "react-hook-form";
import {
  Stack,
  InputLabel,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { type ResetPasswordInputs } from "./reset-password.validation";

interface ResetPasswordTextFieldProps extends Omit<TextFieldProps, "name"> {
  name: FieldPath<ResetPasswordInputs>;
  control: Control<ResetPasswordInputs>;
  label: string;
}

export const ResetPasswordTextField = ({
  name,
  control,
  label,
  id,
  ...props
}: ResetPasswordTextFieldProps) => (
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
