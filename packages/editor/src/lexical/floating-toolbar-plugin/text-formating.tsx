import { createSignal, onCleanup, onMount, type JSX } from 'solid-js';
import { BsTypeItalic, BsTypeUnderline, BsTypeBold, BsCodeSlash } from 'solid-icons/bs';

import { t } from 'shared';
import { ToggleButton } from '../../ui';
import { ToggleGroup } from './toggle-group';
import { useLexicalComposerContext } from '..';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, type TextFormatType } from 'lexical';
import { mergeRegister } from '@lexical/utils';

export function TextFormatting() {
  const [editor] = useLexicalComposerContext();

  const [isBold, setIsBold] = createSignal(false);
  const [isItalic, setIsItalic] = createSignal(false);
  const [isUnderline, setIsUnderline] = createSignal(false);
  const [isCode, setIsCode] = createSignal(false);

  const updateFormat = () => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }

    // Update text format
    setIsBold(selection.hasFormat('bold'));
    setIsItalic(selection.hasFormat('italic'));
    setIsUnderline(selection.hasFormat('underline'));
    setIsCode(selection.hasFormat('code'));
  };

  onMount(() => {
    editor.getEditorState().read(updateFormat);
  });

  onCleanup(
    mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateFormat);
      })
    )
  );

  const handleToggle: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (e) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, e.currentTarget.value as TextFormatType);
  };

  return (
    <ToggleGroup>
      <ToggleButton
        pressed={isBold()}
        onClick={handleToggle}
        value="bold"
        label={t('Format text as bold')}
        size="sm"
        icon={BsTypeBold}
      />
      <ToggleButton
        pressed={isItalic()}
        value="italic"
        onClick={handleToggle}
        size="sm"
        label={t('Format text as italics')}
        icon={BsTypeItalic}
      />
      <ToggleButton
        pressed={isUnderline()}
        value="underline"
        onClick={handleToggle}
        size="sm"
        label={t('Format text to underlined')}
        icon={BsTypeUnderline}
      />
      <ToggleButton
        pressed={isCode()}
        value="code"
        size="sm"
        label={t('Insert code block')}
        onClick={handleToggle}
        icon={BsCodeSlash}
      />
    </ToggleGroup>
  );
}
