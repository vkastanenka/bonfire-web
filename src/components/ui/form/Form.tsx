import { createContext, useContext } from "react";
import { Stack, type StackProps } from "@mui/material";
import {
  FormProvider,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { FormTextField } from "./FormTextField";
import { FormSubmitButton } from "./FormSubmitButton";

interface FormContextValue {
  disabled?: boolean;
}

const FormContext = createContext<FormContextValue>({});

export const useFormStateContext = () => useContext(FormContext);

interface FormRoot<TFieldValues extends FieldValues> extends Omit<
  StackProps,
  "onSubmit"
> {
  methods: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => void | Promise<void>;
  disabled?: boolean;
}

const FormRoot = <TFieldValues extends FieldValues>({
  children,
  methods,
  onSubmit,
  disabled,
  sx,
  ...props
}: FormRoot<TFieldValues>) => {
  return (
    <FormProvider {...methods}>
      <FormContext.Provider value={{ disabled }}>
        <Stack
          component="form"
          onSubmit={methods.handleSubmit(onSubmit)}
          sx={{ gap: (t) => t.spacingTokens.stack, ...sx }}
          {...props}
        >
          {children}
        </Stack>
      </FormContext.Provider>
    </FormProvider>
  );
};

FormRoot.displayName = "Form.Root";

export const Form = Object.assign(FormRoot, {
  TextField: FormTextField,
  SubmitButton: FormSubmitButton,
});
