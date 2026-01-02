import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches React errors and provides graceful fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        
        this.setState({ errorInfo });
        
        // Send to error tracking service (e.g., Sentry)
        if (typeof window !== 'undefined' && (window as any).Sentry) {
            (window as any).Sentry.captureException(error, {
                contexts: {
                    react: {
                        componentStack: errorInfo.componentStack,
                    },
                },
            });
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-agency-secondary dark:bg-agency-dark px-4">
                    <div className="max-w-md text-center">
                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 text-agency-primary dark:text-white">
                            Oops!
                        </h1>
                        <p className="text-lg text-agency-primary/60 dark:text-white/60 mb-8">
                            Something went wrong. Please refresh the page or contact support if the problem persists.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 rounded-full bg-agency-accent text-agency-primary font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                        >
                            Refresh Page
                        </button>
                        
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-8 text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                <summary className="cursor-pointer font-bold text-red-600 dark:text-red-400 mb-2">
                                    Error Details (Development Only)
                                </summary>
                                <pre className="text-xs overflow-auto text-red-800 dark:text-red-300">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
