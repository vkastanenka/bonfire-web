import { useEffect } from "react";
import { useGatewayStore } from "../core/store";

export function useAppInitializer() {
  const initializeGateway = useGatewayStore((state) => state.initializeGateway);
  const terminateGateway = useGatewayStore((state) => state.terminateGateway);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapLayoutData() {
      try {
        // Step 1: Execute static REST calls safely here (e.g., fetch user settings, channels)
        // await useChannelStore.getState().fetchMeChannels();

        // Step 2: Establish the stateful network pipe once structural models exist in memory
        if (isMounted) {
          initializeGateway("online");
        }
      } catch (err) {
        console.error(
          "[App Switchboard] Resource mapping halted root state resolution:",
          err,
        );
      }
    }

    bootstrapLayoutData();

    return () => {
      isMounted = false;
      terminateGateway();
    };
  }, [initializeGateway, terminateGateway]);
}
