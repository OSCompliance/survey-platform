import { useEffect, useRef } from 'react';

/**
 * Re-runs `callback` on an interval while the tab is visible, and immediately
 * on mount / whenever a dependency changes. This is the "real-time" mechanism
 * for the analytics dashboard: a cheap poll against a server-side cached
 * aggregate (see apps/api/src/routes/analytics.ts) rather than a WebSocket.
 * See README "Real-time behavior" for when to upgrade this to push-based
 * updates instead.
 */
export function usePolling(callback: () => void, intervalMs: number, deps: React.DependencyList = []) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    callbackRef.current();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') callbackRef.current();
    }, intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
