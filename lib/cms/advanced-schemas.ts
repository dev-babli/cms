import { z } from 'zod';

// Base field types for advanced schema system
export const FieldTypes = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  RICHTEXT: 'richtext',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime',
  TIME: 'time',
  EMAIL: 'email',
  URL: 'url',
  PHONE: 'phone',
  COLOR: 'color',
  JSON: 'json',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  FILE: 'file',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  LOCATION: 'location',
  REFERENCE: 'reference',
  ARRAY: 'array',
  OBJECT: 'object',
  BLOCK: 'block',
} as const;

export type FieldType = typeof FieldTypes[keyof typeof FieldTypes];

// Advanced field configuration
export interface FieldConfig {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  validation?: z.ZodSchema;
  options?: {
    // For select/multiselect/radio
    choices?: Array<{ label: string; value: string; disabled?: boolean }>;
    // For text/textarea
    placeholder?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    // For number
    min?: number;
    max?: number;
    step?: number;
    // For file/image/video
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    // For reference
    referenceType?: string;
    // For array
    itemType?: FieldConfig;
    minItems?: number;
    maxItems?: number;
    // For object
    fields?: FieldConfig[];
    // For location
    precision?: number;
    // For richtext
    allowedFormats?: string[];
    // UI specific
    width?: 'full' | 'half' | 'third' | 'quarter';
    group?: string;
    conditional?: {
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
      value: any;
    };
  };
}

// Content Type Definition
export interface ContentType {
  id: string;
  name: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  fields: FieldConfig[];
  groups?: Array<{
    id: string;
    label: string;
    fields: string[];
    collapsed?: boolean;
  }>;
  permissions?: {
    create: string[];
    read: string[];
    update: string[];
    delete: string[];
    publish: string[];
  };
  workflow?: string;
  preview?: {
    url: string;
    fields: string[];
  };
  seo?: {
    titleField?: string;
    descriptionField?: string;
    imageField?: string;
  };
  api?: {
    enabled: boolean;
    endpoints: string[];
    rateLimit?: number;
  };
}

// Advanced Blog Post Schema
export const AdvancedBlogPostSchema: ContentType = {
  id: 'blog_post',
  name: 'Blog Post',
  label: 'Blog Post',
  description: 'Advanced blog post with rich content and metadata',
  icon: '📝',
  color: '#3B82F6',
  fields: [
    {
      id: 'title',
      name: 'title',
      type: FieldTypes.TEXT,
      label: 'Title',
      description: 'The main title of the blog post',
      required: true,
      options: {
        placeholder: 'Enter a compelling title...',
        maxLength: 200,
        width: 'full',
      },
    },
    {
      id: 'slug',
      name: 'slug',
      type: FieldTypes.TEXT,
      label: 'URL Slug',
      description: 'URL-friendly version of the title',
      required: true,
      options: {
        placeholder: 'url-friendly-slug',
        pattern: '^[a-z0-9-]+$',
        width: 'half',
      },
    },
    {
      id: 'status',
      name: 'status',
      type: FieldTypes.SELECT,
      label: 'Status',
      required: true,
      options: {
        choices: [
          { label: 'Draft', value: 'draft' },
          { label: 'Review', value: 'review' },
          { label: 'Published', value: 'published' },
          { label: 'Archived', value: 'archived' },
        ],
        width: 'half',
      },
    },
    {
      id: 'excerpt',
      name: 'excerpt',
      type: FieldTypes.TEXTAREA,
      label: 'Excerpt',
      description: 'Brief description shown in listings',
      options: {
        placeholder: 'Write a compelling excerpt...',
        maxLength: 500,
        width: 'full',
      },
    },
    {
      id: 'content',
      name: 'content',
      type: FieldTypes.RICHTEXT,
      label: 'Content',
      description: 'Main content of the blog post',
      required: true,
      options: {
        allowedFormats: ['bold', 'italic', 'link', 'heading', 'list', 'quote', 'code', 'image', 'video'],
        width: 'full',
      },
    },
    {
      id: 'featured_image',
      name: 'featured_image',
      type: FieldTypes.IMAGE,
      label: 'Featured Image',
      description: 'Main image for the post',
      options: {
        accept: 'image/*',
        maxSize: 10 * 1024 * 1024, // 10MB
        width: 'half',
      },
    },
    {
      id: 'gallery',
      name: 'gallery',
      type: FieldTypes.ARRAY,
      label: 'Image Gallery',
      description: 'Additional images for the post',
      options: {
        itemType: {
          id: 'gallery_item',
          name: 'gallery_item',
          type: FieldTypes.IMAGE,
          label: 'Gallery Image',
          options: {
            accept: 'image/*',
            maxSize: 10 * 1024 * 1024,
          },
        },
        minItems: 0,
        maxItems: 10,
        width: 'half',
      },
    },
    {
      id: 'author',
      name: 'author',
      type: FieldTypes.REFERENCE,
      label: 'Author',
      required: true,
      options: {
        referenceType: 'user',
        width: 'half',
      },
    },
    {
      id: 'categories',
      name: 'categories',
      type: FieldTypes.REFERENCE,
      label: 'Categories',
      options: {
        referenceType: 'category',
        multiple: true,
        width: 'half',
      },
    },
    {
      id: 'tags',
      name: 'tags',
      type: FieldTypes.MULTISELECT,
      label: 'Tags',
      description: 'Tags for categorization and search',
      options: {
        choices: [
          { label: 'Technology', value: 'technology' },
          { label: 'AI/ML', value: 'ai-ml' },
          { label: 'Web Development', value: 'web-dev' },
          { label: 'Design', value: 'design' },
          { label: 'Business', value: 'business' },
          { label: 'Tutorial', value: 'tutorial' },
        ],
        width: 'half',
      },
    },
    {
      id: 'seo_title',
      name: 'seo_title',
      type: FieldTypes.TEXT,
      label: 'SEO Title',
      description: 'Custom title for search engines',
      options: {
        placeholder: 'SEO optimized title...',
        maxLength: 60,
        width: 'half',
      },
    },
    {
      id: 'seo_description',
      name: 'seo_description',
      type: FieldTypes.TEXTAREA,
      label: 'SEO Description',
      description: 'Meta description for search engines',
      options: {
        placeholder: 'Write an engaging meta description...',
        maxLength: 160,
        width: 'half',
      },
    },
    {
      id: 'publish_date',
      name: 'publish_date',
      type: FieldTypes.DATETIME,
      label: 'Publish Date',
      description: 'When to publish this post',
      options: {
        width: 'half',
      },
    },
    {
      id: 'reading_time',
      name: 'reading_time',
      type: FieldTypes.NUMBER,
      label: 'Reading Time (minutes)',
      description: 'Estimated reading time',
      options: {
        min: 1,
        max: 60,
        width: 'half',
      },
    },
    {
      id: 'featured',
      name: 'featured',
      type: FieldTypes.BOOLEAN,
      label: 'Featured Post',
      description: 'Highlight this post on the homepage',
      options: {
        width: 'quarter',
      },
    },
    {
      id: 'allow_comments',
      name: 'allow_comments',
      type: FieldTypes.BOOLEAN,
      label: 'Allow Comments',
      description: 'Enable comments on this post',
      options: {
        width: 'quarter',
      },
    },
    {
      id: 'custom_fields',
      name: 'custom_fields',
      type: FieldTypes.JSON,
      label: 'Custom Fields',
      description: 'Additional custom data',
      options: {
        width: 'full',
      },
    },
  ],
  groups: [
    {
      id: 'content',
      label: 'Content',
      fields: ['title', 'slug', 'excerpt', 'content', 'featured_image', 'gallery'],
      collapsed: false,
    },
    {
      id: 'metadata',
      label: 'Metadata',
      fields: ['author', 'categories', 'tags', 'publish_date', 'reading_time'],
      collapsed: true,
    },
    {
      id: 'seo',
      label: 'SEO',
      fields: ['seo_title', 'seo_description'],
      collapsed: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      fields: ['status', 'featured', 'allow_comments', 'custom_fields'],
      collapsed: true,
    },
  ],
  permissions: {
    create: ['admin', 'editor', 'author'],
    read: ['admin', 'editor', 'author', 'viewer'],
    update: ['admin', 'editor', 'author'],
    delete: ['admin', 'editor'],
    publish: ['admin', 'editor'],
  },
  workflow: 'content_review',
  preview: {
    url: '/api/preview/blog/{slug}',
    fields: ['title', 'excerpt', 'featured_image', 'author'],
  },
  seo: {
    titleField: 'seo_title',
    descriptionField: 'seo_description',
    imageField: 'featured_image',
  },
  api: {
    enabled: true,
    endpoints: ['/api/cms/blog', '/api/graphql'],
    rateLimit: 1000,
  },
};

// Additional Content Types
export const CategorySchema: ContentType = {
  id: 'category',
  name: 'Category',
  label: 'Category',
  icon: '📁',
  color: '#10B981',
  fields: [
    {
      id: 'name',
      name: 'name',
      type: FieldTypes.TEXT,
      label: 'Name',
      required: true,
      options: { width: 'half' },
    },
    {
      id: 'slug',
      name: 'slug',
      type: FieldTypes.TEXT,
      label: 'Slug',
      required: true,
      options: { width: 'half' },
    },
    {
      id: 'description',
      name: 'description',
      type: FieldTypes.TEXTAREA,
      label: 'Description',
      options: { width: 'full' },
    },
    {
      id: 'color',
      name: 'color',
      type: FieldTypes.COLOR,
      label: 'Color',
      options: { width: 'quarter' },
    },
    {
      id: 'icon',
      name: 'icon',
      type: FieldTypes.SELECT,
      label: 'Icon',
      options: {
        choices: [
          { label: '📝', value: '📝' },
          { label: '💻', value: '💻' },
          { label: '🎨', value: '🎨' },
          { label: '📊', value: '📊' },
          { label: '🚀', value: '🚀' },
          { label: '🔧', value: '🔧' },
        ],
        width: 'quarter',
      },
    },
  ],
};

export const UserSchema: ContentType = {
  id: 'user',
  name: 'User',
  label: 'User',
  icon: '👤',
  color: '#8B5CF6',
  fields: [
    {
      id: 'name',
      name: 'name',
      type: FieldTypes.TEXT,
      label: 'Full Name',
      required: true,
      options: { width: 'half' },
    },
    {
      id: 'email',
      name: 'email',
      type: FieldTypes.EMAIL,
      label: 'Email',
      required: true,
      options: { width: 'half' },
    },
    {
      id: 'avatar',
      name: 'avatar',
      type: FieldTypes.IMAGE,
      label: 'Avatar',
      options: { width: 'quarter' },
    },
    {
      id: 'bio',
      name: 'bio',
      type: FieldTypes.TEXTAREA,
      label: 'Bio',
      options: { width: 'full' },
    },
    {
      id: 'role',
      name: 'role',
      type: FieldTypes.SELECT,
      label: 'Role',
      required: true,
      options: {
        choices: [
          { label: 'Admin', value: 'admin' },
          { label: 'Editor', value: 'editor' },
          { label: 'Author', value: 'author' },
          { label: 'Viewer', value: 'viewer' },
        ],
        width: 'quarter',
      },
    },
    {
      id: 'social_links',
      name: 'social_links',
      type: FieldTypes.OBJECT,
      label: 'Social Links',
      options: {
        fields: [
          {
            id: 'twitter',
            name: 'twitter',
            type: FieldTypes.URL,
            label: 'Twitter',
            options: { width: 'half' },
          },
          {
            id: 'linkedin',
            name: 'linkedin',
            type: FieldTypes.URL,
            label: 'LinkedIn',
            options: { width: 'half' },
          },
          {
            id: 'github',
            name: 'github',
            type: FieldTypes.URL,
            label: 'GitHub',
            options: { width: 'half' },
          },
          {
            id: 'website',
            name: 'website',
            type: FieldTypes.URL,
            label: 'Website',
            options: { width: 'half' },
          },
        ],
        width: 'full',
      },
    },
  ],
};

// Content Type Registry
export const ContentTypeRegistry: Record<string, ContentType> = {
  blog_post: AdvancedBlogPostSchema,
  category: CategorySchema,
  user: UserSchema,
};

// Schema Builder for Dynamic Content Types
export class SchemaBuilder {
  private contentType: Partial<ContentType> = {};

  constructor(id: string, name: string, label: string) {
    this.contentType.id = id;
    this.contentType.name = name;
    this.contentType.label = label;
    this.contentType.fields = [];
    this.contentType.groups = [];
  }

  addField(field: FieldConfig): this {
    if (!this.contentType.fields) this.contentType.fields = [];
    this.contentType.fields.push(field);
    return this;
  }

  addGroup(group: { id: string; label: string; fields: string[]; collapsed?: boolean }): this {
    if (!this.contentType.groups) this.contentType.groups = [];
    this.contentType.groups.push(group);
    return this;
  }

  setIcon(icon: string): this {
    this.contentType.icon = icon;
    return this;
  }

  setColor(color: string): this {
    this.contentType.color = color;
    return this;
  }

  setPermissions(permissions: ContentType['permissions']): this {
    this.contentType.permissions = permissions;
    return this;
  }

  setWorkflow(workflow: string): this {
    this.contentType.workflow = workflow;
    return this;
  }

  build(): ContentType {
    return this.contentType as ContentType;
  }
}

// Helper function to create field configs
export const createField = (config: Omit<FieldConfig, 'id'>): FieldConfig => ({
  id: config.name,
  ...config,
});

// Validation schema generator
export const generateValidationSchema = (contentType: ContentType): z.ZodSchema => {
  const fields: Record<string, z.ZodSchema> = {};

  contentType.fields.forEach(field => {
    let schema: any;

    switch (field.type) {
      case FieldTypes.TEXT:
        schema = z.string();
        if (field.options?.maxLength) schema = schema.max(field.options.maxLength);
        if (field.options?.minLength) schema = schema.min(field.options.minLength);
        break;
      case FieldTypes.TEXTAREA:
        schema = z.string();
        if (field.options?.maxLength) schema = schema.max(field.options.maxLength);
        break;
      case FieldTypes.RICHTEXT:
        schema = z.string();
        break;
      case FieldTypes.NUMBER:
        schema = z.number();
        if (field.options?.min !== undefined) schema = schema.min(field.options.min);
        if (field.options?.max !== undefined) schema = schema.max(field.options.max);
        break;
      case FieldTypes.BOOLEAN:
        schema = z.boolean();
        break;
      case FieldTypes.DATE:
        schema = z.string().datetime();
        break;
      case FieldTypes.EMAIL:
        schema = z.string().email();
        break;
      case FieldTypes.URL:
        schema = z.string().url();
        break;
      case FieldTypes.JSON:
        schema = z.any();
        break;
      case FieldTypes.SELECT:
        const choices = field.options?.choices?.map(c => c.value) || [];
        schema = z.enum(choices as [string, ...string[]]);
        break;
      case FieldTypes.MULTISELECT:
        const multiChoices = field.options?.choices?.map(c => c.value) || [];
        schema = z.array(z.enum(multiChoices as [string, ...string[]]));
        break;
      case FieldTypes.ARRAY:
        if (field.options?.itemType) {
          const itemSchema = generateValidationSchema({
            ...contentType,
            fields: [field.options.itemType],
          });
          schema = z.array(itemSchema);
        } else {
          schema = z.array(z.any());
        }
        break;
      default:
        schema = z.any();
    }

    if (field.required) {
      fields[field.name] = schema;
    } else {
      fields[field.name] = schema.optional();
    }
  });

  return z.object(fields);
};

