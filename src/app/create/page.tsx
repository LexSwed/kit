import { Editor } from './editor';

export default function EditorPage() {
  const initialEditorState = null;

  return (
    <div className="my-8 shadow-2xl rounded-sm relative">
      <Editor initialEditorState={initialEditorState} />
    </div>
  );
}
