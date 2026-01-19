import React from 'react';
import { Link } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// @ts-ignore
declare const route: any;

interface AccessDeniedProps {
    message?: string;
}

export default function AccessDenied({ message }: AccessDeniedProps) {
    return (
        <AdminLayout
            title="Access Denied"
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin' },
                { title: 'Access Denied', href: '#' },
            ]}
        >
            <div className="flex min-h-[60vh] items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="mb-8 flex justify-center"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, -5, 5, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                className="flex size-32 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                            >
                                <ShieldAlert className="size-16" />
                            </motion.div>
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                className="absolute inset-0 rounded-full bg-destructive/20 blur-xl"
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="space-y-4"
                    >
                        <h1 className="text-4xl font-bold tracking-tight">Access Denied</h1>
                        <p className="text-lg text-muted-foreground">
                            {message || "You don't have permission to access this resource."}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            If you believe this is an error, please contact your administrator.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
                    >
                        <Button
                            variant="default"
                            size="lg"
                            onClick={() => window.history.back()}
                            className="gap-2"
                        >
                            <ArrowLeft className="size-4" />
                            Go Back
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            asChild
                            className="gap-2"
                        >
                            <Link href={route('admin.dashboard')}>
                                <Home className="size-4" />
                                Dashboard
                            </Link>
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="mt-12 rounded-lg border bg-muted/50 p-6"
                    >
                        <h3 className="mb-2 font-semibold">Need Help?</h3>
                        <p className="text-sm text-muted-foreground">
                            Contact your system administrator to request the necessary permissions for this action.
                        </p>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
}
