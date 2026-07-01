import { useEffect, useRef } from "react";

export function useRealtimeRefresh(target, refreshCallback) {
  const callbackRef = useRef(refreshCallback);

  // Keep the ref updated with the latest callback reference to avoid closure issues
  useEffect(() => {
    callbackRef.current = refreshCallback;
  }, [refreshCallback]);

  useEffect(() => {
    if (!target) return;

    const handleRefresh = (event) => {
      if (event.detail && event.detail.target === target) {
        if (callbackRef.current) {
          callbackRef.current();
        }
      }
    };

    window.addEventListener("realtime-refresh", handleRefresh);
    return () => {
      window.removeEventListener("realtime-refresh", handleRefresh);
    };
  }, [target]);
}
