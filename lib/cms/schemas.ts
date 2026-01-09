// Sanity-like Schema System

export type FieldType = 
  | 'string' 
  | 'text' 
  | 'number' 
  | 'boolean' 
  | 'date' 
  | 'datetime'
  | 'url'
  | 'email'
  | 'richtext'
  | 'image'
  | 'file'
  | 'reference'
  | 'array';

export interface SchemaField {
  name: string;
  type: FieldType;
  title: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  validation?: (value: any) => boolean | string;
  options?: {
    list?: Array<{ title: string; value: any }>;
    layout?: 'radio' | 'dropdown' | 'tags';
    hotspot?: boolean; // for images
    accept?: string; // for files
  };
  of?: SchemaField[]; // for arrays
  to?: { type: string }[]; // for references
  preview?: {
    select?: Record<string, string>;
    prepare?: (selection: any) => { title: string; subtitle?: string; media?: string };
  };
}

export interface Schema {
  name: string;
  title: string;
  type: 'document';
  icon?: string;
  fields: SchemaField[];
  preview?: {
    select?: Record<string, string>;
    prepare?: (selection: any) => { title: string; subtitle?: string; media?: string };
  };
  orderings?: Array<{
    title: string;
    name: string;
    by: Array<{ field: string; direction: 'asc' | 'desc' }>;
  }>;
}

// Blog Post Schema (Sanity-like)
export const blogPostSchema: Schema = {
  name: 'post',
  title: 'Blog Posts',
  type: 'document',
  icon: '📝',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'The main title of your blog post',
      required: true,
      validation: (value) => value.length > 0 || 'Title is required',
    },
    {
      name: 'slug',
      type: 'string',
      title: 'URL Slug',
      description: 'Unique identifier for the URL',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'text',
      title: 'Excerpt',
      description: 'Short description for previews',
      placeholder: 'Enter a compelling excerpt...',
    },
    {
      name: 'content',
      type: 'richtext',
      title: 'Content',
      description: 'The main content of your post',
      required: true,
    },
    {
      name: 'featured_image',
      type: 'image',
      title: 'Featured Image',
      description: 'Main image for the post',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'banner_image',
      type: 'image',
      title: 'Banner Image (Hero Section)',
      description: 'Full-width hero banner image for the blog post',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'author',
      type: 'reference',
      title: 'Author',
      description: 'Post author',
      to: [{ type: 'author' }],
    },
    {
      name: 'category',
      type: 'string',
      title: 'Category',
      options: {
        list: [
          { title: 'AI & Machine Learning', value: 'ai' },
          { title: 'Technology', value: 'technology' },
          { title: 'Business', value: 'business' },
          { title: 'Innovation', value: 'innovation' },
        ],
        layout: 'dropdown',
      },
    },
    {
      name: 'tags',
      type: 'array',
      title: 'Tags',
      of: [{ name: 'tag', type: 'string', title: 'Tag' }],
      options: {
        layout: 'tags',
      },
    },
    {
      name: 'published',
      type: 'boolean',
      title: 'Published',
      description: 'Toggle to publish or unpublish',
    },
    {
      name: 'publish_date',
      type: 'datetime',
      title: 'Publish Date',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'author',
      media: 'featured_image',
    },
  },
  orderings: [
    {
      title: 'Publish Date (Newest)',
      name: 'publishDateDesc',
      by: [{ field: 'publish_date', direction: 'desc' }],
    },
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
};

// Team Member Schema
export const teamMemberSchema: Schema = {
  name: 'teamMember',
  title: 'Team Members',
  type: 'document',
  icon: '👤',
  fields: [
    {
      name: 'name',
      type: 'string',
      title: 'Full Name',
      required: true,
    },
    {
      name: 'position',
      type: 'string',
      title: 'Position/Role',
    },
    {
      name: 'bio',
      type: 'text',
      title: 'Biography',
    },
    {
      name: 'image',
      type: 'image',
      title: 'Profile Photo',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'email',
      type: 'email',
      title: 'Email',
    },
    {
      name: 'linkedin',
      type: 'url',
      title: 'LinkedIn URL',
    },
    {
      name: 'twitter',
      type: 'url',
      title: 'Twitter URL',
    },
    {
      name: 'order_index',
      type: 'number',
      title: 'Display Order',
      description: 'Lower numbers appear first',
    },
    {
      name: 'published',
      type: 'boolean',
      title: 'Visible on Site',
    },
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order_index', direction: 'asc' }],
    },
  ],
};

// All Schemas
export const schemas = [
  blogPostSchema,
  teamMemberSchema,
];

export function getSchemaByName(name: string): Schema | undefined {
  return schemas.find(s => s.name === name);
}





