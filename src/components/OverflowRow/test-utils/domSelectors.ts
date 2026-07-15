import { screen } from "@testing-library/react";
import { testIds } from "../OverflowRow";

const getItemIdsIn = (listContainer: HTMLElement): string[] =>
  [...listContainer.querySelectorAll("[data-testid]")].map(
    (element) => element.getAttribute("data-testid")!,
  );

export const domSelectors = {
  getItemIdFromLi: (element: HTMLLIElement): string =>
    element.children[0].getAttribute("data-testid")!,

  getOverflowButton: () => screen.getByTestId(testIds.overflowButton),

  getVisibleItemIds: () => getItemIdsIn(screen.getByTestId(testIds.visibleRow)),

  getMeasureLayerItemIds: () => {
    const measureLayer = screen.queryByTestId(testIds.itemsMeasureLayer);

    return measureLayer === null ? [] : getItemIdsIn(measureLayer);
  },
};
