import { BaseService, type ServiceCallOptions } from "../shared";
import {
  relationTransitionResponseSchema,
  type RelationTransitionResponse,
  type SendFriendRequest,
} from "./validation";

const endpoints = {
  sendRequest: `/relations/requests`,
  acceptRequest: (id: string) => `/relations/requests/${id}/accept`,
  blockUser: (id: string) => `/relations/blocks/${id}`,
  deleteRelation: (id: string) => `/relations/${id}`,
} as const;

export class RelationService extends BaseService {
  public sendFriendRequest(
    data: SendFriendRequest,
    options?: ServiceCallOptions,
  ): Promise<RelationTransitionResponse> {
    return this.post({
      ...options,
      url: endpoints.sendRequest,
      schema: relationTransitionResponseSchema,
      data,
    });
  }

  public acceptFriendRequest(
    id: string,
    options?: ServiceCallOptions,
  ): Promise<RelationTransitionResponse> {
    return this.post({
      ...options,
      url: endpoints.acceptRequest(id),
      schema: relationTransitionResponseSchema,
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
