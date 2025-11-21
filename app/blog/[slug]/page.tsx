import { notFound } from 'next/navigation';
import { blogPosts } from '@/lib/cms/api';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await blogPosts.getBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.content?.substring(0, 160) || '',
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      images: post.featured_image ? [post.featured_image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await blogPosts.getBySlug(slug);

  if (!post) {
    notFound();
  }

  // Only show published posts to public
  if (!post.published) {
    notFound();
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Admin
          </a>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}

        {/* Meta Info */}
        <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
          {post.category && (
            <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium">
              {post.category}
            </span>
          )}
          {post.author && (
            <span>By {post.author}</span>
          )}
          {post.publish_date && (
            <span>{formatDate(post.publish_date)}</span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* Tags */}
        {post.tags && (
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.split(',').map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-muted rounded-full text-xs"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

