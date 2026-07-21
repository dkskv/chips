import {
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useResizeObserver } from "./lib/useResizeObserver";
import { getFittingItemCount } from "./lib/getFittingItemCount";
import { Tooltip } from "../Tooltip";
import styles from "./OverflowRow.module.css";
import { useChangedSinceRender } from "./lib/useChangedSinceRender";
import { useItemsMeasurements } from "./lib/useItemsMeasurements";
import { useDebouncedCallback } from "./lib/useDebouncedCallback";

type OverflowRowProps<T> = {
  /** Элементы строки */
  items: T[];
  /** Стабильный ключ элемента */
  getKey: (item: T) => string;
  /**
   * Рендер элемента строки.
   * Должен быть стабильным (useCallback / вынесен из рендера):
   * при смене ссылки сбрасывается кэш размеров и элементы измеряются заново.
   */
  renderItem: (item: T) => ReactNode;
  /**
   * Рендер кнопки переполнения
   * Получает скрытые элементы (например, для отображения счетчика)
   */
  renderOverflowButton: (hiddenItems: T[]) => ReactNode;
};

const GAP = 8;
const rowStyle = { "--row-gap": `${GAP}px` } as CSSProperties;

/** Debounce ожидания ResizeObserver перед пересчётом visibleCount */
export const RESIZE_DEBOUNCE_MS = 250;

export const testIds = {
  visibleRow: "visible-row",
  itemsMeasureLayer: "items-measure-layer",
  overflowButton: "overflow-button",
} as const;

function getSize(element: HTMLElement): number {
  return element.offsetWidth;
}

function OverflowRowComponent<T extends WeakKey>({
  items,
  getKey,
  renderItem,
  renderOverflowButton,
}: OverflowRowProps<T>) {
  const visibleUlRef = useRef<HTMLUListElement>(null);
  const overflowButtonLiRef = useRef<HTMLLIElement>(null);

  const [visibleCount, setVisibleCount] = useState(0);

  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);

  const isOverflow = visibleCount < items.length;

  const { unmeasuredItems, setItemSize, getItemSizeStrict } =
    useItemsMeasurements(items, [renderItem]);

  const actualizeVisibleCount = useCallback(() => {
    const container = visibleUlRef.current;
    const overflowButtonLi = overflowButtonLiRef.current;

    if (container === null || overflowButtonLi === null)
      throw new Error("no refs to elements set");

    const nextVisibleCount = getFittingItemCount(
      items,
      getSize(container),
      getItemSizeStrict,
      { gap: GAP, overflowIndicatorSize: getSize(overflowButtonLi) },
    );

    setVisibleCount(nextVisibleCount);
  }, [items, getItemSizeStrict]);

  const isOverflowButtonSizeChanged = useChangedSinceRender(() => {
    const element = overflowButtonLiRef.current;

    return element === null ? undefined : getSize(element);
  });

  useLayoutEffect(() => {
    if (
      unmeasuredItems.length > 0 ||
      (isOverflow && isOverflowButtonSizeChanged())
    ) {
      actualizeVisibleCount();
    }
  });

  const handleResize = useDebouncedCallback(
    actualizeVisibleCount,
    [actualizeVisibleCount],
    RESIZE_DEBOUNCE_MS,
  );

  useResizeObserver(visibleUlRef, handleResize, false);

  /** Невидимый слой для измерения новых элементов. Удаляется после измерения */
  const renderItemsMeasureLayer = () => {
    if (unmeasuredItems.length === 0) return null;

    return (
      <ul
        className={`${styles.row} ${styles.measureLayer}`}
        style={rowStyle}
        data-testid={testIds.itemsMeasureLayer}
        aria-hidden
      >
        {unmeasuredItems.map((item) => {
          const ref = (element: HTMLLIElement | null) => {
            if (element !== null) setItemSize(item, getSize(element));
          };

          return (
            <li key={getKey(item)} ref={ref} className={styles.item}>
              {renderItem(item)}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderTooltipOverlay = () => (
    <ul className={styles.overlay}>
      {hiddenItems.map((item) => (
        <li key={getKey(item)} className={styles.item}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {renderItemsMeasureLayer()}
      <ul
        ref={visibleUlRef}
        className={`${styles.row}`}
        style={rowStyle}
        data-testid={testIds.visibleRow}
      >
        {visibleItems.map((item) => (
          <li key={getKey(item)} className={styles.item}>
            {renderItem(item)}
          </li>
        ))}
        <Tooltip
          trigger="click"
          placement="bottomRight"
          showArrow={false}
          overlay={renderTooltipOverlay}
          visible={isOverflow ? undefined : false}
          // REVIEWER: Не вижу необходимости в мемоизации здесь, но готов придерживаться командного подхода
          classNames={{ body: styles.tooltipBody }}
          align={{ dynamicInset: true }}
        >
          <li
            ref={overflowButtonLiRef}
            data-testid={testIds.overflowButton}
            aria-hidden={!isOverflow}
            aria-label="More"
            className={isOverflow ? undefined : styles.measureLayer}
          >
            {renderOverflowButton(hiddenItems)}
          </li>
        </Tooltip>
      </ul>
    </>
  );
}

export const OverflowRow = memo(
  OverflowRowComponent,
) as typeof OverflowRowComponent;
