import React, { type ComponentProps, forwardRef, useEffect } from "react";
import {
  flip,
  inline,
  offset,
  type OffsetOptions,
  type Placement,
  type ReferenceType,
  shift,
  useFloating,
  useMergeRefs,
} from "@floating-ui/react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";
import * as RdxPresence from "@radix-ui/react-presence";
import { clsx } from "clsx";

import { PopoverBox, Portal } from "@fxtrot/ui";

interface Props extends ComponentProps<typeof PopoverBox> {
  isOpen: boolean;
  reference: ReferenceType | null | undefined;
  placement?: Placement;
  offset?: OffsetOptions;
}

export const EditorPopover = forwardRef<HTMLDivElement, Props>(
  function EditorPopoverWithRef(props, ref) {
    return (
      <RdxPresence.Presence present={props.isOpen}>
        <EditorPopoverInner {...props} ref={ref} />
      </RdxPresence.Presence>
    );
  }
);

const EditorPopoverInner = forwardRef<HTMLDivElement, Props>(
  function EditorPopoverWithRef(
    {
      isOpen,
      reference,
      className,
      placement = "top-start",
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
      strategy: "fixed",
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
      // Can't return focus to the trigger as the reference is selected text
      if (isOpen) {
        return () => {
          if (editor.getRootElement() !== document.activeElement) {
            editor.focus();
          }
        };
      }
    }, [editor, isOpen]);

    /* using the portal the buttons inside the popovers being able to open own popovers 
      that are portaled to the root, instead of rendered next to the button itself */
    return (
      <Portal>
        <PopoverBox
          data-align={align}
          data-side={side}
          ref={ref}
          data-state={isOpen ? "open" : "closed"}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: "max-content",
          }}
          className={clsx(
            "isolate transition-[opacity,width,height] duration-300",
            className
          )}
          {...props}
        >
          {children}
        </PopoverBox>
      </Portal>
    );
  }
);

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = "center"] = placement.split("-");
  return [side, align] as const;
}
