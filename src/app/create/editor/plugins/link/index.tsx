import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { AutoLinkPlugin as LexicalAutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { useEffect } from 'react';
import { mergeRegister } from '@lexical/utils';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { MATCHERS, validateUrl } from './utils';

export const LinkPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          console.log(editorState);
        });
      })
    );
  }, [editor]);

  return (
    <>
      <LexicalLinkPlugin validateUrl={validateUrl} />
      <LexicalAutoLinkPlugin matchers={MATCHERS} />
      {/* <FloatingLinkEditorPlugin /> */}
    </>
  );
};
