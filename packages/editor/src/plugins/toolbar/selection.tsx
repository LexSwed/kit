import { useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";
import { mergeRegister } from "@lexical/utils";
import { clsx } from "clsx";
import {
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  INSERT_TAB_COMMAND,
  KEY_ESCAPE_COMMAND,
} from "lexical";

import { t } from "@fxtrot/lib";
import {
  Button,
  LinkButton,
  Row,
  Text,
  Tooltip,
  useKeyboardHandles,
  useLatest,
} from "@fxtrot/ui";

import { Divider } from "../../lib/divider.tsx";
import { EditorPopover } from "../../lib/editor-popover.tsx";

import { blocks, BlockTypeSelector } from "./block-type.tsx";
import { CopyLinkButton, LinkEditPopup } from "./link-edit-popup.tsx";
import { RangeSelectionLink, TextFormat } from "./range-selection.tsx";
import { useActorRef, useSelector } from "./state.ts";
import {
  $getSelectedBlockType,
  useEditorStateChange,
  useSelectionChange,
} from "./utils.ts";

export const Selection = () => {
  const [editor] = useLexicalComposerContext();
  const actor = useActorRef();

  const pointerDown = useSelector((state) =>
    state.matches({ pointer: "down", focus: "in" }),
  );
  const linkSelected = useSelector((state) =>
    state.matches({ toolbar: { shown: "link" } }),
  );
  const rangeSelected = useSelector((state) =>
    state.matches({ toolbar: { shown: "range" } }),
  );

  const selection = useSelector((state) => state.context.selection);

  const isLinkEditOpen = useSelector((state) =>
    [
      state.matches({
        toolbar: { shown: { range: "link-edit" } },
      }),
      state.matches({
        toolbar: { shown: { link: "link-edit" } },
      }),
    ].some(Boolean),
  );

  const open = linkSelected || rangeSelected;

  const popoverRef = useRef<HTMLDivElement>(null);
  const openRef = useLatest(open);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          actor.send({ type: "close" });
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand(
        INSERT_TAB_COMMAND,
        () => {
          if (openRef.current) {
            const element = popoverRef.current;
            if (element instanceof HTMLElement) {
              element.focus({ preventScroll: true });
              return true;
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        FORMAT_TEXT_COMMAND,
        () => {
          if (openRef.current) {
            const element = popoverRef.current;
            if (element instanceof HTMLElement) {
              element.focus({ preventScroll: true });
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, actor, openRef]);

  const onKeyDown = useKeyboardHandles({
    "Escape.propagate": () => {
      actor.send({ type: "close" });
    },
  });

  return (
    <>
      <EditorPopover
        open={open}
        reference={selection}
        ref={popoverRef}
        tabIndex={-1}
        role="toolbar"
        onKeyDown={onKeyDown}
        className={clsx(
          "grid grid-cols-1 grid-rows-1 place-items-start",
          pointerDown ? "hover:opacity-50" : undefined,
        )}
      >
        <div>
          {linkSelected && selection instanceof HTMLAnchorElement ? (
            <LinkSelectionToggles link={selection} />
          ) : (
            <RangeSelectionToggles />
          )}
        </div>
      </EditorPopover>
      {isLinkEditOpen ? <LinkEditPopup reference={selection} /> : null}
    </>
  );
};

const RangeSelectionToggles = () => {
  const [selectionBlockType, setBlockType] =
    useState<keyof typeof blocks>("paragraph");

  /** Needs to update selected block after change when selection event not emitted */
  useEditorStateChange(() => {
    const type = $getSelectedBlockType();
    if (type in blocks) {
      setBlockType(type);
    }
  });

  return (
    <div className="flex gap-1">
      <BlockTypeSelector selectionBlockType={selectionBlockType} />
      <TextFormat />
      <RangeSelectionLink selectionBlockType={selectionBlockType} />
    </div>
  );
};

type LinkSelectionProps = {
  link: HTMLElement;
};

const LinkSelectionToggles = ({ link }: LinkSelectionProps) => {
  const actor = useActorRef();

  const href = link?.getAttribute("href");

  if (!href) return null;

  const toggleEdit = () => {
    actor.send({ type: "toggle edit link" });
  };

  return (
    <Row gap="xs" cross="center">
      <Tooltip content={t("Open in a new tab")}>
        <LinkButton
          href={href}
          title={href}
          className="max-w-[200px]"
          size="sm"
          main="start"
        >
          <Text className="truncate">{href}</Text>
        </LinkButton>
      </Tooltip>
      <CopyLinkButton href={href} />
      <Button size="sm" onClick={toggleEdit}>
        <Text textStyle="label-sm">{t("Edit")}</Text>
      </Button>
    </Row>
  );
};
