import { useLexicalComposerContext } from './LexicalComposerContext';
import { useCharacterLimit } from './shared/use-character-limit';
import { createMemo, createSignal, mergeProps } from 'solid-js';

const CHARACTER_LIMIT = 5;
let textEncoderInstance: null | TextEncoder = null;

function textEncoder(): null | TextEncoder {
  if (window.TextEncoder === undefined) {
    return null;
  }

  if (textEncoderInstance === null) {
    textEncoderInstance = new window.TextEncoder();
  }

  return textEncoderInstance;
}

function utf8Length(text: string) {
  const currentTextEncoder = textEncoder();

  if (currentTextEncoder === null) {
    // http://stackoverflow.com/a/5515960/210370
    const m = encodeURIComponent(text).match(/%[89ABab]/g);
    return text.length + (m ? m.length : 0);
  }

  return currentTextEncoder.encode(text).length;
}

type Props = Readonly<{ charset: 'UTF-8' | 'UTF-16'; maxLength: number }>;

export function CharacterLimitPlugin(props: Props) {
  const mergedProps = mergeProps({ charset: 'UTF-16', maxLength: CHARACTER_LIMIT }, props);
  const [editor] = useLexicalComposerContext();

  const [remainingCharacters, setRemainingCharacters] = createSignal(mergedProps.maxLength);

  const characterLimitProps = createMemo(() => ({
    remainingCharacters: setRemainingCharacters,
    strlen: (text: string) => {
      if (mergedProps.charset === 'UTF-8') {
        return utf8Length(text);
      } else if (mergedProps.charset === 'UTF-16') {
        return text.length;
      } else {
        throw new Error('Unrecognized charset');
      }
    },
  }));

  useCharacterLimit(editor, mergedProps.maxLength, characterLimitProps);

  return (
    <span class={`characters-limit ${remainingCharacters() < 0 ? 'characters-limit-exceeded' : ''}`}>
      {remainingCharacters()}
    </span>
  );
}
