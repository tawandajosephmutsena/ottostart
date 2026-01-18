import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { SharedData } from '@/types';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
}

export const ToastContainer: React.FC = () => {
    const { flash } = usePage<SharedData>().props;
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    useEffect(() => {
        if (!flash) return;

        const types: Array<keyof typeof flash> = ['success', 'error', 'warning', 'info'];
        
        types.forEach(type => {
            if (flash[type]) {
                const id = Math.random().toString(36).substring(2, 9);
                const newToast: Toast = {
                    id,
                    type: type as Toast['type'],
                    message: flash[type] as string
                };
                
                setToasts(prev => [...prev, newToast]);

                // Auto-remove after 5 seconds
                const timer = setTimeout(() => {
                    removeToast(id);
                }, 5000);

                return () => clearTimeout(timer);
            }
        });
    }, [flash]);

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
    };

    const backgrounds = {
        success: 'bg-green-500/10 border-green-500/20',
        error: 'bg-red-500/10 border-red-500/20',
        warning: 'bg-amber-500/10 border-amber-500/20',
        info: 'bg-blue-500/10 border-blue-500/20',
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 max-w-md w-full pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        className={`pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-md ${backgrounds[toast.type]}`}
                    >
                        <div className="shrink-0 mt-0.5">
                            {icons[toast.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                                {toast.message}
                            </p>
                        </div>
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="shrink-0 rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            aria-label="Close notification"
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
