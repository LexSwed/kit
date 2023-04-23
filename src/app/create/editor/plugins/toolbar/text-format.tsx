import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { mergeRegister } from '@lexical/utils';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, TextFormatType } from 'lexical';
import { MouseEvent, memo, useCallback, useEffect, useState } from 'react';
import { ToggleButton } from '@fxtrot/ui';
import {
  BsTypeItalic,
  BsTypeUnderline,
  BsTypeBold,
  BsTypeStrikethrough,
  BsSubscript,
  BsSuperscript,
  BsCodeSlash,
  BsLink,
} from 'react-icons/bs';
import { ToggleGroup } from './toggle-group';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { t } from '~/utils/translation';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export const TextFormatFloatingToolbar = memo(function TextFormatFloatingToolbar() {
  const [editor] = useLexicalComposerContext();

  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://www.example.com');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const updateFormat = useCallback(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }
    const node = getSelectedNode(selection);
    const parent = node.getParent();

    if ($isLinkNode(node) || $isLinkNode(parent)) {
      setIsLink(true);
    } else {
      setIsLink(false);
    }

    // Update text format
    setIsBold(selection.hasFormat('bold'));
    setIsItalic(selection.hasFormat('italic'));
    setIsUnderline(selection.hasFormat('underline'));
    setIsStrikethrough(selection.hasFormat('strikethrough'));
    setIsSubscript(selection.hasFormat('subscript'));
    setIsSuperscript(selection.hasFormat('superscript'));
    setIsCode(selection.hasFormat('code'));
  }, []);

  useEffect(() => {
    // get initial values
    editor.getEditorState().read(updateFormat);
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateFormat);
      })
    );
  }, [editor, updateFormat]);

  const handleToggle = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, e.currentTarget.value as TextFormatType);
    },
    [editor]
  );

  return (
    <ToggleGroup>
      <ToggleButton
        pressed={isBold}
        onClick={handleToggle}
        value="bold"
        label={t('Format text as bold')}
        size="sm"
        icon={BsTypeBold}
      />
      <ToggleButton
        pressed={isItalic}
        value="italic"
        onClick={handleToggle}
        size="sm"
        label={t('Format text as italics')}
        icon={BsTypeItalic}
      />
      <ToggleButton
        pressed={isUnderline}
        value="underline"
        onClick={handleToggle}
        size="sm"
        label={t('Format text to underlined')}
        icon={BsTypeUnderline}
      />
      <ToggleButton
        pressed={isStrikethrough}
        value="strikethrough"
        onClick={handleToggle}
        size="sm"
        label={t('Format text with a strikethrough')}
        icon={BsTypeStrikethrough}
      />
      <ToggleButton
        pressed={isSubscript}
        value="subscript"
        onClick={handleToggle}
        size="sm"
        label={t('Format Subscript')}
        icon={BsSubscript}
      />
      <ToggleButton
        pressed={isSuperscript}
        value="superscript"
        onClick={handleToggle}
        size="sm"
        label={t('Format Superscript')}
        icon={BsSuperscript}
      />
      <ToggleButton pressed={isCode} value="code" size="sm" label={t('Insert code block')} icon={BsCodeSlash} />
      <ToggleButton pressed={isLink} onPressedChange={insertLink} size="sm" label={t('Insert link')} icon={BsLink} />
    </ToggleGroup>
  );
});
