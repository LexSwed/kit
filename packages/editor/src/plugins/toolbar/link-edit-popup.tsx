import {
  type FormEvent,
  type FormEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { RxLinkBreak2 } from "react-icons/rx/index.js";
import type { ReferenceType } from "@floating-ui/react";
import {
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";

import { t } from "@fxtrot/lib";
import {
  Button,
  Row,
  Text,
  TextField,
  Tooltip,
  useCopyToClipboard,
  useKeyboardHandles,
} from "@fxtrot/ui";

import { EditorPopover } from "../../lib/editor-popover.tsx";

import { useActorRef } from "./state.ts";
import {
  getLinkDetailsFromSelection,
  highlightSelectedLink,
  updateSelectedLink,
  useIsLinkNodeSelected,
} from "./utils.ts";

interface LinkEditPopupProps {
  reference: ReferenceType | null;
}

export const LinkEditPopup = ({ reference }: LinkEditPopupProps) => {
  const [editor] = useLexicalComposerContext();
  const [initialValues, setInitialValues] = useState<{
    text: string;
    link: string;
  } | null>(null);
  const actor = useActorRef();
  const [isLink] = useIsLinkNodeSelected();
  const floatingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getLinkDetailsFromSelection(editor).then((details) => {
      console.log({ details });
      setInitialValues(details);
    });
  }, [editor, reference]);
  console.log({ initialValues });
  useEffect(() => {
    if (isLink) {
      return highlightSelectedLink(editor);
    }
  }, [isLink, reference, editor]);

  const close = () => {
    actor.send({ type: "cancel link edit" });
  };

  const saveLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (form.get("text") as string) || "";
    const link = (form.get("link") as string) || "";
    updateSelectedLink(editor, { text, link });
    close();
  };

  const onKeyDown = useKeyboardHandles({
    Escape: close,
  });

  return (
    <EditorPopover
      ref={floatingRef}
      onKeyDown={onKeyDown}
      open
      placement="bottom-start"
      reference={reference}
    >
      {initialValues && (
        <LinkEditForm
          initialValues={initialValues}
          isLink={isLink}
          onClose={close}
          onSubmit={saveLink}
        />
      )}
    </EditorPopover>
  );
};

const LinkEditForm = ({
  isLink,
  initialValues,
  onSubmit,
  onClose,
}: {
  isLink: boolean;
  initialValues: {
    text: string;
    link: string;
  };
  onSubmit: FormEventHandler<HTMLFormElement>;
  onClose: () => void;
}) => {
  const supportsTextEditing = Boolean(initialValues.text);
  return (
    <>
      {isLink ? (
        <LinkActions href={initialValues.link} onClose={onClose} />
      ) : null}
      <form
        className="col-span-full row-start-2 flex w-64 flex-col gap-2 p-2"
        onSubmit={onSubmit}
      >
        <fieldset autoFocus>
          {supportsTextEditing && (
            <TextField
              size="sm"
              label="Link title"
              placeholder="Reference"
              name="text"
              defaultValue={initialValues.text}
              autoFocus
            />
          )}
          <TextField
            size="sm"
            label="Link URL"
            placeholder="https://example.com"
            name="link"
            type="url"
            autoFocus={!supportsTextEditing}
            defaultValue={initialValues.link}
          />
        </fieldset>
        <div className="flex flex-row justify-end gap-2 pt-1">
          <Button size="sm" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button size="sm" type="submit" variant="tonal">
            {t("Save")}
          </Button>
        </div>
      </form>
    </>
  );
};

interface LinkActionsProps {
  href: string;
  onClose: () => void;
}
const LinkActions = ({ href, onClose }: LinkActionsProps) => {
  const [editor] = useLexicalComposerContext();
  const removeLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    onClose();
  };

  return (
    <Row main="end" cross="center">
      <Tooltip
        delayDuration={200}
        content={<Text textStyle="body-sm">Open in a new tab</Text>}
      >
        <Button
          size="sm"
          icon={ArrowTopRightOnSquareIcon}
          aria-label={t("Open in a new tab")}
        />
      </Tooltip>
      <Tooltip
        delayDuration={200}
        content={<Text textStyle="body-sm">{t("Unlink")}</Text>}
      >
        <Button
          size="sm"
          icon={RxLinkBreak2}
          label={t("Remove link")}
          intent="danger"
          onClick={removeLink}
        />
      </Tooltip>
      <CopyLinkButton href={href} />
    </Row>
  );
};

export const CopyLinkButton = ({ href }: { href: string }) => {
  const [copied, copy] = useCopyToClipboard();

  return (
    <Tooltip
      delayDuration={200}
      content={
        copied ? (
          <Text textStyle="body-sm">{t("Copied to clipboard")}</Text>
        ) : (
          <Text textStyle="body-sm">{t("Copy to clipboard")}</Text>
        )
      }
    >
      <Button
        size="sm"
        icon={copied ? ClipboardDocumentCheckIcon : ClipboardDocumentListIcon}
        label={t("Copy link")}
        onClick={() => copy(href)}
      />
    </Tooltip>
  );
};
