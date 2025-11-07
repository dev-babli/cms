import { EventEmitter } from 'events';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  hooks: PluginHooks;
  config?: PluginConfig;
  dependencies?: string[];
  permissions?: string[];
}

export interface PluginHooks {
  onInstall?: () => Promise<void> | void;
  onUninstall?: () => Promise<void> | void;
  onEnable?: () => Promise<void> | void;
  onDisable?: () => Promise<void> | void;
  onContentCreate?: (content: any) => Promise<any> | any;
  onContentUpdate?: (content: any) => Promise<any> | any;
  onContentDelete?: (contentId: string) => Promise<void> | void;
  onContentPublish?: (contentId: string) => Promise<void> | void;
  onUserLogin?: (user: any) => Promise<void> | void;
  onUserLogout?: (user: any) => Promise<void> | void;
  onMediaUpload?: (file: any) => Promise<any> | any;
  onWorkflowTransition?: (transition: any) => Promise<void> | void;
  [key: string]: any;
}

export interface PluginConfig {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'select' | 'textarea';
    label: string;
    description?: string;
    default?: any;
    options?: Array<{ label: string; value: any }>;
    required?: boolean;
  };
}

export interface PluginInstance {
  plugin: Plugin;
  enabled: boolean;
  config: Record<string, any>;
  installedAt: string;
  updatedAt: string;
}

export class PluginSystem extends EventEmitter {
  private static instance: PluginSystem;
  private plugins: Map<string, PluginInstance> = new Map();
  private hookExecutionOrder: Map<string, string[]> = new Map();

  static getInstance(): PluginSystem {
    if (!PluginSystem.instance) {
      PluginSystem.instance = new PluginSystem();
    }
    return PluginSystem.instance;
  }

  // Register a plugin
  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already registered`);
    }

    // Check dependencies
    if (plugin.dependencies) {
      for (const depId of plugin.dependencies) {
        if (!this.plugins.has(depId)) {
          throw new Error(`Plugin ${plugin.id} depends on ${depId} which is not installed`);
        }
      }
    }

    const instance: PluginInstance = {
      plugin,
      enabled: false,
      config: this.getDefaultConfig(plugin),
      installedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.plugins.set(plugin.id, instance);

    // Execute onInstall hook
    if (plugin.hooks.onInstall) {
      await this.executeHook(plugin.id, 'onInstall');
    }

    this.emit('plugin:registered', { pluginId: plugin.id });
    console.log(`Plugin registered: ${plugin.name} (${plugin.id})`);
  }

  // Unregister a plugin
  async unregister(pluginId: string): Promise<void> {
    const instance = this.plugins.get(pluginId);
    if (!instance) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    // Check if other plugins depend on this
    for (const [id, inst] of this.plugins.entries()) {
      if (inst.plugin.dependencies?.includes(pluginId)) {
        throw new Error(`Cannot uninstall ${pluginId} because ${id} depends on it`);
      }
    }

    // Disable first if enabled
    if (instance.enabled) {
      await this.disable(pluginId);
    }

    // Execute onUninstall hook
    if (instance.plugin.hooks.onUninstall) {
      await this.executeHook(pluginId, 'onUninstall');
    }

    this.plugins.delete(pluginId);
    this.emit('plugin:unregistered', { pluginId });
    console.log(`Plugin unregistered: ${instance.plugin.name} (${pluginId})`);
  }

  // Enable a plugin
  async enable(pluginId: string): Promise<void> {
    const instance = this.plugins.get(pluginId);
    if (!instance) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    if (instance.enabled) {
      return; // Already enabled
    }

    // Enable dependencies first
    if (instance.plugin.dependencies) {
      for (const depId of instance.plugin.dependencies) {
        const dep = this.plugins.get(depId);
        if (dep && !dep.enabled) {
          await this.enable(depId);
        }
      }
    }

    instance.enabled = true;
    instance.updatedAt = new Date().toISOString();

    // Execute onEnable hook
    if (instance.plugin.hooks.onEnable) {
      await this.executeHook(pluginId, 'onEnable');
    }

    this.emit('plugin:enabled', { pluginId });
    console.log(`Plugin enabled: ${instance.plugin.name} (${pluginId})`);
  }

  // Disable a plugin
  async disable(pluginId: string): Promise<void> {
    const instance = this.plugins.get(pluginId);
    if (!instance) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    if (!instance.enabled) {
      return; // Already disabled
    }

    // Disable plugins that depend on this
    for (const [id, inst] of this.plugins.entries()) {
      if (inst.enabled && inst.plugin.dependencies?.includes(pluginId)) {
        await this.disable(id);
      }
    }

    instance.enabled = false;
    instance.updatedAt = new Date().toISOString();

    // Execute onDisable hook
    if (instance.plugin.hooks.onDisable) {
      await this.executeHook(pluginId, 'onDisable');
    }

    this.emit('plugin:disabled', { pluginId });
    console.log(`Plugin disabled: ${instance.plugin.name} (${pluginId})`);
  }

  // Update plugin configuration
  updateConfig(pluginId: string, config: Record<string, any>): void {
    const instance = this.plugins.get(pluginId);
    if (!instance) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    // Validate config against plugin's config schema
    if (instance.plugin.config) {
      for (const [key, schema] of Object.entries(instance.plugin.config)) {
        if (schema.required && config[key] === undefined) {
          throw new Error(`Configuration field '${key}' is required for plugin ${pluginId}`);
        }
      }
    }

    instance.config = { ...instance.config, ...config };
    instance.updatedAt = new Date().toISOString();

    this.emit('plugin:config-updated', { pluginId, config });
  }

  // Execute a hook across all enabled plugins
  async executeHooks(hookName: string, ...args: any[]): Promise<any[]> {
    const results: any[] = [];

    const executionOrder = this.hookExecutionOrder.get(hookName) || 
      Array.from(this.plugins.keys());

    for (const pluginId of executionOrder) {
      const instance = this.plugins.get(pluginId);
      if (instance && instance.enabled && instance.plugin.hooks[hookName]) {
        try {
          const result = await this.executeHook(pluginId, hookName, ...args);
          results.push(result);
        } catch (error) {
          console.error(`Error executing hook ${hookName} in plugin ${pluginId}:`, error);
          this.emit('plugin:hook-error', { pluginId, hookName, error });
        }
      }
    }

    return results;
  }

  // Execute a specific hook for a specific plugin
  private async executeHook(pluginId: string, hookName: string, ...args: any[]): Promise<any> {
    const instance = this.plugins.get(pluginId);
    if (!instance) {
      throw new Error(`Plugin ${pluginId} is not registered`);
    }

    const hook = instance.plugin.hooks[hookName];
    if (!hook) {
      return undefined;
    }

    try {
      const result = await hook.apply(instance.plugin, args);
      this.emit('plugin:hook-executed', { pluginId, hookName, args, result });
      return result;
    } catch (error) {
      console.error(`Error in plugin ${pluginId} hook ${hookName}:`, error);
      throw error;
    }
  }

  // Get default configuration from plugin
  private getDefaultConfig(plugin: Plugin): Record<string, any> {
    if (!plugin.config) return {};

    const config: Record<string, any> = {};
    for (const [key, schema] of Object.entries(plugin.config)) {
      if (schema.default !== undefined) {
        config[key] = schema.default;
      }
    }
    return config;
  }

  // Get all registered plugins
  getPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  // Get enabled plugins
  getEnabledPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values()).filter(inst => inst.enabled);
  }

  // Get plugin by ID
  getPlugin(pluginId: string): PluginInstance | undefined {
    return this.plugins.get(pluginId);
  }

  // Check if plugin is enabled
  isEnabled(pluginId: string): boolean {
    const instance = this.plugins.get(pluginId);
    return instance ? instance.enabled : false;
  }

  // Set hook execution order
  setHookExecutionOrder(hookName: string, pluginIds: string[]): void {
    this.hookExecutionOrder.set(hookName, pluginIds);
  }

  // Get plugin statistics
  getStats(): {
    total: number;
    enabled: number;
    disabled: number;
    byAuthor: Record<string, number>;
  } {
    const plugins = this.getPlugins();
    const byAuthor: Record<string, number> = {};

    for (const instance of plugins) {
      const author = instance.plugin.author;
      byAuthor[author] = (byAuthor[author] || 0) + 1;
    }

    return {
      total: plugins.length,
      enabled: plugins.filter(p => p.enabled).length,
      disabled: plugins.filter(p => !p.enabled).length,
      byAuthor,
    };
  }

  // Validate plugin before registration
  validatePlugin(plugin: Plugin): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!plugin.id || typeof plugin.id !== 'string') {
      errors.push('Plugin must have a valid ID');
    }

    if (!plugin.name || typeof plugin.name !== 'string') {
      errors.push('Plugin must have a valid name');
    }

    if (!plugin.version || typeof plugin.version !== 'string') {
      errors.push('Plugin must have a valid version');
    }

    if (!plugin.hooks || typeof plugin.hooks !== 'object') {
      errors.push('Plugin must have hooks object');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Execute sandboxed plugin code (for dynamic plugins)
  async executeSandboxed(pluginId: string, code: string, context: any = {}): Promise<any> {
    const instance = this.plugins.get(pluginId);
    if (!instance || !instance.enabled) {
      throw new Error(`Plugin ${pluginId} is not enabled`);
    }

    try {
      // Create a restricted execution context
      const sandbox = {
        console: {
          log: (...args: any[]) => console.log(`[Plugin ${pluginId}]`, ...args),
          error: (...args: any[]) => console.error(`[Plugin ${pluginId}]`, ...args),
          warn: (...args: any[]) => console.warn(`[Plugin ${pluginId}]`, ...args),
        },
        ...context,
      };

      // Execute the code in the sandbox
      const fn = new Function(...Object.keys(sandbox), code);
      const result = await fn(...Object.values(sandbox));

      return result;
    } catch (error) {
      console.error(`Sandboxed execution error in plugin ${pluginId}:`, error);
      throw error;
    }
  }
}

export const pluginSystem = PluginSystem.getInstance();




