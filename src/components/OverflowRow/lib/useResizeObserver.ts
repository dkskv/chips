import { RefObject, useLayoutEffect } from "react";

export function useResizeObserver<T extends HTMLElement>(
  elementRef: RefObject<T | null>,
  callback: () => void,
  /** Вызывать callback при initial notification после observe(). По умолчанию true. */
  fireOnObserve = true,
) {
  useLayoutEffect(() => {
    const element = elementRef.current;

    if (element === null) {
      return;
    }

    let isFirst = true;

    const observer = new ResizeObserver(() => {
      if (isFirst) {
        isFirst = false;

        if (!fireOnObserve) return;
      }

      callback();
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, callback, fireOnObserve]);
}
