import { useEffect } from "react";
import { usePresenceStore } from "./store";

export function usePresence() {
  const init = usePresenceStore((state) => state.init);
  const close = usePresenceStore((state) => state.close);

  useEffect(() => {
    init();
    return () => {
      close();
    };
  }, [init, close]);
}
