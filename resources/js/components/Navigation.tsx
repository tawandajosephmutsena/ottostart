import { useMagneticEffect } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import AppLogo from './app-logo';

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

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            mainTrigger.kill();
            showAnim.kill();
            hideAnim.kill();
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

    const site = props.site || { name: 'Avant-Garde', logo: '', tagline: 'Premium Agency' };

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
                    <Link href="/" className="flex items-center font-display relative z-10 group overflow-visible">
                        <AppLogo 
                            ref={logoRef as any}
                            className="transition-transform duration-500 group-hover:rotate-[5deg] group-hover:scale-110" 
                        />
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
                                    href="/admin"
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
                                        className="h-10 px-5 inline-flex items-center gap-2 rounded-full bg-agency-primary dark:bg-white text-white dark:text-agency-neutral font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                                    >
                                        <UserPlus className="size-3" /> Sign Up
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Burger menu hidden as per request */}
                        {/* <button
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
                        </button> */}
                    </div>
                </div>
            </nav>

            {/* Full-Screen Menu Overlay hidden as per request */}
            {/* <div id="menu-overlay" className="fixed inset-0 z-[150] hidden flex-col items-center justify-center overflow-hidden">
                ...
            </div> */}
        </>
    );
};

export default Navigation;
