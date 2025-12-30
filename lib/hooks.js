/**
 * Hook system for plugins
 * Manages hook registration and execution
 */

class HookRegistry {
  constructor() {
    this.hooks = new Map();
    this.pluginHooks = new Map(); // Track which plugin registered which hooks
  }
  
  /**
   * Register hooks from a plugin
   */
  registerPluginHooks(plugin) {
    if (!plugin.hooks || typeof plugin.hooks !== 'object') {
      return;
    }
    
    const pluginName = plugin.name;
    
    for (const [hookName, hookFunction] of Object.entries(plugin.hooks)) {
      if (typeof hookFunction !== 'function') {
        console.warn(`⚠️  Plugin ${pluginName}: Hook "${hookName}" is not a function, skipping`);
        continue;
      }
      
      if (!this.hooks.has(hookName)) {
        this.hooks.set(hookName, []);
      }
      
      this.hooks.get(hookName).push({
        plugin: pluginName,
        fn: hookFunction
      });
      
      // Track plugin hooks
      if (!this.pluginHooks.has(pluginName)) {
        this.pluginHooks.set(pluginName, []);
      }
      this.pluginHooks.get(pluginName).push(hookName);
    }
  }
  
  /**
   * Execute a hook with given arguments
   */
  async executeHook(hookName, ...args) {
    const hooks = this.hooks.get(hookName) || [];
    
    if (hooks.length === 0) {
      return;
    }
    
    const results = [];
    
    for (const { plugin, fn } of hooks) {
      try {
        const result = await fn(...args);
        results.push({ plugin, result, error: null });
      } catch (err) {
        results.push({ plugin, result: null, error: err });
        console.error(`❌ Plugin ${plugin} hook "${hookName}" failed:`, err.message);
        if (process.env.VERBOSE || process.env.DEBUG) {
          console.error(err.stack);
        }
      }
    }
    
    return results;
  }
  
  /**
   * Execute a hook and return the last result (for hooks that modify data)
   */
  async executeHookWithResult(hookName, initialValue, ...args) {
    const hooks = this.hooks.get(hookName) || [];
    
    let value = initialValue;
    
    for (const { plugin, fn } of hooks) {
      try {
        const result = await fn(value, ...args);
        // If hook returns a value, use it as the new value
        if (result !== undefined && result !== null) {
          value = result;
        }
      } catch (err) {
        console.error(`❌ Plugin ${plugin} hook "${hookName}" failed:`, err.message);
        if (process.env.VERBOSE || process.env.DEBUG) {
          console.error(err.stack);
        }
      }
    }
    
    return value;
  }
  
  /**
   * Get all registered hooks for a plugin
   */
  getPluginHooks(pluginName) {
    return this.pluginHooks.get(pluginName) || [];
  }
  
  /**
   * Clear all hooks
   */
  clear() {
    this.hooks.clear();
    this.pluginHooks.clear();
  }
}

// Global hook registry instance
let hookRegistry = null;

/**
 * Initialize the hook system
 */
export function initializeHooks() {
  hookRegistry = new HookRegistry();
  return hookRegistry;
}

/**
 * Get the hook registry instance
 */
export function getHookRegistry() {
  if (!hookRegistry) {
    hookRegistry = new HookRegistry();
  }
  return hookRegistry;
}

/**
 * Register hooks from all plugins
 */
export function registerPluginHooks(plugins) {
  const registry = getHookRegistry();
  
  for (const plugin of plugins) {
    registry.registerPluginHooks(plugin);
  }
}

/**
 * Execute a hook
 */
export async function executeHook(hookName, ...args) {
  const registry = getHookRegistry();
  return registry.executeHook(hookName, ...args);
}

/**
 * Execute a hook and return the result (for data transformation hooks)
 */
export async function executeHookWithResult(hookName, initialValue, ...args) {
  const registry = getHookRegistry();
  return registry.executeHookWithResult(hookName, initialValue, ...args);
}

/**
 * Check if a hook has any registered handlers
 */
export function hasHook(hookName) {
  const registry = getHookRegistry();
  return registry.hooks.has(hookName) && registry.hooks.get(hookName).length > 0;
}

/**
 * Clear all hooks (useful for testing)
 */
export function clearHooks() {
  const registry = getHookRegistry();
  registry.clear();
}

export default {
  initializeHooks,
  getHookRegistry,
  registerPluginHooks,
  executeHook,
  executeHookWithResult,
  hasHook,
  clearHooks
};

