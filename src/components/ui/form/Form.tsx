import { Stack, type StackProps } from "@mui/material";
import {
  FormProvider,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { FormTextField } from "./FormTextField";
import { FormSubmitButton } from "./FormSubmitButton";

interface FormRoot<TFieldValues extends FieldValues> extends Omit<
  StackProps,
  "onSubmit"
> {
  methods: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => void | Promise<void>;
}

const FormRoot = <TFieldValues extends FieldValues>({
  children,
  methods,
  onSubmit,
  spacing = 2.5,
  ...props
}: FormRoot<TFieldValues>) => {
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

FormRoot.displayName = "Form.Root";

export const Form = Object.assign(FormRoot, {
  TextField: FormTextField,
  SubmitButton: FormSubmitButton,
});
