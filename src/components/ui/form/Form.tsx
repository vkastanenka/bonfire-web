import {
  Stack,
  type StackProps,
  InputLabel,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import {
  Controller,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type UseFormReturn,
  useFormContext,
} from "react-hook-form";

interface FormProps<TFieldValues extends FieldValues> extends Omit<
  StackProps,
  "onSubmit"
> {
  methods: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => void | Promise<void>;
}

const FormBase = <TFieldValues extends FieldValues>({
  methods,
  onSubmit,
  spacing = 2.5,
  children,
  ...props
}: FormProps<TFieldValues>) => {
  return (
    <FormProvider {...methods}>
      <Stack
        component="form"
        onSubmit={methods.handleSubmit(onSubmit)}
        spacing={spacing}
        {...props}
      >
        {children}
      </Stack>
    </FormProvider>
  );
};

interface FormTextFieldProps<TFieldValues extends FieldValues> extends Omit<
  TextFieldProps,
  "name"
> {
  name: FieldPath<TFieldValues>;
  label: string;
}

const FormTextField = <TFieldValues extends FieldValues>({
  name,
  label,
  id,
  ...props
}: FormTextFieldProps<TFieldValues>) => {
  // Pull context broadly; structural type checking on the generic name
  // prop will handle field safety inside the JSX tree.
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Stack spacing={1}>
          {label && (
            <InputLabel
              htmlFor={id}
              sx={{ fontWeight: "bold", color: "text.primary" }}
            >
              {label}
            </InputLabel>
          )}
          <TextField
            variant="outlined"
            fullWidth
            {...field}
            {...props}
            id={id}
            error={!!error}
            helperText={error?.message}
          />
        </Stack>
      )}
    />
  );
};

// Clean composition assignment
export const Form = Object.assign(FormBase, { TextField: FormTextField });
