import React, { type ComponentProps, forwardRef } from "react";
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
} from "@floating-ui/react";
import { clsx } from "clsx";

import { PopoverBox, Portal } from "@fxtrot/ui";

interface Props extends ComponentProps<typeof PopoverBox> {
  open: boolean;
  reference: ReferenceType | null | undefined;
  placement?: Placement;
  offset?: OffsetOptions;
}

export const EditorPopover = forwardRef<HTMLDivElement, Props>(
  (
    {
      open,
      reference,
      style,
      className,
      placement = "top-start",
      offset: offsetOptions = { mainAxis: 8, crossAxis: -32 },
      children,
      ...props
    },
    propRef,
  ) => {
    const elements = reference
      ? {
          reference,
        }
      : undefined;
    const { x, y, strategy, refs, context } = useFloating({
      open,
      placement,
      strategy: "fixed",
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

    const floatingRef = useMergeRefs([propRef, refs.setFloating]);

    if (!open) return null;

    const [side, align] = getSideAndAlignFromPlacement(context.placement);

    /* using the portal the buttons inside the popovers being able to open own popovers 
      that are portaled to the root, instead of rendered next to the button itself */
    return (
      <Portal>
        <PopoverBox
          data-align={align}
          data-side={side}
          data-state={open ? "open" : "closed"}
          ref={floatingRef}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: "max-content",
            margin: 0,
            ...style,
          }}
          className={clsx(
            "isolate transition-[opacity,width,height] duration-150",
            className,
          )}
          {...props}
        >
          {children}
        </PopoverBox>
      </Portal>
    );
  },
);

function getSideAndAlignFromPlacement(placement: Placement) {
  const [side, align = "center"] = placement.split("-");
  return [side, align] as const;
}

function supportsPopover<T extends HTMLElement>(
  element: T,
): element is T & {
  showPopover: () => void;
  hidePopover: () => void;
  togglePopover: () => void;
} {
  return HTMLElement.prototype.hasOwnProperty!("popover");
}
