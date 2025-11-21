"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploadProps {
    onUpload: (url: string) => void;
    currentUrl?: string;
}

export function ImageUpload({ onUpload, currentUrl }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentUrl || "");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload file
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            // Check if response is OK before parsing JSON
            if (!res.ok) {
                // Try to get error message from response
                let errorMessage = 'Upload failed';
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    // If response is not JSON, use status text
                    errorMessage = res.statusText || errorMessage;
                }
                alert(`Upload failed: ${errorMessage}`);
                return;
            }

            const data = await res.json();
            if (data.success && data.data) {
                onUpload(data.data.url);
            } else {
                alert(`Upload failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMessage = error?.message || 'Network error. Please check your connection.';
            alert(`Upload error: ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="flex-1"
                />
                {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
            </div>

            {preview && (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full max-w-md rounded-lg border border-border shadow-sm"
                    />
                    {!uploading && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                setPreview("");
                                onUpload("");
                            }}
                            className="absolute top-2 right-2"
                        >
                            Remove
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}





