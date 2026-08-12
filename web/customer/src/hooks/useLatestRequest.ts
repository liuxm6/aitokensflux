import { useCallback, useEffect, useRef } from "react";

/**
 * Guards "latest request wins" for loaders that a user can retrigger before the
 * previous one settles, such as paging through a table. Call the returned
 * `beginRequest` before awaiting, then bail out when its `isCurrent` result turns
 * false: either a newer request has started or the view has unmounted.
 */
export function useLatestRequest() {
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback(() => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    return () => mountedRef.current && requestIdRef.current === requestId;
  }, []);
}
