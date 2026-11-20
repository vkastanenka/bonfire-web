import { BaseService, type ServiceCallOptions } from "../shared";
import {
  friendAddedResponseSchema,
  type FriendAddedResponse,
} from "./validation";

const endpoints = {
  sendRequest: (id: string) => `/relations/requests/${id}`,
  acceptRequest: (id: string) => `/relations/requests/${id}/accept`,
  blockUser: (id: string) => `/relations/blocks/${id}`,
  deleteRelation: (id: string) => `/relations/${id}`,
} as const;

export class RelationService extends BaseService {
  public sendFriendRequest(
    id: string,
    options?: ServiceCallOptions,
  ): Promise<FriendAddedResponse | null> {
    return this.post({
      ...options,
      url: endpoints.sendRequest(id),
      schema: friendAddedResponseSchema.nullable(),
    });
  }

  public acceptFriendRequest(
    id: string,
    options?: ServiceCallOptions,
  ): Promise<FriendAddedResponse> {
    return this.post({
      ...options,
      url: endpoints.acceptRequest(id),
      schema: friendAddedResponseSchema,
    });
  }

  public blockUser(id: string, options?: ServiceCallOptions): Promise<void> {
    return this.post({
      ...options,
      url: endpoints.blockUser(id),
    });
  }

  public deleteRelation(
    id: string,
    options?: ServiceCallOptions,
  ): Promise<void> {
    return this.delete({
      ...options,
      url: endpoints.deleteRelation(id),
    });
  }
}
