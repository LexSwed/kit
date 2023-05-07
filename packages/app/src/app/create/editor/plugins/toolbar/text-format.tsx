import { mergeRegister } from '@lexical/utils';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, type TextFormatType } from 'lexical';
import { type MouseEvent, memo, useCallback, useEffect, useState } from 'react';
import { ToggleButton } from '@fxtrot/ui';
import { BsTypeItalic, BsTypeUnderline, BsTypeBold, BsCodeSlash } from 'react-icons/bs';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ToggleGroup } from './toggle-group';
import { t } from 'shared';

interface Props {
  disabled?: boolean;
}

export const TextFormatFloatingToolbar = ({ disabled }: Props) => {
  const [editor] = useLexicalComposerContext();

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateFormat = useCallback(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }

    // Update text format
    setIsBold(selection.hasFormat('bold'));
    setIsItalic(selection.hasFormat('italic'));
    setIsUnderline(selection.hasFormat('underline'));
    setIsCode(selection.hasFormat('code'));
  }, []);

  useEffect(() => {
    if (disabled) return;
    // get initial values
    editor.getEditorState().read(updateFormat);
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(updateFormat);
      })
    );
  }, [editor, disabled, updateFormat]);

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
        disabled={disabled}
        label={t('Format text as bold')}
        size="sm"
        icon={BsTypeBold}
        className={disabled ? 'bg-surface opacity-80' : undefined}
      />
      <ToggleButton
        pressed={isItalic}
        value="italic"
        disabled={disabled}
        onClick={handleToggle}
        size="sm"
        label={t('Format text as italics')}
        icon={BsTypeItalic}
        className={disabled ? 'bg-surface opacity-80' : undefined}
      />
      <ToggleButton
        pressed={isUnderline}
        value="underline"
        disabled={disabled}
        onClick={handleToggle}
        size="sm"
        label={t('Format text to underlined')}
        icon={BsTypeUnderline}
        className={disabled ? 'bg-surface opacity-80' : undefined}
      />
      <ToggleButton
        pressed={isCode}
        value="code"
        disabled={disabled}
        onClick={handleToggle}
        size="sm"
        label={t('Insert code block')}
        icon={BsCodeSlash}
        className={disabled ? 'bg-surface opacity-80' : undefined}
      />
    </ToggleGroup>
  );
};
