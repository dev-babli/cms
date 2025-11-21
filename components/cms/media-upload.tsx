"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface MediaUploadProps {
    onUpload: (url: string) => void;
    accept?: string;
    type?: "image" | "video" | "file";
}

export function MediaUpload({ onUpload, accept, type = "image" }: MediaUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file) return;

        setUploading(true);

        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to server
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data) {
                    onUpload(data.data.url);
                } else {
                    alert(`Upload failed: ${data.error || 'Unknown error'}`);
                }
            } else {
                // Try to get error message from response
                let errorMessage = 'Upload failed';
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    errorMessage = res.statusText || errorMessage;
                }
                alert(`Upload failed: ${errorMessage}`);
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMessage = error?.message || 'Network error. Please check your connection.';
            alert(`Error uploading file: ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    };

    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    const acceptString = accept || (type === "image" ? "image/*" : "video/*");

    return (
        <div className="space-y-4">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFilePicker}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptString}
                    onChange={handleFileInputChange}
                    className="hidden"
                />

                {preview ? (
                    <div className="space-y-4">
                        {type === "image" && (
                            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                        )}
                        {type === "video" && (
                            <video src={preview} controls className="max-h-64 mx-auto rounded-lg" />
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPreview(null);
                            }}
                        >
                            Change {type}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                            {type === "image" && (
                                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            )}
                            {type === "video" && (
                                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-medium mb-1">
                                {isDragActive ? `Drop ${type} here` : `Drop ${type} here, or click to browse`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {type === "image" && "PNG, JPG, GIF up to 10MB"}
                                {type === "video" && "MP4, WebM, MOV up to 100MB"}
                            </p>
                        </div>

                        {uploading && (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-muted-foreground">Uploading...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* URL Input Alternative */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-muted-foreground">or paste URL</span>
                </div>
            </div>
        </div>
    );
}
