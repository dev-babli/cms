// Custom Tiptap extensions for social media embeds
import { Node, RawCommands, Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

// Instagram Embed Extension
export const Instagram = Node.create({
  name: 'instagram',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-instagram]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { 'data-instagram': '', class: 'instagram-embed' },
      [
        'iframe',
        {
          src: `https://www.instagram.com/p/${extractInstagramId(HTMLAttributes.url)}/embed`,
          width: '100%',
          height: '500',
          frameborder: '0',
          scrolling: 'no',
          allowtransparency: 'true',
        },
      ],
    ];
  },

  addCommands() {
    return {
      setInstagram:
        (url: string) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: { url },
          });
        },
    } as Partial<RawCommands>;
  },
});

// Twitter/X Embed Extension
export const Twitter = Node.create({
  name: 'twitter',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-twitter]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const tweetId = extractTwitterId(HTMLAttributes.url);
    return [
      'div',
      { 'data-twitter': '', class: 'twitter-embed' },
      [
        'blockquote',
        { class: 'twitter-tweet' },
        [
          'a',
          { href: `https://twitter.com/i/web/status/${tweetId}` },
          'Loading tweet...',
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setTwitter:
        (url: string) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: { url },
          });
        },
    } as Partial<RawCommands>;
  },
});

// TikTok Embed Extension
export const TikTok = Node.create({
  name: 'tiktok',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      url: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-tiktok]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const videoId = extractTikTokId(HTMLAttributes.url);
    return [
      'div',
      { 'data-tiktok': '', class: 'tiktok-embed' },
      [
        'blockquote',
        { class: 'tiktok-embed', cite: HTMLAttributes.url },
        [
          'a',
          { href: HTMLAttributes.url },
          'View on TikTok',
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setTikTok:
        (url: string) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: { url },
          });
        },
    } as Partial<RawCommands>;
  },
});

// Helper functions
function extractInstagramId(url: string): string {
  const match = url.match(/instagram\.com\/p\/([^/]+)/);
  return match ? match[1] : '';
}

function extractTwitterId(url: string): string {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : '';
}

function extractTikTokId(url: string): string {
  const match = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  return match ? match[1] : '';
}

// FontSize Extension
type FontSizeOptions = {
  types: string[];
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              const fontSize = element.style.fontSize;
              if (!fontSize) return null;
              return fontSize.replace(/['"]+/g, '');
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ commands }) => {
          return commands.setMark('textStyle', { fontSize });
        },
      unsetFontSize:
        () =>
        ({ commands }) => {
          return commands.unsetMark('textStyle');
        },
    };
  },
});

// FontFamily Extension
type FontFamilyOptions = {
  types: string[];
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontFamily: {
      setFontFamily: (fontFamily: string) => ReturnType;
      unsetFontFamily: () => ReturnType;
    };
  }
}

export const FontFamily = Extension.create<FontFamilyOptions>({
  name: 'fontFamily',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (element) => element.style.fontFamily.replace(/['"]+/g, ''),
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) {
                return {};
              }
              return { style: `font-family: ${attributes.fontFamily}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontFamily:
        (fontFamily: string) =>
        ({ commands }) => {
          return commands.setMark('textStyle', { fontFamily });
        },
      unsetFontFamily:
        () =>
        ({ commands }) => {
          return commands.unsetMark('textStyle');
        },
    };
  },
});

