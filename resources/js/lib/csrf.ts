import { usePage } from '@inertiajs/react';

// Extend Window interface to include axios
declare global {
    interface Window {
        axios?: {
            defaults: {
                headers: {
                    common: Record<string, string>;
                };
            };
            interceptors: {
                request: {
                    use: (interceptor: (config: any) => any) => void;
                };
            };
        };
    }
}

/**
 * Get CSRF token from page props or meta tag
 */
export function getCsrfToken(): string | null {
    // Try to get from Inertia page props first
    try {
        const page = usePage();
        if (page.props.csrf_token) {
            return page.props.csrf_token as string;
        }
    } catch (error) {
        // usePage might not be available in all contexts
    }

    // Fallback to meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') : null;
}

/**
 * Get CSRF token from cookie (XSRF-TOKEN)
 */
export function getCsrfTokenFromCookie(): string | null {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'XSRF-TOKEN') {
            return decodeURIComponent(value);
        }
    }
    return null;
}

/**
 * Set up axios defaults for CSRF protection
 */
export function setupCsrfProtection(): void {
    // Set up axios interceptor to include CSRF token
    if (typeof window !== 'undefined' && window.axios) {
        window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        
        // Add request interceptor to include CSRF token
        window.axios.interceptors.request.use((config: any) => {
            const token = getCsrfToken() || getCsrfTokenFromCookie();
            if (token) {
                config.headers['X-CSRF-TOKEN'] = token;
            }
            return config;
        });
    }
}

/**
 * Create a form with CSRF token
 */
export function createFormWithCsrf(action: string, method: string = 'POST'): HTMLFormElement {
    const form = document.createElement('form');
    form.method = method;
    form.action = action;

    // Add CSRF token
    const token = getCsrfToken();
    if (token) {
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = token;
        form.appendChild(csrfInput);
    }

    return form;
}

/**
 * Validate CSRF token format
 */
export function isValidCsrfToken(token: string): boolean {
    // Laravel CSRF tokens are 40 characters long and alphanumeric
    return /^[a-zA-Z0-9]{40}$/.test(token);
}