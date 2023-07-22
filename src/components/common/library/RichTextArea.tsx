import {
  RichTextEditor,
  Link,
  useRichTextEditorContext,
} from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import { IconRobot } from "@tabler/icons";
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from "react";

function InsertPersonalizationControl() {
  const { editor } = useRichTextEditorContext();
  return (
    <RichTextEditor.Control
      onClick={() => editor?.commands.insertContent("{{SellScale_Personalization}}")}
      aria-label="Insert Personalization Placeholder"
      title="Insert Personalization Placeholder"
    >
      <IconRobot stroke={1.5} size="1rem" />
    </RichTextEditor.Control>
  );
}

export default function RichTextArea(props: { personalizationBtn?: boolean, height?: number, value?: string, onChange?: (value: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: 'Body' }),
    ],
    content: props.value ?? "",
    onUpdate({ editor }) {
      if(props.onChange) {
        props.onChange(editor.getHTML());
      }
    },
  });

  // If value updates, update the contents accordingly
  useEffect(() => {
    editor && props.value && editor.commands.setContent(props.value)
  }, [props.value]);

  return (
    <RichTextEditor
      editor={editor}
      styles={{ 
        content: {
          p: {
            fontSize: 14,
          },
          minHeight: props.height || 200,
        }
      }}
    >
      <RichTextEditor.Toolbar sticky stickyOffset={60}>

        {props.personalizationBtn && (
          <RichTextEditor.ControlsGroup>
            <InsertPersonalizationControl />
          </RichTextEditor.ControlsGroup>
        )}

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.ClearFormatting />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />
    </RichTextEditor>
  );
}
