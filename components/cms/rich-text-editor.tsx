"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import Focus from '@tiptap/extension-focus';
import CharacterCount from '@tiptap/extension-character-count';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Mention from '@tiptap/extension-mention';
// 2026: TextStyle is a named export in Tiptap 3.x
import { TextStyle } from '@tiptap/extension-text-style';
import { Button } from '@/components/ui/button';
import { Instagram, Twitter, TikTok, FontSize, FontFamily, FormBuilder, Accordion, Dropdown } from '@/lib/tiptap/extensions';
import { MediaUpload } from './media-upload';
import { ColorPicker } from './color-picker';
import { EmojiPickerButton } from './emoji-picker';
import { FindReplace } from './find-replace';
import { TableMenu } from './table-menu';
import { StatisticsBar } from './statistics-bar';
import { StylesGallery } from './styles-gallery';
import { ContextMenuComponent } from './context-menu';
import { FloatingToolbar } from './floating-toolbar';
import { PageLayout, PageSettings } from './page-layout';
import { ParagraphFormatting } from './paragraph-formatting';
import { LinkDialog } from './link-dialog';
import { PrintPreview } from './print-preview';
import { ShortcutsPanel } from './shortcuts-panel';
import { ZoomControls } from './zoom-controls';
import { DocumentProperties, DocumentInfo } from './document-properties';
import { FontDialog } from './font-dialog';
import { ExportMenu } from './export-menu';
import { Ruler } from './ruler';
import { ThemeSelector } from './theme-selector';
import { ImageToolbar } from './image-toolbar';
import { BordersShading } from './borders-shading';
import { InlineFormattingPanel } from './inline-formatting-panel';
import { InlineLinkInput } from './inline-link-input';
import { InlineSettingsSidebar } from './inline-settings-sidebar';
import { useState, useEffect } from 'react';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough, Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, CheckSquare, Link as LinkIcon, Image as ImageIcon, Video,
    Youtube as YoutubeIcon, Instagram as InstagramIcon, Twitter as TwitterIcon,
    Music, Table as TableIcon, Minus, Quote, Code, Code2, Undo, Redo, Search,
    X, Maximize2, Minimize2, Eye, EyeOff, FileCode, Type, Palette, Highlighter,
    Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Smile, MoreHorizontal,
    FileText, Layout, Printer, Keyboard, Settings, AlignJustify as AlignJustifyIcon,
    Indent, Outdent, Calendar, Hash, Bookmark, FileX, Grid, FileEdit,
    ZoomIn, ZoomOut, Maximize, Minimize, Square, FormInput, ChevronDown, HelpCircle,
    ListChecks, FileQuestion
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = 'Start typing...' }: RichTextEditorProps) {
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [showVideoUpload, setShowVideoUpload] = useState(false);
    const [showFindReplace, setShowFindReplace] = useState(false);
    const [showTableMenu, setShowTableMenu] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [showSourceCode, setShowSourceCode] = useState(false);
    const [textColor, setTextColor] = useState('#000000');
    const [highlightColor, setHighlightColor] = useState('#FFFF00');
    const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'design' | 'layout' | 'review'>('home');
    const [showPageLayout, setShowPageLayout] = useState(false);
    const [showInlineFormatting, setShowInlineFormatting] = useState(false);
    const [formattingTab, setFormattingTab] = useState<'font' | 'paragraph' | 'borders'>('font');
    const [showInlineLink, setShowInlineLink] = useState(false);
    const [showInlineSettings, setShowInlineSettings] = useState(false);
    const [settingsTab, setSettingsTab] = useState<'page' | 'document' | 'shortcuts'>('page');
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [showRuler, setShowRuler] = useState(true);
    const [zoom, setZoom] = useState(100);
    const [pageSettings, setPageSettings] = useState<PageSettings | null>(null);
    const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
    const [viewMode, setViewMode] = useState<'print' | 'web' | 'draft'>('print');

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                link: false,
                codeBlock: {
                    HTMLAttributes: {
                        class: 'bg-muted p-4 rounded-lg font-mono text-sm border border-border',
                    },
                },
                blockquote: {
                    HTMLAttributes: {
                        class: 'border-l-4 border-primary pl-4 italic my-4 text-muted-foreground',
                    },
                },
                bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc list-outside my-4 space-y-2 ml-6',
                    },
                },
                orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal list-outside my-4 space-y-2 ml-6',
                    },
                },
            }),
            TextStyle,
            FontSize,
            FontFamily,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                defaultAlignment: 'left',
                alignments: ['left', 'center', 'right', 'justify'],
            }),
            Underline,
            Subscript,
            Superscript,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            TaskList.configure({
                HTMLAttributes: {
                    class: 'my-4 space-y-2',
                },
            }),
            TaskItem.configure({
                nested: true,
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse border border-border my-4 w-full',
                },
            }),
            TableRow,
            TableHeader,
            TableCell,
            Typography,
            Placeholder.configure({
                placeholder,
            }),
            Focus,
            CharacterCount,
            Dropcursor,
            Gapcursor,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline hover:text-primary/80',
                },
            }),
            Image.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        style: {
                            default: null,
                            parseHTML: (element) => {
                                const style = element.getAttribute('style');
                                return style || null;
                            },
                            renderHTML: (attributes) => {
                                if (!attributes.style) {
                                    return {};
                                }
                                return { style: attributes.style };
                            },
                        },
                        class: {
                            default: 'rounded-lg max-w-full h-auto',
                            parseHTML: (element) => {
                                const className = element.getAttribute('class');
                                return className || 'rounded-lg max-w-full h-auto';
                            },
                            renderHTML: (attributes) => {
                                return { class: attributes.class || 'rounded-lg max-w-full h-auto' };
                            },
                        },
                    };
                },
            }).configure({
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
            Mention.configure({
                HTMLAttributes: {
                    class: 'mention bg-primary/10 text-primary px-1 rounded',
                },
                suggestion: {
                    items: ({ query }: { query: string }) => {
                        const users = [
                            { id: '1', label: 'John Doe' },
                            { id: '2', label: 'Jane Smith' },
                            { id: '3', label: 'Bob Johnson' },
                        ];
                        return users.filter(user => 
                            user.label.toLowerCase().includes(query.toLowerCase())
                        ).slice(0, 5);
                    },
                    char: '@',
                },
            }),
            Instagram,
            Twitter,
            TikTok,
            FormBuilder,
            Accordion,
            Dropdown,
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[500px] p-8 max-w-none bg-white transition-all duration-300 ${
                    viewMode === 'print' ? 'max-w-4xl mx-auto' : 
                    viewMode === 'web' ? 'max-w-6xl mx-auto' : 
                    'max-w-full'
                }`,
                role: 'textbox',
                'aria-label': 'Rich text editor',
                'aria-multiline': 'true',
                'aria-describedby': 'editor-description',
            },
        },
    });

    // Sync content when prop changes
    useEffect(() => {
        if (editor && !editor.isDestroyed && content !== editor.getHTML()) {
            editor.commands.setContent(content, false);
        }
    }, [content, editor]);

    useEffect(() => {
        if (editor && !editor.isDestroyed) {
            const handleKeyDown = (event: KeyboardEvent) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
                    event.preventDefault();
                    setShowFindReplace(true);
                }
                if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
                    event.preventDefault();
                    setShowFindReplace(true);
                }
                if ((event.ctrlKey || event.metaKey) && event.key === '/') {
                    event.preventDefault();
                    setSettingsTab('shortcuts');
                    setShowInlineSettings(true);
                }
                if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
                    event.preventDefault();
                    setShowPrintPreview(true);
                }
            };

            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [editor]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (!isFullscreen) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    const toggleFocusMode = () => {
        setIsFocusMode(!isFocusMode);
    };

    const clearFormatting = () => {
        editor?.chain().focus().clearNodes().unsetAllMarks().run();
    };

    const insertHorizontalRule = () => {
        editor?.chain().focus().setHorizontalRule().run();
    };

    const toggleCodeBlock = () => {
        editor?.chain().focus().toggleCodeBlock().run();
    };

    const toggleInlineCode = () => {
        editor?.chain().focus().toggleCode().run();
    };

    const toggleBlockquote = () => {
        editor?.chain().focus().toggleBlockquote().run();
    };

    const unlink = () => {
        editor?.chain().focus().unsetLink().run();
    };

    const addYouTube = () => {
        const url = prompt('Enter YouTube URL:');
        if (url) {
            editor?.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    };

    const addInstagram = () => {
        const url = prompt('Enter Instagram post URL:');
        if (url) {
            (editor?.chain().focus() as any).setInstagram(url).run();
        }
    };

    const addTwitter = () => {
        const url = prompt('Enter Twitter/X post URL:');
        if (url) {
            (editor?.chain().focus() as any).setTwitter(url).run();
        }
    };

    const addTikTok = () => {
        const url = prompt('Enter TikTok video URL:');
        if (url) {
            (editor?.chain().focus() as any).setTikTok(url).run();
        }
    };

    const setImageAlignment = (alignment: 'left' | 'center' | 'right') => {
        if (!editor) return;
        const attrs = editor.getAttributes('image');
        let style = '';
        let className = 'rounded-lg max-w-full h-auto';

        if (alignment === 'left') {
            style = 'float: left; margin-right: 1rem;';
            className += ' float-left mr-4';
        } else if (alignment === 'right') {
            style = 'float: right; margin-left: 1rem;';
            className += ' float-right ml-4';
        } else {
            style = 'display: block; margin: 0 auto;';
            className += ' block mx-auto';
        }

        editor.chain().focus().updateAttributes('image', {
            ...(attrs || {}),
            style: style || (attrs?.style as string | undefined),
            class: className,
        } as any).run();
    };

    const handleEmojiClick = (emoji: string) => {
        editor?.chain().focus().insertContent(emoji).run();
    };

    if (!editor) {
        return (
            <div className="border border-border rounded-lg bg-white p-8 flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Sanity Studio Design - Minimal Toolbar Button
    const ToolbarButton = ({ 
        onClick, 
        isActive = false, 
        icon: Icon, 
        label, 
        shortcut,
        className = '',
        children 
    }: { 
        onClick: () => void; 
        isActive?: boolean; 
        icon?: any; 
        label: string; 
        shortcut?: string;
        className?: string;
        children?: React.ReactNode;
    }) => (
        <button
            type="button"
            onClick={onClick}
            className={`
                relative flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md
                transition-colors duration-150 ease-out text-sm font-medium
                ${isActive 
                    ? 'bg-[#F9FAFB] text-[#111827]' 
                    : 'bg-transparent hover:bg-[#F9FAFB] text-[#6B7280] hover:text-[#111827]'
                }
                ${className}
            `}
            title={shortcut ? `${label} (${shortcut})` : label}
            aria-label={label}
            aria-pressed={isActive}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {children}
            {label && <span className="text-xs">{label}</span>}
        </button>
    );

    const ToolbarGroup = ({ title, children, className = '' }: { title?: string; children: React.ReactNode; className?: string }) => (
        <div className={`flex items-center gap-2 border-r border-border/60 pr-4 mr-2 ${className}`}>
            {title && <span className="text-xs text-muted-foreground mr-1 font-semibold uppercase tracking-wide whitespace-nowrap">{title}</span>}
            <div className="flex items-center gap-1.5">
                {children}
            </div>
        </div>
    );

    const editorClasses = isFullscreen
        ? 'fixed inset-0 z-50 bg-white'
        : 'border border-[#E5E7EB] rounded-md overflow-hidden bg-white relative w-full max-w-full';

    return (
        <div className={editorClasses}>
            {!isFocusMode && (
                <>
                    {/* Ribbon-Style Toolbar */}
                    <div className="bg-white border-b border-[#E5E7EB]">
                        {/* Tab Navigation */}
                        <div className="flex items-center border-b border-[#E5E7EB] bg-white overflow-x-auto">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveTab('home');
                                }}
                                className={`px-6 py-2.5 text-sm font-medium transition-colors relative ${
                                    activeTab === 'home'
                                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                            >
                                Home
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveTab('insert');
                                }}
                                className={`px-6 py-2.5 text-sm font-medium transition-colors relative ${
                                    activeTab === 'insert'
                                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                }`}
                            >
                                Insert
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveTab('design');
                                }}
                                className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out relative ${
                                    activeTab === 'design'
                                        ? 'text-[#111827] border-b-2 border-[#3B82F6]'
                                        : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                                }`}
                            >
                                Design
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveTab('layout');
                                }}
                                className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out relative ${
                                    activeTab === 'layout'
                                        ? 'text-[#111827] border-b-2 border-[#3B82F6]'
                                        : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                                }`}
                            >
                                Layout
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveTab('review');
                                }}
                                className={`px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out relative ${
                                    activeTab === 'review'
                                        ? 'text-[#111827] border-b-2 border-[#3B82F6]'
                                        : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                                }`}
                            >
                                Review
                            </button>
                            <div className="ml-auto flex items-center gap-2 px-4">
                                <ZoomControls zoom={zoom} onZoomChange={setZoom} />
                                <div className="w-px h-6 bg-border mx-2" />
                                <ToolbarButton
                                    onClick={toggleFocusMode}
                                    icon={isFocusMode ? EyeOff : Eye}
                                    label="Focus"
                                    className="h-8"
                                />
                                <ToolbarButton
                                    onClick={toggleFullscreen}
                                    icon={isFullscreen ? Minimize2 : Maximize2}
                                    label="Fullscreen"
                                    className="h-8"
                                />
                                <ThemeSelector />
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="p-4 bg-white min-h-[64px] overflow-x-auto border-b border-[#E5E7EB]">
                            {activeTab === 'home' && (
                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Clipboard Group */}
                                    <ToolbarGroup title="Clipboard">
                                        <ToolbarButton
                                            onClick={() => editor.chain().focus().undo().run()}
                                            icon={Undo}
                                            label="Undo"
                                            shortcut="Ctrl+Z"
                                            isActive={false}
                                            className="h-9"
                                        />
                                        <ToolbarButton
                                            onClick={() => editor.chain().focus().redo().run()}
                                            icon={Redo}
                                            label="Redo"
                                            shortcut="Ctrl+Shift+Z"
                                            isActive={false}
                                            className="h-9"
                                        />
                                    </ToolbarGroup>

                                    {/* Font Group */}
                                    <ToolbarGroup title="Font">
                                        <button
                                            onClick={() => {
                                                setFormattingTab('font');
                                                setShowInlineFormatting(true);
                                            }}
                                            className="h-9 px-3 text-sm border border-border bg-background rounded-md hover:bg-muted transition-all duration-200 flex items-center gap-2 hover:scale-105"
                                            title="Font Options"
                                        >
                                            <Type className="w-4 h-4" />
                                            Font
                                        </button>
                                        <select
                                            onChange={(e) => {
                                                const family = e.target.value;
                                                if (!editor) return;
                                                if (family === 'default') {
                                                    editor.chain().focus().unsetFontFamily().run();
                                                } else {
                                                    try {
                                                        editor.chain().focus().setFontFamily(family).run();
                                                    } catch (error) {
                                                        console.error('Error setting font family:', error);
                                                    }
                                                }
                                            }}
                                            className="h-9 px-3 text-sm border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[120px] transition-all duration-200 hover:border-primary/50"
                                            title="Font Family"
                                        >
                                            <option value="default">Font</option>
                                            <option value="Arial">Arial</option>
                                            <option value="Helvetica">Helvetica</option>
                                            <option value="Times New Roman">Times New Roman</option>
                                            <option value="Courier New">Courier New</option>
                                            <option value="Georgia">Georgia</option>
                                            <option value="Verdana">Verdana</option>
                                            <option value="Comic Sans MS">Comic Sans MS</option>
                                        </select>
                                        <select
                                            onChange={(e) => {
                                                const size = e.target.value;
                                                if (!editor) return;
                                                if (size === 'default') {
                                                    editor.chain().focus().unsetFontSize().run();
                                                } else {
                                                    try {
                                                        editor.chain().focus().setFontSize(size).run();
                                                    } catch (error) {
                                                        console.error('Error setting font size:', error);
                                                    }
                                                }
                                            }}
                                            className="h-9 px-3 text-sm border border-border bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[80px] transition-all duration-200 hover:border-primary/50"
                                            title="Font Size"
                                        >
                                            <option value="default">Size</option>
                                            <option value="12px">12</option>
                                            <option value="14px">14</option>
                                            <option value="16px">16</option>
                                            <option value="18px">18</option>
                                            <option value="20px">20</option>
                                            <option value="24px">24</option>
                                            <option value="28px">28</option>
                                            <option value="32px">32</option>
                                            <option value="36px">36</option>
                                            <option value="48px">48</option>
                                        </select>
                                        <div className="flex items-center gap-1">
                                            <ToolbarButton
                                                onClick={() => editor.chain().focus().toggleBold().run()}
                                                icon={Bold}
                                                label=""
                                                shortcut="Ctrl+B"
                                                isActive={editor.isActive('bold')}
                                                className="h-9 w-9"
                                            />
                                            <ToolbarButton
                                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                                icon={Italic}
                                                label=""
                                                shortcut="Ctrl+I"
                                                isActive={editor.isActive('italic')}
                                                className="h-9 w-9"
                                            />
                                            <ToolbarButton
                                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                                icon={UnderlineIcon}
                                                label=""
                                                shortcut="Ctrl+U"
                                                isActive={editor.isActive('underline')}
                                                className="h-9 w-9"
                                            />
                                            <ToolbarButton
                                                onClick={() => editor.chain().focus().toggleStrike().run()}
                                                icon={Strikethrough}
                                                label=""
                                                isActive={editor.isActive('strike')}
                                                className="h-9 w-9"
                                            />
                                            <ToolbarButton
                                                onClick={() => editor.chain().focus().toggleSubscript().run()}
                                                icon={SubscriptIcon}
                                                label=""
                                                isActive={editor.isActive('subscript')}
                                                className="h-9 w-9"
                                            />
                                            <ToolbarButton
                                                onClick={() => editor.chain().focus().toggleSuperscript().run()}
                                                icon={SuperscriptIcon}
                                                label=""
                                                isActive={editor.isActive('superscript')}
                                                className="h-9 w-9"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1 border-l border-border pl-2">
                                            <ColorPicker
                                                color={textColor}
                                                onChange={(color) => {
                                                    setTextColor(color);
                                                    editor.chain().focus().setColor(color).run();
                                                }}
                                                label="Text Color"
                                            />
                                            <ColorPicker
                                                color={highlightColor}
                                                onChange={(color) => {
                                                    setHighlightColor(color);
                                                    editor.chain().focus().toggleHighlight({ color }).run();
                                                }}
                                                label="Highlight"
                                                presetColors={['#FFFF00', '#FF0000', '#00FF00', '#0000FF', '#FFA500']}
                                            />
                                        </div>
                                    </ToolbarGroup>

                                    {/* Paragraph Group */}
                                    <ToolbarGroup title="Paragraph">
                                        <div className="flex items-center gap-1">
                                            <ToolbarButton
                                                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                                icon={AlignLeft}
                                                label=""
                                                isActive={editor.isActive({ textAlign: 'left' })}
                                                className="h-9 w-9"
                                            />
                                            <ToolbarButton
                                                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                                icon={AlignCenter}
                                                label=""
                                                isActive={editor.isActive({ textAlign: 'center' })}
                                                className="h-9 w-9"
                                            />
                                            <ToolbarButton
                                                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                                icon={AlignRight}
                                                label=""
                                                isActive={editor.isActive({ textAlign: 'right' })}
                                                className="h-9 w-9"
                                            />
                                            <ToolbarButton
                                                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                                                icon={AlignJustify}
                                                label=""
                                                isActive={editor.isActive({ textAlign: 'justify' })}
                                                className="h-9 w-9"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1 border-l border-border pl-2">
                                            <ToolbarButton
                                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                                icon={List}
                                                label=""
                                                isActive={editor.isActive('bulletList')}
                                                className="h-9 w-9"
                                                title="Bullet List"
                                            />
                                            <ToolbarButton
                                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                                icon={ListOrdered}
                                                label=""
                                                isActive={editor.isActive('orderedList')}
                                                className="h-9 w-9"
                                                title="Numbered List"
                                            />
                                            <ToolbarButton
                                                onClick={() => editor.chain().focus().toggleTaskList().run()}
                                                icon={CheckSquare}
                                                label=""
                                                isActive={editor.isActive('taskList')}
                                                className="h-9 w-9"
                                                title="Task List"
                                            />
                                            <ToolbarButton
                                                onClick={() => editor.chain().focus().setAccordion({ title: 'FAQ Item', open: false }).run()}
                                                icon={ListChecks}
                                                label=""
                                                className="h-9 w-9"
                                                title="FAQ Accordion"
                                            />
                                        </div>
                                    </ToolbarGroup>

                                    {/* Styles Group */}
                                    <ToolbarGroup title="Styles">
                                        <StylesGallery editor={editor} />
                                    </ToolbarGroup>

                                    {/* Paragraph Group - Enhanced */}
                                    <ToolbarGroup title="Paragraph">
                                        <ToolbarButton
                                            onClick={() => {
                                                setFormattingTab('paragraph');
                                                setShowInlineFormatting(true);
                                            }}
                                            icon={AlignJustifyIcon}
                                            label="Format"
                                            className="h-9"
                                        />
                                        <ToolbarButton
                                            onClick={() => {
                                                setFormattingTab('borders');
                                                setShowInlineFormatting(true);
                                            }}
                                            icon={Square}
                                            label="Borders"
                                            className="h-9"
                                        />
                                    </ToolbarGroup>

                                    {/* Editing Group */}
                                    <ToolbarGroup title="Editing">
                                        <ToolbarButton
                                            onClick={() => setShowFindReplace(!showFindReplace)}
                                            icon={Search}
                                            label="Find"
                                            shortcut="Ctrl+F"
                                            className="h-9"
                                        />
                                        <ToolbarButton
                                            onClick={clearFormatting}
                                            icon={X}
                                            label="Clear"
                                            className="h-9"
                                        />
                                    </ToolbarGroup>
                                </div>
                            )}

                            {activeTab === 'insert' && (
                                <div className="flex items-center gap-3 flex-wrap min-w-max">
                                    <ToolbarGroup title="Pages">
                                        <ToolbarButton
                                            onClick={insertHorizontalRule}
                                            icon={Minus}
                                            label="Horizontal Line"
                                            className="h-9"
                                        />
                                    </ToolbarGroup>

                                    <ToolbarGroup title="Tables">
                                        <ToolbarButton
                                            onClick={() => setShowTableMenu(!showTableMenu)}
                                            icon={TableIcon}
                                            label="Table"
                                            isActive={editor.isActive('table')}
                                            className="h-9"
                                        />
                                    </ToolbarGroup>

                                    <ToolbarGroup title="Illustrations">
                                        <ToolbarButton
                                            onClick={() => setShowImageUpload(!showImageUpload)}
                                            icon={ImageIcon}
                                            label="Image"
                                            className="h-9"
                                        />
                                        <ToolbarButton
                                            onClick={() => setShowVideoUpload(!showVideoUpload)}
                                            icon={Video}
                                            label="Video"
                                            className="h-9"
                                        />
                                    </ToolbarGroup>

                                    <ToolbarGroup title="Media">
                                        <ToolbarButton
                                            onClick={addYouTube}
                                            icon={YoutubeIcon}
                                            label="YouTube"
                                            className="h-9"
                                        />
                                        <ToolbarButton
                                            onClick={addInstagram}
                                            icon={InstagramIcon}
                                            label="Instagram"
                                            className="h-9"
                                        />
                                        <ToolbarButton
                                            onClick={addTwitter}
                                            icon={TwitterIcon}
                                            label="Twitter"
                                            className="h-9"
                                        />
                                        <ToolbarButton
                                            onClick={addTikTok}
                                            icon={Music}
                                            label="TikTok"
                                            className="h-9"
                                        />
                                    </ToolbarGroup>

                                    <ToolbarGroup title="Links">
                                        <div className="relative">
                                            <ToolbarButton
                                                onClick={() => setShowInlineLink(!showInlineLink)}
                                                icon={LinkIcon}
                                                label="Link"
                                                shortcut="Ctrl+K"
                                                isActive={editor.isActive('link') || showInlineLink}
                                                className="h-9"
                                            />
                                            <InlineLinkInput
                                                editor={editor}
                                                isOpen={showInlineLink}
                                                onClose={() => setShowInlineLink(false)}
                                            />
                                        </div>
                                        {editor.isActive('link') && (
                                            <ToolbarButton
                                                onClick={unlink}
                                                icon={X}
                                                label="Unlink"
                                                className="h-9"
                                            />
                                        )}
                                    </ToolbarGroup>

                                    <ToolbarGroup title="Text">
                                        <ToolbarButton
                                            onClick={toggleBlockquote}
                                            icon={Quote}
                                            label="Quote"
                                            isActive={editor.isActive('blockquote')}
                                            className="h-9"
                                        />
                                        <ToolbarButton
                                            onClick={toggleCodeBlock}
                                            icon={Code}
                                            label="Code Block"
                                            isActive={editor.isActive('codeBlock')}
                                            className="h-9"
                                        />
                                        <ToolbarButton
                                            onClick={toggleInlineCode}
                                            icon={Code2}
                                            label="Inline Code"
                                            isActive={editor.isActive('code')}
                                            className="h-9"
                                        />
                                    </ToolbarGroup>

                                    <ToolbarGroup title="Forms & Interactive">
                                        <ToolbarButton
                                            onClick={() => editor.chain().focus().setFormBuilder().run()}
                                            icon={FormInput}
                                            label="Form"
                                            className="h-9"
                                        />
                                        <ToolbarButton
                                            onClick={() => editor.chain().focus().setDropdown().run()}
                                            icon={ChevronDown}
                                            label="Dropdown"
                                            className="h-9"
                                        />
                                        <ToolbarButton
                                            onClick={() => editor.chain().focus().setAccordion({ title: 'FAQ Question', open: false }).run()}
                                            icon={HelpCircle}
                                            label="FAQ"
                                            className="h-9"
                                        />
                                    </ToolbarGroup>

                                    <ToolbarGroup>
                                        <EmojiPickerButton onEmojiClick={handleEmojiClick} />
                                    </ToolbarGroup>
                                </div>
                            )}

                            {activeTab === 'design' && (
                                <div className="flex items-center gap-3 flex-wrap min-w-max">
                                    <ToolbarGroup title="Document">
                                        <ToolbarButton
                                            onClick={() => setShowSourceCode(!showSourceCode)}
                                            icon={FileCode}
                                            label="Source Code"
                                            isActive={showSourceCode}
                                            className="h-9"
                                        />
                                        <ToolbarButton
                                            onClick={() => {
                                                setSettingsTab('document');
                                                setShowInlineSettings(true);
                                            }}
                                            icon={FileText}
                                            label="Properties"
                                            className="h-9"
                                        />
                                    </ToolbarGroup>
                                    <ToolbarGroup title="View">
                                        <div className="flex items-center gap-1 border border-border rounded-md p-1">
                                            <button
                                                onClick={() => setViewMode('print')}
                                                className={`px-3 py-1 text-xs rounded transition-colors ${
                                                    viewMode === 'print' 
                                                        ? 'bg-primary text-primary-foreground' 
                                                        : 'hover:bg-muted'
                                                }`}
                                            >
                                                Print Layout
                                            </button>
                                            <button
                                                onClick={() => setViewMode('web')}
                                                className={`px-3 py-1 text-xs rounded transition-colors ${
                                                    viewMode === 'web' 
                                                        ? 'bg-primary text-primary-foreground' 
                                                        : 'hover:bg-muted'
                                                }`}
                                            >
                                                Web Layout
                                            </button>
                                            <button
                                                onClick={() => setViewMode('draft')}
                                                className={`px-3 py-1 text-xs rounded transition-colors ${
                                                    viewMode === 'draft' 
                                                        ? 'bg-primary text-primary-foreground' 
                                                        : 'hover:bg-muted'
                                                }`}
                                            >
                                                Draft
                                            </button>
                                        </div>
                                        <ToolbarButton
                                            onClick={() => setShowPrintPreview(true)}
                                            icon={Printer}
                                            label="Print"
                                            shortcut="Ctrl+P"
                                            className="h-9"
                                        />
                                        <ToolbarButton
                                            onClick={() => {
                                                setSettingsTab('shortcuts');
                                                setShowInlineSettings(true);
                                            }}
                                            icon={Keyboard}
                                            label="Shortcuts"
                                            shortcut="Ctrl+/"
                                            className="h-9"
                                        />
                                        <ToolbarButton
                                            onClick={() => setShowRuler(!showRuler)}
                                            icon={Layout}
                                            label="Ruler"
                                            isActive={showRuler}
                                            className="h-9"
                                        />
                                    </ToolbarGroup>
                                    <ToolbarGroup title="Export">
                                        <ExportMenu editor={editor} />
                                    </ToolbarGroup>
                                </div>
                            )}

                            {activeTab === 'layout' && (
                                <div className="flex items-center gap-3 flex-wrap min-w-max">
                                    <ToolbarGroup title="Page Setup">
                                        <ToolbarButton
                                            onClick={() => {
                                                setSettingsTab('page');
                                                setShowInlineSettings(true);
                                            }}
                                            icon={Layout}
                                            label="Page Setup"
                                            className="h-9"
                                        />
                                    </ToolbarGroup>
                                    <ToolbarGroup title="Page Background">
                                        <ToolbarButton
                                            onClick={() => {
                                                const color = prompt('Enter page color (hex):', '#FFFFFF');
                                                if (color) {
                                                    // Apply page background color
                                                    document.body.style.backgroundColor = color;
                                                }
                                            }}
                                            icon={Palette}
                                            label="Page Color"
                                            className="h-9"
                                        />
                                    </ToolbarGroup>
                                    <ToolbarGroup title="Breaks">
                                        <ToolbarButton
                                            onClick={() => {
                                                editor.chain().focus().insertContent('<div style="page-break-after: always;"></div>').run();
                                            }}
                                            icon={FileX}
                                            label="Page Break"
                                            className="h-9"
                                        />
                                    </ToolbarGroup>
                                </div>
                            )}

                            {activeTab === 'review' && (
                                <div className="flex items-center gap-3 flex-wrap min-w-max">
                                    <ToolbarGroup title="Proofing">
                                        <ToolbarButton
                                            onClick={() => {
                                                alert('Spell check feature - to be implemented');
                                            }}
                                            icon={FileText}
                                            label="Spelling"
                                            className="h-9"
                                        />
                                    </ToolbarGroup>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image Toolbar - Inline */}
                    {editor.isActive('image') && (
                        <div className="absolute z-50 top-4 left-1/2 transform -translate-x-1/2 animate-in slide-in-from-top-2 fade-in-0 duration-200">
                            <ImageToolbar editor={editor} onClose={() => {}} />
                        </div>
                    )}

                    {/* Find & Replace - Inline */}
                    {showFindReplace && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-[#E5E7EB] rounded-md p-4 mx-4 max-h-[400px] overflow-y-auto" style={{ maxWidth: 'calc(100% - 2rem)' }}>
                            <FindReplace editor={editor} onClose={() => setShowFindReplace(false)} />
                        </div>
                    )}

                    {/* Table Menu - Inline */}
                    {showTableMenu && (
                        <div className="absolute z-50 top-full left-0 mt-2 bg-white border border-[#E5E7EB] rounded-md p-4 min-w-[300px] max-w-[500px] max-h-[500px] overflow-y-auto" style={{ maxWidth: 'min(500px, calc(100vw - 2rem))' }}>
                            <TableMenu editor={editor} onClose={() => setShowTableMenu(false)} />
                        </div>
                    )}

                    {/* Inline Formatting Panel */}
                    {showInlineFormatting && (
                        <div className="absolute inset-0 z-40 pointer-events-none">
                            <div className="absolute inset-y-0 right-0 pointer-events-auto">
                                <InlineFormattingPanel
                                    editor={editor}
                                    isOpen={showInlineFormatting}
                                    onClose={() => setShowInlineFormatting(false)}
                                    activeTab={formattingTab}
                                />
                            </div>
                        </div>
                    )}

                    {/* Inline Settings Sidebar */}
                    {showInlineSettings && (
                        <div className="absolute inset-0 z-40 pointer-events-none">
                            <div className="absolute inset-y-0 right-0 pointer-events-auto">
                                <InlineSettingsSidebar
                                    isOpen={showInlineSettings}
                                    onClose={() => setShowInlineSettings(false)}
                                    activeTab={settingsTab}
                                    pageSettings={pageSettings}
                                    documentInfo={documentInfo}
                                    onPageSettingsChange={(settings) => setPageSettings(settings)}
                                    onDocumentInfoChange={(info) => setDocumentInfo(info)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Print Preview */}
                    {showPrintPreview && (
                        <PrintPreview
                            editor={editor}
                            onClose={() => setShowPrintPreview(false)}
                        />
                    )}



                    {/* Image Upload Panel - Inline */}
                    {showImageUpload && (
                        <div className="p-4 bg-white border-b border-[#E5E7EB]">
                            <MediaUpload
                                type="image"
                                onUpload={(url) => {
                                    editor.chain().focus().setImage({
                                        src: url,
                                        style: 'display: block; margin: 0 auto;',
                                        class: 'rounded-lg max-w-full h-auto block mx-auto',
                                    } as any).run();
                                    setShowImageUpload(false);
                                }}
                            />
                        </div>
                    )}

                    {/* Video Upload Panel - Inline */}
                    {showVideoUpload && (
                        <div className="p-4 bg-white border-b border-[#E5E7EB]">
                            <MediaUpload
                                type="video"
                                onUpload={(url) => {
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

                    {/* Source Code View */}
                    {showSourceCode ? (
                        <div className="p-6 bg-white min-h-[500px] border border-[#E5E7EB] rounded-md">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-[#111827] font-medium text-sm">Source Code</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigator.clipboard.writeText(editor.getHTML())}
                                    className="text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors duration-150 ease-out h-8"
                                >
                                    Copy HTML
                                </Button>
                            </div>
                            <textarea
                                value={editor.getHTML()}
                                onChange={(e) => editor.commands.setContent(e.target.value)}
                                className="w-full h-[500px] font-mono text-sm text-[#111827] bg-white border border-[#E5E7EB] rounded-md p-4 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] resize-none"
                                style={{ minHeight: '500px' }}
                            />
                        </div>
                    ) : (
                        <ContextMenuComponent editor={editor}>
                                <div className="relative bg-white overflow-hidden w-full">
                                {showRuler && <Ruler />}
                                <FloatingToolbar editor={editor} />
                                <div 
                                    className="transition-transform duration-300 overflow-auto w-full"
                                    style={{ 
                                        transform: zoom !== 100 ? `scale(${zoom / 100})` : 'none', 
                                        transformOrigin: 'top left',
                                        minHeight: zoom !== 100 ? `${100 / (zoom / 100)}%` : 'auto',
                                        maxHeight: 'calc(100vh - 300px)',
                                        width: zoom !== 100 ? `${100 / (zoom / 100)}%` : '100%'
                                    }}
                                >
                                    <div id="editor-description" className="sr-only">
                                        Rich text editor with formatting options. Use keyboard shortcuts for quick access to features.
                                    </div>
                                    <EditorContent editor={editor} />
                                </div>
                            </div>
                        </ContextMenuComponent>
                    )}

                    {/* Statistics Bar */}
                    <div className="border-t border-border">
                        <StatisticsBar editor={editor} />
                    </div>
                </>
            )}

            {/* Focus Mode */}
            {isFocusMode && (
                <div className="relative">
                    <div className="absolute top-4 right-4 z-10">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={toggleFocusMode}
                            className="h-8 px-3 text-xs bg-white border border-[#E5E7EB]"
                        >
                            <EyeOff className="w-4 h-4 mr-2" />
                            Exit Focus
                        </Button>
                    </div>
                    <EditorContent editor={editor} />
                </div>
            )}
        </div>
    );
}
