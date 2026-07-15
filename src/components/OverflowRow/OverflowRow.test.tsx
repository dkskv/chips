import { type ReactNode } from "react";
import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RESIZE_DEBOUNCE_MS, testIds } from "./OverflowRow";
import {
  domSelectors,
  installLayoutMock,
  installResizeObserverMock,
  renderOverflowRow,
  type LayoutMock,
  type TestItem,
} from "./test-utils";

// Tooltip даёт собственные commits под Profiler, поэтому
// для подсчёта рендеров OverflowRow оставляем прозрачный trigger без внутренних setState.
vi.mock("../Tooltip", () => ({
  Tooltip: ({ children }: { children: ReactNode }) => children,
}));

describe("OverflowRow", () => {
  let resizeObserverMock: ReturnType<typeof installResizeObserverMock>;
  let layoutMock: LayoutMock;

  beforeEach(() => {
    vi.useFakeTimers();

    resizeObserverMock = installResizeObserverMock();
    layoutMock = installLayoutMock();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();

    layoutMock.restore();
    resizeObserverMock.restore();
  });

  it("при монтировании ровно 2 рендера и нет отложенных", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

    layoutMock.sizes = {
      container: 300,
      overflowButton: 40,
      items: { a: 50, b: 50, c: 50 },
    };

    const { tracker } = renderOverflowRow({ items });

    expect(tracker.getCount()).toBe(2);
    expect(tracker.commits[0]).toBe("mount");
    expect(tracker.commits[1]).toMatch(/update/);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(tracker.getCount()).toBe(2);
  });

  it("при одиночном ресайзе максимум 1 перерендер", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];

    layoutMock.sizes = {
      container: 200,
      overflowButton: 40,
      items: { a: 50, b: 50, c: 50, d: 50 },
    };

    const { tracker } = renderOverflowRow({ items });

    expect(tracker.getCount()).toBe(2);
    expect(domSelectors.getVisibleItemIds()).toEqual([
      "a",
      "b",
      testIds.overflowButton,
    ]);

    tracker.reset();

    layoutMock.sizes = { ...layoutMock.sizes, container: 140 };

    act(() => {
      resizeObserverMock.triggerResize();
    });

    expect(tracker.getCount()).toBe(0);

    act(() => {
      vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS);
    });

    expect(tracker.getCount()).toBe(1);
    expect(domSelectors.getVisibleItemIds()).toEqual([
      "a",
      testIds.overflowButton,
    ]);
  });

  it(`несколько ресайзов за ${RESIZE_DEBOUNCE_MS}ms дают один перерендер`, () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];

    layoutMock.sizes = {
      container: 200,
      overflowButton: 40,
      items: { a: 50, b: 50, c: 50, d: 50 },
    };

    const { tracker } = renderOverflowRow({ items });

    tracker.reset();

    act(() => {
      layoutMock.sizes = { ...layoutMock.sizes, container: 180 };
      resizeObserverMock.triggerResize();
    });

    act(() => {
      vi.advanceTimersByTime(50);
      layoutMock.sizes = { ...layoutMock.sizes, container: 160 };
      resizeObserverMock.triggerResize();
    });

    act(() => {
      vi.advanceTimersByTime(50);
      layoutMock.sizes = { ...layoutMock.sizes, container: 140 };
      resizeObserverMock.triggerResize();
    });

    expect(tracker.getCount()).toBe(0);

    act(() => {
      vi.advanceTimersByTime(RESIZE_DEBOUNCE_MS);
    });

    expect(tracker.getCount()).toBe(1);
    expect(domSelectors.getVisibleItemIds()).toEqual([
      "a",
      testIds.overflowButton,
    ]);
  });

  it("новые items измеряются, старые — нет", () => {
    const a = { id: "a" };
    const b = { id: "b" };
    const c = { id: "c" };

    layoutMock.sizes = {
      container: 300,
      overflowButton: 40,
      items: { a: 50, b: 50, c: 50 },
    };

    const { rerender } = renderOverflowRow({ items: [a, b] });

    expect([...layoutMock.measuredItemIds].sort()).toEqual(["a", "b"]);
    layoutMock.clearMeasuredItemIds();

    rerender({ items: [a, b, c] });

    expect(layoutMock.measuredItemIds).toEqual(["c"]);
    expect(domSelectors.getMeasureLayerItemIds()).toEqual([]);
  });

  it("при смене renderItem все элементы переизмеряются", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

    const renderItemV1 = (item: TestItem) => (
      <span data-testid={item.id}>v1-{item.id}</span>
    );

    const renderItemV2 = (item: TestItem) => (
      <span data-testid={item.id}>v2-{item.id}</span>
    );

    layoutMock.sizes = {
      container: 300,
      overflowButton: 40,
      items: { a: 50, b: 50, c: 50 },
    };

    const { rerender } = renderOverflowRow({
      items,
      renderItem: renderItemV1,
    });

    layoutMock.clearMeasuredItemIds();

    rerender({
      items,
      renderItem: renderItemV2,
    });

    expect([...layoutMock.measuredItemIds].sort()).toEqual(["a", "b", "c"]);
  });

  it("учитывается изменение размера overflowButton при overflow", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];

    const buttonSizeFromDom = (element: HTMLElement) =>
      element.textContent?.includes("WIDE") ? 90 : 30;

    layoutMock.sizes = {
      container: 180,
      overflowButton: buttonSizeFromDom,
      items: { a: 50, b: 50, c: 50, d: 50 },
    };

    const { rerender, tracker } = renderOverflowRow({ items });

    expect(domSelectors.getVisibleItemIds()).toEqual([
      "a",
      "b",
      testIds.overflowButton,
    ]);
    expect(domSelectors.getOverflowButton()).toHaveAttribute(
      "aria-hidden",
      "false",
    );

    tracker.reset();

    rerender({
      items,
      renderOverflowButton: () => <span data-overflow-btn>WIDE</span>,
    });

    expect(domSelectors.getVisibleItemIds()).toEqual([
      "a",
      testIds.overflowButton,
    ]);
    expect(tracker.getCount()).toBeGreaterThanOrEqual(1);
  });

  it("без overflow изменение размера overflowButton не пересчитывает visibleCount", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

    const buttonSizeFromDom = (element: HTMLElement) =>
      element.textContent?.includes("WIDE") ? 90 : 30;

    layoutMock.sizes = {
      container: 180,
      overflowButton: buttonSizeFromDom,
      items: { a: 50, b: 50, c: 50 },
    };

    const { rerender, tracker } = renderOverflowRow({
      items,
      renderOverflowButton: () => <span data-overflow-btn>+0</span>,
    });

    expect(domSelectors.getVisibleItemIds()).toEqual([
      "a",
      "b",
      "c",
      testIds.overflowButton,
    ]);
    expect(domSelectors.getOverflowButton()).toHaveAttribute(
      "aria-hidden",
      "true",
    );

    tracker.reset();

    rerender({
      items,
      renderOverflowButton: () => <span data-overflow-btn>WIDE</span>,
    });

    expect(tracker.getCount()).toBe(1);
    expect(tracker.commits.every((phase) => !phase.includes("nested"))).toBe(
      true,
    );
    expect(domSelectors.getVisibleItemIds()).toEqual([
      "a",
      "b",
      "c",
      testIds.overflowButton,
    ]);
  });

  it("все items помещаются — overflowButton скрыта", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

    layoutMock.sizes = {
      container: 200,
      overflowButton: 40,
      items: { a: 50, b: 50, c: 50 },
    };

    renderOverflowRow({ items });

    expect(domSelectors.getVisibleItemIds()).toEqual([
      "a",
      "b",
      "c",
      testIds.overflowButton,
    ]);
    expect(domSelectors.getOverflowButton()).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("ни один item не помещается — видна только overflowButton", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

    layoutMock.sizes = {
      container: 50,
      overflowButton: 40,
      items: { a: 50, b: 50, c: 50 },
    };

    renderOverflowRow({ items });

    expect(domSelectors.getVisibleItemIds()).toEqual([testIds.overflowButton]);
    expect(domSelectors.getOverflowButton()).toHaveAttribute(
      "aria-hidden",
      "false",
    );
    expect(domSelectors.getOverflowButton()).toHaveTextContent("+3");
  });

  it("замена identity item переизмеряет только его", () => {
    const a = { id: "a" };
    const b = { id: "b" };
    const c = { id: "c" };
    const b2 = { id: "b" };

    layoutMock.sizes = {
      container: 300,
      overflowButton: 40,
      items: { a: 50, b: 50, c: 50 },
    };

    const { rerender } = renderOverflowRow({ items: [a, b, c] });

    layoutMock.clearMeasuredItemIds();

    rerender({ items: [a, b2, c] });

    expect(layoutMock.measuredItemIds).toEqual(["b"]);
  });
});
