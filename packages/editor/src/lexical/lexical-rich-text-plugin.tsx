import { useLexicalComposerContext } from './lexical-composer-context';
import { useLexicalEditable } from './use-lexical-editable';
import { useCanShowPlaceholder } from './shared/use-can-show-placeholder';
import { type ErrorBoundaryType, useDecorators } from './shared/use-decorators';
import { useRichTextSetup } from './shared/use-rich-text-setup';
import { type JSX, Show, createMemo } from 'solid-js';
import { untrack } from 'solid-js';

export function RichTextPlugin(props: {
  contentEditable: JSX.Element;
  placeholder: ((isEditable: boolean) => null | JSX.Element) | null | JSX.Element;
  errorBoundary: ErrorBoundaryType;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const decorators = useDecorators(editor, props.errorBoundary);
  useRichTextSetup(editor);

  return (
    <>
      {props.contentEditable}
      <Placeholder content={props.placeholder} />
      {decorators}
    </>
  );
}

type ContentFunction = (isEditable: boolean) => null | JSX.Element;

function Placeholder(props: { content: ContentFunction | null | JSX.Element }): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const showPlaceholder = useCanShowPlaceholder(editor);
  const editable = useLexicalEditable();
  const content = createMemo(() => props.content);

  return (
    <Show when={showPlaceholder()}>
      <Show when={typeof content() === 'function'} fallback={content() as JSX.Element}>
        {untrack(() => (content() as ContentFunction)(editable()))}
      </Show>
    </Show>
  );
}
