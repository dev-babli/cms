"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Code,
  X,
} from "lucide-react";
import { useState } from "react";

interface SimpleRichEditorProps {
  placeholder?: string;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  showSendButton?: boolean;
  showGroupCheckbox?: boolean;
}

export function SimpleRichEditor({
  placeholder = "Type your message...",
  initialContent = "",
  onContentChange,
  showSendButton = false,
  showGroupCheckbox = false,
}: SimpleRichEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      TextAlign.configure({
        types: ["paragraph"],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[120px] p-4 text-[#111827]",
      },
    },
  });

  // Ensure editor is only rendered on client side
  if (typeof window === 'undefined' || !editor) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB]">
        <div className="p-4 min-h-[120px] flex items-center justify-center text-[#6B7280]">
          Loading editor...
        </div>
      </div>
    );
  }

  const handleAddLink = () => {
    if (linkUrl && linkText) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}">${linkText}</a>`)
        .run();
      setLinkUrl("");
      setLinkText("");
      setShowLinkDialog(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] relative">
      {/* Toolbar */}
      <div className="border-b border-[#E5E7EB] p-2 flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-[#F9FAFB] transition-colors ${
            editor.isActive("bold") ? "bg-[#F3F4F6]" : ""
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4 text-[#6B7280]" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-[#F9FAFB] transition-colors ${
            editor.isActive("italic") ? "bg-[#F3F4F6]" : ""
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4 text-[#6B7280]" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-[#F9FAFB] transition-colors ${
            editor.isActive("underline") ? "bg-[#F3F4F6]" : ""
          }`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4 text-[#6B7280]" />
        </button>
        <div className="w-px h-6 bg-[#E5E7EB] mx-1" />
        <button
          type="button"
          className="p-1.5 rounded hover:bg-[#F9FAFB] transition-colors text-[#6B7280] text-sm font-medium flex items-center gap-1"
          title="Font"
        >
          Aa
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="w-px h-6 bg-[#E5E7EB] mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-1.5 rounded hover:bg-[#F9FAFB] transition-colors ${
            editor.isActive({ textAlign: "left" }) ? "bg-[#F3F4F6]" : ""
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4 text-[#6B7280]" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-1.5 rounded hover:bg-[#F9FAFB] transition-colors ${
            editor.isActive({ textAlign: "center" }) ? "bg-[#F3F4F6]" : ""
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4 text-[#6B7280]" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-1.5 rounded hover:bg-[#F9FAFB] transition-colors ${
            editor.isActive({ textAlign: "right" }) ? "bg-[#F3F4F6]" : ""
          }`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4 text-[#6B7280]" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`p-1.5 rounded hover:bg-[#F9FAFB] transition-colors ${
            editor.isActive({ textAlign: "justify" }) ? "bg-[#F3F4F6]" : ""
          }`}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4 text-[#6B7280]" />
        </button>
        <div className="w-px h-6 bg-[#E5E7EB] mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-[#F9FAFB] transition-colors ${
            editor.isActive("bulletList") ? "bg-[#F3F4F6]" : ""
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4 text-[#6B7280]" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-[#F9FAFB] transition-colors ${
            editor.isActive("orderedList") ? "bg-[#F3F4F6]" : ""
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4 text-[#6B7280]" />
        </button>
        <div className="w-px h-6 bg-[#E5E7EB] mx-1" />
        <button
          type="button"
          onClick={() => setShowLinkDialog(true)}
          className={`p-1.5 rounded hover:bg-[#F9FAFB] transition-colors ${
            editor.isActive("link") ? "bg-[#F3F4F6]" : ""
          }`}
          title="Link"
        >
          <LinkIcon className="w-4 h-4 text-[#6B7280]" />
        </button>
        <button
          type="button"
          className="p-1.5 rounded hover:bg-[#F9FAFB] transition-colors"
          title="Image"
        >
          <ImageIcon className="w-4 h-4 text-[#6B7280]" />
        </button>
        <button
          type="button"
          className="p-1.5 rounded hover:bg-[#F9FAFB] transition-colors"
          title="Video"
        >
          <Video className="w-4 h-4 text-[#6B7280]" />
        </button>
        <div className="w-px h-6 bg-[#E5E7EB] mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded hover:bg-[#F9FAFB] transition-colors ${
            editor.isActive("code") ? "bg-[#F3F4F6]" : ""
          }`}
          title="Code"
        >
          <Code className="w-4 h-4 text-[#6B7280]" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-1.5 rounded hover:bg-[#F9FAFB] transition-colors"
          title="Clear Formatting"
        >
          <X className="w-4 h-4 text-[#6B7280]" />
        </button>
      </div>

      {/* Editor Content */}
      <div className="border-b border-[#E5E7EB]">
        <EditorContent editor={editor} />
      </div>

      {/* Bottom Actions */}
      {(showSendButton || showGroupCheckbox) && (
        <div className="p-3 flex items-center justify-between">
          {showGroupCheckbox && (
            <label className="flex items-center gap-2 text-sm text-[#6B7280]">
              <input type="checkbox" className="rounded" />
              Also send to # groups
            </label>
          )}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded hover:bg-[#F9FAFB] transition-colors">
              <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button className="p-2 rounded hover:bg-[#F9FAFB] transition-colors">
              <ImageIcon className="w-5 h-5 text-[#6B7280]" />
            </button>
            <button className="p-2 rounded hover:bg-[#F9FAFB] transition-colors">
              <Video className="w-5 h-5 text-[#6B7280]" />
            </button>
            <button className="p-2 rounded hover:bg-[#F9FAFB] transition-colors text-[#6B7280] text-sm font-medium">
              @
            </button>
            <button className="p-2 rounded hover:bg-[#F9FAFB] transition-colors text-[#6B7280] text-sm font-medium flex items-center gap-1">
              Aa
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showSendButton && (
              <button className="p-2 rounded hover:bg-[#F9FAFB] transition-colors">
                <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-lg p-4 z-50 min-w-[300px] max-w-md mx-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-[#111827] mb-1">Link URL</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              placeholder="https://..."
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-[#111827] mb-1">Link Text</label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              placeholder="Link text"
            />
          </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowLinkDialog(false)}
                className="px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLink}
                className="px-3 py-1.5 text-sm bg-[#3B82F6] text-white rounded-md hover:bg-[#2563EB]"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

