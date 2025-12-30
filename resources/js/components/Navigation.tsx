import { Button } from '@/components/ui/button';
import { useMagneticEffect } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X } from 'lucide-react';
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
    const { url } = usePage();
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
            { yPercent: -100 },
            { yPercent: 0, duration: 0.3, ease: 'power2.out', paused: true },
        );

        const hideAnim = gsap.fromTo(
            navRef.current,
            { yPercent: 0 },
            { yPercent: -100, duration: 0.3, ease: 'power2.out', paused: true },
        );

        ScrollTrigger.create({
            start: 'top top',
            end: 99999,
            onUpdate: (self) => {
                if (self.direction === -1) {
                    showAnim.play();
                    hideAnim.pause();
                } else if (self.direction === 1 && self.progress > 0.1) {
                    hideAnim.play();
                    showAnim.pause();
                }
            },
        });

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial scroll position

        return () => {
            window.removeEventListener('scroll', handleScroll);
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    // Close menu on route change
    useEffect(() => {
        const closeMenu = () => {
            if (isMenuOpen) {
                setIsMenuOpen(false);
            }
        };

        closeMenu();
    }, [url]); // Remove isMenuOpen from dependencies to avoid the warning

    // Handle menu toggle with enhanced GSAP animations
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Enhanced menu overlay animations
    useEffect(() => {
        const overlay = document.getElementById('menu-overlay');
        const menuItems = document.querySelectorAll('.menu-item');
        const menuBg = document.querySelector('.menu-bg');
        const closeButton = document.querySelector('.menu-close');
        const contactInfo = document.querySelector('.menu-contact');

        if (isMenuOpen && overlay) {
            // Show overlay
            gsap.set(overlay, { display: 'flex' });

            // Animate background
            gsap.fromTo(
                menuBg,
                { scaleY: 0, transformOrigin: 'top' },
                { scaleY: 1, duration: 0.6, ease: 'power2.out' },
            );

            // Animate overlay opacity
            gsap.fromTo(
                overlay,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' },
            );

            // Animate close button
            gsap.fromTo(
                closeButton,
                { opacity: 0, rotation: -90, scale: 0.8 },
                {
                    opacity: 1,
                    rotation: 0,
                    scale: 1,
                    duration: 0.4,
                    delay: 0.3,
                    ease: 'back.out(1.7)',
                },
            );

            // Animate menu items with stagger
            gsap.fromTo(
                menuItems,
                { y: 100, opacity: 0, rotationX: -90 },
                {
                    y: 0,
                    opacity: 1,
                    rotationX: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    delay: 0.4,
                    ease: 'power2.out',
                },
            );

            // Animate contact info
            gsap.fromTo(
                contactInfo,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    delay: 0.8,
                    ease: 'power2.out',
                },
            );
        } else if (!isMenuOpen && overlay) {
            // Hide overlay with reverse animation
            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.set(overlay, { display: 'none' });
                },
            });

            tl.to(contactInfo, {
                y: 50,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.out',
            })
                .to(
                    menuItems,
                    {
                        y: -50,
                        opacity: 0,
                        duration: 0.4,
                        stagger: 0.05,
                        ease: 'power2.out',
                    },
                    '-=0.2',
                )
                .to(
                    closeButton,
                    {
                        opacity: 0,
                        rotation: 90,
                        scale: 0.8,
                        duration: 0.3,
                        ease: 'power2.out',
                    },
                    '-=0.3',
                )
                .to(
                    overlay,
                    { opacity: 0, duration: 0.3, ease: 'power2.out' },
                    '-=0.2',
                )
                .to(
                    menuBg,
                    { scaleY: 0, duration: 0.4, ease: 'power2.out' },
                    '-=0.3',
                );
        }
    }, [isMenuOpen]);

    return (
        <>
            {/* Main Navigation */}
            <nav
                ref={navRef}
                className={cn(
                    'fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 w-[95%] max-w-7xl px-6 rounded-full border border-current/10 bg-white/10 dark:bg-black/10 backdrop-blur-2xl shadow-2xl',
                    isScrolled ? 'top-4 py-3' : 'top-8 py-4',
                    className,
                )}
            >
                <div className="flex h-12 items-center justify-between">
                    {/* Logo with magnetic effect */}
                    <Link
                        href="/"
                        className="flex items-center space-x-3 font-display relative z-10 group"
                    >
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
                    <div className="hidden md:flex items-center gap-2">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'px-4 py-2 text-[13px] font-bold uppercase tracking-widest transition-all duration-500 rounded-full hover:bg-agency-accent/10',
                                    url === item.href
                                        ? 'bg-agency-accent text-agency-primary shadow-lg shadow-agency-accent/20'
                                        : 'text-agency-primary dark:text-white hover:text-agency-accent',
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Action & Menu */}
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/contact" 
                            className="hidden sm:inline-flex h-10 px-6 items-center justify-center rounded-full bg-agency-primary text-agency-secondary dark:bg-white dark:text-agency-primary font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                        >
                            Hire Us
                        </Link>

                        <button
                            className={cn(
                                'size-11 rounded-full border border-current/10 flex flex-col items-center justify-center gap-1.5 transition-all duration-500 hover:bg-agency-accent group',
                                isMenuOpen && 'bg-agency-accent'
                            )}
                            onClick={toggleMenu}
                            aria-label="Toggle menu"
                        >
                            <div className={cn('w-5 h-0.5 bg-current transition-all duration-500', isMenuOpen && 'rotate-45 translate-y-2')}></div>
                            <div className={cn('w-5 h-0.5 bg-current transition-all duration-500', isMenuOpen && 'opacity-0')}></div>
                            <div className={cn('w-5 h-0.5 bg-current transition-all duration-500', isMenuOpen && '-rotate-45 -translate-y-2')}></div>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Full-Screen Menu Overlay */}
            <div
                id="menu-overlay"
                className={cn(
                    'fixed inset-0 z-50 flex flex-col items-center justify-center',
                    'hidden', // Initially hidden, controlled by GSAP
                )}
            >
                {/* Animated Background */}
                <div className="menu-bg absolute inset-0 bg-agency-primary dark:bg-agency-dark"></div>

                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="menu-close absolute top-4 right-4 z-10 text-agency-neutral transition-all duration-300 hover:scale-110 hover:text-agency-accent"
                    onClick={toggleMenu}
                    aria-label="Close menu"
                >
                    <X className="h-8 w-8" />
                </Button>

                {/* Menu Items */}
                <div className="z-10 flex flex-col items-center space-y-8">
                    {navigationItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'menu-item font-display text-4xl font-bold md:text-6xl',
                                'text-agency-neutral hover:text-agency-accent',
                                'transform-gpu transition-all duration-500 hover:scale-110',
                                'hover:drop-shadow-lg',
                                url === item.href &&
                                    'scale-110 text-agency-accent',
                            )}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Contact Info */}
                <div className="menu-contact absolute right-8 bottom-8 left-8 z-10 text-center">
                    <p className="mb-2 text-sm text-agency-neutral/70">
                        Ready to create something amazing?
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block text-lg font-medium text-agency-accent transition-all duration-300 hover:scale-105 hover:text-agency-neutral"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Get in touch
                    </Link>
                </div>
            </div>
        </>
    );
};

export default Navigation;
