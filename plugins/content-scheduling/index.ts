import { pluginSystem, Plugin } from "@/lib/plugins/core";

const contentSchedulingPlugin: Plugin = {
  id: "core.content-scheduling",
  name: "Content Scheduling",
  version: "1.0.0",
  description: "Enables scheduling of publish/unpublish actions.",
  author: "Core",
  hooks: {
    onContentPublish: async (contentId: string) => {
      console.log("[content-scheduling] publish event", contentId);
    },
    onWorkflowTransition: async (transition: any) => {
      console.log("[content-scheduling] workflow transition", transition);
    },
  },
};

export async function registerContentScheduling() {
  await pluginSystem.register(contentSchedulingPlugin);
  await pluginSystem.enable(contentSchedulingPlugin.id);
}








