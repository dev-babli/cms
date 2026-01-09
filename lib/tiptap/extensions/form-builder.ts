import { Node, mergeAttributes } from '@tiptap/core';

export interface FormBuilderOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    formBuilder: {
      /**
       * Insert a form builder
       */
      setFormBuilder: (options?: { fields?: FormField[] }) => ReturnType;
    };
  }
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select, radio
}

export const FormBuilder = Node.create<FormBuilderOptions>({
  name: 'formBuilder',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      fields: {
        default: [],
        parseHTML: (element) => {
          const fieldsJson = element.getAttribute('data-fields');
          return fieldsJson ? JSON.parse(fieldsJson) : [];
        },
        renderHTML: (attributes) => {
          if (!attributes.fields || attributes.fields.length === 0) {
            return {};
          }
          return {
            'data-fields': JSON.stringify(attributes.fields),
          };
        },
      },
      formId: {
        default: `form-${Date.now()}`,
        parseHTML: (element) => element.getAttribute('data-form-id'),
        renderHTML: (attributes) => {
          if (!attributes.formId) {
            return {};
          }
          return {
            'data-form-id': attributes.formId,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="form-builder"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      'data-type': 'form-builder',
      class: 'form-builder-wrapper my-6 p-6 border-2 border-dashed border-primary/30 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10',
    }), 0];
  },

  addCommands() {
    return {
      setFormBuilder:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              fields: options?.fields || [
                {
                  id: `field-${Date.now()}`,
                  type: 'text',
                  label: 'Name',
                  placeholder: 'Enter your name',
                  required: true,
                },
              ],
              formId: `form-${Date.now()}`,
            },
          });
        },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.className = 'form-builder-wrapper my-6 p-6 border-2 border-dashed border-primary/30 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10';
      dom.setAttribute('data-type', 'form-builder');
      
      const fields = node.attrs.fields || [];
      const formId = node.attrs.formId || `form-${Date.now()}`;

      // Create form preview
      const formPreview = document.createElement('div');
      formPreview.className = 'form-preview space-y-4';
      
      const formTitle = document.createElement('div');
      formTitle.className = 'text-lg font-semibold text-foreground mb-4 flex items-center gap-2';
      formTitle.innerHTML = `
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Form Builder
      `;
      formPreview.appendChild(formTitle);

      fields.forEach((field: FormField) => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'form-field';
        
        const label = document.createElement('label');
        label.className = 'block text-sm font-medium text-foreground mb-1';
        label.textContent = field.label + (field.required ? ' *' : '');
        fieldDiv.appendChild(label);

        let input: HTMLElement;
        if (field.type === 'textarea') {
          input = document.createElement('textarea');
          (input as HTMLTextAreaElement).rows = 4;
          (input as HTMLTextAreaElement).placeholder = field.placeholder || '';
          input.className = 'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20';
        } else if (field.type === 'select') {
          input = document.createElement('select');
          input.className = 'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20';
          field.options?.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option;
            optionEl.textContent = option;
            (input as HTMLSelectElement).appendChild(optionEl);
          });
        } else if (field.type === 'checkbox') {
          input = document.createElement('input');
          (input as HTMLInputElement).type = 'checkbox';
          input.className = 'w-4 h-4 text-primary border-border rounded focus:ring-primary/20';
        } else if (field.type === 'radio') {
          input = document.createElement('div');
          input.className = 'space-y-2';
          field.options?.forEach(option => {
            const radioDiv = document.createElement('div');
            radioDiv.className = 'flex items-center gap-2';
            const radio = document.createElement('input');
            (radio as HTMLInputElement).type = 'radio';
            (radio as HTMLInputElement).name = field.id;
            (radio as HTMLInputElement).value = option;
            radio.className = 'w-4 h-4 text-primary border-border focus:ring-primary/20';
            const radioLabel = document.createElement('label');
            radioLabel.textContent = option;
            radioLabel.className = 'text-sm text-foreground';
            radioDiv.appendChild(radio);
            radioDiv.appendChild(radioLabel);
            input.appendChild(radioDiv);
          });
        } else {
          input = document.createElement('input');
          (input as HTMLInputElement).type = field.type;
          (input as HTMLInputElement).placeholder = field.placeholder || '';
          input.className = 'w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20';
        }

        if (field.required && input instanceof HTMLInputElement) {
          (input as HTMLInputElement).required = true;
        }

        fieldDiv.appendChild(input);
        formPreview.appendChild(fieldDiv);
      });

      const editButton = document.createElement('button');
      editButton.className = 'mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium';
      editButton.textContent = 'Edit Form';
      editButton.onclick = () => {
        // Open form builder dialog
        const formBuilderDialog = document.createElement('div');
        formBuilderDialog.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50';
        formBuilderDialog.innerHTML = `
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b">
              <h2 class="text-xl font-semibold">Form Builder</h2>
            </div>
            <div class="p-6">
              <div id="form-fields-list" class="space-y-4"></div>
              <button id="add-field" class="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                Add Field
              </button>
            </div>
            <div class="p-6 border-t flex justify-end gap-2">
              <button id="cancel-form" class="px-4 py-2 border rounded-md">Cancel</button>
              <button id="save-form" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                Save Form
              </button>
            </div>
          </div>
        `;
        document.body.appendChild(formBuilderDialog);

        const fieldsList = formBuilderDialog.querySelector('#form-fields-list');
        const addFieldBtn = formBuilderDialog.querySelector('#add-field');
        const saveBtn = formBuilderDialog.querySelector('#save-form');
        const cancelBtn = formBuilderDialog.querySelector('#cancel-form');

        const renderFields = (fieldsToRender: FormField[]) => {
          if (!fieldsList) return;
          fieldsList.innerHTML = '';
          fieldsToRender.forEach((field, index) => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'border rounded-lg p-4';
            fieldDiv.innerHTML = `
              <div class="flex justify-between items-start mb-4">
                <h3 class="font-medium">Field ${index + 1}</h3>
                <button class="text-red-500 hover:text-red-700" data-remove="${index}">Remove</button>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">Label</label>
                  <input type="text" value="${field.label}" data-field="${index}" data-prop="label" class="w-full px-3 py-2 border rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Type</label>
                  <select data-field="${index}" data-prop="type" class="w-full px-3 py-2 border rounded-md">
                    <option value="text" ${field.type === 'text' ? 'selected' : ''}>Text</option>
                    <option value="email" ${field.type === 'email' ? 'selected' : ''}>Email</option>
                    <option value="number" ${field.type === 'number' ? 'selected' : ''}>Number</option>
                    <option value="textarea" ${field.type === 'textarea' ? 'selected' : ''}>Textarea</option>
                    <option value="select" ${field.type === 'select' ? 'selected' : ''}>Select</option>
                    <option value="checkbox" ${field.type === 'checkbox' ? 'selected' : ''}>Checkbox</option>
                    <option value="radio" ${field.type === 'radio' ? 'selected' : ''}>Radio</option>
                    <option value="date" ${field.type === 'date' ? 'selected' : ''}>Date</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">Placeholder</label>
                  <input type="text" value="${field.placeholder || ''}" data-field="${index}" data-prop="placeholder" class="w-full px-3 py-2 border rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">
                    <input type="checkbox" ${field.required ? 'checked' : ''} data-field="${index}" data-prop="required"> Required
                  </label>
                </div>
              </div>
            `;
            fieldsList.appendChild(fieldDiv);
          });
        };

        let currentFields = [...fields];
        renderFields(currentFields);

        addFieldBtn?.addEventListener('click', () => {
          currentFields.push({
            id: `field-${Date.now()}`,
            type: 'text',
            label: 'New Field',
            placeholder: '',
            required: false,
          });
          renderFields(currentFields);
        });

        fieldsList?.addEventListener('change', (e) => {
          const target = e.target as HTMLElement;
          const fieldIndex = parseInt(target.getAttribute('data-field') || '0');
          const prop = target.getAttribute('data-prop') || '';
          if (target instanceof HTMLInputElement) {
            if (prop === 'required') {
              currentFields[fieldIndex].required = target.checked;
            } else {
              (currentFields[fieldIndex] as any)[prop] = target.value;
            }
          } else if (target instanceof HTMLSelectElement) {
            (currentFields[fieldIndex] as any)[prop] = target.value;
          }
        });

        fieldsList?.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          if (target.hasAttribute('data-remove')) {
            const index = parseInt(target.getAttribute('data-remove') || '0');
            currentFields.splice(index, 1);
            renderFields(currentFields);
          }
        });

        saveBtn?.addEventListener('click', () => {
          const pos = getPos();
          if (typeof pos === 'number') {
            editor.view.dispatch(
              editor.view.state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                fields: currentFields,
              })
            );
          }
          document.body.removeChild(formBuilderDialog);
        });

        cancelBtn?.addEventListener('click', () => {
          document.body.removeChild(formBuilderDialog);
        });
      };

      formPreview.appendChild(editButton);
      dom.appendChild(formPreview);

      return {
        dom,
      };
    };
  },
});

