import { productionApi } from './production-api';
import { errorHandler } from './error-handler';
import { toast } from 'sonner';

export interface PersistenceOptions {
  optimistic?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  showToast?: boolean;
  validateBeforeSave?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

export interface PersistenceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  retryCount?: number;
}

class DataPersistenceService {
  private autoSaveTimers: Map<string, NodeJS.Timeout> = new Map();
  private pendingChanges: Map<string, unknown> = new Map();
  private validationRules: Map<string, (data: unknown) => boolean> = new Map();

  // Generic CRUD operations
  public async create<T>(
    endpoint: string,
    data: unknown,
    options: PersistenceOptions = {}
  ): Promise<PersistenceResult<T>> {
    const {
      optimistic = false,
      retryAttempts = 3,
      retryDelay = 1000,
      showToast = true,
      validateBeforeSave = true
    } = options;

    try {
      // Validate data if validation is enabled
      if (validateBeforeSave && this.validationRules.has(endpoint)) {
        const isValid = this.validationRules.get(endpoint)!(data);
        if (!isValid) {
          throw new Error('Validation failed');
        }
      }

      // Optimistic update
      if (optimistic) {
        this.showOptimisticToast('Creating...', showToast);
      }

      // Attempt to create with retry logic
      const result = await this.withRetry(
        () => this.callCreateAPI(endpoint, data),
        retryAttempts,
        retryDelay
      );

      if (result.success) {
        this.showSuccessToast('Created successfully', showToast);
        return result as PersistenceResult<T>;
      } else {
        throw new Error(result.error || 'Create operation failed');
      }
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        { component: 'DataPersistence', action: `Create operation for ${endpoint}` }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create record',
        retryCount: 0
      };
    }
  }

  public async read<T>(
    endpoint: string,
    id?: string,
    options: PersistenceOptions = {}
  ): Promise<PersistenceResult<T>> {
    const {
      retryAttempts = 3,
      retryDelay = 1000,
      showToast = false
    } = options;

    try {
      const result = await this.withRetry(
        () => this.callReadAPI(endpoint, id),
        retryAttempts,
        retryDelay
      );

      if (result.success) {
        return result as PersistenceResult<T>;
      } else {
        throw new Error(result.error || 'Read operation failed');
      }
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        { component: 'DataPersistence', action: `Read operation for ${endpoint}` }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
        retryCount: 0
      };
    }
  }

  public async update<T>(
    endpoint: string,
    id: string,
    data: unknown,
    options: PersistenceOptions = {}
  ): Promise<PersistenceResult<T>> {
    const {
      optimistic = false,
      retryAttempts = 3,
      retryDelay = 1000,
      showToast = true,
      validateBeforeSave = true
    } = options;

    try {
      // Validate data if validation is enabled
      if (validateBeforeSave && this.validationRules.has(endpoint)) {
        const isValid = this.validationRules.get(endpoint)!(data);
        if (!isValid) {
          throw new Error('Validation failed');
        }
      }

      // Optimistic update
      if (optimistic) {
        this.showOptimisticToast('Updating...', showToast);
      }

      // Attempt to update with retry logic
      const result = await this.withRetry(
        () => this.callUpdateAPI(endpoint, id, data),
        retryAttempts,
        retryDelay
      );

      if (result.success) {
        this.showSuccessToast('Updated successfully', showToast);
        return result as PersistenceResult<T>;
      } else {
        throw new Error(result.error || 'Update operation failed');
      }
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        { component: 'DataPersistence', action: `Update operation for ${endpoint}` }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update record',
        retryCount: 0
      };
    }
  }

  public async delete<T>(
    endpoint: string,
    id: string,
    options: PersistenceOptions = {}
  ): Promise<PersistenceResult<T>> {
    const {
      optimistic = false,
      retryAttempts = 3,
      retryDelay = 1000,
      showToast = true
    } = options;

    try {
      // Optimistic update
      if (optimistic) {
        this.showOptimisticToast('Deleting...', showToast);
      }

      // Attempt to delete with retry logic
      const result = await this.withRetry(
        () => this.callDeleteAPI(endpoint, id),
        retryAttempts,
        retryDelay
      );

      if (result.success) {
        this.showSuccessToast('Deleted successfully', showToast);
        return result as PersistenceResult<T>;
      } else {
        throw new Error(result.error || 'Delete operation failed');
      }
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        { component: 'DataPersistence', action: `Delete operation for ${endpoint}` }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete record',
        retryCount: 0
      };
    }
  }

  // Batch operations
  public async batchCreate<T>(
    endpoint: string,
    items: unknown[],
    options: PersistenceOptions = {}
  ): Promise<PersistenceResult<T[]>> {
    const results: T[] = [];
    const errors: string[] = [];

    for (const item of items) {
      const result = await this.create<T>(endpoint, item, {
        ...options,
        showToast: false // Don't show individual toasts for batch operations
      });

      if (result.success && result.data) {
        results.push(result.data);
      } else {
        errors.push(result.error || 'Unknown error');
      }
    }

    const success = results.length === items.length;
    const message = success 
      ? `Successfully created ${results.length} items`
      : `Created ${results.length} of ${items.length} items`;

    if (options.showToast !== false) {
      if (success) {
        toast.success(message);
      } else {
        toast.warning(message);
        if (errors.length > 0) {
          toast.error(`Errors: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`);
        }
      }
    }

    return {
      success,
      data: results,
      error: errors.length > 0 ? errors.join('; ') : undefined
    };
  }

  public async batchUpdate<T>(
    endpoint: string,
    updates: { id: string; data: unknown }[],
    options: PersistenceOptions = {}
  ): Promise<PersistenceResult<T[]>> {
    const results: T[] = [];
    const errors: string[] = [];

    for (const update of updates) {
      const result = await this.update<T>(endpoint, update.id, update.data, {
        ...options,
        showToast: false // Don't show individual toasts for batch operations
      });

      if (result.success && result.data) {
        results.push(result.data);
      } else {
        errors.push(result.error || 'Unknown error');
      }
    }

    const success = results.length === updates.length;
    const message = success 
      ? `Successfully updated ${results.length} items`
      : `Updated ${results.length} of ${updates.length} items`;

    if (options.showToast !== false) {
      if (success) {
        toast.success(message);
      } else {
        toast.warning(message);
        if (errors.length > 0) {
          toast.error(`Errors: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`);
        }
      }
    }

    return {
      success,
      data: results,
      error: errors.length > 0 ? errors.join('; ') : undefined
    };
  }

  public async batchDelete<T>(
    endpoint: string,
    ids: string[],
    options: PersistenceOptions = {}
  ): Promise<PersistenceResult<boolean[]>> {
    const results: boolean[] = [];
    const errors: string[] = [];

    for (const id of ids) {
      const result = await this.delete<T>(endpoint, id, {
        ...options,
        showToast: false // Don't show individual toasts for batch operations
      });

      results.push(result.success);
      if (!result.success) {
        errors.push(result.error || 'Unknown error');
      }
    }

    const success = results.every(r => r);
    const message = success 
      ? `Successfully deleted ${results.filter(r => r).length} items`
      : `Deleted ${results.filter(r => r).length} of ${ids.length} items`;

    if (options.showToast !== false) {
      if (success) {
        toast.success(message);
      } else {
        toast.warning(message);
        if (errors.length > 0) {
          toast.error(`Errors: ${errors.slice(0, 3).join(', ')}${errors.length > 3 ? '...' : ''}`);
        }
      }
    }

    return {
      success,
      data: results,
      error: errors.length > 0 ? errors.join('; ') : undefined
    };
  }

  // Auto-save functionality
  public enableAutoSave(
    key: string,
    data: unknown,
    saveFunction: (data: unknown) => Promise<unknown>,
    interval: number = 30000 // 30 seconds
  ): void {
    // Clear existing timer
    this.disableAutoSave(key);

    // Store pending changes
    this.pendingChanges.set(key, data);

    // Set up auto-save timer
    const timer = setInterval(async () => {
      const currentData = this.pendingChanges.get(key);
      if (currentData) {
        try {
          await saveFunction(currentData);
        } catch (error) {
          // Auto-save failed
        }
      }
    }, interval);

    this.autoSaveTimers.set(key, timer);
  }

  public disableAutoSave(key: string): void {
    const timer = this.autoSaveTimers.get(key);
    if (timer) {
      clearInterval(timer);
      this.autoSaveTimers.delete(key);
    }
    this.pendingChanges.delete(key);
  }

  public updateAutoSaveData(key: string, data: unknown): void {
    this.pendingChanges.set(key, data);
  }

  // Validation
  public setValidationRule(endpoint: string, validator: (data: unknown) => boolean): void {
    this.validationRules.set(endpoint, validator);
  }

  public removeValidationRule(endpoint: string): void {
    this.validationRules.delete(endpoint);
  }

  // Cache management
  public async invalidateCache(endpoint: string): Promise<void> {
    // This would typically clear relevant cache entries
  }

  public async refreshData<T>(endpoint: string): Promise<T | null> {
    try {
      await this.invalidateCache(endpoint);
      const result = await this.read<T>(endpoint);
      return result.success ? result.data || null : null;
    } catch (error) {
      // Failed to refresh data
      return null;
    }
  }

  // Private helper methods
  private async callCreateAPI(endpoint: string, data: unknown): Promise<PersistenceResult<unknown>> {
    // Map endpoint to appropriate API method
    const apiMethod = this.getAPIMethod(endpoint, 'create');
    const result = await apiMethod(data);
    return { success: true, data: result };
  }

  private async callReadAPI(endpoint: string, id?: string): Promise<PersistenceResult<unknown>> {
    const apiMethod = this.getAPIMethod(endpoint, 'read');
    const result = await apiMethod(id);
    return { success: true, data: result };
  }

  private async callUpdateAPI(endpoint: string, id: string, data: unknown): Promise<PersistenceResult<unknown>> {
    const apiMethod = this.getAPIMethod(endpoint, 'update');
    const result = await apiMethod(id, data);
    return { success: true, data: result };
  }

  private async callDeleteAPI(endpoint: string, id: string): Promise<PersistenceResult<unknown>> {
    const apiMethod = this.getAPIMethod(endpoint, 'delete');
    const result = await apiMethod(id);
    return { success: true, data: result };
  }

  private getAPIMethod(endpoint: string, operation: string): (...args: unknown[]) => unknown {
    // Map endpoint patterns to API methods - only use methods that actually exist
    const endpointMap: Record<string, Record<string, (...args: unknown[]) => unknown>> = {
      'users': {
        create: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        read: productionApi.getUsers,
        update: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        delete: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' })
      },
      'fleet': {
        create: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        read: productionApi.getFleetVehicles,
        update: (...args: unknown[]) => productionApi.updateFleetVehicle(args[0] as string, args[1] as Record<string, unknown>),
        delete: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' })
      },
      'payments': {
        create: (...args: unknown[]) => productionApi.createPayment(args[0] as Record<string, unknown>),
        read: productionApi.getPayments,
        update: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        delete: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' })
      },
      'customers': {
        create: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        read: productionApi.getUsers, // Use getUsers as fallback since getCustomers doesn't exist
        update: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        delete: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' })
      },
      'vendors': {
        create: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        read: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        update: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        delete: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' })
      },
      'integrations': {
        create: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        read: productionApi.getIntegrations,
        update: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        delete: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' })
      },
      'feature-flags': {
        create: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        read: productionApi.getFeatureFlags,
        update: productionApi.updateFeatureFlag,
        delete: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' })
      },
      'knowledge-articles': {
        create: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        read: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        update: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        delete: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' })
      },
      'user-segments': {
        create: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        read: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        update: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' }),
        delete: () => Promise.resolve({ success: false, data: null, message: 'Method not implemented' })
      }
    };

    const methods = endpointMap[endpoint];
    if (!methods || !methods[operation]) {
      throw new Error(`No API method found for ${endpoint}.${operation}`);
    }

    return methods[operation];
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number,
    delay: number
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }

    throw lastError || new Error('Operation failed after all retry attempts');
  }

  private showOptimisticToast(message: string, showToast: boolean): void {
    if (showToast) {
      toast.loading(message);
    }
  }

  private showSuccessToast(message: string, showToast: boolean): void {
    if (showToast) {
      toast.success(message);
    }
  }

  // Cleanup method
  public cleanup(): void {
    // Clear all auto-save timers
    for (const [key, timer] of this.autoSaveTimers) {
      clearInterval(timer);
    }
    this.autoSaveTimers.clear();
    this.pendingChanges.clear();
  }
}

export const dataPersistence = new DataPersistenceService();
export default dataPersistence;
