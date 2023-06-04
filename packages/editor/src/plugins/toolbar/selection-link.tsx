import { RxLink2 } from "react-icons/rx/index.js";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext.js";

import { t } from "@fxtrot/lib";
import { Icon, ToggleButton } from "@fxtrot/ui";

import { LinkEditPopup } from "./link-edit-popup.tsx";
import { useActorRef, useSelector } from "./state.ts";
import { ToggleGroup } from "./toggle-group.tsx";
import { selectWholeLink, useIsLinkNodeSelected } from "./utils.ts";

export const SelectionLink = () => {
  const [editor] = useLexicalComposerContext();
  const reference = useSelector((state) => state.context.selection);

  const isLinkEditOpen = useSelector((state) =>
    state.matches({
      toolbar: { shown: { range: "link-edit" } },
    })
  );
  const actor = useActorRef();
  const [isLink, isDisabled] = useIsLinkNodeSelected();

  const toggle = async () => {
    if (!reference) return;
    if (isLinkEditOpen) {
      actor.send({ type: "cancel link edit" });
    } else {
      if (isLink) {
        await selectWholeLink(editor, reference);
      }
      actor.send({ type: "edit link" });
    }
  };

  return (
    <>
      <div className="w-0.5 bg-outline/10" />
      <ToggleGroup disabled={isDisabled}>
        <ToggleButton
          pressed={isLink || isLinkEditOpen}
          onClick={toggle}
          size="sm"
        >
          <Icon size="sm" as={RxLink2} />
          {t("Link")}
        </ToggleButton>
      </ToggleGroup>

      {isLinkEditOpen && (
        <LinkEditPopup isLink={isLink} reference={reference} />
      )}
    </>
  );
};
