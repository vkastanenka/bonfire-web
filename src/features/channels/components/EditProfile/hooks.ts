import { z } from "@/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  displayNameSchema,
  bioSchema,
  avatarUrlSchema,
  bannerColorSchema,
  type UpdateProfileRequest,
  updateProfileRequestSchema,
  useUpdateProfile,
} from "@/bonfire";
import { handleAipFieldViolations } from "@/errs";

// 1. Form Schema validates rules (URLs, lengths, etc.) but accepts empty strings for MUI
export const editProfileFormSchema = z.object({
  displayName: displayNameSchema,
  bio: bioSchema.optional().or(z.literal("")),
  avatarUrl: avatarUrlSchema.optional().or(z.literal("")),
  bannerColor: bannerColorSchema.optional().or(z.literal("")),
});

export type EditProfileFormValues = z.infer<typeof editProfileFormSchema>;

export const useEditProfileForm = ({
  displayName,
  bio,
  avatarUrl,
  bannerColor,
}: UpdateProfileRequest) => {
  const methods = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileFormSchema),
    defaultValues: {
      displayName: displayName,
      bio: bio ?? "",
      avatarUrl: avatarUrl ?? "",
      bannerColor: bannerColor ?? "",
    },
  });

  const { mutate, isPending } = useUpdateProfile();

  const onSubmit = (data: EditProfileFormValues) => {
    // 2. Transform form values into the request payload (empty strings -> undefined)
    const rawPayload = {
      displayName: data.displayName,
      bio: data.bio === "" ? undefined : data.bio,
      avatarUrl: data.avatarUrl === "" ? undefined : data.avatarUrl,
      bannerColor: data.bannerColor === "" ? undefined : data.bannerColor,
    };

    // 3. Validate against the backend request schema
    const validationResult = updateProfileRequestSchema.safeParse(rawPayload);

    if (!validationResult.success) {
      // Use .issues instead of .errors
      validationResult.error.issues.forEach((err) => {
        const fieldName = err.path[0] as keyof EditProfileFormValues;
        if (fieldName) {
          methods.setError(fieldName, {
            type: "server",
            message: err.message,
          });
        }
      });
      return;
    }

    // 5. Submit the cleanly validated request payload
    mutate(validationResult.data, {
      onError: (err) => {
        handleAipFieldViolations(err, methods);
      },
    });
  };

  return {
    methods,
    onSubmit,
    isPending,
  };
};
