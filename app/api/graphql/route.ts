import { createYoga, createSchema } from 'graphql-yoga';
import { blogPosts, teamMembers } from '@/lib/cms/api';
import { NextRequest } from 'next/server';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/security/cors';

const typeDefs = `
  type BlogPost {
    id: Int!
    slug: String!
    title: String!
    excerpt: String
    content: String
    author: String
    featured_image: String
    category: String
    tags: String
    published: Boolean!
    publish_date: String
    created_at: String
    updated_at: String
  }

  type TeamMember {
    id: Int!
    name: String!
    position: String
    bio: String
    image: String
    email: String
    linkedin: String
    twitter: String
    order_index: Int!
    published: Boolean!
  }

  type Query {
    blogPosts(published: Boolean): [BlogPost!]!
    blogPost(slug: String!): BlogPost
    teamMembers(published: Boolean): [TeamMember!]!
  }

  type Mutation {
    createBlogPost(input: BlogPostInput!): BlogPost!
    updateBlogPost(id: Int!, input: BlogPostInput!): BlogPost!
    deleteBlogPost(id: Int!): Boolean!
  }

  input BlogPostInput {
    slug: String!
    title: String!
    excerpt: String
    content: String
    author: String
    featured_image: String
    category: String
    tags: String
    published: Boolean
    publish_date: String
  }
`;

const resolvers = {
  Query: {
    blogPosts: async (_: any, { published }: { published?: boolean }) => {
      return await blogPosts.getAll(published);
    },
    blogPost: async (_: any, { slug }: { slug: string }) => {
      return await blogPosts.getBySlug(slug);
    },
    teamMembers: async (_: any, { published }: { published?: boolean }) => {
      return await teamMembers.getAll(published);
    },
  },
  Mutation: {
    createBlogPost: async (_: any, { input }: { input: any }) => {
      const result = await blogPosts.create(input);
      const newId = (result as any).row?.id || (result as any).lastInsertRowid || null;
      return { id: Number(newId), ...input };
    },
    updateBlogPost: async (_: any, { id, input }: { id: number; input: any }) => {
      await blogPosts.update(id, input);
      return { id, ...input };
    },
    deleteBlogPost: async (_: any, { id }: { id: number }) => {
      await blogPosts.delete(id);
      return true;
    },
  },
};

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response },
});

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const preflightResponse = handleCorsPreflight(request, {
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  if (preflightResponse) {
    return preflightResponse;
  }
  return new Response(null, { status: 403 });
}

// Properly typed handlers for Next.js 15 with CORS
export async function GET(request: NextRequest) {
  const response = await yoga.fetch(request as any);
  // Add CORS headers to response
  const corsHeaders = getCorsHeaders(request, {
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  if (corsHeaders) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  return response;
}

export async function POST(request: NextRequest) {
  const response = await yoga.fetch(request as any);
  // Add CORS headers to response
  const corsHeaders = getCorsHeaders(request, {
    allowedMethods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  if (corsHeaders) {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  return response;
}



