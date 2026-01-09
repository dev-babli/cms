import { pluginSystem, Plugin } from "@/lib/plugins/core";

const webhooksPlugin: Plugin = {
  id: "core.webhooks",
  name: "Webhooks Dispatcher",
  version: "1.0.0",
  description: "Dispatches webhook events on publish/update/delete.",
  author: "Core",
  hooks: {
    onContentPublish: async (contentId: string, payload?: any) => {
      console.log("[webhooks] publish", contentId, payload?.title || "");
      // Stub: POST to configured endpoints
    },
    onContentUpdate: async (content: any) => {
      console.log("[webhooks] update", content?.id || "");
      return content;
    },
    onContentDelete: async (contentId: string) => {
      console.log("[webhooks] delete", contentId);
    },
  },
  config: {
    endpoints: {
      type: "textarea",
      label: "Webhook Endpoints (JSON array)",
      description: "List of webhook URLs to call on events.",
      default: "[]",
    },
    secret: {
      type: "string",
      label: "Signing Secret",
      description: "Used to sign webhook requests.",
      required: false,
    },
  },
};

export async function registerWebhooks() {
  await pluginSystem.register(webhooksPlugin);
  await pluginSystem.enable(webhooksPlugin.id);
}








