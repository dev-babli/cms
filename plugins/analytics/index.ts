import { pluginSystem, Plugin } from "@/lib/plugins/core";

const analyticsPlugin: Plugin = {
  id: "core.analytics",
  name: "Content Analytics",
  version: "1.0.0",
  description: "Captures content events for basic analytics.",
  author: "Core",
  hooks: {
    onContentPublish: async (contentId: string) => {
      console.log("[analytics] publish event", contentId);
    },
    onContentCreate: async (content: any) => {
      console.log("[analytics] create event", content?.id || "unknown");
      return content;
    },
    onContentUpdate: async (content: any) => {
      console.log("[analytics] update event", content?.id || "unknown");
      return content;
    },
  },
};

export async function registerAnalytics() {
  await pluginSystem.register(analyticsPlugin);
  await pluginSystem.enable(analyticsPlugin.id);
}








