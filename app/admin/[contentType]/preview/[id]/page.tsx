"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type ContentType = "blog" | "ebook" | "case-study" | "whitepaper";

const contentTypeMap = {
  blog: { api: "blog", displayName: "Blog Post" },
  ebook: { api: "ebooks", displayName: "eBook" },
  "case-study": { api: "case-studies", displayName: "Case Study" },
  whitepaper: { api: "whitepapers", displayName: "Whitepaper" },
};

export default function ContentPreviewPage() {
  const params = useParams();
  const contentType = params?.contentType as ContentType;
  const id = params?.id as string;

  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contentType || !id) return;

    const config = contentTypeMap[contentType];
    if (!config) {
      setError("Invalid content type");
      setLoading(false);
      return;
    }

    fetchContent(config.api, id);
  }, [contentType, id]);

  const fetchContent = async (apiPath: string, contentId: string) => {
    try {
      const res = await fetch(`/api/cms/${apiPath}/${contentId}`);
      const data = await res.json();

      if (data.success && data.data) {
        setContent(data.data);
      } else {
        setError("Content not found");
      }
    } catch (err) {
      console.error("Failed to fetch content:", err);
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html: string) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Content Not Found</h1>
          <p className="text-slate-600">{error || "The content you're looking for doesn't exist."}</p>
          <a href="/admin" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const config = contentTypeMap[contentType]!;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const previewUrl = getPreviewUrl(contentType, content.slug);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Preview Banner */}
      <div className="bg-yellow-500 text-white px-6 py-3 text-center font-semibold">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>📄 Preview Mode - {config.displayName}</span>
          <div className="flex items-center gap-4">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline font-normal"
            >
              View on Site →
            </a>
            <button
              onClick={() => window.close()}
              className="text-white hover:underline font-normal"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold text-slate-900 mb-4"
            dangerouslySetInnerHTML={{ __html: content.title }}
          />
          {content.excerpt && (
            <p className="text-xl text-slate-600 leading-relaxed">
              {stripHtml(content.excerpt)}
            </p>
          )}
          {content.author && (
            <p className="text-sm text-slate-500 mt-4">By {content.author}</p>
          )}
        </div>

        {/* Featured Image */}
        {content.featured_image && (
          <img
            src={content.featured_image}
            alt={content.title}
            className="w-full h-auto rounded-lg mb-8"
          />
        )}

        {/* Content */}
        {content.content && (
          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: content.content }}
          />
        )}

        {/* Description */}
        {content.description && (
          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: content.description }}
          />
        )}

        {/* Case Study Specific Fields */}
        {contentType === "case-study" && (
          <>
            {content.challenge && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
                <h2 className="text-2xl font-bold text-red-900 mb-3">Challenge</h2>
                <div dangerouslySetInnerHTML={{ __html: content.challenge }} />
              </div>
            )}
            {content.solution && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
                <h2 className="text-2xl font-bold text-blue-900 mb-3">Solution</h2>
                <div dangerouslySetInnerHTML={{ __html: content.solution }} />
              </div>
            )}
            {content.results && (
              <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6">
                <h2 className="text-2xl font-bold text-green-900 mb-3">Results</h2>
                <div dangerouslySetInnerHTML={{ __html: content.results }} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function getPreviewUrl(contentType: ContentType, slug: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  const baseUrl = process.env.NEXT_PUBLIC_REACT_APP_URL || "http://localhost:3001";

  switch (contentType) {
    case "blog":
      return `${baseUrl}/blog/${slug}`;
    case "ebook":
      return `${baseUrl}/ebooks/${slug}`;
    case "case-study":
      return `${baseUrl}/case-studies/${slug}`;
    case "whitepaper":
      return `${baseUrl}/whitepapers/${slug}`;
    default:
      return baseUrl;
  }
}

