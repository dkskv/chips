import { testIds } from "../OverflowRow";
import { domSelectors } from "./domSelectors";
import { installOffsetWidthMock } from "./offsetWidthMock";

export type SizeConfig = {
  container: number;
  overflowButton: number | ((element: HTMLElement) => number);
  items: Record<string, number>;
};

export function installLayoutMock() {
  /** История измерения `items` в виде последовательности id */
  const measuredItemIds: string[] = [];

  let sizes: SizeConfig;

  const { restore } = installOffsetWidthMock((element) => {
    const testId = element.getAttribute("data-testid");

    if (testId === testIds.overflowButton) {
      const { overflowButton } = sizes;

      return typeof overflowButton === "function"
        ? overflowButton(element)
        : overflowButton;
    }

    if (testId === testIds.visibleRow) {
      return sizes.container;
    }

    if (element instanceof HTMLLIElement) {
      const id = domSelectors.getItemIdFromLi(element);

      const itemsMeasureLayer = element.closest(
        `[data-testid="${testIds.itemsMeasureLayer}"]`,
      );

      if (itemsMeasureLayer !== null) {
        measuredItemIds.push(id);
      }

      return sizes.items[id] ?? 0;
    }

    return 0;
  });

  return {
    restore,
    measuredItemIds,
    clearMeasuredItemIds: () => {
      measuredItemIds.length = 0;
    },
    get sizes() {
      return sizes;
    },
    set sizes(next: SizeConfig) {
      sizes = next;
    },
  };
}

export type LayoutMock = ReturnType<typeof installLayoutMock>;
