import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedCallback } from "./useDebouncedCallback";

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("не вызывает pending callback при смене deps", () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ deps }) => useDebouncedCallback(callback, deps, 100),
      { initialProps: { deps: [1] } },
    );

    act(() => {
      result.current();
    });

    rerender({ deps: [2] });
    vi.advanceTimersByTime(100);

    expect(callback).not.toHaveBeenCalled();
  });

  it("не вызывает pending callback при смене wait", () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ wait }) => useDebouncedCallback(callback, [], wait),
      { initialProps: { wait: 100 } },
    );

    act(() => {
      result.current();
    });

    rerender({ wait: 200 });
    vi.advanceTimersByTime(200);

    expect(callback).not.toHaveBeenCalled();
  });
});
