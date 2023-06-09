import { Editor } from "@fxtrot/editor";

export default function EditorPage() {
  const initialEditorState = null;
  return (
    <div className="my-8">
      <Editor initialEditorState={initialEditorState} />
    </div>
  );
}
