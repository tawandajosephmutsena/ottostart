/**
 * Loading State Manager
 * Manages loading states and progressive loading animations
 */
export class LoadingStateManager {
    private static instance: LoadingStateManager;
    private loadingStates: Map<string, LoadingState> = new Map();
    private progressiveLoaders: Map<string, ProgressiveLoader> = new Map();
    private globalLoadingState: boolean = false;
    private loadingCallbacks: Set<(isLoading: boolean) => void> = new Set();

    private constructor() {
        this.setupGlobalLoadingIndicator();
    }

    public static getInstance(): LoadingStateManager {
        if (!LoadingStateManager.instance) {
            LoadingStateManager.instance = new LoadingStateManager();
        }
        return LoadingStateManager.instance;
    }

    /**
     * Setup global loading indicator
     */
    private setupGlobalLoadingIndicator(): void {
        if (typeof document === 'undefined') return;

        // Create global loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'global-loading-indicator';
        loadingIndicator.className = 'fixed top-0 left-0 w-full h-1 bg-blue-500 transform -translate-x-full transition-transform duration-300 z-50';
        loadingIndicator.style.display = 'none';
        document.body.appendChild(loadingIndicator);
    }

    /**
     * Set loading state for a specific key
     */
    public setLoadingState(key: string, isLoading: boolean, metadata?: any): void {
        if (isLoading) {
            this.loadingStates.set(key, {
                key,
                isLoading: true,
                startTime: Date.now(),
                metadata,
            });
        } else {
            const existingState = this.loadingStates.get(key);
            if (existingState) {
                this.loadingStates.set(key, {
                    ...existingState,
                    isLoading: false,
                    endTime: Date.now(),
                    duration: Date.now() - existingState.startTime,
                });
            }
        }

        this.updateGlobalLoadingState();
    }

    /**
     * Update global loading state
     */
    private updateGlobalLoadingState(): void {
        const hasActiveLoading = Array.from(this.loadingStates.values()).some(
            state => state.isLoading
        );

        if (hasActiveLoading !== this.globalLoadingState) {
            this.globalLoadingState = hasActiveLoading;
            this.notifyLoadingCallbacks();
            this.updateGlobalLoadingIndicator();
        }
    }

    /**
     * Update global loading indicator
     */
    private updateGlobalLoadingIndicator(): void {
        const indicator = document.getElementById('global-loading-indicator');
        if (!indicator) return;

        if (this.globalLoadingState) {
            indicator.style.display = 'block';
            indicator.style.transform = 'translateX(0)';
        } else {
            indicator.style.transform = 'translateX(100%)';
            setTimeout(() => {
                indicator.style.display = 'none';
                indicator.style.transform = 'translateX(-100%)';
            }, 300);
        }
    }

    /**
     * Notify loading callbacks
     */
    private notifyLoadingCallbacks(): void {
        this.loadingCallbacks.forEach(callback => {
            callback(this.globalLoadingState);
        });
    }

    /**
     * Subscribe to global loading state changes
     */
    public onLoadingStateChange(callback: (isLoading: boolean) => void): () => void {
        this.loadingCallbacks.add(callback);
        
        return () => {
            this.loadingCallbacks.delete(callback);
        };
    }

    /**
     * Get loading state for a specific key
     */
    public getLoadingState(key: string): LoadingState | undefined {
        return this.loadingStates.get(key);
    }

    /**
     * Check if any loading is active
     */
    public isLoading(): boolean {
        return this.globalLoadingState;
    }

    /**
     * Get all active loading states
     */
    public getActiveLoadingStates(): LoadingState[] {
        return Array.from(this.loadingStates.values()).filter(state => state.isLoading);
    }

    /**
     * Create progressive loader
     */
    public createProgressiveLoader(
        key: string,
        stages: ProgressiveStage[],
        options: ProgressiveLoaderOptions = {}
    ): ProgressiveLoader {
        const loader: ProgressiveLoader = {
            key,
            stages,
            currentStage: 0,
            isActive: false,
            startTime: 0,
            stageStartTime: 0,
            options: {
                autoAdvance: true,
                showProgress: true,
                animateTransitions: true,
                ...options,
            },
        };

        this.progressiveLoaders.set(key, loader);
        return loader;
    }

    /**
     * Start progressive loader
     */
    public startProgressiveLoader(key: string): void {
        const loader = this.progressiveLoaders.get(key);
        if (!loader) return;

        loader.isActive = true;
        loader.startTime = Date.now();
        loader.stageStartTime = Date.now();
        loader.currentStage = 0;

        this.setLoadingState(key, true, { type: 'progressive', loader });
        this.executeProgressiveStage(loader);
    }

    /**
     * Execute progressive stage
     */
    private executeProgressiveStage(loader: ProgressiveLoader): void {
        const stage = loader.stages[loader.currentStage];
        if (!stage) return;

        // Execute stage action
        if (stage.action) {
            stage.action();
        }

        // Auto-advance to next stage if enabled
        if (loader.options.autoAdvance && stage.duration) {
            setTimeout(() => {
                this.advanceProgressiveLoader(loader.key);
            }, stage.duration);
        }
    }

    /**
     * Advance progressive loader to next stage
     */
    public advanceProgressiveLoader(key: string): void {
        const loader = this.progressiveLoaders.get(key);
        if (!loader || !loader.isActive) return;

        loader.currentStage++;
        loader.stageStartTime = Date.now();

        if (loader.currentStage >= loader.stages.length) {
            this.completeProgressiveLoader(key);
        } else {
            this.executeProgressiveStage(loader);
        }
    }

    /**
     * Complete progressive loader
     */
    public completeProgressiveLoader(key: string): void {
        const loader = this.progressiveLoaders.get(key);
        if (!loader) return;

        loader.isActive = false;
        this.setLoadingState(key, false);
    }

    /**
     * Get progressive loader progress
     */
    public getProgressiveLoaderProgress(key: string): number {
        const loader = this.progressiveLoaders.get(key);
        if (!loader || !loader.isActive) return 0;

        return (loader.currentStage / loader.stages.length) * 100;
    }

    /**
     * Create skeleton transition
     */
    public createSkeletonTransition(
        skeletonElement: HTMLElement,
        contentElement: HTMLElement,
        options: SkeletonTransitionOptions = {}
    ): void {
        const {
            duration = 300,
            ease = 'ease-out',
            fadeOut = true,
            slideUp = false,
        } = options;

        // Ensure content is initially hidden
        contentElement.style.opacity = '0';
        if (slideUp) {
            contentElement.style.transform = 'translateY(20px)';
        }

        // Show content
        contentElement.style.display = 'block';

        // Animate transition
        const timeline = [
            // Fade out skeleton
            ...(fadeOut ? [{
                element: skeletonElement,
                properties: { opacity: 0 },
                duration: duration / 2,
            }] : []),
            
            // Fade in content
            {
                element: contentElement,
                properties: { 
                    opacity: 1,
                    ...(slideUp ? { transform: 'translateY(0)' } : {}),
                },
                duration: duration / 2,
                delay: fadeOut ? duration / 2 : 0,
            },
        ];

        this.executeAnimationTimeline(timeline, () => {
            // Hide skeleton after transition
            skeletonElement.style.display = 'none';
        });
    }

    /**
     * Execute animation timeline
     */
    private executeAnimationTimeline(
        timeline: AnimationStep[],
        onComplete?: () => void
    ): void {
        let completedSteps = 0;

        timeline.forEach((step, index) => {
            setTimeout(() => {
                const element = step.element;
                const properties = step.properties;
                
                // Apply transition
                element.style.transition = `all ${step.duration}ms ease-out`;
                
                // Apply properties
                Object.entries(properties).forEach(([prop, value]) => {
                    (element.style as any)[prop] = value;
                });

                // Track completion
                setTimeout(() => {
                    completedSteps++;
                    if (completedSteps === timeline.length && onComplete) {
                        onComplete();
                    }
                }, step.duration);
                
            }, step.delay || 0);
        });
    }

    /**
     * Create loading spinner
     */
    public createLoadingSpinner(
        container: HTMLElement,
        options: LoadingSpinnerOptions = {}
    ): HTMLElement {
        const {
            size = 'medium',
            color = 'blue',
            text = 'Loading...',
            showText = true,
        } = options;

        const spinner = document.createElement('div');
        spinner.className = `loading-spinner loading-spinner-${size} loading-spinner-${color}`;
        
        const spinnerIcon = document.createElement('div');
        spinnerIcon.className = 'loading-spinner-icon';
        spinner.appendChild(spinnerIcon);

        if (showText && text) {
            const textElement = document.createElement('div');
            textElement.className = 'loading-spinner-text';
            textElement.textContent = text;
            spinner.appendChild(textElement);
        }

        container.appendChild(spinner);
        return spinner;
    }

    /**
     * Remove loading spinner
     */
    public removeLoadingSpinner(spinner: HTMLElement): void {
        if (spinner && spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
        }
    }

    /**
     * Get loading statistics
     */
    public getLoadingStats(): LoadingStats {
        const states = Array.from(this.loadingStates.values());
        const completedStates = states.filter(state => !state.isLoading && state.duration);
        
        const averageDuration = completedStates.length > 0
            ? completedStates.reduce((sum, state) => sum + (state.duration || 0), 0) / completedStates.length
            : 0;

        return {
            totalStates: states.length,
            activeStates: states.filter(state => state.isLoading).length,
            completedStates: completedStates.length,
            averageDuration: Math.round(averageDuration),
            longestDuration: Math.max(...completedStates.map(state => state.duration || 0), 0),
        };
    }

    /**
     * Clear all loading states
     */
    public clearAllLoadingStates(): void {
        this.loadingStates.clear();
        this.progressiveLoaders.clear();
        this.globalLoadingState = false;
        this.updateGlobalLoadingIndicator();
        this.notifyLoadingCallbacks();
    }

    /**
     * Cleanup
     */
    public cleanup(): void {
        this.clearAllLoadingStates();
        this.loadingCallbacks.clear();
        
        const indicator = document.getElementById('global-loading-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
}

// Type definitions
interface LoadingState {
    key: string;
    isLoading: boolean;
    startTime: number;
    endTime?: number;
    duration?: number;
    metadata?: any;
}

interface ProgressiveStage {
    name: string;
    duration?: number;
    action?: () => void;
}

interface ProgressiveLoaderOptions {
    autoAdvance?: boolean;
    showProgress?: boolean;
    animateTransitions?: boolean;
}

interface ProgressiveLoader {
    key: string;
    stages: ProgressiveStage[];
    currentStage: number;
    isActive: boolean;
    startTime: number;
    stageStartTime: number;
    options: ProgressiveLoaderOptions;
}

interface SkeletonTransitionOptions {
    duration?: number;
    ease?: string;
    fadeOut?: boolean;
    slideUp?: boolean;
}

interface AnimationStep {
    element: HTMLElement;
    properties: Record<string, any>;
    duration: number;
    delay?: number;
}

interface LoadingSpinnerOptions {
    size?: 'small' | 'medium' | 'large';
    color?: 'blue' | 'gray' | 'green' | 'red';
    text?: string;
    showText?: boolean;
}

interface LoadingStats {
    totalStates: number;
    activeStates: number;
    completedStates: number;
    averageDuration: number;
    longestDuration: number;
}

// Export singleton instance
export const loadingStateManager = LoadingStateManager.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        loadingStateManager.cleanup();
    });
}