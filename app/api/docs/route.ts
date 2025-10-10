import { NextResponse } from 'next/server';

// OpenAPI/Swagger documentation
const apiDocs = {
  openapi: '3.0.0',
  info: {
    title: 'Emscale CMS API',
    version: '1.0.0',
    description: 'Enterprise-grade Content Management System API',
    contact: {
      name: 'Emscale Team',
      email: 'api@emscale.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
    {
      url: 'https://your-domain.com/api',
      description: 'Production server',
    },
  ],
  paths: {
    '/cms/blog': {
      get: {
        summary: 'List all blog posts',
        parameters: [
          {
            name: 'published',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filter by published status',
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/BlogPost' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new blog post',
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BlogPostInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Blog post created',
          },
        },
      },
    },
    '/cms/blog/{id}': {
      get: {
        summary: 'Get blog post by ID or slug',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Blog post found',
          },
          404: {
            description: 'Blog post not found',
          },
        },
      },
      put: {
        summary: 'Update blog post',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BlogPostInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Blog post updated',
          },
        },
      },
      delete: {
        summary: 'Delete blog post',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Blog post deleted',
          },
        },
      },
    },
    '/graphql': {
      post: {
        summary: 'GraphQL endpoint',
        description: 'Query and mutate data using GraphQL',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  query: { type: 'string' },
                  variables: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      BlogPost: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          slug: { type: 'string' },
          title: { type: 'string' },
          excerpt: { type: 'string' },
          content: { type: 'string' },
          author: { type: 'string' },
          featured_image: { type: 'string' },
          category: { type: 'string' },
          tags: { type: 'string' },
          published: { type: 'boolean' },
          publish_date: { type: 'string', format: 'date-time' },
        },
      },
      BlogPostInput: {
        type: 'object',
        required: ['slug', 'title'],
        properties: {
          slug: { type: 'string' },
          title: { type: 'string' },
          excerpt: { type: 'string' },
          content: { type: 'string' },
          author: { type: 'string' },
          featured_image: { type: 'string' },
          category: { type: 'string' },
          tags: { type: 'string' },
          published: { type: 'boolean' },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(apiDocs);
}



