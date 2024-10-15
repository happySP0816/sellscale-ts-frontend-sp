import {
  RichTextEditor,
  Link,
  useRichTextEditorContext,
} from "@mantine/tiptap";
import { JSONContent, useEditor } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import { IconRobot } from "@tabler/icons";
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from "react";
import { ScrollArea } from "@mantine/core";

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

export default function RichTextArea(props: { personalizationBtn?: boolean, height?: number, value?: string | JSONContent, onChange?: (value: string, rawValue: JSONContent) => void, overrideSticky?: boolean, resize?: boolean }) {
  const [scrollAreaHeight, setScrollAreaHeight] = useState(props.height || 200);

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
      if (props.onChange) {
        props.onChange(editor.getHTML(), editor.getJSON());
      }
    },
  });

  // If value updates, update the contents accordingly
  useEffect(() => {
    editor && props.value && editor.commands.setContent(props.value)
  }, [props.value]);

  const handleResize = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const startY = event.clientY;
    const startHeight = scrollAreaHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = startHeight + (moveEvent.clientY - startY);
      setScrollAreaHeight(newHeight > 100 ? newHeight : 100); // Minimum height of 100
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <RichTextEditor
      editor={editor}
      styles={{
        content: {
          p: {
            fontSize: 14,
          },
          minHeight: scrollAreaHeight,
        }
      }}
      onClick={() => editor?.commands.focus()} // Ensure the editor is focused when clicking anywhere on the textarea
    >
      <RichTextEditor.Toolbar sticky={!props.overrideSticky} stickyOffset={60}>

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
      <ScrollArea h={scrollAreaHeight}>
        <RichTextEditor.Content />
      </ScrollArea>
      {props.resize && (
        <div
          style={{
            height: '10px',
            cursor: 'row-resize',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'gray', // Set text color to white
          }}
          onMouseDown={handleResize}
        >
          ...
        </div>
      )}
    </RichTextEditor>
  );
}
