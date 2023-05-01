import { createEffect, createSignal, onCleanup, type Accessor, on, mergeProps } from 'solid-js';
import {
  computePosition,
  type ComputePositionConfig,
  type ComputePositionReturn,
  type ReferenceElement,
} from '@floating-ui/dom';

export interface FloatingOptions<R extends ReferenceElement, F extends HTMLElement>
  extends Partial<ComputePositionConfig> {
  open?: Accessor<boolean>;
  whileElementsMounted?: (reference: R, floating: F, update: () => void) => void | (() => void);
}

interface FloatingState extends Omit<ComputePositionReturn, 'x' | 'y'> {
  x?: number | null;
  y?: number | null;
}

export function createFloating<R extends ReferenceElement, F extends HTMLElement>(
  reference: () => R | undefined | null,
  floating: () => F | undefined | null,
  { open = () => true, placement = 'bottom', strategy = 'absolute', ...options }: FloatingOptions<R, F>
) {
  const [data, setData] = createSignal<FloatingState>({
    x: null,
    y: null,
    placement,
    strategy,
    middlewareData: {},
  });

  const [error, setError] = createSignal<{ value: any } | undefined>();

  createEffect(() => {
    const currentError = error();
    if (currentError) {
      throw currentError.value;
    }
  });

  const $placement = () => placement;
  const $strategy = () => strategy;
  const $open = () => open();

  const update = () => {
    const currentReference = reference();
    const currentFloating = floating();
    if ($open() && currentReference && currentFloating) {
      computePosition(currentReference, currentFloating, {
        middleware: options?.middleware,
        placement: $placement(),
        strategy: $strategy(),
      }).then(setData, setError);
    }
  };

  createEffect(on([reference, floating, $open, $placement, $strategy], update));

  return {
    get x() {
      return data().x;
    },
    get y() {
      return data().y;
    },
    get placement() {
      return data().placement;
    },
    get strategy() {
      return data().strategy;
    },
    get middlewareData() {
      return data().middlewareData;
    },
    update,
  };
}
