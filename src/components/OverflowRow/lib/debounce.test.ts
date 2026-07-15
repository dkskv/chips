import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("не вызывает функцию сразу", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");

    expect(fn).not.toHaveBeenCalled();
  });

  it("вызывает функцию один раз после wait с последними аргументами", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    debounced("b");
    debounced("c");

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");
  });

  it("сбрасывает интервал wait при каждом вызове", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    vi.advanceTimersByTime(99);
    debounced("b");
    vi.advanceTimersByTime(99);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("b");
  });

  it("пробрасывает несколько аргументов в исходную функцию", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced(1, "two", true);
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith(1, "two", true);
  });

  it("допускает новый вызов после интервала wait", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    vi.advanceTimersByTime(100);
    debounced("b");
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, "a");
    expect(fn).toHaveBeenNthCalledWith(2, "b");
  });

  it("cancel отменяет отложенный вызов", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    debounced.cancel();

    vi.advanceTimersByTime(100);

    expect(fn).not.toHaveBeenCalled();
  });

  it("cancel безопасен, если ничего не отложено", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    expect(() => debounced.cancel()).not.toThrow();
  });

  it("после cancel работает на следующем вызове", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    debounced.cancel();
    debounced("b");
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("b");
  });
});
