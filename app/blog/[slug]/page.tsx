import { notFound } from 'next/navigation';
import { blogPosts } from '@/lib/cms/api';
import type { Metadata } from 'next';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Modern Header with Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/blog" 
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group"
            >
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Featured Image */}
      {post.featured_image && (
        <div className="relative w-full h-[60vh] min-h-[500px] max-h-[700px] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-700">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-6 pb-12">
            <div className="flex items-center gap-4 mb-4 text-white/90 text-sm">
              {post.category && (
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold border border-white/30">
                  {post.category}
                </span>
              )}
              {post.publish_date && (
                <span className="text-white/80">{formatDate(post.publish_date)}</span>
              )}
              {post.author && (
                <span className="text-white/80">By {post.author}</span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl drop-shadow-md">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        {/* Meta Info (if no featured image) */}
        {!post.featured_image && (
          <>
            <div className="mb-6 flex items-center gap-4 text-sm text-slate-600">
              {post.category && (
                <span className="px-4 py-1.5 bg-slate-100 rounded-full text-xs font-semibold">
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-xl text-slate-600 mb-12 leading-relaxed font-light">
                {post.excerpt}
              </p>
            )}
          </>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg prose-slate max-w-none
            prose-headings:text-slate-900 prose-headings:font-bold
            prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:tracking-tight
            prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:tracking-tight
            prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-8 prose-h3:tracking-tight
            prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
            prose-strong:text-slate-900 prose-strong:font-semibold
            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6 prose-ul:text-lg
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-6 prose-ol:text-lg
            prose-li:text-slate-700 prose-li:mb-2 prose-li:leading-relaxed
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-slate-600 prose-blockquote:bg-slate-50 prose-blockquote:py-4 prose-blockquote:my-6
            prose-code:text-blue-600 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:shadow-xl
            prose-img:rounded-xl prose-img:shadow-xl prose-img:my-10 prose-img:w-full
            prose-hr:border-slate-200 prose-hr:my-10
            [&_.lead]:text-xl [&_.lead]:font-light [&_.lead]:text-slate-600 [&_.lead]:leading-relaxed
            [&_div[style*='background']]:rounded-xl [&_div[style*='background']]:shadow-lg
            [&_div[style*='border']]:rounded-lg"
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* Tags Section */}
        {post.tags && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <h3 className="text-sm font-semibold mb-6 text-slate-600 uppercase tracking-wide">Tags</h3>
            <div className="flex flex-wrap gap-3">
              {post.tags.split(',').map((tag, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 rounded-full text-sm font-medium text-slate-700 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share Section */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-600">Share:</span>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

