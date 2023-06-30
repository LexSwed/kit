import type { ElementType } from "react";
import {
  PiCaretUpDownDuotone,
  PiCheckSquareDuotone,
  PiCodeBlockDuotone,
  PiListBulletsDuotone,
  PiListNumbersDuotone,
  PiQuotesDuotone,
  PiTextHFiveDuotone,
  PiTextHFourDuotone,
  PiTextHOneDuotone,
  PiTextHSixDuotone,
  PiTextHThreeDuotone,
  PiTextHTwoDuotone,
  PiTextTDuotone,
} from "react-icons/pi";
import { RxDividerHorizontal } from "react-icons/rx";
import { $createCodeNode } from "@lexical/code";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  type LexicalEditor,
} from "lexical";

import { t } from "@fxtrot/lib";

import { INSERT_COLLAPSIBLE_COMMAND } from "../plugins/collapsible/collapsible";

interface BlockOption {
  title: string;
  icon?: ElementType;
  /** Other matching labels for the option */
  keywords: Array<string>;
  onSelect: (editor: LexicalEditor) => void;
}

export const Paragraph = {
  title: t("Text"),
  icon: PiTextTDuotone,
  keywords: ["normal", "paragraph", "p", "text"],
  onSelect: (editor) =>
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    }),
} satisfies BlockOption;

const headingIcons = {
  1: PiTextHOneDuotone,
  2: PiTextHTwoDuotone,
  3: PiTextHThreeDuotone,
  4: PiTextHFourDuotone,
  5: PiTextHFiveDuotone,
  6: PiTextHSixDuotone,
} as const;
export const [Heading1, Heading2, Heading3, Heading4, Heading5, Heading6] =
  Array.from({ length: 6 }, (_, i) => i + 1).map(
    (n) =>
      ({
        title: t("Heading {{n}}", { n }),
        icon: headingIcons[n as keyof typeof headingIcons],
        keywords: ["heading", "header", `h${n}`],
        onSelect: (editor) =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () =>
                $createHeadingNode(`h${n as 1 | 2 | 3}`),
              );
            }
          }),
      } satisfies BlockOption),
  );

export const NumberedList = {
  title: t("Numbered List"),
  icon: PiListNumbersDuotone,
  keywords: ["numbered list", "ordered list", "ol"],
  onSelect: (editor) =>
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
} satisfies BlockOption;

export const BulletedList = {
  title: t("Bulleted List"),
  icon: PiListBulletsDuotone,
  keywords: ["bulleted list", "unordered list", "ul"],
  onSelect: (editor) =>
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
} satisfies BlockOption;

export const CheckList = {
  title: t("Check List"),
  icon: PiCheckSquareDuotone,
  keywords: ["check list", "todo list"],
  onSelect: (editor) =>
    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
} satisfies BlockOption;

export const Quote = {
  title: t("Quote"),
  icon: PiQuotesDuotone,
  keywords: ["block quote"],
  onSelect: (editor) =>
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    }),
} satisfies BlockOption;

export const Code = {
  title: t("Code"),
  icon: PiCodeBlockDuotone,
  keywords: ["javascript", "python", "js", "codeblock"],
  onSelect: (editor) =>
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        if (selection.isCollapsed()) {
          $setBlocksType(selection, () => $createCodeNode());
        } else {
          // Will this ever happen?
          const textContent = selection.getTextContent();
          const codeNode = $createCodeNode();
          selection.insertNodes([codeNode]);
          selection.insertRawText(textContent);
        }
      }
    }),
} satisfies BlockOption;

export const Divider = {
  title: t("Divider"),
  icon: RxDividerHorizontal,
  keywords: ["horizontal rule", "divider", "hr"],
  onSelect: (editor) =>
    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
} satisfies BlockOption;

export const Collapsible = {
  title: t("Collapsible"),
  icon: PiCaretUpDownDuotone,
  keywords: ["collapse", "collapsible", "toggle"],
  onSelect: (editor) =>
    editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
} satisfies BlockOption;
