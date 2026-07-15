import { useEffect, useMemo, type DependencyList } from "react";
import { useLatestRef } from "@/lib/useLatestRef";
import { debounce } from "./debounce";

export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  deps: DependencyList,
  wait: number,
): T {
  const callbackRef = useLatestRef(callback);

  const debounced = useMemo(
    () =>
      debounce((...args) => {
        callbackRef.current(...args);
      }, wait),
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
    [wait, ...deps],
  );

  useEffect(() => {
    return () => {
      debounced.cancel();
    };
  }, [debounced]);

  return debounced as unknown as T;
}
