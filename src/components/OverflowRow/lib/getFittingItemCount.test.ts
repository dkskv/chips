import { describe, expect, it } from "vitest";
import { getFittingItemCount } from "./getFittingItemCount";

describe("getFittingItemCount", () => {
  const getSize = (item: number) => item;

  const options = {
    gap: 8,
    overflowIndicatorSize: 24,
  };

  it("возвращает 0 для пустого массива", () => {
    expect(getFittingItemCount([], 100, getSize, options)).toBe(0);
  });

  it("возвращает число всех items, когда они помещаются", () => {
    expect(getFittingItemCount([20, 30, 40], 106, getSize, options)).toBe(3);
  });

  it("возвращает 0, если первый item не помещается вместе с overflow-индикатором", () => {
    expect(getFittingItemCount([50, 50], 81, getSize, options)).toBe(0);
  });

  it("резервирует место под overflow-индикатор", () => {
    expect(getFittingItemCount([20, 30], 51, getSize, options)).toBe(0);

    expect(getFittingItemCount([20, 30], 52, getSize, options)).toBe(1);
  });

  it("учитывает gaps между видимыми items", () => {
    expect(getFittingItemCount([20, 30, 40], 89, getSize, options)).toBe(1);

    expect(getFittingItemCount([20, 30, 40], 90, getSize, options)).toBe(2);
  });

  it("не резервирует место под overflow, когда все items помещаются", () => {
    expect(getFittingItemCount([20, 30], 58, getSize, options)).toBe(2);
  });

  it("позволяет последнему item занять оставшееся место без overflow-индикатора", () => {
    expect(getFittingItemCount([20, 30], 58, getSize, options)).toBe(2);
  });

  it("работает с объектами и кастомным size getter", () => {
    const items = [{ width: 20 }, { width: 30 }, { width: 40 }];

    expect(getFittingItemCount(items, 90, (item) => item.width, options)).toBe(
      2,
    );
  });

  it("возвращает все items, когда контейнер достаточно большой", () => {
    expect(getFittingItemCount([10, 20, 30, 40], 124, getSize, options)).toBe(
      4,
    );
  });
});
