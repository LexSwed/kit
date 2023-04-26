import {
  type LexicalComposerContextType,
  createLexicalComposerContext,
  LexicalComposerContext,
} from './lexical-composer-context';
import { type EditorThemeClasses, type Klass, type LexicalEditor, type LexicalNode } from 'lexical';
import { createEffect, type JSX, onCleanup, useContext } from 'solid-js';

type Props = Readonly<{
  children: JSX.Element;
  initialEditor: LexicalEditor;
  initialTheme?: EditorThemeClasses;
  initialNodes?: ReadonlyArray<Klass<LexicalNode>>;
  skipCollabChecks?: true;
}>;

export function LexicalNestedComposer(props: Props) {
  const parentContext = useContext(LexicalComposerContext);

  if (parentContext == null) {
    throw Error('Unexpected parent context null on a nested composer');
  }

  const [parentEditor, { getTheme: getParentTheme }] = parentContext;

  const composerTheme: EditorThemeClasses | undefined = props.initialTheme || getParentTheme() || undefined;

  const context: LexicalComposerContextType = createLexicalComposerContext(parentContext, composerTheme);

  if (composerTheme !== undefined) {
    props.initialEditor._config.theme = composerTheme;
  }

  props.initialEditor._parentEditor = parentEditor;

  if (!props.initialNodes) {
    const parentNodes = (props.initialEditor._nodes = new Map(parentEditor._nodes));
    for (const [type, entry] of parentNodes) {
      props.initialEditor._nodes.set(type, {
        klass: entry.klass,
        replace: entry.replace,
        replaceWithKlass: entry.replaceWithKlass,
        transforms: new Set(),
      });
    }
  } else {
    for (const klass of props.initialNodes) {
      const type = klass.getType();
      props.initialEditor._nodes.set(type, {
        klass,
        replace: null,
        replaceWithKlass: null,
        transforms: new Set(),
      });
    }
  }
  props.initialEditor._config.namespace = parentEditor._config.namespace;
  props.initialEditor._editable = parentEditor._editable;

  // Update `isEditable` state of nested editor in response to the same change on parent editor.
  createEffect(() => {
    onCleanup(
      parentEditor.registerEditableListener((editable) => {
        props.initialEditor.setEditable(editable);
      })
    );
  });

  return (
    <LexicalComposerContext.Provider value={[props.initialEditor, context]}>
      {props.children}
    </LexicalComposerContext.Provider>
  );
}
