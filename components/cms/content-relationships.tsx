"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, X, Search } from "lucide-react";

interface RelatedContent {
  id: number;
  type: string;
  title: string;
  slug: string;
}

interface ContentRelationshipsProps {
  contentType: string;
  contentId: number;
  relatedContent?: RelatedContent[];
  onAddRelationship?: (type: string, id: number) => void;
  onRemoveRelationship?: (id: number) => void;
}

export function ContentRelationships({
  contentType,
  contentId,
  relatedContent = [],
  onAddRelationship,
  onRemoveRelationship,
}: ContentRelationshipsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RelatedContent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search across all content types
      const types = ["blog", "news", "case-studies", "ebooks"];
      const results: RelatedContent[] = [];

      for (const type of types) {
        if (type === contentType) continue; // Skip current type

        try {
          const response = await fetch(`/api/cms/${type}?search=${encodeURIComponent(query)}`);
          const data = await response.json();
          if (data.success && data.data) {
            results.push(
              ...data.data.slice(0, 5).map((item: any) => ({
                id: item.id,
                type,
                title: item.title,
                slug: item.slug,
              }))
            );
          }
        } catch (error) {
          console.error(`Failed to search ${type}:`, error);
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (showSearch) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, showSearch]);

  const isAlreadyRelated = (id: number) => {
    return relatedContent.some((item) => item.id === id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[#111827]">Related Content</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSearch(!showSearch)}
          className="h-8 px-2 text-xs text-[#6B7280] hover:text-[#111827]"
        >
          <Link2 className="w-3.5 h-3.5 mr-1" />
          Add Related
        </Button>
      </div>

      {showSearch && (
        <div className="space-y-2 p-3 border border-[#E5E7EB] rounded-md bg-white">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search content..."
              className="pl-8 h-8 text-sm"
            />
          </div>
          {isSearching && (
            <p className="text-xs text-[#6B7280]">Searching...</p>
          )}
          {searchResults.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {searchResults.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="flex items-center justify-between p-2 hover:bg-[#F9FAFB] rounded-md"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#6B7280] uppercase">{result.type}</p>
                    <p className="text-sm text-[#111827] truncate">{result.title}</p>
                  </div>
                  {isAlreadyRelated(result.id) ? (
                    <span className="text-xs text-[#6B7280]">Added</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onAddRelationship?.(result.type, result.id);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      Add
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {relatedContent.length === 0 ? (
        <p className="text-sm text-[#6B7280] py-4 text-center">
          No related content
        </p>
      ) : (
        <div className="space-y-2">
          {relatedContent.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-md hover:bg-[#F9FAFB]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#6B7280] uppercase">{item.type}</p>
                <p className="text-sm font-medium text-[#111827] truncate">
                  {item.title}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveRelationship?.(item.id)}
                className="h-6 px-2 text-[#EF4444] hover:text-[#DC2626]"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




