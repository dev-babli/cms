import { pluginSystem, Plugin } from "@/lib/plugins/core";

const abTestingPlugin: Plugin = {
  id: "core.ab-testing",
  name: "A/B Testing",
  version: "1.0.0",
  description: "Enables simple A/B test tagging for content variants.",
  author: "Core",
  hooks: {
    onContentCreate: async (content: any) => {
      console.log("[ab-testing] created variant", content?.id || "");
      return content;
    },
    onContentUpdate: async (content: any) => {
      console.log("[ab-testing] updated variant", content?.id || "");
      return content;
    },
  },
  config: {
    enabled: {
      type: "boolean",
      label: "Enable A/B Testing",
      default: false,
    },
    defaultVariant: {
      type: "string",
      label: "Default Variant",
      default: "A",
    },
  },
};

export async function registerAbTesting() {
  await pluginSystem.register(abTestingPlugin);
  await pluginSystem.enable(abTestingPlugin.id);
}








