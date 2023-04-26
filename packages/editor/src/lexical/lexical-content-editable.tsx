import { createSignal, type JSX, mergeProps, onCleanup, onMount } from 'solid-js';
import { useLexicalComposerContext } from './lexical-composer-context';

type Props = Readonly<{
  ariaActiveDescendant?: string;
  ariaAutoComplete?: JSX.HTMLAttributes<HTMLDivElement>['aria-autocomplete'];
  ariaControls?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaMultiline?: boolean;
  ariaOwns?: string;
  ariaRequired?: JSX.HTMLAttributes<HTMLDivElement>['aria-required'];
  autoCapitalize?: JSX.HTMLAutocapitalize;
  autoComplete?: boolean;
  autoCorrect?: boolean;
  class?: string;
  id?: string;
  readOnly?: boolean;
  role?: string;
  style?: JSX.HTMLAttributes<HTMLDivElement>['style'];
  spellCheck?: boolean;
  tabIndex?: number;
  testid?: string;
}>;

export function ContentEditable(props: Props): JSX.Element {
  const mergedProps = mergeProps({ role: 'textbox', spellCheck: true }, props);
  const [editor] = useLexicalComposerContext();
  const [isEditable, setEditable] = createSignal(false);
  let rootElementRef!: HTMLDivElement;
  onMount(() => {
    editor.setRootElement(rootElementRef);
  });
  onMount(() => {
    setEditable(editor.isEditable());
    onCleanup(
      editor.registerEditableListener((currentIsReadOnly) => {
        setEditable(currentIsReadOnly);
      })
    );
  });
  function ifNotReadonly<T, U = undefined>(value: T, fallback?: U): T | U | undefined {
    if (!isEditable()) return fallback;
    return value;
  }
  return (
    <div
      aria-activedescendant={ifNotReadonly(mergedProps.ariaActiveDescendant)}
      aria-autocomplete={ifNotReadonly(mergedProps.ariaAutoComplete, 'none')}
      aria-controls={ifNotReadonly(mergedProps.ariaControls)}
      aria-describedby={mergedProps.ariaDescribedBy}
      aria-expanded={ifNotReadonly(mergedProps.role === 'combobox' ? !!mergedProps.ariaExpanded : undefined)}
      aria-label={mergedProps.ariaLabel}
      aria-labelledby={mergedProps.ariaLabelledBy}
      aria-multiline={mergedProps.ariaMultiline}
      aria-owns={ifNotReadonly(mergedProps.ariaOwns)}
      aria-required={mergedProps.ariaRequired}
      autoCapitalize={mergedProps.autoCapitalize}
      class={mergedProps.class}
      contentEditable={isEditable()}
      data-testid={mergedProps.testid}
      id={mergedProps.id}
      ref={rootElementRef}
      role={ifNotReadonly(mergedProps.role) as JSX.HTMLAttributes<HTMLDivElement>['role']}
      spellcheck={mergedProps.spellCheck}
      style={mergedProps.style}
      tabIndex={mergedProps.tabIndex}
    />
  );
}

export type { Props };
