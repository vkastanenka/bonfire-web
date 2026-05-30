import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  Stack,
  InputLabel,
  TextField,
  type TextFieldProps,
} from "@mui/material";

interface TextInputProps<TFieldValues extends FieldValues> extends Omit<
  TextFieldProps,
  "name"
> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
}

export const TextInput = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  id,
  ...props
}: TextInputProps<TFieldValues>) => (
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
