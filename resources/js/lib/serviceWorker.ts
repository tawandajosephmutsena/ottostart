/**
 * Service Worker registration and management
 */

export interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig = {};

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  /**
   * Register service worker
   */
  async register(swUrl: string = '/sw.js', config: ServiceWorkerConfig = {}): Promise<void> {
    this.config = config;

    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register(swUrl);
      this.registration = registration;

      console.log('Service Worker registered successfully');

      // Handle updates
      registration.addEventListener('updatefound', () => {
        this.handleUpdateFound(registration);
      });

      // Check for existing service worker
      if (registration.active) {
        this.config.onSuccess?.(registration);
      }

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this));

      // Check for updates periodically
      this.setupUpdateCheck();

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      this.config.onError?.(error as Error);
    }
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Update service worker
   */
  async update(): Promise<void> {
    if (!this.registration) {
      throw new Error('No service worker registration found');
    }

    try {
      await this.registration.update();
      console.log('Service Worker update check completed');
    } catch (error) {
      console.error('Service Worker update failed:', error);
      throw error;
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  skipWaiting(): void {
    if (!this.registration?.waiting) {
      return;
    }

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  /**
   * Get service worker version
   */
  async getVersion(): Promise<string | null> {
    if (!this.registration?.active) {
      return null;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version || null);
      };

      this.registration!.active!.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    });
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<boolean> {
    if (!this.registration?.active) {
      return false;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success || false);
      };

      this.registration!.active!.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }

  /**
   * Check if service worker is supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Get registration status
   */
  getStatus(): string {
    if (!this.isSupported()) {
      return 'not-supported';
    }

    if (!this.registration) {
      return 'not-registered';
    }

    if (this.registration.installing) {
      return 'installing';
    }

    if (this.registration.waiting) {
      return 'waiting';
    }

    if (this.registration.active) {
      return 'active';
    }

    return 'unknown';
  }

  /**
   * Handle service worker update found
   */
  private handleUpdateFound(registration: ServiceWorkerRegistration): void {
    const installingWorker = registration.installing;
    
    if (!installingWorker) {
      return;
    }

    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New service worker available
          console.log('New service worker available');
          this.config.onUpdate?.(registration);
        } else {
          // Service worker installed for the first time
          console.log('Service worker installed for the first time');
          this.config.onSuccess?.(registration);
        }
      }
    });
  }

  /**
   * Handle messages from service worker
   */
  private handleMessage(event: MessageEvent): void {
    const { type, payload } = event.data || {};
    
    switch (type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated:', payload);
        break;
        
      case 'OFFLINE_READY':
        console.log('App ready for offline use');
        break;
        
      default:
        console.log('Unknown message from service worker:', event.data);
    }
  }

  /**
   * Setup periodic update checks
   */
  private setupUpdateCheck(): void {
    // Check for updates every hour
    setInterval(() => {
      if (this.registration) {
        this.registration.update().catch(console.error);
      }
    }, 60 * 60 * 1000);

    // Check for updates when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.registration) {
        this.registration.update().catch(console.error);
      }
    });
  }
}

/**
 * Register service worker with default configuration
 */
export const registerServiceWorker = (config: ServiceWorkerConfig = {}): Promise<void> => {
  const manager = ServiceWorkerManager.getInstance();
  return manager.register('/sw.js', config);
};

/**
 * Show update available notification
 */
export const showUpdateAvailableNotification = (
  onUpdate: () => void,
  onDismiss?: () => void
): void => {
  // Create update notification
  const notification = document.createElement('div');
  notification.className = 'fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
  notification.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <h4 class="font-semibold">Update Available</h4>
        <p class="text-sm opacity-90">A new version of the app is available.</p>
      </div>
      <button class="ml-4 text-white hover:text-gray-200" data-dismiss>
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
    <div class="mt-3 flex space-x-2">
      <button class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100" data-update>
        Update Now
      </button>
      <button class="text-white opacity-75 hover:opacity-100 px-3 py-1 rounded text-sm" data-dismiss>
        Later
      </button>
    </div>
  `;

  // Add event listeners
  notification.querySelector('[data-update]')?.addEventListener('click', () => {
    onUpdate();
    notification.remove();
  });

  notification.querySelector('[data-dismiss]')?.addEventListener('click', () => {
    onDismiss?.();
    notification.remove();
  });

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
      onDismiss?.();
    }
  }, 10000);

  document.body.appendChild(notification);
};

/**
 * React hook for service worker management
 */
export const useServiceWorker = () => {
  const manager = ServiceWorkerManager.getInstance();

  return {
    register: (config?: ServiceWorkerConfig) => manager.register('/sw.js', config),
    unregister: () => manager.unregister(),
    update: () => manager.update(),
    skipWaiting: () => manager.skipWaiting(),
    getVersion: () => manager.getVersion(),
    clearCaches: () => manager.clearCaches(),
    isSupported: () => manager.isSupported(),
    getStatus: () => manager.getStatus(),
  };
};