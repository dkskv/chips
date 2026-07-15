/**
 * Подменяет `HTMLElement.prototype.offsetWidth` геттером.
 * Возвращает `restore` для отката дескриптора.
 */
export function installOffsetWidthMock(
  getOffsetWidth: (element: HTMLElement) => number,
) {
  const original = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth",
  );

  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get(this: HTMLElement) {
      return getOffsetWidth(this);
    },
  });

  const restore = () => {
    if (original !== undefined) {
      Object.defineProperty(HTMLElement.prototype, "offsetWidth", original);
      return;
    }

    delete (HTMLElement.prototype as { offsetWidth?: number }).offsetWidth;
  };

  return { restore };
}
