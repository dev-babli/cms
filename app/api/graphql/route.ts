import { createYoga, createSchema } from 'graphql-yoga';
import { blogPosts, services, teamMembers } from '@/lib/cms/api';

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

  type Service {
    id: Int!
    slug: String!
    title: String!
    description: String
    content: String
    icon: String
    featured_image: String
    price: String
    features: String
    published: Boolean!
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
    services(published: Boolean): [Service!]!
    service(slug: String!): Service
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
    blogPosts: (_: any, { published }: { published?: boolean }) => {
      return blogPosts.getAll(published);
    },
    blogPost: (_: any, { slug }: { slug: string }) => {
      return blogPosts.getBySlug(slug);
    },
    services: (_: any, { published }: { published?: boolean }) => {
      return services.getAll(published);
    },
    service: (_: any, { slug }: { slug: string }) => {
      return services.getBySlug(slug);
    },
    teamMembers: (_: any, { published }: { published?: boolean }) => {
      return teamMembers.getAll(published);
    },
  },
  Mutation: {
    createBlogPost: (_: any, { input }: { input: any }) => {
      const result = blogPosts.create(input);
      return { id: result.lastInsertRowid, ...input };
    },
    updateBlogPost: (_: any, { id, input }: { id: number; input: any }) => {
      blogPosts.update(id, input);
      return { id, ...input };
    },
    deleteBlogPost: (_: any, { id }: { id: number }) => {
      blogPosts.delete(id);
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

export { yoga as GET, yoga as POST };



