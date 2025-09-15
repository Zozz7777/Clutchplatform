/**
 * Service Manager
 * Manages all services with proper cleanup and memory management
 */

class ServiceManager {
  constructor() {
    this.services = new Map();
    this.isShuttingDown = false;
    this.cleanupHandlers = new Set();
  }

  /**
   * Register a service
   */
  register(name, service) {
    if (this.services.has(name)) {
      console.warn(`⚠️ Service ${name} already registered, replacing...`);
    }
    
    this.services.set(name, {
      instance: service,
      name: name,
      registeredAt: new Date(),
      isActive: true
    });
    
    console.log(`✅ Service ${name} registered`);
  }

  /**
   * Get a service
   */
  get(name) {
    const service = this.services.get(name);
    return service ? service.instance : null;
  }

  /**
   * Unregister a service
   */
  unregister(name) {
    const service = this.services.get(name);
    if (service) {
      service.isActive = false;
      this.services.delete(name);
      console.log(`✅ Service ${name} unregistered`);
    }
  }

  /**
   * Add cleanup handler
   */
  addCleanupHandler(handler) {
    this.cleanupHandlers.add(handler);
  }

  /**
   * Remove cleanup handler
   */
  removeCleanupHandler(handler) {
    this.cleanupHandlers.delete(handler);
  }

  /**
   * Get service statistics
   */
  getStats() {
    const stats = {
      totalServices: this.services.size,
      activeServices: 0,
      services: []
    };

    for (const [name, service] of this.services) {
      if (service.isActive) {
        stats.activeServices++;
      }
      
      stats.services.push({
        name: service.name,
        isActive: service.isActive,
        registeredAt: service.registeredAt,
        uptime: Date.now() - service.registeredAt.getTime()
      });
    }

    return stats;
  }

  /**
   * Cleanup all services
   */
  async cleanup() {
    if (this.isShuttingDown) {
      console.log('⚠️ Cleanup already in progress');
      return;
    }

    this.isShuttingDown = true;
    console.log('🧹 Starting service cleanup...');

    const cleanupPromises = [];

    // Cleanup registered services
    for (const [name, service] of this.services) {
      if (service.instance && typeof service.instance.cleanup === 'function') {
        console.log(`🧹 Cleaning up service: ${name}`);
        cleanupPromises.push(
          service.instance.cleanup().catch(error => {
            console.error(`❌ Error cleaning up service ${name}:`, error);
          })
        );
      }
    }

    // Run cleanup handlers
    for (const handler of this.cleanupHandlers) {
      try {
        cleanupPromises.push(
          Promise.resolve(handler()).catch(error => {
            console.error('❌ Error in cleanup handler:', error);
          })
        );
      } catch (error) {
        console.error('❌ Error in cleanup handler:', error);
      }
    }

    // Wait for all cleanup to complete
    await Promise.allSettled(cleanupPromises);

    // Clear all services
    this.services.clear();
    this.cleanupHandlers.clear();

    console.log('✅ Service cleanup completed');
  }

  /**
   * Health check for all services
   */
  async healthCheck() {
    const health = {
      status: 'healthy',
      services: {},
      timestamp: new Date().toISOString()
    };

    for (const [name, service] of this.services) {
      try {
        if (service.instance && typeof service.instance.healthCheck === 'function') {
          health.services[name] = await service.instance.healthCheck();
        } else {
          health.services[name] = {
            status: service.isActive ? 'healthy' : 'inactive',
            message: 'No health check available'
          };
        }
      } catch (error) {
        health.services[name] = {
          status: 'error',
          message: error.message
        };
        health.status = 'degraded';
      }
    }

    return health;
  }

  /**
   * Restart a service
   */
  async restart(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }

    console.log(`🔄 Restarting service: ${name}`);

    // Cleanup existing service
    if (service.instance && typeof service.instance.cleanup === 'function') {
      await service.instance.cleanup();
    }

    // Mark as inactive
    service.isActive = false;

    // Re-register if service has a factory method
    if (service.instance && typeof service.instance.restart === 'function') {
      await service.instance.restart();
      service.isActive = true;
      console.log(`✅ Service ${name} restarted`);
    } else {
      console.log(`⚠️ Service ${name} cannot be restarted automatically`);
    }
  }
}

// Create singleton instance
const serviceManager = new ServiceManager();

// Add graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('📡 SIGTERM received, starting graceful shutdown...');
  await serviceManager.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📡 SIGINT received, starting graceful shutdown...');
  await serviceManager.cleanup();
  process.exit(0);
});

process.on('uncaughtException', async (error) => {
  console.error('❌ Uncaught exception:', error);
  await serviceManager.cleanup();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  await serviceManager.cleanup();
  process.exit(1);
});

module.exports = serviceManager;
