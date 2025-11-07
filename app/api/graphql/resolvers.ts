import { blogPosts, services } from '@/lib/cms/api';
import { users, sessions } from '@/lib/auth/users';
import { workflowEngine } from '@/lib/workflows/engine';
import bcrypt from 'bcryptjs';

export const resolvers = {
  Query: {
    // User queries
    me: async (_: any, __: any, context: any) => {
      const token = context.req.cookies.get('auth-token')?.value;
      if (!token) return null;
      
      const session = sessions.findByToken(token);
      return session ? session.user : null;
    },

    user: async (_: any, { id }: { id: number }) => {
      return users.findById(id);
    },

    users: async (_: any, { limit = 50, offset = 0 }: { limit?: number; offset?: number }) => {
      const allUsers = users.list();
      return allUsers.slice(offset, offset + limit);
    },

    // Blog post queries
    blogPost: async (_: any, { slug }: { slug: string }) => {
      return blogPosts.getBySlug(slug);
    },

    blogPosts: async (
      _: any,
      {
        limit = 50,
        offset = 0,
        published,
        categoryId,
        tag,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC',
      }: {
        limit?: number;
        offset?: number;
        published?: boolean;
        categoryId?: number;
        tag?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
      }
    ) => {
      let posts = blogPosts.getAll(published);

      // Filter by category
      if (categoryId) {
        posts = posts.filter((post: any) => post.category_id === categoryId);
      }

      // Filter by tag
      if (tag) {
        posts = posts.filter((post: any) => post.tags?.includes(tag));
      }

      // Search
      if (search) {
        const searchLower = search.toLowerCase();
        posts = posts.filter(
          (post: any) =>
            post.title?.toLowerCase().includes(searchLower) ||
            post.excerpt?.toLowerCase().includes(searchLower) ||
            post.content?.toLowerCase().includes(searchLower)
        );
      }

      // Sort
      posts.sort((a: any, b: any) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (sortOrder === 'ASC') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });

      return posts.slice(offset, offset + limit);
    },

    blogPostsPaginated: async (
      _: any,
      {
        first = 20,
        after,
        published,
        categoryId,
        tag,
        search,
      }: {
        first?: number;
        after?: string;
        published?: boolean;
        categoryId?: number;
        tag?: string;
        search?: string;
      }
    ) => {
      let posts = blogPosts.getAll(published);

      // Apply filters (same as blogPosts query)
      if (categoryId) {
        posts = posts.filter((post: any) => post.category_id === categoryId);
      }
      if (tag) {
        posts = posts.filter((post: any) => post.tags?.includes(tag));
      }
      if (search) {
        const searchLower = search.toLowerCase();
        posts = posts.filter(
          (post: any) =>
            post.title?.toLowerCase().includes(searchLower) ||
            post.excerpt?.toLowerCase().includes(searchLower)
        );
      }

      // Pagination
      const startIndex = after ? posts.findIndex((p: any) => p.id.toString() === after) + 1 : 0;
      const endIndex = startIndex + first;
      const paginatedPosts = posts.slice(startIndex, endIndex);

      return {
        edges: paginatedPosts.map((post: any) => ({
          node: post,
          cursor: post.id.toString(),
        })),
        pageInfo: {
          hasNextPage: endIndex < posts.length,
          hasPreviousPage: startIndex > 0,
          startCursor: (paginatedPosts[0] as any)?.id.toString(),
          endCursor: (paginatedPosts[paginatedPosts.length - 1] as any)?.id.toString(),
        },
        totalCount: posts.length,
      };
    },

    // Category queries (placeholder - implement based on your data model)
    category: async (_: any, { id, slug }: { id?: number; slug?: string }) => {
      // Implement category queries
      return null;
    },

    categories: async () => {
      // Implement categories query
      return [];
    },

    // Service queries
    service: async (_: any, { slug }: { slug: string }) => {
      return services.getBySlug(slug);
    },

    services: async (_: any, { published }: { published?: boolean }) => {
      return services.getAll(published);
    },

    // Media queries (placeholder)
    mediaFile: async (_: any, { id }: { id: number }) => {
      // Implement media file query
      return null;
    },

    mediaFiles: async (_: any, { limit = 50, offset = 0 }: { limit?: number; offset?: number }) => {
      // Implement media files query
      return [];
    },

    // Workflow queries
    workflowStatus: async (
      _: any,
      { contentType, contentId }: { contentType: string; contentId: string }
    ) => {
      return workflowEngine.getWorkflowStatus(contentType, contentId);
    },

    // Analytics queries (placeholder)
    analytics: async (_: any, { dateRange }: { dateRange?: any }) => {
      return {
        pageViews: 0,
        uniqueVisitors: 0,
        topPosts: [],
        recentActivity: [],
      };
    },

    // Version queries (placeholder)
    contentVersions: async (
      _: any,
      { contentType, contentId }: { contentType: string; contentId: string }
    ) => {
      return [];
    },
  },

  Mutation: {
    // Auth mutations
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      const userWithPassword = users.findByEmailWithPassword(email);
      if (!userWithPassword) {
        return { success: false, error: 'Invalid credentials' };
      }

      const isValid = await bcrypt.compare(password, userWithPassword.password_hash);
      if (!isValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      const token = sessions.create(userWithPassword.id!);
      const { password_hash, ...user } = userWithPassword;
      return { success: true, token, user };
    },

    register: async (
      _: any,
      { email, password, name }: { email: string; password: string; name: string }
    ) => {
      try {
        const user = await users.create({ email, password, name, role: 'author' });
        const token = sessions.create(user.id!);
        return { success: true, token, user };
      } catch (error) {
        return { success: false, error: 'Registration failed' };
      }
    },

    logout: async (_: any, __: any, context: any) => {
      const token = context.req.cookies.get('auth-token')?.value;
      if (token) {
        sessions.delete(token);
      }
      return true;
    },

    // Blog post mutations
    createBlogPost: async (_: any, { input }: { input: any }, context: any) => {
      const session = await resolvers.Query.me(null, null, context);
      if (!session) throw new Error('Unauthorized');

      const result = blogPosts.create({
        ...input,
        author: session.name,
        publish_date: input.publishDate || new Date().toISOString(),
      });

      return { id: Number(result.lastInsertRowid), ...input, author: session.name };
    },

    updateBlogPost: async (_: any, { id, input }: { id: number; input: any }, context: any) => {
      const session = await resolvers.Query.me(null, null, context);
      if (!session) throw new Error('Unauthorized');

      blogPosts.update(id, input);
      return { id, ...input };
    },

    deleteBlogPost: async (_: any, { id }: { id: number }, context: any) => {
      const session = await resolvers.Query.me(null, null, context);
      if (!session) throw new Error('Unauthorized');

      blogPosts.delete(id);
      return true;
    },

    publishBlogPost: async (_: any, { id }: { id: number }, context: any) => {
      const session = await resolvers.Query.me(null, null, context);
      if (!session) throw new Error('Unauthorized');

      const publishDate = new Date().toISOString();
      blogPosts.update(id, { published: true, publish_date: publishDate });
      return { id, published: true, publish_date: publishDate };
    },

    unpublishBlogPost: async (_: any, { id }: { id: number }, context: any) => {
      const session = await resolvers.Query.me(null, null, context);
      if (!session) throw new Error('Unauthorized');

      blogPosts.update(id, { published: false });
      return { id, published: false };
    },

    // Category mutations (placeholder)
    createCategory: async (_: any, { input }: { input: any }) => {
      throw new Error('Not implemented');
    },

    updateCategory: async (_: any, { id, input }: { id: number; input: any }) => {
      throw new Error('Not implemented');
    },

    deleteCategory: async (_: any, { id }: { id: number }) => {
      throw new Error('Not implemented');
    },

    // Service mutations
    createService: async (_: any, { input }: { input: any }, context: any) => {
      const session = await resolvers.Query.me(null, null, context);
      if (!session) throw new Error('Unauthorized');

      const result = services.create(input);
      return { id: Number(result.lastInsertRowid), ...input };
    },

    updateService: async (_: any, { id, input }: { id: number; input: any }, context: any) => {
      const session = await resolvers.Query.me(null, null, context);
      if (!session) throw new Error('Unauthorized');

      services.update(id, input);
      return { id, ...input };
    },

    deleteService: async (_: any, { id }: { id: number }, context: any) => {
      const session = await resolvers.Query.me(null, null, context);
      if (!session) throw new Error('Unauthorized');

      services.delete(id);
      return true;
    },

    // Media mutations (placeholder)
    uploadMedia: async (_: any, { file }: { file: any }) => {
      throw new Error('Not implemented - use REST API for file uploads');
    },

    updateMediaFile: async (_: any, { id, input }: { id: number; input: any }) => {
      throw new Error('Not implemented');
    },

    deleteMediaFile: async (_: any, { id }: { id: number }) => {
      throw new Error('Not implemented');
    },

    // Workflow mutations
    executeWorkflowAction: async (
      _: any,
      {
        contentType,
        contentId,
        actionId,
        comment,
      }: { contentType: string; contentId: string; actionId: string; comment?: string },
      context: any
    ) => {
      const session = await resolvers.Query.me(null, null, context);
      if (!session) throw new Error('Unauthorized');

      await workflowEngine.executeAction(
        contentType,
        contentId,
        actionId,
        session.id.toString(),
        session.name,
        session.role,
        comment
      );

      return workflowEngine.getWorkflowStatus(contentType, contentId);
    },

    // Version mutations (placeholder)
    restoreVersion: async (
      _: any,
      { contentType, contentId, versionId }: { contentType: string; contentId: string; versionId: string }
    ) => {
      throw new Error('Not implemented');
    },
  },

  Subscription: {
    blogPostCreated: {
      subscribe: (_: any, __: any, { pubsub }: any) => pubsub.asyncIterator(['BLOG_POST_CREATED']),
    },

    blogPostUpdated: {
      subscribe: (_: any, { id }: { id: number }, { pubsub }: any) =>
        pubsub.asyncIterator([`BLOG_POST_UPDATED_${id}`]),
    },

    blogPostDeleted: {
      subscribe: (_: any, __: any, { pubsub }: any) => pubsub.asyncIterator(['BLOG_POST_DELETED']),
    },

    workflowTransition: {
      subscribe: (
        _: any,
        { contentType, contentId }: { contentType: string; contentId: string },
        { pubsub }: any
      ) => pubsub.asyncIterator([`WORKFLOW_TRANSITION_${contentType}_${contentId}`]),
    },

    collaborationUpdate: {
      subscribe: (_: any, { documentId }: { documentId: string }, { pubsub }: any) =>
        pubsub.asyncIterator([`COLLABORATION_UPDATE_${documentId}`]),
    },
  },

  // Field resolvers
  BlogPost: {
    author: async (parent: any) => {
      if (parent.author_id) {
        return users.findById(parent.author_id);
      }
      return null;
    },

    category: async (parent: any) => {
      // Implement category resolver
      return null;
    },

    workflow: async (parent: any) => {
      return workflowEngine.getWorkflowStatus('blog_post', parent.id.toString());
    },

    versions: async (parent: any) => {
      // Implement versions resolver
      return [];
    },

    viewCount: () => 0, // Implement view tracking
  },

  Category: {
    posts: async (parent: any) => {
      return blogPosts.getAll(true).filter((post: any) => post.category_id === parent.id);
    },

    postCount: async (parent: any) => {
      return blogPosts.getAll(true).filter((post: any) => post.category_id === parent.id).length;
    },
  },

  MediaFile: {
    uploadedBy: async (parent: any) => {
      if (parent.uploaded_by_id) {
        return users.findById(parent.uploaded_by_id);
      }
      return null;
    },
  },

  ContentVersion: {
    createdBy: async (parent: any) => {
      return users.findById(parent.created_by_id);
    },
  },

  ActivityEvent: {
    user: async (parent: any) => {
      if (parent.user_id) {
        return users.findById(parent.user_id);
      }
      return null;
    },
  },

  // Scalar resolvers
  DateTime: {
    serialize: (value: any) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    },
    parseValue: (value: any) => {
      return new Date(value);
    },
    parseLiteral: (ast: any) => {
      if (ast.kind === 'StringValue') {
        return new Date(ast.value);
      }
      return null;
    },
  },

  JSON: {
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
    parseLiteral: (ast: any) => {
      if (ast.kind === 'ObjectValue') {
        return ast.value;
      }
      return null;
    },
  },
};


