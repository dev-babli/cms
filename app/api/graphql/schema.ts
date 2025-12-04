export const typeDefs = `#graphql
  scalar DateTime
  scalar JSON

  # User Types
  type User {
    id: ID!
    email: String!
    name: String!
    avatar: String
    bio: String
    role: String!
    status: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Blog Post Types
  type BlogPost {
    id: ID!
    slug: String!
    title: String!
    excerpt: String
    content: String
    author: User
    featuredImage: String
    category: Category
    tags: [String!]
    published: Boolean!
    publishDate: DateTime
    seoTitle: String
    seoDescription: String
    viewCount: Int
    workflow: WorkflowStatus
    versions: [ContentVersion!]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type BlogPostConnection {
    edges: [BlogPostEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type BlogPostEdge {
    node: BlogPost!
    cursor: String!
  }

  # Category Types
  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    color: String
    icon: String
    posts: [BlogPost!]
    postCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Media Types
  type MediaFile {
    id: ID!
    filename: String!
    originalName: String!
    url: String!
    mimeType: String!
    size: Int!
    altText: String
    tags: [String!]
    dimensions: ImageDimensions
    aiAnalysis: AIAnalysis
    uploadedBy: User
    createdAt: DateTime!
  }

  type ImageDimensions {
    width: Int!
    height: Int!
  }

  type AIAnalysis {
    tags: [String!]
    altText: String
    colors: [ColorInfo!]
    objects: [DetectedObject!]
  }

  type ColorInfo {
    hex: String!
    percentage: Float!
  }

  type DetectedObject {
    name: String!
    confidence: Float!
  }

  # Workflow Types
  type WorkflowStatus {
    currentStage: String!
    stageInfo: WorkflowStage!
    history: [WorkflowTransition!]!
    canEdit: Boolean!
    isComplete: Boolean!
  }

  type WorkflowStage {
    id: String!
    name: String!
    description: String
    color: String!
  }

  type WorkflowTransition {
    id: String!
    actionId: String!
    fromStage: String!
    toStage: String!
    userId: String!
    userName: String!
    comment: String
    timestamp: DateTime!
  }

  # Content Version Types
  type ContentVersion {
    id: String!
    contentId: String!
    version: Int!
    content: JSON!
    createdBy: User!
    createdAt: DateTime!
    comment: String
  }

  # Analytics Types
  type Analytics {
    pageViews: Int!
    uniqueVisitors: Int!
    topPosts: [BlogPost!]!
    recentActivity: [ActivityEvent!]!
  }

  type ActivityEvent {
    id: ID!
    type: String!
    user: User
    resource: String!
    action: String!
    timestamp: DateTime!
  }

  # Pagination Types
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  # Query Type
  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!

    # Blog post queries
    blogPost(id: ID, slug: String): BlogPost
    blogPosts(
      limit: Int
      offset: Int
      published: Boolean
      categoryId: ID
      tag: String
      search: String
      sortBy: String
      sortOrder: String
    ): [BlogPost!]!
    
    blogPostsPaginated(
      first: Int
      after: String
      published: Boolean
      categoryId: ID
      tag: String
      search: String
    ): BlogPostConnection!

    # Category queries
    category(id: ID, slug: String): Category
    categories: [Category!]!

    # Media queries
    mediaFile(id: ID!): MediaFile
    mediaFiles(
      limit: Int
      offset: Int
      type: String
      search: String
    ): [MediaFile!]!

    # Workflow queries
    workflowStatus(contentType: String!, contentId: String!): WorkflowStatus

    # Analytics queries
    analytics(dateRange: DateRangeInput): Analytics!

    # Version queries
    contentVersions(contentType: String!, contentId: String!): [ContentVersion!]!
  }

  # Mutation Type
  type Mutation {
    # Auth mutations
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, name: String!): AuthPayload!
    logout: Boolean!

    # Blog post mutations
    createBlogPost(input: CreateBlogPostInput!): BlogPost!
    updateBlogPost(id: ID!, input: UpdateBlogPostInput!): BlogPost!
    deleteBlogPost(id: ID!): Boolean!
    publishBlogPost(id: ID!): BlogPost!
    unpublishBlogPost(id: ID!): BlogPost!

    # Category mutations
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!

    # Media mutations
    uploadMedia(file: Upload!): MediaFile!
    updateMediaFile(id: ID!, input: UpdateMediaFileInput!): MediaFile!
    deleteMediaFile(id: ID!): Boolean!

    # Workflow mutations
    executeWorkflowAction(
      contentType: String!
      contentId: String!
      actionId: String!
      comment: String
    ): WorkflowStatus!

    # Version mutations
    restoreVersion(contentType: String!, contentId: String!, versionId: String!): Boolean!
  }

  # Subscription Type
  type Subscription {
    blogPostCreated: BlogPost!
    blogPostUpdated(id: ID!): BlogPost!
    blogPostDeleted: ID!
    
    workflowTransition(contentType: String!, contentId: String!): WorkflowTransition!
    
    collaborationUpdate(documentId: String!): CollaborationUpdate!
  }

  type CollaborationUpdate {
    type: String!
    userId: String!
    data: JSON!
  }

  # Input Types
  input CreateBlogPostInput {
    slug: String!
    title: String!
    excerpt: String
    content: String
    featuredImage: String
    categoryId: ID
    tags: [String!]
    published: Boolean
    publishDate: DateTime
    seoTitle: String
    seoDescription: String
  }

  input UpdateBlogPostInput {
    slug: String
    title: String
    excerpt: String
    content: String
    featuredImage: String
    categoryId: ID
    tags: [String!]
    published: Boolean
    publishDate: DateTime
    seoTitle: String
    seoDescription: String
  }

  input CreateCategoryInput {
    name: String!
    slug: String!
    description: String
    color: String
    icon: String
  }

  input UpdateCategoryInput {
    name: String
    slug: String
    description: String
    color: String
    icon: String
  }

  input UpdateMediaFileInput {
    altText: String
    tags: [String!]
  }

  input DateRangeInput {
    from: DateTime!
    to: DateTime!
  }

  type AuthPayload {
    success: Boolean!
    token: String
    user: User
    error: String
  }

  scalar Upload
`;




