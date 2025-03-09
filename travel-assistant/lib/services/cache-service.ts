"use client";

// Cache service for storing API responses locally

interface CacheItem<T> {
  data: T
  timestamp: number
}

// Helper to safely check if we're in a browser environment
const isBrowser = () => typeof window !== "undefined";

// Helper to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (isBrowser()) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.error("Error accessing localStorage.getItem:", error);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (isBrowser()) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error("Error accessing localStorage.setItem:", error);
    }
  }
};

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map()
  private expiryTime: number = 1000 * 60 * 60 // 1 hour default

  constructor(expiryTimeMs?: number) {
    if (expiryTimeMs) {
      this.expiryTime = expiryTimeMs
    }

    // Load cache from localStorage if available
    try {
      const savedCache = safeLocalStorage.getItem("travelAssistantCache")
      if (savedCache) {
        const parsed = JSON.parse(savedCache)
        Object.keys(parsed).forEach((key) => {
          this.cache.set(key, parsed[key])
        })

        // Clean expired items
        this.cleanExpiredItems()
      }
    } catch (error) {
      console.error("Error loading cache from localStorage:", error)
    }
  }

  // Save cache to localStorage
  private saveToLocalStorage(): void {
    try {
      const cacheObj = Object.fromEntries(this.cache.entries())
      safeLocalStorage.setItem("travelAssistantCache", JSON.stringify(cacheObj))
    } catch (error) {
      console.error("Error saving cache to localStorage:", error)
    }
  }

  // Clean expired items
  private cleanExpiredItems(): void {
    const now = Date.now()
    let hasChanges = false

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.expiryTime) {
        this.cache.delete(key)
        hasChanges = true
      }
    }

    if (hasChanges) {
      this.saveToLocalStorage()
    }
  }

  // Get item from cache
  get<T>(key: string): T | null {
    this.cleanExpiredItems()

    const item = this.cache.get(key)
    if (!item) return null

    return item.data as T
  }

  // Set item in cache
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })

    this.saveToLocalStorage()
  }

  // Check if key exists in cache
  has(key: string): boolean {
    this.cleanExpiredItems()
    return this.cache.has(key)
  }

  // Remove item from cache
  remove(key: string): void {
    this.cache.delete(key)
    this.saveToLocalStorage()
  }

  // Clear entire cache
  clear(): void {
    this.cache.clear()
    this.saveToLocalStorage()
  }
}

// Create a memory-only cache service for server-side
class MemoryCacheService {
  private cache: Map<string, CacheItem<any>> = new Map()
  
  get<T>(key: string): T | null {
    return null; // Always return null on server-side
  }
  
  set<T>(_key: string, _data: T): void {
    // Do nothing on server-side
  }
  
  has(_key: string): boolean {
    return false; // Always return false on server-side
  }
  
  remove(_key: string): void {
    // Do nothing on server-side
  }
  
  clear(): void {
    // Do nothing on server-side
  }
}

// Export as singleton - use memory cache on server, regular cache on client
let cacheServiceInstance: CacheService | MemoryCacheService;

if (isBrowser()) {
  cacheServiceInstance = new CacheService();
} else {
  cacheServiceInstance = new MemoryCacheService();
}

export const cacheService = cacheServiceInstance;

