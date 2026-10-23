// import { queryClient } from "@/main";
import { gatewayDispatcher } from "../gateway";
// import { authService } from "./service";

interface RevokeSessionPayload {
  UserID: string;
  RevokeSessionID: string;
}

// Register handler for a single session being revoked
gatewayDispatcher.register<RevokeSessionPayload>("auth.session_revoked", () => {
  //   (payload) => {
  //   const currentSessionId = /* fetch current session id if stored locally, or check if it matches */;
  //   // If the current session was revoked, clear session & redirect/logout
  //   // Or check against payload.RevokeSessionID
  //   authService.logout().catch(() => {
  //     // Fallback clear if request fails
  //     queryClient.clear();
  //   });
});

// Register handler for all sessions being revoked (e.g., password reset or security lock)
gatewayDispatcher.register("auth.session_revoked_all", () => {
  //   queryClient.clear();
  //   authService.logout().catch(() => {});
});
