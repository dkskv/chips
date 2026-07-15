import { useRef, type RefObject } from "react";

/**
 * Возвращает ref, синхронизированный с последним значением.
 */
export function useLatestRef<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  // eslint-disable-next-line react-hooks/refs
  ref.current = value;

  return ref;
}
