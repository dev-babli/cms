import { pluginSystem, Plugin } from "@/lib/plugins/core";

const mediaLibraryPlugin: Plugin = {
  id: "core.media-library",
  name: "Media Library",
  version: "1.0.0",
  description: "Provides media uploads, metadata extraction, and basic transformations.",
  author: "Core",
  hooks: {
    onMediaUpload: async (file: any) => {
      // Stub: Extract metadata, generate thumbnails, store references
      console.log("[media-library] media uploaded", file?.name || "unknown");
      return file;
    },
  },
};

export async function registerMediaLibrary() {
  await pluginSystem.register(mediaLibraryPlugin);
  await pluginSystem.enable(mediaLibraryPlugin.id);
}








