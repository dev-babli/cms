"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Filter, Save } from "lucide-react";

interface SearchFilter {
  field: string;
  operator: "equals" | "contains" | "starts_with" | "ends_with" | "greater_than" | "less_than";
  value: string;
}

interface AdvancedSearchProps {
  contentType: string;
  onSearch: (query: string, filters: SearchFilter[]) => void;
  onSaveQuery?: (name: string, query: string, filters: SearchFilter[]) => void;
  savedQueries?: Array<{ id: string; name: string; query: string; filters: SearchFilter[] }>;
}

export function AdvancedSearch({
  contentType,
  onSearch,
  onSaveQuery,
  savedQueries = [],
}: AdvancedSearchProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedQueryName, setSavedQueryName] = useState("");

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleAddFilter = () => {
    setFilters([...filters, { field: "title", operator: "contains", value: "" }]);
    setShowFilters(true);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleFilterChange = (index: number, updates: Partial<SearchFilter>) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    setFilters(newFilters);
  };

  const handleSaveQuery = () => {
    if (!savedQueryName.trim()) return;
    onSaveQuery?.(savedQueryName, query, filters);
    setShowSaveDialog(false);
    setSavedQueryName("");
  };

  const handleLoadQuery = (savedQuery: typeof savedQueries[0]) => {
    setQuery(savedQuery.query);
    setFilters(savedQuery.filters);
    onSearch(savedQuery.query, savedQuery.filters);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Search content..."
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSearch}
          className="h-8 px-2 text-xs"
        >
          Search
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFilter}
          className="h-8 px-2 text-xs text-[#6B7280] hover:text-[#111827]"
        >
          <Filter className="w-3.5 h-3.5 mr-1" />
          Filter
        </Button>
        {onSaveQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            className="h-8 px-2 text-xs text-[#6B7280] hover:text-[#111827]"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            Save
          </Button>
        )}
      </div>

      {filters.length > 0 && (
        <div className="space-y-2 p-3 border border-[#E5E7EB] rounded-md bg-[#F9FAFB]">
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                value={filter.field}
                onChange={(e) =>
                  handleFilterChange(index, { field: e.target.value })
                }
                className="h-7 px-2 text-xs border border-[#E5E7EB] rounded-md bg-white"
              >
                <option value="title">Title</option>
                <option value="content">Content</option>
                <option value="author">Author</option>
                <option value="category">Category</option>
                <option value="tags">Tags</option>
                <option value="created_at">Created Date</option>
                <option value="publish_date">Publish Date</option>
              </select>
              <select
                value={filter.operator}
                onChange={(e) =>
                  handleFilterChange(index, {
                    operator: e.target.value as SearchFilter["operator"],
                  })
                }
                className="h-7 px-2 text-xs border border-[#E5E7EB] rounded-md bg-white"
              >
                <option value="equals">Equals</option>
                <option value="contains">Contains</option>
                <option value="starts_with">Starts With</option>
                <option value="ends_with">Ends With</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
              </select>
              <Input
                type="text"
                value={filter.value}
                onChange={(e) =>
                  handleFilterChange(index, { value: e.target.value })
                }
                placeholder="Value"
                className="flex-1 h-7 text-xs"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFilter(index)}
                className="h-7 px-2 text-[#EF4444] hover:text-[#DC2626]"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {savedQueries.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-[#6B7280] font-medium">Saved Searches</p>
          {savedQueries.map((savedQuery) => (
            <button
              key={savedQuery.id}
              onClick={() => handleLoadQuery(savedQuery)}
              className="w-full text-left px-2 py-1 text-xs text-[#6B7280] hover:bg-[#F9FAFB] rounded-md"
            >
              {savedQuery.name}
            </button>
          ))}
        </div>
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white border border-[#E5E7EB] rounded-md p-4 w-80">
            <h3 className="text-sm font-medium text-[#111827] mb-2">
              Save Search Query
            </h3>
            <Input
              type="text"
              value={savedQueryName}
              onChange={(e) => setSavedQueryName(e.target.value)}
              placeholder="Query name"
              className="mb-3 h-8 text-sm"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSaveDialog(false);
                  setSavedQueryName("");
                }}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveQuery}
                disabled={!savedQueryName.trim()}
                className="flex-1 text-xs bg-[#3B82F6] text-white hover:bg-[#2563EB]"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







