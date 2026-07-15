import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useItemsMeasurements } from "./useItemsMeasurements";

type Item = { id: string };

const a: Item = { id: "a" };
const b: Item = { id: "b" };
const c: Item = { id: "c" };

describe("useItemsMeasurements", () => {
  it("изначально все items считаются неизмеренными", () => {
    const { result } = renderHook(() =>
      useItemsMeasurements<Item>([a, b], [null]),
    );

    expect(result.current.unmeasuredItems).toEqual([a, b]);
  });

  it("после setItemSize item исчезает из unmeasuredItems", () => {
    const { result, rerender } = renderHook(
      ({ items }) => useItemsMeasurements<Item>(items, [null]),
      { initialProps: { items: [a, b] } },
    );

    act(() => {
      result.current.setItemSize(a, 42);
    });

    rerender({ items: [a, b] });

    expect(result.current.unmeasuredItems).toEqual([b]);
    expect(result.current.getItemSizeStrict(a)).toBe(42);
  });

  it("при добавлении item неизмеренным остаётся только новый", () => {
    const { result, rerender } = renderHook(
      ({ items }) => useItemsMeasurements<Item>(items, [null]),
      { initialProps: { items: [a, b] } },
    );

    act(() => {
      result.current.setItemSize(a, 10);
      result.current.setItemSize(b, 20);
    });

    rerender({ items: [a, b, c] });

    expect(result.current.unmeasuredItems).toEqual([c]);
  });

  it("при смене cacheDeps кэш сбрасывается и все items снова неизмерены", () => {
    const { result, rerender } = renderHook(
      ({ items, dep }) => useItemsMeasurements<Item>(items, [dep]),
      { initialProps: { items: [a, b], dep: "v1" } },
    );

    act(() => {
      result.current.setItemSize(a, 10);
      result.current.setItemSize(b, 20);
    });

    rerender({ items: [a, b], dep: "v1" });
    expect(result.current.unmeasuredItems).toEqual([]);

    rerender({ items: [a, b], dep: "v2" });
    expect(result.current.unmeasuredItems).toEqual([a, b]);
  });

  it("getItemSizeStrict бросает ошибку", () => {
    const { result } = renderHook(() =>
      useItemsMeasurements<Item>([a], [null]),
    );

    expect(() => result.current.getItemSizeStrict(a)).toThrow();
  });
});
