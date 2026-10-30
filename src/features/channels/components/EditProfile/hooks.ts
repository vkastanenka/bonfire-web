import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UpdateProfileRequest,
  updateProfileRequestSchema,
  useUpdateProfile,
} from "@/bonfire";
import { handleAipFieldViolations } from "@/errs";

export const useEditProfileForm = ({
  displayName,
  bio,
  avatarUrl,
  bannerColor,
}: UpdateProfileRequest) => {
  const methods = useForm<UpdateProfileRequest>({
    resolver: zodResolver(updateProfileRequestSchema),
    defaultValues: {
      displayName: displayName,
      bio: bio ?? "",
      avatarUrl: avatarUrl ?? "",
      bannerColor: bannerColor ?? "",
    },
  });

  const { mutate, isPending } = useUpdateProfile();

  const onSubmit = (data: UpdateProfileRequest) => {
    mutate(data, {
      //   onSuccess: () => {
      //     navigate({ to: "/channels/@me" });
      //   },
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
