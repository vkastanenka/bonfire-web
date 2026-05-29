import { type Control, Controller, type FieldPath } from "react-hook-form";
import {
  Stack,
  InputLabel,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { type LoginInputs } from "./login.validation";

interface LoginTextFieldProps extends Omit<TextFieldProps, "name"> {
  name: FieldPath<LoginInputs>;
  control: Control<LoginInputs>;
  label: string;
}

export const LoginTextField = ({
  name,
  control,
  label,
  id,
  ...props
}: LoginTextFieldProps) => (
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
