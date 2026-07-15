import { vi } from "vitest";

type ObserverEntry = {
  callback: ResizeObserverCallback;
  elements: Set<Element>;
};

/**
 * Подменяет global ResizeObserver.
 */
export function installResizeObserverMock() {
  const observers: ObserverEntry[] = [];

  class ResizeObserverMock {
    private readonly entry: ObserverEntry;

    constructor(callback: ResizeObserverCallback) {
      this.entry = { callback, elements: new Set() };
      observers.push(this.entry);
    }

    observe(element: Element) {
      this.entry.elements.add(element);
      this.entry.callback(
        [] as unknown as ResizeObserverEntry[],
        this as unknown as ResizeObserver,
      );
    }

    unobserve(element: Element) {
      this.entry.elements.delete(element);
    }

    disconnect() {
      this.entry.elements.clear();
      const index = observers.indexOf(this.entry);

      if (index !== -1) {
        observers.splice(index, 1);
      }
    }
  }

  vi.stubGlobal("ResizeObserver", ResizeObserverMock);

  const triggerResize = (target?: Element) => {
    for (const observer of observers) {
      if (target !== undefined && !observer.elements.has(target)) continue;

      observer.callback(
        [] as unknown as ResizeObserverEntry[],
        {} as ResizeObserver,
      );
    }
  };

  const restore = () => {
    observers.length = 0;
    vi.unstubAllGlobals();
  };

  return { triggerResize, restore };
}
