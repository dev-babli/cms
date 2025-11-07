// Simple seed script to populate database with sample content
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'content.db');
const db = new Database(dbPath);

// Sample blog posts
const samplePosts = [
  {
    slug: "ai-transformation-guide",
    title: "The Complete Guide to AI Transformation",
    excerpt: "Learn how to successfully implement AI in your organization with our comprehensive guide.",
    content: "<h2>Introduction to AI Transformation</h2><p>Artificial Intelligence is revolutionizing how businesses operate. In this comprehensive guide, we'll explore the key steps to successfully transform your organization with AI.</p><h2>Key Steps</h2><ul><li>Assess your current infrastructure</li><li>Identify AI opportunities</li><li>Build a skilled team</li><li>Start with pilot projects</li><li>Scale what works</li></ul><h2>Conclusion</h2><p>AI transformation is a journey, not a destination. Start small, learn fast, and scale strategically.</p>",
    author: "Sarah Johnson",
    featured_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
    category: "AI Strategy",
    tags: "ai, transformation, strategy, guide",
    published: 1,
    publish_date: "2024-10-01",
  },
  {
    slug: "machine-learning-trends-2024",
    title: "Top Machine Learning Trends in 2024",
    excerpt: "Discover the latest trends shaping the future of machine learning and AI technology.",
    content: "<h2>The Future is Here</h2><p>Machine learning continues to evolve at a rapid pace. Here are the top trends we're seeing in 2024.</p><h2>Trending Technologies</h2><ol><li>Generative AI Models</li><li>Edge AI Computing</li><li>Multimodal AI Systems</li><li>AutoML Platforms</li><li>Explainable AI</li></ol><p>These technologies are transforming industries from healthcare to finance.</p>",
    author: "Michael Chen",
    featured_image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1200&auto=format&fit=crop",
    category: "Technology",
    tags: "machine-learning, trends, ai, 2024",
    published: 1,
    publish_date: "2024-09-15",
  },
  {
    slug: "building-scalable-ai-systems",
    title: "Building Scalable AI Systems",
    excerpt: "Best practices for building AI systems that can grow with your business.",
    content: "<h2>Scalability Matters</h2><p>Building AI systems that scale is crucial for long-term success. Let's explore the key principles.</p><h2>Architecture Principles</h2><ul><li>Microservices design</li><li>Cloud-native architecture</li><li>Containerization</li><li>API-first approach</li></ul><p>Start with these foundations to ensure your AI systems can handle growth.</p>",
    author: "David Martinez",
    featured_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
    category: "Engineering",
    tags: "scalability, architecture, engineering, ai",
    published: 1,
    publish_date: "2024-09-01",
  },
];

console.log('🌱 Seeding database with sample content...');

try {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO blog_posts (slug, title, excerpt, content, author, featured_image, category, tags, published, publish_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  samplePosts.forEach(post => {
    stmt.run(
      post.slug, post.title, post.excerpt, post.content,
      post.author, post.featured_image, post.category, post.tags,
      post.published, post.publish_date
    );
  });

  console.log('✅ Successfully seeded', samplePosts.length, 'blog posts!');
  console.log('');
  console.log('🎉 You can now:');
  console.log('   1. Visit http://localhost:3000/admin to manage content');
  console.log('   2. Visit http://localhost:3000/blog to see your blog');
  console.log('');
} catch (error) {
  console.error('❌ Seeding failed:', error);
} finally {
  db.close();
}





