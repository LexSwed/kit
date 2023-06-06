import React, { type ComponentProps, useEffect, useState } from "react";
import {
  flip,
  inline,
  offset,
  type OffsetOptions,
  type Placement,
  type ReferenceType,
  shift,
  useFloating,
} from "@floating-ui/react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";
import { clsx } from "clsx";

import { PopoverBox, Portal } from "@fxtrot/ui";

interface Props extends ComponentProps<typeof PopoverBox> {
  open: boolean;
  reference: ReferenceType | null | undefined;
  placement?: Placement;
  offset?: OffsetOptions;
}

export const EditorPopover = ({
  open,
  reference,
  className,
  placement = "top-start",
  offset: offsetOptions = 8,
  children,
  ...props
}: Props) => {
  const [editor] = useLexicalComposerContext();
  const [floating, setFloating] = useState<HTMLDivElement | null>(null);
  const { x, y, strategy, context } = useFloating({
    open: open,
    placement,
    strategy: "fixed",
    elements: reference
      ? {
          floating,
          reference,
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

  useEffect(() => {
    // Can't return focus to the trigger as the reference is selected text
    if (open) {
      return () => {
        if (editor.getRootElement() !== document.activeElement) {
          editor.focus(undefined, { defaultSelection: "rootStart" });
        }
      };
    }
  }, [editor, open]);

  if (!open) return null;

  const [side, align] = getSideAndAlignFromPlacement(context.placement);

  /* using the portal the buttons inside the popovers being able to open own popovers 
      that are portaled to the root, instead of rendered next to the button itself */
  return (
    <Portal>
      <PopoverBox
        data-align={align}
        data-side={side}
        ref={setFloating}
        data-state={open ? "open" : "closed"}
        style={{
          position: strategy,
          top: y ?? 0,
          left: x ?? 0,
          width: "max-content",
        }}
        className={clsx(
          "isolate transition-[opacity,width,height] duration-150",
          className
        )}
        {...props}
      >
        {children}
      </PopoverBox>
    </Portal>
  );
};

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = "center"] = placement.split("-");
  return [side, align] as const;
}
