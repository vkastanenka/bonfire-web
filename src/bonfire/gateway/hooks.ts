// export function useGateway() {
//   const initializeGateway = useGatewayStore((state) => state.initializeGateway);
//   const terminateGateway = useGatewayStore((state) => state.terminateGateway);
//   const setActivity = useGatewayStore((state) => state.setActivity);

//   useEffect(() => {
//     let isMounted = true;

//     // 1. Kickstart low-level browser interaction listeners
//     activityTracker.start();

//     // 2. Subscribe and stream activity tracker values into Zustand
//     const unsubscribeActivity = activityTracker.subscribe((status) => {
//       if (isMounted) {
//         setActivity(status);
//         // Dispatch instant WS frame if we transition between online and idle
//         gatewayManager.syncPresence();
//       }
//     });

//     // 3. Mount real-time websocket channel
//     if (isMounted) {
//       initializeGateway();
//     }

//     // 4. Tab visibility focus mechanics
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible") {
//         console.log("[Gateway] Tab focused. Synchronizing socket activity...");
//         // Fast recovery path: wake connection up if sleep severed it, then sync presence
//         initializeGateway();
//         gatewayManager.syncPresence();
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     return () => {
//       isMounted = false;
//       unsubscribeActivity();
//       activityTracker.stop();
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//       terminateGateway();
//     };
//   }, [initializeGateway, terminateGateway, setActivity]);
// }
