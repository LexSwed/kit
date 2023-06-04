import { Button, LinkButton, Row, Text, TextLink } from "@fxtrot/ui";

import { EditorPopover } from "../../lib/editor-popover.tsx";

import { CopyLinkButton, LinkEditPopup } from "./link-edit-popup.tsx";
import { useActorRef, useSelector } from "./state.ts";

export const LinkSelection = () => {
  const open = useSelector((state) =>
    state.matches({ toolbar: { shown: "link" } })
  );
  const isLinkEditOpen = useSelector((state) =>
    state.matches({
      toolbar: { shown: { link: "link-edit" } },
    })
  );
  const link = useSelector((state) => state.context.link);
  const actor = useActorRef();
  const editLink = () => {
    if (isLinkEditOpen) {
      actor.send({ type: "cancel link edit" });
    } else {
      actor.send({ type: "edit link" });
    }
  };

  const href = link?.getAttribute("href");
  return (
    <>
      <EditorPopover
        open={open}
        placement="top"
        reference={link}
        className="p-1"
      >
        {href ? (
          <Row gap="xs" cross="center">
            <LinkButton
              href={href}
              title={href}
              className="max-w-[200px]"
              size="sm"
              main="start"
            >
              <Text className="truncate">{href}</Text>
            </LinkButton>
            <CopyLinkButton href={href} />
            <Button size="sm" onClick={editLink}>
              <Text textStyle="label-sm">Edit</Text>
            </Button>
          </Row>
        ) : null}
      </EditorPopover>
      {href && isLinkEditOpen ? (
        <LinkEditPopup reference={link} isLink />
      ) : null}
    </>
  );
};
