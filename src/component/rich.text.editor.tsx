import React from 'react'
import { Editor, EditorState } from 'draft-js'

export default function TextEditor() {
  const [editorState, setEditorState] = React.useState(EditorState.createEmpty())

  const editor = React.useRef<Editor>(null)

  function focusEditor() {
    if (editor.current) editor.current.focus()
  }

  React.useEffect(() => {
    focusEditor()
  }, [])

  return (
    <div onClick={focusEditor}>
      <Editor
        ref={editor}
        editorState={editorState}
        onChange={(editorState) => setEditorState(editorState)}
      />
    </div>
  )
}
