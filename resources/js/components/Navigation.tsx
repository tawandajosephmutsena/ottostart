import { useMagneticEffect } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface NavigationProps {
    className?: string;
}

const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Team', href: '/team' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
];

export const Navigation: React.FC<NavigationProps> = ({ className }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { url, props } = usePage<SharedData>();
    const { auth } = props;
    const navRef = useRef<HTMLElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);

    // Add magnetic effect to logo
    useMagneticEffect(logoRef as React.RefObject<HTMLElement>, {
        strength: 0.2,
        speed: 0.4,
    });

    // Handle scroll effects
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsScrolled(scrollY > 50);
        };

        // Create scroll trigger for navigation hide/show
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

        ScrollTrigger.create({
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

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    // Close menu on route change without triggering cascading render lint
    const [lastUrl, setLastUrl] = useState(url);
    if (url !== lastUrl) {
        setLastUrl(url);
        if (isMenuOpen) setIsMenuOpen(false);
    }

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Enhanced menu overlay animations
    useEffect(() => {
        const overlay = document.getElementById('menu-overlay');
        const menuItems = document.querySelectorAll('.menu-item');
        const menuBg = document.querySelector('.menu-bg');
        const closeButton = document.querySelector('.menu-close');
        const contactInfo = document.querySelector('.menu-contact');

        if (isMenuOpen && overlay) {
            gsap.set(overlay, { display: 'flex' });
            gsap.fromTo(menuBg, { scaleY: 0, transformOrigin: 'top' }, { scaleY: 1, duration: 0.8, ease: 'expo.out' });
            gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4 });
            gsap.fromTo(closeButton, { opacity: 0, rotation: -90, scale: 0.5 }, { opacity: 1, rotation: 0, scale: 1, duration: 0.5, delay: 0.4, ease: 'back.out(2)' });
            gsap.fromTo(menuItems, { y: 120, opacity: 0, skewY: 10 }, { y: 0, opacity: 1, skewY: 0, duration: 1, stagger: 0.1, delay: 0.3, ease: 'expo.out' });
            gsap.fromTo(contactInfo, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.8, ease: 'power3.out' });
        } else if (!isMenuOpen && overlay) {
            const tl = gsap.timeline({ 
                onComplete: () => { 
                    gsap.set(overlay, { display: 'none' }); 
                } 
            });
            tl.to(contactInfo, { y: 40, opacity: 0, duration: 0.3 })
              .to(menuItems, { y: -100, opacity: 0, skewY: -5, duration: 0.5, stagger: 0.05, ease: 'expo.in' }, '-=0.2')
              .to(closeButton, { opacity: 0, scale: 0.5, duration: 0.3 }, '-=0.4')
              .to(overlay, { opacity: 0, duration: 0.4 }, '-=0.3')
              .to(menuBg, { scaleY: 0, duration: 0.6, ease: 'expo.inOut' }, '-=0.3');
        }
    }, [isMenuOpen]);

    return (
        <>
            {/* Main Navigation */}
            <nav
                ref={navRef}
                className={cn(
                    'fixed z-[100] transition-all duration-700 left-0 right-0 px-4 md:px-8',
                    isScrolled ? 'top-4' : 'top-8',
                    className,
                )}
            >
                <div className={cn(
                    'mx-auto max-w-7xl flex h-16 items-center justify-between px-6 rounded-full border transition-all duration-500',
                    'bg-white/80 dark:bg-black/80 backdrop-blur-2xl shadow-2xl border-white/20 dark:border-white/5',
                    isScrolled ? 'py-2' : 'py-4'
                )}>
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 font-display relative z-10 group">
                        <div
                            ref={logoRef}
                            className="size-10 rounded-xl bg-agency-accent flex items-center justify-center transition-transform duration-500 group-hover:rotate-[15deg] group-hover:scale-110 shadow-lg shadow-agency-accent/20"
                        >
                            <span className="text-xl font-black text-agency-primary">A</span>
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-lg font-black uppercase tracking-tighter text-agency-primary dark:text-white">Avant</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 text-agency-primary dark:text-white">Garde</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-500 rounded-full',
                                    url === item.href
                                        ? 'bg-agency-accent text-agency-primary shadow-lg shadow-agency-accent/20'
                                        : 'text-agency-primary/60 dark:text-white/60 hover:text-agency-accent hover:bg-agency-accent/5',
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth & Menu */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 mr-2">
                            {auth?.user ? (
                                <Link
                                    href="/dashboard"
                                    className="h-10 px-5 inline-flex items-center gap-2 rounded-full bg-agency-accent/10 border border-agency-accent/20 text-agency-accent font-bold text-[10px] uppercase tracking-widest hover:bg-agency-accent hover:text-agency-primary transition-all"
                                >
                                    <LayoutDashboard className="size-3" /> Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="h-10 px-5 inline-flex items-center gap-2 rounded-full text-agency-primary/60 dark:text-white/60 font-bold text-[10px] uppercase tracking-widest hover:text-agency-accent transition-all"
                                    >
                                        <LogIn className="size-3" /> Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="h-10 px-5 inline-flex items-center gap-2 rounded-full bg-agency-primary dark:bg-white text-white dark:text-agency-primary font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                                    >
                                        <UserPlus className="size-3" /> Sign Up
                                    </Link>
                                </>
                            )}
                        </div>

                        <button
                            className={cn(
                                'size-11 rounded-full border border-current/10 flex flex-col items-center justify-center gap-1.5 transition-all duration-500 hover:bg-agency-accent group',
                                isMenuOpen && 'bg-agency-accent border-transparent'
                            )}
                            onClick={toggleMenu}
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                            title={isMenuOpen ? "Close menu" : "Open menu"}
                        >
                            <div className={cn('w-5 h-0.5 bg-current transition-all duration-500', isMenuOpen && 'rotate-45 translate-y-2')}></div>
                            <div className={cn('w-5 h-0.5 bg-current transition-all duration-500', isMenuOpen && 'opacity-0')}></div>
                            <div className={cn('w-5 h-0.5 bg-current transition-all duration-500', isMenuOpen && '-rotate-45 -translate-y-2')}></div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Full-Screen Menu Overlay */}
            <div id="menu-overlay" className="fixed inset-0 z-[150] hidden flex-col items-center justify-center overflow-hidden">
                <div className="menu-bg absolute inset-0 bg-agency-secondary dark:bg-agency-dark"></div>
                
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none select-none agency-grid-overlay"></div>

                <button
                    className="menu-close absolute top-8 right-8 size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-agency-primary dark:text-white hover:bg-agency-accent hover:text-agency-primary transition-all duration-500 z-50 group"
                    onClick={toggleMenu}
                    aria-label="Close menu"
                    title="Close menu"
                >
                    <X className="size-8 group-hover:rotate-90 transition-transform duration-500" />
                </button>

                <div className="z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl px-8">
                    <div className="flex flex-col space-y-4 md:space-y-6 items-center md:items-start">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'menu-item font-display text-5xl md:text-8xl font-black uppercase tracking-tighter transition-all hover:text-agency-accent hover:italic hover:pl-8',
                                    url === item.href ? 'text-agency-accent italic' : 'text-agency-primary dark:text-white'
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="menu-contact mt-20 md:mt-0 flex flex-col items-center md:items-end text-center md:text-right space-y-8">
                        {auth?.user ? (
                             <Link href="/dashboard" className="menu-item text-2xl font-black uppercase tracking-tighter text-agency-accent flex items-center gap-4">
                                DASHBOARD <LayoutDashboard className="size-6" />
                             </Link>
                        ) : (
                            <div className="flex flex-col items-center md:items-end space-y-4">
                                <Link href="/login" className="menu-item text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white hover:text-agency-accent">LOGIN</Link>
                                <Link href="/register" className="menu-item text-4xl font-black uppercase tracking-tighter text-agency-primary dark:text-white hover:text-agency-accent">REGISTER</Link>
                            </div>
                        )}
                        
                        <div className="pt-12 border-t border-agency-primary/5 dark:border-white/5">
                            <p className="text-xs font-bold uppercase tracking-[0.4em] opacity-40 mb-4">New Business</p>
                            <a href="mailto:hello@avant-garde.com" className="text-2xl font-black text-agency-primary dark:text-white hover:text-agency-accent transition-colors">
                                hello@avant-garde.com
                            </a>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full opacity-[0.03] pointer-events-none select-none overflow-hidden">
                    <span className="text-[30vw] font-black uppercase whitespace-nowrap leading-none block marquee">
                        NAVIGATE BEYOND NAVIGATE BEYOND
                    </span>
                </div>
            </div>
        </>
    );
};

export default Navigation;
