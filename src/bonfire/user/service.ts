import { type ClientRequestOptions } from "../http";
import { userClient } from "./client";
import {
  type DisableRequest,
  type Me,
  type UpdateEmailRequest,
  type UpdatePasswordRequest,
  type UpdatePreferredPresenceRequest,
  type UpdateProfileRequest,
  type UpdateUsernameRequest,
} from "./validation";
import { useAuthStore, type AuthState } from "../auth";

export class UserService {
  public async updateEmail(
    req: UpdateEmailRequest,
    options?: ClientRequestOptions<Me>,
  ) {
    return withOptimisticMe(
      (me) => ({ ...me, email: req.newEmail }),
      () => userClient.updateEmail(req, options),
    );
  }

  public async updateUsername(
    req: UpdateUsernameRequest,
    options?: ClientRequestOptions<Me>,
  ) {
    return withOptimisticMe(
      (me) => ({ ...me, username: req.newUsername }),
      () => userClient.updateUsername(req, options),
    );
  }

  public async updatePreferredPresence(
    req: UpdatePreferredPresenceRequest,
    options?: ClientRequestOptions<Me>,
  ) {
    return withOptimisticMe(
      (me) => ({ ...me, preferredPresence: req.presence }),
      () => userClient.updatePreferredPresence(req, options),
    );
  }

  public async updateProfile(
    req: UpdateProfileRequest,
    options?: ClientRequestOptions<Me>,
  ) {
    return withOptimisticMe(
      (me) => ({ ...me, ...req }),
      () => userClient.updateProfile(req, options),
    );
  }

  public async updatePassword(
    req: UpdatePasswordRequest,
    options?: ClientRequestOptions,
  ) {
    await userClient.updatePassword(req, options);
  }

  public disable(
    req: DisableRequest,
    options?: ClientRequestOptions,
  ): Promise<unknown> {
    const promise = userClient.disable(req, options);
    useAuthStore.getState().clearSession();
    return promise;
  }

  public scheduleDelete(
    req: DisableRequest,
    options?: ClientRequestOptions,
  ): Promise<unknown> {
    const promise = userClient.scheduleDelete(req, options);
    useAuthStore.getState().clearSession();
    return promise;
  }
}

export const userService = new UserService();

async function withOptimisticMe(
  optimisticUpdate: (
    currentMe: NonNullable<AuthState["me"]>,
  ) => NonNullable<AuthState["me"]>,
  apiCall: () => Promise<Me>,
): Promise<void> {
  const previousMe = useAuthStore.getState().me;

  if (previousMe) {
    useAuthStore.setState({ me: optimisticUpdate(previousMe) });
  }

  try {
    const data = await apiCall();
    useAuthStore.getState().setMe(data);
  } catch (error) {
    useAuthStore.setState({ me: previousMe });
    throw error;
  }
}
