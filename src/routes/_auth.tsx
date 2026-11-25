import { useEffect } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { queryClient, requireAuth, bonfireSdk } from "@/app";
import {
  bootstrapKeys,
  Layout,
  useAuthGatewayEvents,
  useAuthStore,
  useBroadcaster,
  useChannelStore,
  useGateway,
  usePresenceTracker,
  useUserGatewayEvents,
  useUserStore,
} from "@/features";
import { useRelationStore } from "@/features/relation";

export const authLoader = async () => {
  const data = await queryClient.ensureQueryData({
    queryKey: bootstrapKeys.all,
    queryFn: () => bonfireSdk.bootstrap.bootstrap(),
  });

  if (data) {
    useAuthStore.getState().hydrateAuth({
      me: data.me,
      channelMemberships: data.userChannelMembers,
      sidebarIds: data.sidebarIds,
    });
    useChannelStore.getState().hydrateChannels({
      channels: data.channels,
      channelMemberIds: data.channelMemberIds,
    });
    useRelationStore.getState().hydrateRelations({
      outgoingPendingIds: data.outgoingPendingIds,
      incomingPendingIds: data.incomingPendingIds,
      friendIds: data.friendIds,
      outgoingBlockIds: data.outgoingBlockIds,
    });
    useUserStore.getState().hydrateUsers({
      users: data.peers,
      userPresences: data.peerPresences,
    });
  }

  return data;
};

function AuthLayout() {
  useBroadcaster();
  usePresenceTracker();
  useGateway();
  useUserGatewayEvents();
  useAuthGatewayEvents();

  const me = useAuthStore((state) => state.me);

  useEffect(() => {
    return () => {
      if (!useAuthStore.getState().accessToken) {
        queryClient.clear();
      }
    };
  }, []);

  if (!me) {
    return null;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export const Route = createFileRoute("/_auth")({
  beforeLoad: requireAuth(),
  loader: authLoader,
  pendingComponent: () => <div>Restoring Session...</div>,
  component: AuthLayout,
});
