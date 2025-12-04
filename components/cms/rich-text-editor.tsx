"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Button } from '@/components/ui/button';
import { Instagram, Twitter, TikTok } from '@/lib/tiptap/extensions';
import { MediaUpload } from './media-upload';
import { useState } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [showVideoUpload, setShowVideoUpload] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                // Disable Link from StarterKit since we're configuring it separately
                link: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto',
                },
            }),
            Youtube.configure({
                width: 640,
                height: 360,
                HTMLAttributes: {
                    class: 'rounded-lg',
                },
            }),
            Instagram,
            Twitter,
            TikTok,
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[400px] p-6 max-w-none',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const addYouTube = () => {
        const url = prompt('Enter YouTube URL:');
        if (url) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    };

    const addInstagram = () => {
        const url = prompt('Enter Instagram post URL:');
        if (url) {
            (editor.chain().focus() as any).setInstagram(url).run();
        }
    };

    const addTwitter = () => {
        const url = prompt('Enter Twitter/X post URL:');
        if (url) {
            (editor.chain().focus() as any).setTwitter(url).run();
        }
    };

    const addTikTok = () => {
        const url = prompt('Enter TikTok video URL:');
        if (url) {
            (editor.chain().focus() as any).setTikTok(url).run();
        }
    };

    const addImageUrl = () => {
        const url = prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="border border-border rounded-xl overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="bg-muted/30 p-3 border-b border-border flex flex-wrap gap-2">
                {/* Text Formatting */}
                <div className="flex gap-1 pr-2 border-r">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-primary/10 text-primary' : ''}`}
                        title="Bold"
                    >
                        <strong>B</strong>
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-primary/10 text-primary' : ''}`}
                        title="Italic"
                    >
                        <em>I</em>
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`h-8 w-8 p-0 ${editor.isActive('strike') ? 'bg-primary/10 text-primary' : ''}`}
                        title="Strikethrough"
                    >
                        <s>S</s>
                    </Button>
                </div>

                {/* Headings */}
                <div className="flex gap-1 pr-2 border-r">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`h-8 px-2 text-xs ${editor.isActive('heading', { level: 2 }) ? 'bg-primary/10 text-primary' : ''}`}
                        title="Heading 2"
                    >
                        H2
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`h-8 px-2 text-xs ${editor.isActive('heading', { level: 3 }) ? 'bg-primary/10 text-primary' : ''}`}
                        title="Heading 3"
                    >
                        H3
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                        className={`h-8 px-2 text-xs ${editor.isActive('heading', { level: 4 }) ? 'bg-primary/10 text-primary' : ''}`}
                        title="Heading 4"
                    >
                        H4
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                        className={`h-8 px-2 text-xs ${editor.isActive('heading', { level: 5 }) ? 'bg-primary/10 text-primary' : ''}`}
                        title="Heading 5"
                    >
                        H5
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                        className={`h-8 px-2 text-xs ${editor.isActive('heading', { level: 6 }) ? 'bg-primary/10 text-primary' : ''}`}
                        title="Heading 6"
                    >
                        H6
                    </Button>
                </div>

                {/* Lists */}
                <div className="flex gap-1 pr-2 border-r">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-primary/10 text-primary' : ''}`}
                        title="Bullet List"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM4 9a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm0 5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-primary/10 text-primary' : ''}`}
                        title="Numbered List"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 9a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                        </svg>
                    </Button>
                </div>

                {/* Media & Embeds */}
                <div className="flex gap-1 pr-2 border-r">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowImageUpload(!showImageUpload)}
                        className="h-8 px-3 text-xs"
                        title="Upload Image"
                    >
                        🖼️ Image
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowVideoUpload(!showVideoUpload)}
                        className="h-8 px-3 text-xs"
                        title="Upload Video"
                    >
                        🎥 Video
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addYouTube}
                        className="h-8 px-3 text-xs"
                        title="YouTube"
                    >
                        ▶️ YouTube
                    </Button>
                </div>

                {/* Social Embeds */}
                <div className="flex gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addInstagram}
                        className="h-8 px-3 text-xs"
                        title="Instagram"
                    >
                        📷 Instagram
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addTwitter}
                        className="h-8 px-3 text-xs"
                        title="Twitter/X"
                    >
                        🐦 Twitter
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addTikTok}
                        className="h-8 px-3 text-xs"
                        title="TikTok"
                    >
                        🎵 TikTok
                    </Button>
                </div>

                {/* Link */}
                <div className="flex gap-1 ml-auto">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            const url = prompt('Enter URL:');
                            if (url) {
                                editor.chain().focus().setLink({ href: url }).run();
                            }
                        }}
                        className={`h-8 w-8 p-0 ${editor.isActive('link') ? 'bg-primary/10 text-primary' : ''}`}
                        title="Add Link"
                    >
                        🔗
                    </Button>
                </div>
            </div>

            {/* Image Upload Panel */}
            {showImageUpload && (
                <div className="p-6 bg-muted/20 border-b">
                    <MediaUpload
                        type="image"
                        onUpload={(url) => {
                            editor.chain().focus().setImage({ src: url }).run();
                            setShowImageUpload(false);
                        }}
                    />
                </div>
            )}

            {/* Video Upload Panel */}
            {showVideoUpload && (
                <div className="p-6 bg-muted/20 border-b">
                    <MediaUpload
                        type="video"
                        onUpload={(url) => {
                            // Insert video as HTML
                            editor.chain().focus().insertContent(`
                <video controls class="rounded-lg max-w-full">
                  <source src="${url}" type="video/mp4">
                </video>
              `).run();
                            setShowVideoUpload(false);
                        }}
                    />
                </div>
            )}

            {/* Editor */}
            <EditorContent editor={editor} />
        </div>
    );
}
