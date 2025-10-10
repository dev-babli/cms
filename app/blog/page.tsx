"use client";

import React, { useEffect, useState } from "react";
import { Navbar5 } from "@/components/sections/blog/components/navbar-05";
import { Footer5 } from "@/components/sections/blog/components/footer-05";
import { FadeIn } from "@/components/ui/scroll-reveal";
import Link from "next/link";

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Show all posts (including drafts) - remove ?published=true to see everything
      const res = await fetch("/api/cms/blog");
      const data = await res.json();
      console.log("Fetched posts:", data); // Debug
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <Navbar5 />

      {/* Hero */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <FadeIn>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-6">
              Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Insights, stories, and ideas from our team
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : posts.length === 0 ? (
            <FadeIn>
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No posts yet</p>
                <Link href="/admin/blog/new">
                  <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                    Create First Post
                  </button>
                </Link>
              </div>
            </FadeIn>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <FadeIn key={post.id} delay={index * 0.05}>
                  <Link href={`/blog/${post.slug}`}>
                    <article className="group cursor-pointer">
                      {post.featured_image && (
                        <div className="aspect-[16/10] overflow-hidden rounded-lg mb-4 bg-muted">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {post.category && (
                            <span className="text-xs font-medium text-primary">
                              {post.category}
                            </span>
                          )}
                          {!post.published && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                              Draft
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        {post.author && (
                          <p className="text-sm text-muted-foreground">
                            By {post.author}
                          </p>
                        )}
                      </div>
                    </article>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer5 />
    </div>
  );
}
