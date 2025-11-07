import { pluginSystem } from './core';

/**
 * Plugin API - Public interface for plugins to interact with the CMS
 */
export class PluginAPI {
  private pluginId: string;

  constructor(pluginId: string) {
    this.pluginId = pluginId;
  }

  // Content operations
  content = {
    create: async (type: string, data: any) => {
      return await pluginSystem.executeHooks('onContentCreate', type, data);
    },

    update: async (type: string, id: string, data: any) => {
      return await pluginSystem.executeHooks('onContentUpdate', type, id, data);
    },

    delete: async (type: string, id: string) => {
      return await pluginSystem.executeHooks('onContentDelete', type, id);
    },

    get: async (type: string, id: string) => {
      // Implement content retrieval
      return null;
    },

    list: async (type: string, filters?: any) => {
      // Implement content listing
      return [];
    },
  };

  // User operations
  user = {
    getCurrent: async () => {
      // Get current user
      return null;
    },

    get: async (id: string) => {
      // Get user by ID
      return null;
    },

    list: async (filters?: any) => {
      // List users
      return [];
    },
  };

  // Media operations
  media = {
    upload: async (file: any) => {
      return await pluginSystem.executeHooks('onMediaUpload', file);
    },

    get: async (id: string) => {
      // Get media file
      return null;
    },

    list: async (filters?: any) => {
      // List media files
      return [];
    },

    delete: async (id: string) => {
      // Delete media file
      return true;
    },
  };

  // Workflow operations
  workflow = {
    transition: async (contentType: string, contentId: string, action: string) => {
      return await pluginSystem.executeHooks('onWorkflowTransition', contentType, contentId, action);
    },

    getStatus: async (contentType: string, contentId: string) => {
      // Get workflow status
      return null;
    },
  };

  // Database operations (restricted)
  db = {
    query: async (sql: string, params?: any[]) => {
      // Execute SQL query (with restrictions)
      console.warn(`Plugin ${this.pluginId} attempted database query:`, sql);
      throw new Error('Direct database access is restricted');
    },
  };

  // HTTP operations
  http = {
    fetch: async (url: string, options?: RequestInit) => {
      // Make HTTP requests
      return await fetch(url, options);
    },
  };

  // Storage operations (plugin-specific)
  storage = {
    get: async (key: string) => {
      // Get plugin-specific storage value
      const instance = pluginSystem.getPlugin(this.pluginId);
      return instance?.config[key];
    },

    set: async (key: string, value: any) => {
      // Set plugin-specific storage value
      const config = { [key]: value };
      pluginSystem.updateConfig(this.pluginId, config);
    },

    delete: async (key: string) => {
      // Delete plugin-specific storage value
      const config = { [key]: undefined };
      pluginSystem.updateConfig(this.pluginId, config);
    },
  };

  // Event operations
  events = {
    emit: (eventName: string, data: any) => {
      pluginSystem.emit(`plugin:${this.pluginId}:${eventName}`, data);
    },

    on: (eventName: string, handler: (data: any) => void) => {
      pluginSystem.on(`plugin:${this.pluginId}:${eventName}`, handler);
    },

    off: (eventName: string, handler: (data: any) => void) => {
      pluginSystem.off(`plugin:${this.pluginId}:${eventName}`, handler);
    },
  };

  // UI extension points
  ui = {
    addMenuItem: (menu: string, item: { label: string; href: string; icon?: string }) => {
      // Add menu item to admin UI
      pluginSystem.emit('ui:add-menu-item', { pluginId: this.pluginId, menu, item });
    },

    addWidget: (location: string, widget: { id: string; component: string; props?: any }) => {
      // Add widget to UI
      pluginSystem.emit('ui:add-widget', { pluginId: this.pluginId, location, widget });
    },

    addCustomField: (field: {
      type: string;
      component: string;
      validate?: (value: any) => boolean;
    }) => {
      // Register custom field type
      pluginSystem.emit('ui:add-custom-field', { pluginId: this.pluginId, field });
    },
  };

  // Utility functions
  utils = {
    generateId: () => {
      return `${this.pluginId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    hash: async (data: string) => {
      // Hash data
      const encoder = new TextEncoder();
      const buffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    slugify: (text: string) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    },
  };

  // Logging
  log = {
    info: (...args: any[]) => {
      console.log(`[Plugin ${this.pluginId}]`, ...args);
    },

    error: (...args: any[]) => {
      console.error(`[Plugin ${this.pluginId}]`, ...args);
    },

    warn: (...args: any[]) => {
      console.warn(`[Plugin ${this.pluginId}]`, ...args);
    },

    debug: (...args: any[]) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[Plugin ${this.pluginId}]`, ...args);
      }
    },
  };
}

/**
 * Create a plugin API instance for a specific plugin
 */
export function createPluginAPI(pluginId: string): PluginAPI {
  return new PluginAPI(pluginId);
}




