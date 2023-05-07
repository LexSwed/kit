/**
 * @deprecated not used, keeping if ever find a bug
 * Inspired by https://github.com/facebook/lexical/blob/2dc70df466032c455cfe8f48ebd21d96f0a0b0a7/packages/lexical-playground/src/utils/getDOMRangeRect.ts#L8
 */
export function getElementFromDomRange(nativeSelection: Selection, rootElement: HTMLElement) {
  const domRange = nativeSelection.getRangeAt(0);

  let element: Range | Element = domRange;

  if (nativeSelection.anchorNode === rootElement) {
    element = rootElement;
    while ('firstElementChild' in element && element.firstElementChild !== null) {
      element = element.firstElementChild as Element;
    }
  }

  return element;
}
