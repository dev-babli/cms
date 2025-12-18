"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export default function NewTeamMember() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        position: "",
        qualification: "",
        bio: "",
        image: "",
        email: "",
        linkedin: "",
        twitter: "",
        order_index: 0,
        published: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert("Please enter a name");
            return;
        }

        setLoading(true);

        try {
            // If no image provided, fetch a unique Unsplash image
            let finalImage = formData.image;
            if (!finalImage || finalImage.trim() === '') {
                try {
                    // Get existing team members to ensure unique images
                    const existingRes = await fetch("/api/cms/team?published=true");
                    const existingData = await existingRes.json();
                    const existingMembers = existingData.success ? existingData.data : [];
                    const usedImageIds = existingMembers
                        .map((m: any) => m.image)
                        .filter((img: string) => img && img.includes('unsplash'))
                        .map((img: string) => {
                            const match = img.match(/sig=(\d+)/);
                            return match ? match[1] : null;
                        })
                        .filter(Boolean);
                    
                    // Generate a random seed that's not in usedImageIds
                    let randomSeed = Math.floor(Math.random() * 10000);
                    while (usedImageIds.includes(randomSeed.toString())) {
                        randomSeed = Math.floor(Math.random() * 10000);
                    }
                    
                    // Fetch a person image from Unsplash
                    finalImage = `https://source.unsplash.com/400x400/?person,portrait&sig=${randomSeed}`;
                } catch (unsplashError) {
                    console.error('Failed to fetch Unsplash image:', unsplashError);
                    // Continue without image if Unsplash fails
                }
            }

            // Clean up form data - convert empty strings to undefined for optional fields
            const cleanedData = {
                ...formData,
                image: finalImage,
                position: formData.position?.trim() || undefined,
                qualification: formData.qualification?.trim() || undefined,
                bio: formData.bio?.trim() || undefined,
                email: formData.email?.trim() || undefined,
                linkedin: formData.linkedin?.trim() || undefined,
                twitter: formData.twitter?.trim() || undefined,
            };

            const res = await fetch("/api/cms/team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanedData),
            });

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 200)}`);
            }

            const data = await res.json();

            if (res.ok && data.success) {
                router.push("/admin/team");
            } else {
                alert(`Failed to create team member: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating team member:', error);
            alert(`Error creating team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const contentType = res.headers.get('content-type');
            const isJson = contentType?.includes('application/json');

            if (res.ok) {
                let data;
                try {
                    if (isJson) {
                        data = await res.json();
                    } else {
                        const text = await res.text();
                        throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
                    }
                } catch (parseError: any) {
                    console.error('Failed to parse response:', parseError);
                    alert(`Upload error: Failed to parse server response. ${parseError.message}`);
                    return;
                }

                if (data.success && data.data) {
                    setFormData(prev => ({ ...prev, image: data.data.url }));
                } else {
                    alert(`Upload failed: ${data.error || 'Unknown error'}`);
                }
            } else {
                let errorMessage = 'Upload failed';
                try {
                    if (isJson) {
                        const errorData = await res.json();
                        errorMessage = errorData.error || errorMessage;
                    } else {
                        const text = await res.text();
                        errorMessage = text || res.statusText || errorMessage;
                    }
                } catch (parseError) {
                    errorMessage = res.statusText || `HTTP ${res.status}`;
                }
                alert(`Upload failed: ${errorMessage}`);
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`Upload error: ${error?.message || 'Network error'}`);
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
                <div className="px-6 py-4">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/team">
                                <button className="text-muted-foreground hover:text-foreground transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                            </Link>
                            <h1 className="text-lg font-semibold">New Team Member</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/admin/team")}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading ? "Saving..." : formData.published ? "Publish" : "Save Draft"}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-6 py-12">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Position</Label>
                                <Input
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    placeholder="CEO, CTO, etc."
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Qualification</Label>
                            <Input
                                value={formData.qualification}
                                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                placeholder="MBA, Ph.D., B.Tech, etc."
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Bio</Label>
                            <Textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Brief bio about the team member..."
                                rows={4}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Profile Image</Label>
                            {formData.image ? (
                                <div className="space-y-3">
                                    <div className="rounded-lg overflow-hidden border w-32 h-32">
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFormData({ ...formData, image: "" })}
                                        >
                                            Remove
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={uploadingImage}
                                            onClick={() => document.getElementById('change-image-input')?.click()}
                                        >
                                            {uploadingImage ? "Uploading..." : "Change Image"}
                                        </Button>
                                        <input
                                            id="change-image-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploadingImage}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-32 border-dashed"
                                        disabled={uploadingImage}
                                        onClick={() => document.getElementById('profile-image-input')?.click()}
                                    >
                                        <span className="flex flex-col items-center justify-center gap-2">
                                            {uploadingImage ? (
                                                <>
                                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-sm">Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">Click to upload image</span>
                                                    <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</span>
                                                </>
                                            )}
                                        </span>
                                    </Button>
                                    <input
                                        id="profile-image-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploadingImage}
                                    />
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="px-2 bg-white text-muted-foreground">or paste URL</span>
                                        </div>
                                    </div>
                                    <Input
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://images.unsplash.com/..."
                                        className="h-10"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Order Index</Label>
                                <Input
                                    type="number"
                                    value={formData.order_index}
                                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">LinkedIn URL</Label>
                                <Input
                                    type="url"
                                    value={formData.linkedin}
                                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Twitter URL</Label>
                                <Input
                                    type="url"
                                    value={formData.twitter}
                                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                    placeholder="https://twitter.com/..."
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t">
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="published"
                                        checked={formData.published}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, published: !!checked })
                                        }
                                    />
                                    <div>
                                        <Label htmlFor="published" className="cursor-pointer font-medium">
                                            Publish immediately
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Make this team member visible to everyone
                                        </p>
                                    </div>
                                </div>
                                {formData.published && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                        Will Publish
                                    </span>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}


