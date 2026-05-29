import { type Control, Controller, type FieldPath } from "react-hook-form";
import {
  Stack,
  InputLabel,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { type RegisterInputs } from "./register.validation";

interface RegisterTextFieldProps extends Omit<TextFieldProps, "name"> {
  name: FieldPath<RegisterInputs>;
  control: Control<RegisterInputs>;
  label: string;
}

export const RegisterTextField = ({
  name,
  control,
  label,
  id,
  ...props
}: RegisterTextFieldProps) => (
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
