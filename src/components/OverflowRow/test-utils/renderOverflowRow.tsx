import { Profiler, type ReactNode } from "react";
import { render } from "@testing-library/react";
import { OverflowRow } from "../OverflowRow";
import { createCommitTracker } from "./createCommitTracker";

export type TestItem = { id: string };

export type RenderOverflowRowOptions = {
  items: TestItem[];
  renderItem?: (item: TestItem) => ReactNode;
  renderOverflowButton?: (hiddenItems: TestItem[]) => ReactNode;
};

export const defaultProps = {
  getKey: (item: TestItem) => item.id,
  renderItem: (item: TestItem) => <span data-testid={item.id}>{item.id}</span>,
  renderOverflowButton: (hiddenItems: TestItem[]) => (
    <span data-overflow-btn>+{hiddenItems.length}</span>
  ),
};

/**
 * Рендер OverflowRow под Profiler.
 */
export function renderOverflowRow({
  items,
  renderItem = defaultProps.renderItem,
  renderOverflowButton = defaultProps.renderOverflowButton,
}: RenderOverflowRowOptions) {
  const tracker = createCommitTracker();

  const view = render(
    <Profiler id="OverflowRow" onRender={tracker.onRender}>
      <OverflowRow
        items={items}
        getKey={defaultProps.getKey}
        renderItem={renderItem}
        renderOverflowButton={renderOverflowButton}
      />
    </Profiler>,
  );

  const rerender = ({
    items: nextItems,
    renderItem: nextRenderItem = renderItem,
    renderOverflowButton: nextRenderOverflowButton = renderOverflowButton,
  }: RenderOverflowRowOptions) => {
    view.rerender(
      <Profiler id="OverflowRow" onRender={tracker.onRender}>
        <OverflowRow
          items={nextItems}
          getKey={defaultProps.getKey}
          renderItem={nextRenderItem}
          renderOverflowButton={nextRenderOverflowButton}
        />
      </Profiler>,
    );
  };

  return { ...view, tracker, rerender };
}
