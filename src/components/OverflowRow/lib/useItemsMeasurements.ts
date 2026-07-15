import { useCallback, useMemo, type DependencyList } from "react";

/**
 * Кэш измеренных размеров элементов по их identity.
 *
 * WeakMap инвалидируется при изменении `cacheDeps`, поэтому все элементы
 * после этого считаются неизмеренными и должны быть измерены заново.
 *
 * @note `T extends WeakKey` позволяет использовать WeakMap и не требует
 * ручной очистки устаревших элементов. Для примитивов потребовался бы
 * Map, очистку которого от устаревших ключей тривиально реализовать в useEffect.
 */
export function useItemsMeasurements<T extends WeakKey>(
  items: T[],
  cacheDeps: DependencyList,
) {
  const itemSizes = useMemo(
    () => new WeakMap<T, number>(),
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
    cacheDeps,
  );

  const unmeasuredItems = items.filter((item) => !itemSizes.has(item));

  const setItemSize = useCallback(
    (item: T, size: number) => {
      itemSizes.set(item, size);
    },
    [itemSizes],
  );

  const getItemSizeStrict = useCallback(
    (item: T) => {
      const size = itemSizes.get(item);

      if (size === undefined) {
        throw new Error("the item was not measured");
      }

      return size;
    },
    [itemSizes],
  );

  return { unmeasuredItems, setItemSize, getItemSizeStrict };
}
