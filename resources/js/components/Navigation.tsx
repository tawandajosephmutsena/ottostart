import AppLogo from '@/components/app-logo';
import { useMagneticEffect } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LayoutDashboard, LogIn, UserPlus } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface NavigationProps {
    className?: string;
}

// Extracted NavLink component for magnetic effect on individual items
const NavLink = ({
    item,
    isActive,
}: {
    item: { name: string; href: string };
    isActive: boolean;
}) => {
    const linkRef = useRef<HTMLAnchorElement>(null);

    useMagneticEffect(linkRef as React.RefObject<HTMLElement>, {
        strength: 0.3,
        speed: 0.3,
    });

    return (
        <Link
            ref={linkRef}
            href={item.href}
            className={cn(
                'relative overflow-hidden rounded-full px-4 py-2 text-[11px] font-bold tracking-widest uppercase transition-all duration-500',
                isActive
                    ? 'bg-agency-accent text-primary-foreground shadow-lg shadow-agency-accent/20'
                    : 'text-agency-primary/80 hover:bg-agency-accent/5 hover:text-agency-accent dark:text-white/60',
            )}
        >
            <span className="relative z-10">{item.name}</span>
        </Link>
    );
};

export const Navigation: React.FC<NavigationProps> = ({ className }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { url, props } = usePage<SharedData>();
    const { auth, menus } = props;
    const navRef = useRef<HTMLElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);

    // Fallback if no menu data
    const menuItems =
        menus?.main && menus.main.length > 0
            ? menus.main
            : [
                  { name: 'Home', href: '/', target: '_self' },
                  { name: 'Services', href: '/services', target: '_self' },
                  { name: 'Portfolio', href: '/portfolio', target: '_self' },
                  { name: 'Team', href: '/team', target: '_self' },
                  { name: 'Blog', href: '/blog', target: '_self' },
                  { name: 'Contact', href: '/contact', target: '_self' },
              ];

    // Add magnetic effect to logo
    useMagneticEffect(logoRef as React.RefObject<HTMLElement>, {
        strength: 0.2,
        speed: 0.4,
    });

    // Handle scroll effects
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Use ScrollTrigger to detect scroll for the glassy transition
        const scrollTrigger = ScrollTrigger.create({
            start: 'top -20',
            onUpdate: (self) => {
                const scrolled = self.scroll() > 20;
                setIsScrolled(scrolled);
            },
        });

        // Create scroll trigger for navigation hide/show (smart sticky)
        const showAnim = gsap.fromTo(
            navRef.current,
            { yPercent: -120 },
            { yPercent: 0, duration: 0.4, ease: 'power3.out', paused: true },
        );

        const hideAnim = gsap.fromTo(
            navRef.current,
            { yPercent: 0 },
            { yPercent: -120, duration: 0.4, ease: 'power3.in', paused: true },
        );

        const mainTrigger = ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 99999,
            onUpdate: (self) => {
                if (self.direction === -1) {
                    showAnim.play();
                    hideAnim.pause();
                } else if (self.direction === 1 && self.progress > 0.05) {
                    hideAnim.play();
                    showAnim.pause();
                }
            },
        });

        return () => {
            scrollTrigger.kill();
            mainTrigger.kill();
            showAnim.kill();
            hideAnim.kill();
        };
    }, []);



    return (
        <>
            {/* Main Navigation */}
            <nav
                ref={navRef}
                className={cn(
                    'fixed right-0 left-0 z-[100] transition-all duration-500 will-change-transform',
                    isScrolled ? 'top-0 px-0' : 'top-0 px-4 pt-6 md:px-8',
                    className,
                )}
            >
                <div
                    className={cn(
                        'relative mx-auto flex h-16 items-center justify-between px-6 transition-all duration-500',
                        isScrolled
                            ? 'max-w-full rounded-none border-b border-white/20 bg-white/40 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-black/40'
                            : 'max-w-7xl rounded-full border border-white/20 bg-white/80 shadow-2xl backdrop-blur-2xl dark:border-white/5 dark:bg-black/80',
                    )}
                >
                    {/* Logo */}
                    <Link
                        href="/"
                        className="group relative z-10 flex items-center overflow-visible font-display"
                    >
                        <AppLogo
                            ref={logoRef as React.RefObject<HTMLDivElement>}
                            className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[5deg]"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-1 lg:flex">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.name}
                                item={item}
                                isActive={
                                    url === item.href ||
                                    (item.href !== '/' &&
                                        url.startsWith(item.href))
                                }
                            />
                        ))}
                    </div>

                    {/* Auth & Menu */}
                    <div className="flex items-center gap-3">
                        <div className="mr-2 hidden items-center gap-2 md:flex">
                            {auth?.user ? (
                                <Link
                                    href="/admin"
                                    className="inline-flex h-10 items-center gap-2 rounded-full border border-agency-accent/20 bg-agency-accent/15 px-5 text-[10px] font-bold tracking-widest text-agency-accent uppercase transition-all hover:bg-agency-accent hover:text-primary-foreground dark:bg-agency-accent/10 dark:text-agency-accent"
                                >
                                    <LayoutDashboard className="size-3" />{' '}
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="inline-flex h-10 items-center gap-2 rounded-full px-5 text-[10px] font-bold tracking-widest text-agency-primary/80 uppercase transition-all hover:text-agency-accent dark:text-white/60"
                                    >
                                        <LogIn className="size-3" /> Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="inline-flex h-10 items-center gap-2 rounded-full bg-agency-primary px-5 text-[10px] font-bold tracking-widest text-white uppercase shadow-lg transition-all hover:scale-105 dark:bg-white dark:text-agency-neutral"
                                    >
                                        <UserPlus className="size-3" /> Sign Up
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Burger menu hidden as per request */}
                        {/* <button ... /> */}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navigation;
