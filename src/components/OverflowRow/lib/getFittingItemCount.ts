interface GetFittingItemCountOptions {
  gap: number;
  overflowIndicatorSize: number;
}

export function getFittingItemCount<T>(
  items: T[],
  containerSize: number,
  getItemSize: (item: T) => number,
  { gap, overflowIndicatorSize }: GetFittingItemCountOptions,
): number {
  let usedSize = 0;

  for (let index = 0; index < items.length; index++) {
    const itemSize = getItemSize(items[index]);
    const gapBeforeItem = index > 0 ? gap : 0;

    const nextSize = usedSize + gapBeforeItem + itemSize;

    const hasOverflowIndicator = index < items.length - 1;

    const requiredSize = hasOverflowIndicator
      ? nextSize + gap + overflowIndicatorSize
      : nextSize;

    if (requiredSize > containerSize) {
      return index;
    }

    usedSize = nextSize;
  }

  return items.length;
}
