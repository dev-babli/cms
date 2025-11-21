"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface MediaFile {
    id: number;
    filename: string;
    original_name: string;
    url: string;
    mime_type: string;
    size: number;
    alt_text?: string;
    tags?: string[];
    created_at: string;
    ai_analysis?: {
        tags: string[];
        altText: string;
        colors: Array<{ hex: string; percentage: number }>;
        objects: Array<{ name: string; confidence: number }>;
    };
}

interface MediaFilters {
    type: 'all' | 'image' | 'video';
    size: 'all' | 'small' | 'medium' | 'large';
    dateRange: 'all' | 'today' | 'week' | 'month';
    tags: string[];
}

export default function MediaPage() {
    const [media, setMedia] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filters, setFilters] = useState<MediaFilters>({
        type: 'all',
        size: 'all',
        dateRange: 'all',
        tags: [],
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [uploading, setUploading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchMedia();
    }, [filters]);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();

            if (filters.type !== 'all') queryParams.append('type', filters.type);
            if (filters.size !== 'all') queryParams.append('size', filters.size);
            if (filters.dateRange !== 'all') queryParams.append('dateRange', filters.dateRange);
            if (searchQuery) queryParams.append('search', searchQuery);

            const res = await fetch(`/api/admin/media?${queryParams}`);
            const data = await res.json();

            if (data.success) {
                setMedia(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch media:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = useCallback(async (files: FileList) => {
        setUploading(true);

        try {
            const formData = new FormData();
            Array.from(files).forEach(file => {
                formData.append('files', file);
            });

            const res = await fetch('/api/admin/media', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                let errorMessage = 'Upload failed';
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    errorMessage = res.statusText || errorMessage;
                }
                alert(`Upload failed: ${errorMessage}`);
                return;
            }

            const data = await res.json();

            if (data.success && data.data) {
                setMedia(prev => [...data.data, ...prev]);
            } else {
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error: any) {
            console.error("Upload failed:", error);
            const errorMessage = error?.message || 'Network error. Please check your connection.';
            alert(`Upload error: ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files);
        }
    };

    const toggleFileSelection = (id: number) => {
        setSelectedFiles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const selectAll = () => {
        setSelectedFiles(new Set(media.map(file => file.id)));
    };

    const deselectAll = () => {
        setSelectedFiles(new Set());
    };

    const deleteSelected = async () => {
        if (selectedFiles.size === 0) return;

        if (!confirm(`Delete ${selectedFiles.size} file(s)?`)) return;

        try {
            const res = await fetch('/api/admin/media/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedFiles) }),
            });

            if (res.ok) {
                setMedia(prev => prev.filter(file => !selectedFiles.has(file.id)));
                setSelectedFiles(new Set());
            }
        } catch (error) {
            console.error("Failed to delete files:", error);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) {
            return (
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        } else if (mimeType.startsWith('video/')) {
            return (
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            );
        }
        return (
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
    };

    const filteredMedia = media.filter(file => {
        // Apply filters
        if (filters.type !== 'all') {
            if (filters.type === 'image' && !file.mime_type.startsWith('image/')) return false;
            if (filters.type === 'video' && !file.mime_type.startsWith('video/')) return false;
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!file.original_name.toLowerCase().includes(query) &&
                !file.alt_text?.toLowerCase().includes(query) &&
                !file.ai_analysis?.tags.some(tag => tag.toLowerCase().includes(query))) {
                return false;
            }
        }

        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading media library...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b bg-white">
                <div className="px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin">
                                <button className="text-muted-foreground hover:text-foreground transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                            </Link>
                            <h1 className="text-2xl font-semibold">Media Library</h1>
                            <span className="text-sm text-gray-500">({filteredMedia.length} files)</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                Filters
                            </Button>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    Grid
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                >
                                    List
                                </Button>
                            </div>

                            {selectedFiles.size > 0 && (
                                <Button variant="destructive" onClick={deleteSelected}>
                                    Delete ({selectedFiles.size})
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Search and Filters */}
            <div className="px-6 py-4 border-b bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search media files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-md"
                            />
                        </div>

                        {showFilters && (
                            <div className="flex items-center gap-4">
                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="all">All Types</option>
                                    <option value="image">Images</option>
                                    <option value="video">Videos</option>
                                </select>

                                <select
                                    value={filters.dateRange}
                                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Upload Area */}
            <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                    >
                        <div className="space-y-4">
                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>

                            <div>
                                <p className="text-lg font-medium text-gray-900 mb-2">
                                    {uploading ? 'Uploading files...' : 'Drop files here or click to upload'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Supports images, videos, and documents up to 100MB each
                                </p>
                            </div>

                            <input
                                type="file"
                                multiple
                                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                                className="hidden"
                                id="file-upload"
                                disabled={uploading}
                            />
                            <label htmlFor="file-upload">
                                <Button asChild disabled={uploading}>
                                    <span>Choose Files</span>
                                </Button>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Media Grid/List */}
            <div className="px-6 pb-8">
                <div className="max-w-7xl mx-auto">
                    {selectedFiles.size > 0 && (
                        <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm text-blue-800">
                                {selectedFiles.size} file(s) selected
                            </span>
                            <Button variant="outline" size="sm" onClick={selectAll}>
                                Select All
                            </Button>
                            <Button variant="outline" size="sm" onClick={deselectAll}>
                                Deselect All
                            </Button>
                        </div>
                    )}

                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            {filteredMedia.map((file) => (
                                <div
                                    key={file.id}
                                    className={`group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedFiles.has(file.id) ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                                        }`}
                                    onClick={() => toggleFileSelection(file.id)}
                                >
                                    <div className="absolute top-2 left-2 z-10">
                                        <Checkbox
                                            checked={selectedFiles.has(file.id)}
                                            onChange={() => toggleFileSelection(file.id)}
                                        />
                                    </div>

                                    {file.mime_type.startsWith('image/') ? (
                                        <img
                                            src={file.url}
                                            alt={file.alt_text || file.original_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {getFileIcon(file.mime_type)}
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-xs truncate">{file.original_name}</p>
                                            <p className="text-white text-xs">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Preview
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Size
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Uploaded
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredMedia.map((file) => (
                                            <tr key={file.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <Checkbox
                                                            checked={selectedFiles.has(file.id)}
                                                            onChange={() => toggleFileSelection(file.id)}
                                                            className="mr-3"
                                                        />
                                                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                                            {file.mime_type.startsWith('image/') ? (
                                                                <img
                                                                    src={file.url}
                                                                    alt={file.alt_text || file.original_name}
                                                                    className="w-full h-full object-cover rounded"
                                                                />
                                                            ) : (
                                                                getFileIcon(file.mime_type)
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {file.original_name}
                                                        </div>
                                                        {file.alt_text && (
                                                            <div className="text-sm text-gray-500">
                                                                {file.alt_text}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {file.mime_type}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatFileSize(file.size)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(file.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                                                        Edit
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-900">
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {filteredMedia.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No media files found</h3>
                            <p className="text-gray-500">
                                Upload your first files to get started with the media library.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



