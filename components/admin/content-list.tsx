"use client";

import { useState } from "react";
import Link from "next/link";
import { BulkActions } from "@/components/cms/bulk-actions";

interface ContentListItem {
  id: number;
  title: string;
  excerpt?: string;
  author?: string;
  publish_date?: string | null;
  created_at?: string | null;
  published: boolean;
  slug: string;
  [key: string]: any;
}

interface ContentListProps {
  items: ContentListItem[];
  loading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionHref: string;
  emptyActionText: string;
  newItemHref: string;
  editHref: (id: number) => string;
  viewHref: (slug: string) => string;
  onDelete?: (id: number) => void;
  onApprove?: (id: number) => void;
  userRole?: string;
  contentType?: string;
  columns?: {
    title: string;
    width: string;
    render?: (item: ContentListItem) => React.ReactNode;
  }[];
}

export function ContentList({
  items,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionText,
  newItemHref,
  editHref,
  viewHref,
  onDelete,
  onApprove,
  userRole,
  contentType = "blog",
  columns,
}: ContentListProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleBulkAction = async (action: string, ids: number[], options?: any) => {
    try {
      switch (action) {
        case "publish":
          for (const id of ids) {
            await fetch(`/api/cms/${contentType}/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ published: true }),
            });
          }
          break;
        case "unpublish":
          for (const id of ids) {
            await fetch(`/api/cms/${contentType}/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ published: false }),
            });
          }
          break;
        case "delete":
          for (const id of ids) {
            await fetch(`/api/cms/${contentType}/${id}`, { method: "DELETE" });
          }
          break;
        case "duplicate":
          // TODO: Implement duplication
          break;
        case "tag":
          // TODO: Implement tagging
          break;
      }
      setSelectedIds([]);
      window.location.reload();
    } catch (error) {
      console.error("Bulk action failed:", error);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const defaultColumns = [
    {
      title: 'Title',
      width: 'col-span-5',
      render: (item: ContentListItem) => (
        <div className="min-w-0">
          <Link href={editHref(item.id)}>
            <h3 className="text-sm font-medium text-[#111827] truncate hover:text-[#3B82F6] transition-colors duration-150">
              {item.title || 'Untitled'}
            </h3>
          </Link>
          {item.excerpt && (
            <p className="text-xs text-[#6B7280] truncate mt-0.5">
              {item.excerpt}
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'Author',
      width: 'col-span-2',
      render: (item: ContentListItem) => (
        <span className="text-sm text-[#6B7280]">
          {item.author || '—'}
        </span>
      ),
    },
    {
      title: 'Date',
      width: 'col-span-2',
      render: (item: ContentListItem) => (
        <span className="text-sm text-[#6B7280]">
          {formatDate(item.publish_date || item.created_at)}
        </span>
      ),
    },
    {
      title: 'Status',
      width: 'col-span-1',
      render: (item: ContentListItem) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            item.published
              ? 'bg-[#D1FAE5] text-[#065F46]'
              : 'bg-[#FEF3C7] text-[#92400E]'
          }`}
        >
          {item.published ? 'Published' : 'Draft'}
        </span>
      ),
    },
  ];

  const displayColumns = columns || defaultColumns;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#E5E7EB] border-t-[#3B82F6] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-[#6B7280]">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium text-[#111827] mb-1">{emptyTitle.replace('No ', '')}</h1>
          <p className="text-sm text-[#6B7280]">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>
        <Link href={newItemHref}>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors duration-150 ease-out">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Item
          </button>
        </Link>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <BulkActions
          selectedIds={selectedIds}
          onBulkAction={handleBulkAction}
          contentType={contentType}
        />
      )}

      {/* List View */}
      {items.length === 0 ? (
        <div className="border border-[#E5E7EB] rounded-md bg-white p-12 text-center">
          <svg className="w-12 h-12 text-[#9CA3AF] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-sm font-medium text-[#111827] mb-2">{emptyTitle}</h3>
          <p className="text-sm text-[#6B7280] mb-6">{emptyDescription}</p>
          <Link href={emptyActionHref}>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors duration-150 ease-out">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {emptyActionText}
            </button>
          </Link>
        </div>
      ) : (
        <div className="border border-[#E5E7EB] rounded-md bg-white">
          {/* Table Header */}
          <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-[#6B7280] uppercase tracking-wide">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedIds.length === items.length && items.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-[#3B82F6] border-[#E5E7EB] rounded focus:ring-[#3B82F6]"
                />
              </div>
              {displayColumns.map((col, idx) => (
                <div key={idx} className={col.width}>
                  {col.title}
                </div>
              ))}
              <div className="col-span-2 text-right">Actions</div>
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#E5E7EB]">
            {items.map((item) => (
              <div
                key={item.id}
                className="px-4 py-3 hover:bg-[#F9FAFB] transition-colors duration-150 ease-out"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      className="w-4 h-4 text-[#3B82F6] border-[#E5E7EB] rounded focus:ring-[#3B82F6]"
                    />
                  </div>
                  {displayColumns.map((col, idx) => (
                    <div key={idx} className={col.width}>
                      {col.render ? col.render(item) : <span className="text-sm text-[#6B7280]">{item[col.title.toLowerCase()] || '—'}</span>}
                    </div>
                  ))}
                  
                  {/* Actions Column */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <Link href={editHref(item.id)}>
                      <button
                        className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded transition-colors duration-150 ease-out"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </Link>
                    <Link href={viewHref(item.slug)} target="_blank">
                      <button
                        className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded transition-colors duration-150 ease-out"
                        title="View"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </Link>
                    {!item.published && onApprove && (userRole === 'editor' || userRole === 'admin') && (
                      <button
                        onClick={() => onApprove(item.id)}
                        className="p-1.5 text-[#059669] hover:text-[#047857] hover:bg-[#D1FAE5] rounded transition-colors duration-150 ease-out"
                        title="Approve"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEE2E2] rounded transition-colors duration-150 ease-out"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

