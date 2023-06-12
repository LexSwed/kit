import React, { type ComponentProps, forwardRef, useEffect, useState } from 'react';
import {
  autoUpdate,
  flip,
  inline,
  offset,
  type OffsetOptions,
  type Placement,
  type ReferenceType,
  shift,
  useFloating,
  useMergeRefs,
} from '@floating-ui/react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext.js';
import { clsx } from 'clsx';

import { PopoverBox, Portal } from '@fxtrot/ui';

interface Props extends ComponentProps<typeof PopoverBox> {
  open: boolean;
  reference: ReferenceType | null | undefined;
  placement?: Placement;
  offset?: OffsetOptions;
}

export const EditorPopover = forwardRef<HTMLDivElement, Props>(
  (
    { open, reference, style, className, placement = 'top-start', offset: offsetOptions = 8, children, ...props },
    propRef
  ) => {
    const [editor] = useLexicalComposerContext();
    const elements = reference
      ? {
          reference,
        }
      : undefined;
    const { x, y, strategy, refs, context } = useFloating({
      open: open && Boolean(elements),
      placement,
      strategy: 'fixed',
      elements,
      whileElementsMounted: autoUpdate,
      middleware: [
        inline(),
        offset(offsetOptions),
        flip({
          crossAxis: false,
        }),
        shift(),
      ],
    });

    useEffect(() => {
      // Can't return focus to the trigger as the reference is selected text
      if (open) {
        return () => {
          if (editor.getRootElement() !== document.activeElement) {
            editor.focus(undefined, { defaultSelection: 'rootStart' });
          }
        };
      }
    }, [editor, open]);

    const floatingRef = useMergeRefs([propRef, refs.setFloating]);
    if (!open) return null;

    const [side, align] = getSideAndAlignFromPlacement(context.placement);

    /* using the portal the buttons inside the popovers being able to open own popovers 
      that are portaled to the root, instead of rendered next to the button itself */
    return (
      <Portal
        ref={floatingRef}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
          width: 'max-content',
          ...style,
        }}
        className={className}
      >
        <PopoverBox
          data-align={align}
          data-side={side}
          data-state={open ? 'open' : 'closed'}
          className={'isolate transition-[opacity,width,height] duration-150'}
          {...props}
        >
          {children}
        </PopoverBox>
      </Portal>
    );
  }
);

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = 'center'] = placement.split('-');
  return [side, align] as const;
}
