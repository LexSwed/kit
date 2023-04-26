import { useLexicalComposerContext } from './lexical-composer-context';
import { useLexicalEditable } from './use-lexical-editable';
import { useCanShowPlaceholder } from './shared/use-can-show-placeholder';
import { type ErrorBoundaryType, useDecorators } from './shared/use-decorators';
import { usePlainTextSetup } from './shared/use-plain-text-setup';
import { createMemo, type JSX, Show, untrack } from 'solid-js';

type Props = Readonly<{
  contentEditable: JSX.Element;
  placeholder: ((isEditable: boolean) => null | JSX.Element) | null | JSX.Element;
  errorBoundary: ErrorBoundaryType;
}>;

export function PlainTextPlugin(props: Props) {
  const [editor] = useLexicalComposerContext();
  const decorators = useDecorators(editor, props.errorBoundary);
  usePlainTextSetup(editor);

  return (
    <>
      {props.contentEditable}
      <Placeholder content={props.placeholder} />
      {decorators}
    </>
  );
}

type ContentFunction = (isEditable: boolean) => null | JSX.Element;

function Placeholder(props: { content: ContentFunction | null | JSX.Element }): null | JSX.Element {
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
