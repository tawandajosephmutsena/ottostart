import React, { useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { gsap } from 'gsap';
import { Home, ArrowLeft, RefreshCcw, ShieldAlert, Ghost, Search, Server } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';

declare const route: (name: string, params?: Record<string, unknown> | string | number) => string;

interface ErrorPageProps {
    status: number;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ status }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const title = {
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Page Not Found',
        500: 'Internal Server Error',
        503: 'Service Unavailable',
    }[status] || 'Unexpected Error';

    const description = {
        401: 'You need to be authenticated to access this page.',
        403: 'Sorry, you don\'t have permission to access this area.',
        404: 'Oops! The page you are looking for has vanished into the digital void.',
        500: 'Something went wrong on our end. Our technicians are already on it.',
        503: 'We are currently performing maintenance. We\'ll be back shortly.',
    }[status] || 'An unknown error occurred.';

    const Icon = {
        401: ShieldAlert,
        403: ShieldAlert,
        404: Ghost,
        500: Server,
        503: RefreshCcw,
    }[status] || Ghost;

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Floating animation for the icon
            gsap.to('.error-icon', {
                y: -20,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut'
            });

            // Text reveal
            gsap.from('.reveal-text', {
                opacity: 0,
                y: 30,
                duration: 1,
                stagger: 0.2,
                ease: 'power3.out'
            });

            // Glitch effect for the status code
            const glitch = () => {
                gsap.to('.status-code', {
                    skewX: () => Math.random() * 20 - 10,
                    duration: 0.1,
                    onComplete: () => {
                        gsap.set('.status-code', { skewX: 0 });
                        setTimeout(glitch, Math.random() * 3000 + 1000);
                    }
                });
            };
            glitch();
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <MainLayout>
            <Head title={title} />
            
            <div ref={containerRef} className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-full max-w-2xl h-full max-h-2xl bg-primary/5 blur-[120px] rounded-full" />
                
                <div ref={contentRef} className="text-center max-w-2xl mx-auto z-10">
                    <div className="relative mb-8 inline-block">
                        <div className="status-code text-[120px] md:text-[200px] font-black opacity-[0.03] select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 leading-none whitespace-nowrap tracking-tighter">
                            {status}
                        </div>
                        <div className="error-icon relative z-10 bg-primary/10 p-8 rounded-full">
                            <Icon className="w-16 h-16 md:w-24 md:h-24 text-primary" />
                        </div>
                    </div>

                    <h1 className="reveal-text text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
                        {title}
                    </h1>
                    
                    <p className="reveal-text text-lg md:text-xl text-muted-foreground mb-12 max-w-lg mx-auto leading-relaxed">
                        {description}
                    </p>

                    <div className="reveal-text flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link 
                            href={route('home')}
                            className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <Home className="w-5 h-5" />
                            Return Home
                        </Link>
                        
                        <button 
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto px-8 py-4 bg-muted text-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </button>
                    </div>

                    <div className="reveal-text mt-16 pt-8 border-t border-muted">
                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Search className="w-4 h-4" />
                            Try searching for what you're looking for (Cmd + K)
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ErrorPage;
