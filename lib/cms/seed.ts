import { blogPosts, teamMembers } from './api';

export function seedDatabase() {
  // Sample Blog Posts
  const samplePosts = [
    {
      slug: "ai-transformation-guide",
      title: "The Complete Guide to AI Transformation",
      excerpt: "Learn how to successfully implement AI in your organization with our comprehensive guide.",
      content: `
        <h2>Introduction to AI Transformation</h2>
        <p>Artificial Intelligence is revolutionizing how businesses operate. In this comprehensive guide, we'll explore the key steps to successfully transform your organization with AI.</p>
        
        <h2>Key Steps</h2>
        <ul>
          <li>Assess your current infrastructure</li>
          <li>Identify AI opportunities</li>
          <li>Build a skilled team</li>
          <li>Start with pilot projects</li>
          <li>Scale what works</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>AI transformation is a journey, not a destination. Start small, learn fast, and scale strategically.</p>
      `,
      author: "Sarah Johnson",
      featured_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
      category: "AI Strategy",
      tags: "ai, transformation, strategy, guide",
      published: true,
      publish_date: "2024-10-01",
    },
    {
      slug: "machine-learning-trends-2024",
      title: "Top Machine Learning Trends in 2024",
      excerpt: "Discover the latest trends shaping the future of machine learning and AI technology.",
      content: `
        <h2>The Future is Here</h2>
        <p>Machine learning continues to evolve at a rapid pace. Here are the top trends we're seeing in 2024.</p>
        
        <h2>Trending Technologies</h2>
        <ol>
          <li>Generative AI Models</li>
          <li>Edge AI Computing</li>
          <li>Multimodal AI Systems</li>
          <li>AutoML Platforms</li>
          <li>Explainable AI</li>
        </ol>
        
        <p>These technologies are transforming industries from healthcare to finance.</p>
      `,
      author: "Michael Chen",
      featured_image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1200&auto=format&fit=crop",
      category: "Technology",
      tags: "machine-learning, trends, ai, 2024",
      published: true,
      publish_date: "2024-09-15",
    },
    {
      slug: "building-scalable-ai-systems",
      title: "Building Scalable AI Systems",
      excerpt: "Best practices for building AI systems that can grow with your business.",
      content: `
        <h2>Scalability Matters</h2>
        <p>Building AI systems that scale is crucial for long-term success. Let's explore the key principles.</p>
        
        <h2>Architecture Principles</h2>
        <ul>
          <li>Microservices design</li>
          <li>Cloud-native architecture</li>
          <li>Containerization</li>
          <li>API-first approach</li>
        </ul>
        
        <p>Start with these foundations to ensure your AI systems can handle growth.</p>
      `,
      author: "David Martinez",
      featured_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
      category: "Engineering",
      tags: "scalability, architecture, engineering, ai",
      published: true,
      publish_date: "2024-09-01",
    },
  ];

  // Sample Team Members
  const sampleTeam = [
    {
      name: "Sarah Johnson",
      position: "CEO & Founder",
      bio: "15+ years of experience in AI and machine learning. Former VP at Google AI.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
      email: "sarah@emscale.com",
      linkedin: "linkedin.com/in/sarahjohnson",
      order_index: 1,
      published: true,
    },
    {
      name: "Michael Chen",
      position: "CTO",
      bio: "PhD in Computer Science. Specializes in deep learning and neural networks.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
      email: "michael@emscale.com",
      linkedin: "linkedin.com/in/michaelchen",
      order_index: 2,
      published: true,
    },
  ];

  try {
    // Seed blog posts
    samplePosts.forEach(post => {
      try {
        blogPosts.create(post);
      } catch (error) {
        console.log('Post already exists:', post.slug);
      }
    });

    // Seed team members
    sampleTeam.forEach(member => {
      try {
        teamMembers.create(member);
      } catch (error) {
        console.log('Team member already exists:', member.name);
      }
    });

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}





