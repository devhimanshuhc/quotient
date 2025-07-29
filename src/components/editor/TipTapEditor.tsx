"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Heading from "@tiptap/extension-heading";
import Blockquote from "@tiptap/extension-blockquote";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Heading1,
  Heading2,
} from "lucide-react";
import { Button } from "../ui/button";
import { useEffect } from "react";
import AIPromptModal from "../AIPromptModal";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

const editorStyles = `
  .ProseMirror {
    min-height: 200px;
    height: auto;
    resize: vertical;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 1rem;
    outline: none;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    width: 100%;
    box-sizing: border-box;
  }

  .ProseMirror > * {
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
  }

  .ProseMirror p {
    margin: 0 0 0.5em 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    width: 100%;
    line-height: 1.6;
  }

  .ProseMirror p:last-child {
    margin-bottom: 0;
  }

  .ProseMirror p:empty {
    margin: 0;
    height: 0;
    display: none;
  }

  .ProseMirror blockquote {
    border-left: 3px solid #e5e7eb;
    padding-left: 1rem;
    margin: 1em 0;
    margin-left: 0;
    margin-right: 0;
  }

  .ProseMirror h1 {
    font-size: 1.5em;
    font-weight: 600;
    margin: 1.2em 0 0.8em 0;
    line-height: 1.3;
  }

  .ProseMirror h2 {
    font-size: 1.3em;
    font-weight: 600;
    margin: 1em 0 0.6em 0;
    line-height: 1.4;
  }

  .ProseMirror code {
    background-color: #f3f4f6;
    padding: 0.2em 0.4em;
    border-radius: 0.25em;
    font-family: monospace;
  }

  .ProseMirror ul {
    list-style-type: disc;
    padding-left: 1.5em;
    margin: 0.8em 0;
  }

  .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 1.5em;
    margin: 0.8em 0;
  }

  .ProseMirror li {
    margin: 0.3em 0;
    line-height: 1.6;
  }

  .ProseMirror li:empty {
    display: none;
  }

  .ProseMirror li p {
    margin: 0;
    display: inline;
  }

  .ProseMirror ul:empty,
  .ProseMirror ol:empty {
    display: none;
  }

  .ProseMirror p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  .ProseMirror:focus {
    outline: none;
  }
`;

export default function TipTapEditor({
  content,
  onChange,
  readOnly = false,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Strike,
      Heading.configure({
        levels: [1, 2],
      }),
      Blockquote,
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl w-full",
        "data-placeholder": "Write your thoughts...",
      },
    },
    onUpdate: ({ editor }) => {
      if (!readOnly) {
        onChange(editor.getHTML());
      }
    },
    editable: !readOnly,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Function to clean AI-generated content before insertion
  const cleanAIContent = (content: string): string => {
    let cleaned = content;

    // Remove excessive empty paragraphs and line breaks
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, "");
    cleaned = cleaned.replace(/<p>\s*&nbsp;\s*<\/p>/g, "");
    cleaned = cleaned.replace(/<br\s*\/?>\s*<br\s*\/?>/g, "<br>");

    // Remove empty list items
    cleaned = cleaned.replace(/<li>\s*<\/li>/g, "");
    cleaned = cleaned.replace(/<li>\s*&nbsp;\s*<\/li>/g, "");

    // Remove empty ul/ol tags
    cleaned = cleaned.replace(/<ul>\s*<\/ul>/g, "");
    cleaned = cleaned.replace(/<ol>\s*<\/ol>/g, "");

    // Remove trailing and leading whitespace from list items
    cleaned = cleaned.replace(/<li>\s+/g, "<li>");
    cleaned = cleaned.replace(/\s+<\/li>/g, "</li>");

    // Remove trailing and leading whitespace from paragraphs
    cleaned = cleaned.replace(/<p>\s+/g, "<p>");
    cleaned = cleaned.replace(/\s+<\/p>/g, "</p>");

    // Remove multiple consecutive spaces
    cleaned = cleaned.replace(/\s{2,}/g, " ");

    // Clean up any malformed HTML
    cleaned = cleaned.replace(/<([^>]+)>\s*<\/\1>/g, "");

    return cleaned.trim();
  };

  const handleAIContent = (generatedContent: string) => {
    if (editor) {
      // Clean the AI-generated content before insertion
      const cleanedContent = cleanAIContent(generatedContent);

      // Get current cursor position
      const { from } = editor.state.selection;

      // Insert the cleaned AI-generated content at cursor position
      editor.chain().focus().insertContentAt(from, cleanedContent).run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md">
      <div className="border-b p-2 bg-gray-50 flex flex-wrap gap-1 justify-between">
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-gray-200" : ""}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-gray-200" : ""}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive("underline") ? "bg-gray-200" : ""}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "bg-gray-200" : ""}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive("code") ? "bg-gray-200" : ""}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive("blockquote") ? "bg-gray-200" : ""}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={
              editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""
            }
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={
              editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""
            }
          >
            <Heading2 className="h-4 w-4" />
          </Button>
        </div>

        {/* AI Generation Button - Only show when not read-only */}
        {!readOnly && (
          <div className="flex items-center">
            <AIPromptModal
              onContentGenerated={handleAIContent}
              currentContent={editor.getText()}
            />
          </div>
        )}
      </div>
      <style>{editorStyles}</style>
      <EditorContent editor={editor} className="w-full" />
    </div>
  );
}
