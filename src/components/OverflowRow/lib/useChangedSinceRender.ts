/**
 * Сохраняет значения во время render и возвращает функцию,
 * проверяющую, изменилось ли значение с момента render.
 */
export function useChangedSinceRender<V>(getValue: () => V): () => boolean {
  const snapshot = getValue();

  return () => {
    const value = getValue();

    return !Object.is(snapshot, value);
  };
}
