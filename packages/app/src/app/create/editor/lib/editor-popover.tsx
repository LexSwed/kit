import React, { forwardRef, type ComponentProps, useCallback, useEffect } from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  inline,
  type Placement,
  type ReferenceType,
  type OffsetOptions,
  useMergeRefs,
} from '@floating-ui/react';
import * as RdxPresence from '@radix-ui/react-presence';
import { PopoverBox, Portal } from '@fxtrot/ui';
import cx from 'clsx';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

interface Props extends ComponentProps<typeof PopoverBox> {
  isOpen: boolean;
  reference: ReferenceType | null | undefined;
  placement?: Placement;
  offset?: OffsetOptions;
}

export const EditorPopover = forwardRef<HTMLDivElement, Props>(function EditorPopoverWithRef(
  {
    isOpen,
    reference,
    className,
    placement = 'top-start',
    offset: offsetOptions = { mainAxis: 8, crossAxis: -32 },
    children,
    ...props
  },
  propRef
) {
  const [editor] = useLexicalComposerContext();
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
      offset(offsetOptions),
      flip({
        crossAxis: false,
      }),
      shift(),
    ],
  });
  const [side, align] = getSideAndAlignFromPlacement(context.placement);

  const ref = useMergeRefs([propRef, refs.setFloating]);

  useEffect(() => {
    return () => {
      editor.getRootElement()?.focus();
    };
  }, [editor]);

  return (
    <RdxPresence.Presence present={isOpen}>
      {/* using the portal the buttons inside the popovers being able to open own popovers 
      that are portaled to the root, instead of rendered next to the button itself */}
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
