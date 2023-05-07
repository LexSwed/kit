import React, { forwardRef, type ComponentProps, useCallback } from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  inline,
  type Placement,
  type ReferenceType,
  useMergeRefs,
} from '@floating-ui/react';
import * as RdxPresence from '@radix-ui/react-presence';
import { PopoverBox, Portal } from '@fxtrot/ui';
import cx from 'clsx';

interface Props extends ComponentProps<typeof PopoverBox> {
  isOpen: boolean;
  reference: ReferenceType | null | undefined;
  placement?: Placement;
}

export const EditorPopover = forwardRef<HTMLDivElement, Props>(function EditorPopoverWithRef(
  { isOpen, reference, className, placement = 'top-start', children, ...props },
  propRef
) {
  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    placement,
    strategy: 'fixed',
    elements: reference
      ? {
          reference: reference,
        }
      : undefined,
    middleware: [
      inline(),
      offset({ mainAxis: 8, crossAxis: -32 }),
      flip({
        crossAxis: false,
      }),
      shift(),
    ],
  });
  const [side, align] = getSideAndAlignFromPlacement(context.placement);

  const ref = useMergeRefs([propRef, refs.setFloating]);

  return (
    <RdxPresence.Presence present={isOpen}>
      <Portal>
        <PopoverBox
          data-align={align}
          data-side={side}
          ref={ref}
          data-state={isOpen ? 'open' : 'closed'}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: 'max-content',
          }}
          className={cx('isolate transition-[opacity,width,height] duration-300', className)}
          {...props}
        >
          {children}
        </PopoverBox>
      </Portal>
    </RdxPresence.Presence>
  );
});

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = 'center'] = placement.split('-');
  return [side, align] as const;
}
