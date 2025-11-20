// Custom Tiptap extensions for social media embeds
import { Node, RawCommands } from '@tiptap/core';

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




