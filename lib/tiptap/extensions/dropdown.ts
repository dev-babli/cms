import { Node, mergeAttributes } from '@tiptap/core';

export interface DropdownOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dropdown: {
      /**
       * Insert a dropdown/select element
       */
      setDropdown: (options?: { label?: string; options?: string[]; placeholder?: string }) => ReturnType;
    };
  }
}

export const Dropdown = Node.create<DropdownOptions>({
  name: 'dropdown',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      label: {
        default: 'Select an option',
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label) {
            return {};
          }
          return {
            'data-label': attributes.label,
          };
        },
      },
      options: {
        default: ['Option 1', 'Option 2', 'Option 3'],
        parseHTML: (element) => {
          const optionsJson = element.getAttribute('data-options');
          return optionsJson ? JSON.parse(optionsJson) : ['Option 1', 'Option 2', 'Option 3'];
        },
        renderHTML: (attributes) => {
          if (!attributes.options || attributes.options.length === 0) {
            return {};
          }
          return {
            'data-options': JSON.stringify(attributes.options),
          };
        },
      },
      placeholder: {
        default: 'Choose an option...',
        parseHTML: (element) => element.getAttribute('data-placeholder'),
        renderHTML: (attributes) => {
          if (!attributes.placeholder) {
            return {};
          }
          return {
            'data-placeholder': attributes.placeholder,
          };
        },
      },
      selected: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-selected'),
        renderHTML: (attributes) => {
          if (!attributes.selected) {
            return {};
          }
          return {
            'data-selected': attributes.selected,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="dropdown"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'dropdown',
        class: 'dropdown-wrapper my-4',
      }),
      [
        'label',
        {
          class: 'block text-sm font-medium text-foreground mb-2',
        },
        node.attrs.label || 'Select an option',
      ],
      [
        'select',
        {
          class: 'w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")] bg-no-repeat bg-right-2 bg-[length:20px] pr-8',
        },
        [
          'option',
          {
            value: '',
            disabled: true,
            selected: !node.attrs.selected,
          },
          node.attrs.placeholder || 'Choose an option...',
        ],
        ...(node.attrs.options || []).map((option: string) => [
          'option',
          {
            value: option,
            selected: node.attrs.selected === option,
          },
          option,
        ]),
      ],
    ];
  },

  addCommands() {
    return {
      setDropdown:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              label: options?.label || 'Select an option',
              options: options?.options || ['Option 1', 'Option 2', 'Option 3'],
              placeholder: options?.placeholder || 'Choose an option...',
              selected: null,
            },
          });
        },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.className = 'dropdown-wrapper my-4 p-4 border border-border rounded-lg bg-gradient-to-br from-background to-muted/30';
      dom.setAttribute('data-type', 'dropdown');

      const label = document.createElement('label');
      label.className = 'block text-sm font-medium text-foreground mb-2';
      label.textContent = node.attrs.label || 'Select an option';
      label.contentEditable = 'true';
      label.onblur = () => {
        const pos = getPos();
        if (typeof pos === 'number') {
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              label: label.textContent || 'Select an option',
            })
          );
        }
      };

      const select = document.createElement('select');
      select.className = 'w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200';
      
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.disabled = true;
      placeholderOption.selected = !node.attrs.selected;
      placeholderOption.textContent = node.attrs.placeholder || 'Choose an option...';
      select.appendChild(placeholderOption);

      (node.attrs.options || []).forEach((option: string) => {
        const optionEl = document.createElement('option');
        optionEl.value = option;
        optionEl.textContent = option;
        optionEl.selected = node.attrs.selected === option;
        select.appendChild(optionEl);
      });

      const editButton = document.createElement('button');
      editButton.className = 'mt-2 px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors';
      editButton.textContent = 'Edit Options';
      editButton.onclick = () => {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50';
        dialog.innerHTML = `
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="p-6 border-b">
              <h2 class="text-xl font-semibold">Edit Dropdown</h2>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Label</label>
                <input type="text" id="dropdown-label" value="${node.attrs.label || ''}" class="w-full px-3 py-2 border rounded-md">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Placeholder</label>
                <input type="text" id="dropdown-placeholder" value="${node.attrs.placeholder || ''}" class="w-full px-3 py-2 border rounded-md">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Options (one per line)</label>
                <textarea id="dropdown-options" rows="5" class="w-full px-3 py-2 border rounded-md">${(node.attrs.options || []).join('\n')}</textarea>
              </div>
            </div>
            <div class="p-6 border-t flex justify-end gap-2">
              <button id="cancel-dropdown" class="px-4 py-2 border rounded-md">Cancel</button>
              <button id="save-dropdown" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">Save</button>
            </div>
          </div>
        `;
        document.body.appendChild(dialog);

        const saveBtn = dialog.querySelector('#save-dropdown');
        const cancelBtn = dialog.querySelector('#cancel-dropdown');
        const labelInput = dialog.querySelector('#dropdown-label') as HTMLInputElement;
        const placeholderInput = dialog.querySelector('#dropdown-placeholder') as HTMLInputElement;
        const optionsInput = dialog.querySelector('#dropdown-options') as HTMLTextAreaElement;

        saveBtn?.addEventListener('click', () => {
          const pos = getPos();
          if (typeof pos === 'number') {
            const options = optionsInput.value.split('\n').filter(o => o.trim()).map(o => o.trim());
            editor.view.dispatch(
              editor.view.state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                label: labelInput.value || 'Select an option',
                placeholder: placeholderInput.value || 'Choose an option...',
                options: options.length > 0 ? options : ['Option 1', 'Option 2', 'Option 3'],
              })
            );
          }
          document.body.removeChild(dialog);
        });

        cancelBtn?.addEventListener('click', () => {
          document.body.removeChild(dialog);
        });
      };

      dom.appendChild(label);
      dom.appendChild(select);
      dom.appendChild(editButton);

      return {
        dom,
      };
    };
  },
});

