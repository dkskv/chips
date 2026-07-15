type Debounced<T extends (...args: unknown[]) => void> = ((
  ...args: Parameters<T>
) => void) & {
  cancel: () => void;
};

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  wait: number,
): Debounced<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, wait);
  }) as Debounced<T>;

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}
