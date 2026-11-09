import { AipError } from "@/errs";
import {
  type FieldValues,
  type Path,
  type UseFormReturn,
} from "react-hook-form";

export function handleAipFieldViolations<TFieldValues extends FieldValues>(
  err: unknown,
  methods: UseFormReturn<TFieldValues>,
): boolean {
  if (!(err instanceof AipError)) {
    return false;
  }

  const violations = err.getFieldViolations();
  if (violations.length === 0) {
    return false;
  }

  violations.forEach((violation) => {
    methods.setError(violation.field as Path<TFieldValues>, {
      type: "manual",
      message: violation.description,
    });
  });

  return true;
}
