import { pluginSystem, Plugin } from "@/lib/plugins/core";

const auditLogPlugin: Plugin = {
  id: "core.audit-log",
  name: "Audit Log",
  version: "1.0.0",
  description: "Records key content and user events for auditing.",
  author: "Core",
  hooks: {
    onContentCreate: async (content: any) => {
      console.log("[audit] create", content?.id || "");
      return content;
    },
    onContentUpdate: async (content: any) => {
      console.log("[audit] update", content?.id || "");
      return content;
    },
    onContentDelete: async (contentId: string) => {
      console.log("[audit] delete", contentId);
    },
    onUserLogin: async (user: any) => {
      console.log("[audit] login", user?.id || "unknown");
    },
    onUserLogout: async (user: any) => {
      console.log("[audit] logout", user?.id || "unknown");
    },
  },
};

export async function registerAuditLog() {
  await pluginSystem.register(auditLogPlugin);
  await pluginSystem.enable(auditLogPlugin.id);
}








