import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UpdateProfileRequest,
  updateProfileRequestSchema,
  useMe,
  useUpdateProfile,
} from "@/bonfire";
import { handleAipFieldViolations } from "@/errs";

export const useEditProfileForm = ({
  handleClose,
}: {
  handleClose: () => void;
}) => {
  const me = useMe();

  const defaultValues = {
    displayName: me.displayName,
    bio: me.bio,
    avatarUrl: me.avatarUrl,
    bannerColor: me.bannerColor,
  };

  const methods = useForm<UpdateProfileRequest>({
    resolver: zodResolver(updateProfileRequestSchema),
    defaultValues,
  });

  const watchedBannerColor = useWatch({
    control: methods.control,
    name: "bannerColor",
  });

  const handleBannerColorChange = (newColor: string) => {
    methods.setValue("bannerColor", newColor, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const resetForm = () => {
    methods.reset(defaultValues);
  };

  const { mutate, isPending } = useUpdateProfile();

  const onSubmit = (data: UpdateProfileRequest) => {
    mutate(data, {
      onSuccess: handleClose,
      onError: (err) => {
        handleAipFieldViolations(err, methods);
      },
    });
  };

  return {
    methods,
    onSubmit,
    isPending,
    watchedBannerColor,
    handleBannerColorChange,
    resetForm,
  };
};
