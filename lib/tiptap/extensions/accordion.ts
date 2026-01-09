import { Node, mergeAttributes } from '@tiptap/core';

export interface AccordionOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    accordion: {
      /**
       * Insert an accordion/FAQ item
       */
      setAccordion: (options?: { title?: string; content?: string; open?: boolean }) => ReturnType;
      /**
       * Toggle accordion open/closed
       */
      toggleAccordion: () => ReturnType;
    };
  }
}

export const Accordion = Node.create<AccordionOptions>({
  name: 'accordion',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'paragraph+',

  addAttributes() {
    return {
      title: {
        default: 'FAQ Question',
        parseHTML: (element) => element.getAttribute('data-title'),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }
          return {
            'data-title': attributes.title,
          };
        },
      },
      open: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-open') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.open) {
            return {};
          }
          return {
            'data-open': attributes.open,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="accordion"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const isOpen = node.attrs.open || false;
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'accordion',
        class: `accordion-wrapper my-4 border border-border rounded-lg overflow-hidden bg-white shadow-sm transition-all duration-200 ${isOpen ? 'shadow-md' : ''}`,
      }),
      [
        'div',
        {
          class: 'accordion-header flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 cursor-pointer hover:from-primary/10 hover:to-primary/15 transition-all duration-200',
          'data-accordion-toggle': 'true',
        },
        [
          'h3',
          {
            class: 'text-base font-semibold text-foreground flex-1 pr-4',
          },
          node.attrs.title || 'FAQ Question',
        ],
        [
          'svg',
          {
            class: `w-5 h-5 text-primary transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`,
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
          },
          [
            'path',
            {
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              'stroke-width': '2',
              d: 'M19 9l-7 7-7-7',
            },
          ],
        ],
      ],
      [
        'div',
        {
          class: `accordion-content overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`,
        },
        ['div', { class: 'p-4 text-foreground/80' }, 0],
      ],
    ];
  },

  addCommands() {
    return {
      setAccordion:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              title: options?.title || 'FAQ Question',
              open: options?.open || false,
            },
            content: options?.content
              ? [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: options.content }],
                  },
                ]
              : [
                  {
                    type: 'paragraph',
                  },
                ],
          });
        },
      toggleAccordion:
        () =>
        ({ commands, state, dispatch }) => {
          const { selection } = state;
          const { $from } = selection;
          const node = $from.node(-1);
          
          if (node && node.type.name === this.name) {
            if (dispatch) {
              const pos = $from.before(-1);
              const attrs = { ...node.attrs, open: !node.attrs.open };
              dispatch(state.tr.setNodeMarkup(pos, undefined, attrs));
            }
            return true;
          }
          return false;
        },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.className = 'accordion-wrapper my-4 border border-border rounded-lg overflow-hidden bg-white shadow-sm transition-all duration-200';
      dom.setAttribute('data-type', 'accordion');

      const header = document.createElement('div');
      header.className = 'accordion-header flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 cursor-pointer hover:from-primary/10 hover:to-primary/15 transition-all duration-200';
      
      const title = document.createElement('h3');
      title.className = 'text-base font-semibold text-foreground flex-1 pr-4';
      title.textContent = node.attrs.title || 'FAQ Question';
      title.contentEditable = 'true';
      title.onblur = () => {
        const pos = getPos();
        if (typeof pos === 'number') {
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              title: title.textContent || 'FAQ Question',
            })
          );
        }
      };

      const icon = document.createElement('svg');
      icon.className = `w-5 h-5 text-primary transition-transform duration-200 ${node.attrs.open ? 'transform rotate-180' : ''}`;
      icon.setAttribute('fill', 'none');
      icon.setAttribute('stroke', 'currentColor');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>';

      header.appendChild(title);
      header.appendChild(icon);

      const content = document.createElement('div');
      content.className = `accordion-content overflow-hidden transition-all duration-300 ${node.attrs.open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`;
      
      const contentInner = document.createElement('div');
      contentInner.className = 'p-4 text-foreground/80';
      contentInner.contentEditable = 'true';
      contentInner.innerHTML = node.content.size > 0 ? '' : '<p>Enter FAQ answer here...</p>';
      content.appendChild(contentInner);

      header.onclick = () => {
        const pos = getPos();
        if (typeof pos === 'number') {
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              open: !node.attrs.open,
            })
          );
        }
      };

      dom.appendChild(header);
      dom.appendChild(content);

      return {
        dom,
        contentDOM: contentInner,
      };
    };
  },
});

