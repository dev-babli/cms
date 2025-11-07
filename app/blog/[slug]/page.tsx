"use client";

import { useEffect, useState } from "react";
import { Navbar5 } from "@/components/sections/blog/components/navbar-05";
import { Footer5 } from "@/components/sections/blog/components/footer-05";
import { FadeIn } from "@/components/ui/scroll-reveal";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: PageProps) {
  // Unwrap params for client component
  const unwrappedParams = params as unknown as { slug: string };
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/cms/blog/${unwrappedParams.slug}`);
      const data = await res.json();
      if (data.success && data.data) {
        setPost(data.data);
      } else {
        notFound();
      }
    } catch (error) {
      console.error("Failed to fetch post:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar5 />
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer5 />
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return (
    <div>
      <Navbar5 />

      <article className="px-6 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="mb-12">
              {post.category && (
                <span className="text-sm font-medium text-primary mb-4 block">
                  {post.category}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
                {post.title}
              </h1>
              {post.author && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>By {post.author}</span>
                  {post.publish_date && (
                    <>
                      <span>·</span>
                      <span>
                        {new Date(post.publish_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </FadeIn>

          {post.featured_image && (
            <FadeIn delay={0.1}>
              <div className="mb-12 rounded-xl overflow-hidden">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full aspect-video object-cover"
                />
              </div>
            </FadeIn>
          )}

          <FadeIn delay={0.2}>
            <div
              className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </FadeIn>

          {post.tags && (
            <FadeIn delay={0.3}>
              <div className="mt-12 pt-8 border-t">
                <div className="flex flex-wrap gap-2">
                  {post.tags.split(",").map((tag: string) => (
                    <span
                      key={tag.trim()}
                      className="px-3 py-1 bg-muted rounded-full text-sm"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          <FadeIn delay={0.4}>
            <div className="mt-12 text-center">
              <Link href="/blog">
                <button className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  ← Back to Blog
                </button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </article>

      <Footer5 />
    </div>
  );
}
