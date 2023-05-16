import { type Accessor } from 'solid-js';
import { ElementNode, TextNode, type RangeSelection } from 'lexical';
import { $isAtNodeEnd } from '@lexical/selection';

export type MaybeAccessor<T> = T | Accessor<T>;

export function resolve<T>(t: MaybeAccessor<T>): T {
  if (typeof t === 'function') {
    // @ts-expect-error T itself can be a function without being accessor, T needs to be restricted in type
    return t();
  } else {
    return t;
  }
}

export function $getSelectedNode(selection: RangeSelection): TextNode | ElementNode {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}

import { type VirtualElement } from '@floating-ui/dom';

/**
 * Inspired by https://github.com/facebook/lexical/blob/2dc70df466032c455cfe8f48ebd21d96f0a0b0a7/packages/lexical-playground/src/utils/getDOMRangeRect.ts#L8
 */
export function getElementFromDomRange(nativeSelection: Selection, rootElement: HTMLElement) {
  const domRange = nativeSelection.getRangeAt(0);

  let element: VirtualElement | HTMLElement = domRange;

  if (nativeSelection.anchorNode === rootElement) {
    element = rootElement;
    while ('firstElementChild' in element && element.firstElementChild != null) {
      element = element.firstElementChild as HTMLElement;
    }
  }

  return element;
}
