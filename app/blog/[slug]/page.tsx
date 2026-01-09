import { notFound } from 'next/navigation';
import { blogPosts } from '@/lib/cms/api';
import type { Metadata } from 'next';
import Link from 'next/link';
import { sanitizeArticleContent } from '@/lib/utils/sanitize';

function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/blog/${slug}`;
  
  return (
    <>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150"
        aria-label="Share on Facebook"
      >
        <svg className="w-4 h-4 text-[#6B7280]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150"
        aria-label="Share on Twitter"
      >
        <svg className="w-4 h-4 text-[#6B7280]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150"
        aria-label="Share on LinkedIn"
      >
        <svg className="w-4 h-4 text-[#6B7280]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
    </>
  );
}

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

  // Get all published posts for related articles, recent posts, etc.
  const allPosts = await blogPosts.getAll(true); // Only published posts
  const currentIndex = allPosts.findIndex((p: any) => p.slug === slug);
  
  // Previous/Next articles
  const previousArticle = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  
  // Related articles (same category, excluding current)
  const relatedArticles = allPosts
    .filter((p: any) => 
      p.slug !== slug && 
      (p.category === post.category || p.thumb === post.category) &&
      p.published
    )
    .slice(0, 3);
  
  // Recent posts (excluding current)
  const recentPosts = allPosts
    .filter((p: any) => p.slug !== slug && p.published)
    .sort((a: any, b: any) => {
      const dateA = new Date(a.publish_date || a.created_at || 0).getTime();
      const dateB = new Date(b.publish_date || b.created_at || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);
  
  // Get all categories
  const categories = Array.from(new Set(
    allPosts
      .map((p: any) => p.category || p.thumb)
      .filter(Boolean)
  )).slice(0, 10);
  
  // Get all tags
  const allTags = Array.from(new Set(
    allPosts
      .flatMap((p: any) => (p.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean))
  )).slice(0, 15);
  
  // Popular posts (by publish date, most recent first)
  const popularPosts = allPosts
    .filter((p: any) => p.slug !== slug && p.published)
    .sort((a: any, b: any) => {
      const dateA = new Date(a.publish_date || a.created_at || 0).getTime();
      const dateB = new Date(b.publish_date || b.created_at || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

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

  const getReadTime = (content: string | null) => {
    if (!content) return '1 min read';
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const readTime = Math.ceil(wordCount / 200);
    return `${readTime} min read`;
  };

  const bannerImage = (post as any).banner_image || post.featured_image;
  const hasBanner = !!bannerImage;

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header - Sanity Style */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link 
              href="/blog" 
              className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors duration-150"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors duration-150">
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Cinematic Hero Section - Full Bleed */}
      {hasBanner && (
        <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden bg-[#111827]">
          <img
            src={bannerImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          {/* Subtle dark overlay - no gradient */}
          <div className="absolute inset-0 bg-black/45" />
          {/* Content overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-4xl mx-auto w-full px-6 pb-12">
              <div className="mb-4 flex items-center gap-4 text-sm text-white/90">
                {post.category && (
                  <span className="px-3 py-1 bg-white/10 border border-white/20 rounded text-xs font-medium">
                    {post.category}
                  </span>
                )}
                {post.publish_date && (
                  <span className="text-white/80">{formatDate(post.publish_date)}</span>
                )}
                {post.author && (
                  <span className="text-white/80">By {post.author}</span>
                )}
                <span className="text-white/70">•</span>
                <span className="text-white/80">{getReadTime(post.content || '')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-4">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl">
                  {post.excerpt}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Article Content - Narrow Reading Width */}
      <article className={`max-w-3xl mx-auto px-6 ${hasBanner ? 'py-16' : 'pt-12 pb-16'}`}>
        {/* Meta Info (if no banner) */}
        {!hasBanner && (
          <>
            <div className="mb-6 flex items-center gap-4 text-sm text-[#6B7280]">
              {post.category && (
                <span className="px-3 py-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-xs font-medium text-[#111827]">
                  {post.category}
                </span>
              )}
              {post.author && (
                <span className="font-medium text-[#111827]">By {post.author}</span>
              )}
              {post.publish_date && (
                <span className="text-[#6B7280]">{formatDate(post.publish_date)}</span>
              )}
              <span className="text-[#6B7280]">•</span>
              <span className="text-[#6B7280]">{getReadTime(post.content || '')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold mb-6 text-[#111827] leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-xl text-[#6B7280] mb-12 leading-relaxed border-l-4 border-[#E5E7EB] pl-6">
                {post.excerpt}
              </p>
            )}
          </>
        )}

        {/* Content - Sanity Style Typography */}
        <div 
          className="prose prose-lg max-w-none
            prose-headings:text-[#111827] prose-headings:font-semibold
            prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:font-semibold prose-h1:border-b prose-h1:border-[#E5E7EB] prose-h1:pb-3
            prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-10 prose-h2:font-semibold
            prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-8 prose-h3:font-semibold
            prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-6 prose-h4:font-semibold
            prose-h5:text-base prose-h5:mb-2 prose-h5:mt-4 prose-h5:font-medium
            prose-h6:text-sm prose-h6:mb-2 prose-h6:mt-4 prose-h6:font-medium prose-h6:uppercase prose-h6:tracking-wider prose-h6:text-[#6B7280]
            prose-p:text-[#111827] prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base
            prose-a:text-[#3B82F6] prose-a:no-underline hover:prose-a:underline prose-a:font-medium
            prose-strong:text-[#111827] prose-strong:font-semibold
            prose-ul:list-disc prose-ul:list-outside prose-ul:pl-6 prose-ul:mb-4 prose-ul:text-base prose-ul:space-y-1
            prose-ol:list-decimal prose-ol:list-outside prose-ol:pl-6 prose-ol:mb-4 prose-ol:text-base prose-ol:space-y-1
            prose-li:text-[#111827] prose-li:mb-1 prose-li:leading-relaxed
            prose-blockquote:border-l-4 prose-blockquote:border-[#E5E7EB] prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-[#6B7280] prose-blockquote:bg-[#F9FAFB] prose-blockquote:py-4 prose-blockquote:my-6 prose-blockquote:rounded-r
            prose-code:text-[#111827] prose-code:bg-[#F9FAFB] prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:border prose-code:border-[#E5E7EB]
            prose-pre:bg-[#F9FAFB] prose-pre:text-[#111827] prose-pre:rounded prose-pre:p-4 prose-pre:border prose-pre:border-[#E5E7EB] prose-pre:overflow-x-auto
            prose-img:rounded prose-img:my-8 prose-img:w-full prose-img:border prose-img:border-[#E5E7EB]
            prose-hr:border-[#E5E7EB] prose-hr:my-8 prose-hr:border-t
            [&_img[style*='float:left']]:float-left [&_img[style*='float:left']]:mr-4 [&_img[style*='float:left']]:mb-4 [&_img[style*='float:left']]:max-w-sm [&_img[style*='float:left']]:rounded [&_img[style*='float:left']]:border [&_img[style*='float:left']]:border-[#E5E7EB]
            [&_img[style*='float:right']]:float-right [&_img[style*='float:right']]:ml-4 [&_img[style*='float:right']]:mb-4 [&_img[style*='float:right']]:max-w-sm [&_img[style*='float:right']]:rounded [&_img[style*='float:right']]:border [&_img[style*='float:right']]:border-[#E5E7EB]
            [&_img[style*='display:block']]:block [&_img[style*='display:block']]:mx-auto [&_img[style*='display:block']]:max-w-3xl"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(post.content || '') }}
        />

        {/* Tags Section - Flat Design */}
        {post.tags && (
          <div className="mt-16 pt-8 border-t border-[#E5E7EB]">
            <h3 className="text-sm font-medium mb-4 text-[#6B7280] uppercase tracking-wide">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.split(',').map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-sm font-medium text-[#111827] hover:bg-[#F3F4F6] transition-colors duration-150"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share Section - Minimal */}
        <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[#6B7280]">Share:</span>
            <div className="flex items-center gap-2">
              <ShareButtons slug={slug} title={post.title} />
            </div>
          </div>
        </div>

        {/* Previous/Next Navigation */}
        {(previousArticle || nextArticle) && (
          <div className="mt-16 pt-8 border-t border-[#E5E7EB] grid grid-cols-1 md:grid-cols-2 gap-6">
            {previousArticle ? (
              <Link 
                href={`/blog/${previousArticle.slug}`}
                className="group p-4 border border-[#E5E7EB] rounded hover:bg-[#F9FAFB] transition-colors duration-150"
              >
                <div className="flex items-center gap-2 mb-2 text-xs font-medium text-[#6B7280] uppercase tracking-wide">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Article
                </div>
                <h3 className="text-sm font-semibold text-[#111827] group-hover:text-[#3B82F6] transition-colors duration-150 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {previousArticle.title}
                </h3>
                {previousArticle.author && (
                  <p className="text-xs text-[#6B7280] mt-2">By {previousArticle.author}</p>
                )}
              </Link>
            ) : (
              <div></div>
            )}
            {nextArticle ? (
              <Link 
                href={`/blog/${nextArticle.slug}`}
                className="group p-4 border border-[#E5E7EB] rounded hover:bg-[#F9FAFB] transition-colors duration-150 md:text-right"
              >
                <div className="flex items-center gap-2 mb-2 text-xs font-medium text-[#6B7280] uppercase tracking-wide md:justify-end">
                  Next Article
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-[#111827] group-hover:text-[#3B82F6] transition-colors duration-150 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {nextArticle.title}
                </h3>
                {nextArticle.author && (
                  <p className="text-xs text-[#6B7280] mt-2">By {nextArticle.author}</p>
                )}
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-16 pt-8 border-t border-[#E5E7EB]">
            <h2 className="text-xl font-semibold text-[#111827] mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related: any) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group border border-[#E5E7EB] rounded overflow-hidden hover:bg-[#F9FAFB] transition-colors duration-150"
                >
                  {related.featured_image && (
                    <div className="aspect-video overflow-hidden bg-[#F9FAFB]">
                      <img
                        src={related.featured_image}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    {related.category && (
                      <span className="inline-block px-2 py-1 mb-2 text-xs font-medium text-[#6B7280] bg-[#F9FAFB] border border-[#E5E7EB] rounded">
                        {related.category}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-[#111827] group-hover:text-[#3B82F6] transition-colors duration-150 mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {related.title}
                    </h3>
                    {related.author && (
                      <p className="text-xs text-[#6B7280]">By {related.author}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Sidebar Section */}
      <aside className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16 pt-8 border-t border-[#E5E7EB]">
          {/* Recent Posts */}
          <div>
            <h3 className="text-sm font-semibold text-[#111827] mb-4 uppercase tracking-wide">Recent Posts</h3>
            <div className="space-y-4">
              {recentPosts.map((recent: any) => (
                <Link
                  key={recent.slug}
                  href={`/blog/${recent.slug}`}
                  className="group block pb-4 border-b border-[#E5E7EB] last:border-0 last:pb-0"
                >
                  <h4 className="text-sm font-medium text-[#111827] group-hover:text-[#3B82F6] transition-colors duration-150 mb-1 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {recent.title}
                  </h4>
                  {recent.publish_date && (
                    <p className="text-xs text-[#6B7280]">{formatDate(recent.publish_date)}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-[#111827] mb-4 uppercase tracking-wide">Categories</h3>
            <div className="space-y-2">
              {(categories as string[]).map((category: string) => (
                <Link
                  key={category}
                  href={`/blog?category=${encodeURIComponent(category)}`}
                  className="block text-sm text-[#6B7280] hover:text-[#111827] transition-colors duration-150 py-1"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          <div>
            <h3 className="text-sm font-semibold text-[#111827] mb-4 uppercase tracking-wide">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {(allTags as string[]).map((tag: string) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-xs font-medium text-[#111827] hover:bg-[#F3F4F6] transition-colors duration-150"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Posts */}
        {popularPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
            <h3 className="text-sm font-semibold text-[#111827] mb-6 uppercase tracking-wide">Popular Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {popularPosts.map((popular: any) => (
                <Link
                  key={popular.slug}
                  href={`/blog/${popular.slug}`}
                  className="group"
                >
                  {popular.featured_image && (
                    <div className="aspect-video overflow-hidden bg-[#F9FAFB] rounded mb-2">
                      <img
                        src={popular.featured_image}
                        alt={popular.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h4 className="text-xs font-medium text-[#111827] group-hover:text-[#3B82F6] transition-colors duration-150 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {popular.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Follow Us Section */}
        <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
          <h3 className="text-sm font-semibold text-[#111827] mb-4 uppercase tracking-wide">Follow Us</h3>
          <p className="text-sm text-[#6B7280] mb-4">Stay connected for the latest updates and insights.</p>
          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/company/intellectt"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5 text-[#6B7280]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href="https://twitter.com/intellectt"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5 text-[#6B7280]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a
              href="https://www.facebook.com/intellectt"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors duration-150"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5 text-[#6B7280]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
