import AnimatedSection from '@/components/AnimatedSection';
import { useMagneticEffect } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    Github,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Twitter,
} from 'lucide-react';
import React, { useRef } from 'react';

interface FooterProps {
    className?: string;
}

const footerLinks = {
    company: [
        { name: 'About', href: '/about' },
        { name: 'Services', href: '/services' },
        { name: 'Portfolio', href: '/portfolio' },
        { name: 'Team', href: '/team' },
    ],
    resources: [
        { name: 'Blog', href: '/blog' },
        { name: 'Case Studies', href: '/portfolio' },
        { name: 'Contact', href: '/contact' },
        { name: 'Careers', href: '/careers' },
    ],
    legal: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
    ],
};

const socialLinks = [
    { name: 'Github', href: 'https://github.com', icon: Github },
    { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
    { name: 'Instagram', href: 'https://instagram.com', icon: Instagram },
];

const contactInfo = [
    {
        icon: Mail,
        label: 'Email',
        value: 'hello@avant-garde.com',
        href: 'mailto:hello@avant-garde.com',
    },
    {
        icon: Phone,
        label: 'Phone',
        value: '+1 (555) 123-4567',
        href: 'tel:+15551234567',
    },
    {
        icon: MapPin,
        label: 'Address',
        value: 'San Francisco, CA',
        href: null,
    },
];

export const Footer: React.FC<FooterProps> = ({ className }) => {
    const logoRef = useRef<HTMLDivElement>(null);
    const socialRef = useRef<HTMLDivElement>(null);

    // Add magnetic effect to logo
    useMagneticEffect(logoRef as React.RefObject<HTMLElement>, {
        strength: 0.15,
        speed: 0.4,
    });

    return (
        <footer
            className={cn(
                'bg-agency-primary text-agency-neutral',
                'dark:bg-agency-dark dark:text-agency-neutral',
                'overflow-hidden',
                className,
            )}
        >
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <AnimatedSection
                    animation="fade-up"
                    className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12"
                >
                    {/* Brand Section */}
                    <AnimatedSection
                        animation="slide-left"
                        delay={100}
                        className="lg:col-span-1"
                    >
                        <Link
                            href="/"
                            className="group mb-4 flex items-center space-x-2 font-display text-xl font-bold"
                        >
                            <div
                                ref={logoRef}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-agency-accent transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
                            >
                                <span className="text-sm font-bold text-white">
                                    A
                                </span>
                            </div>
                            <span className="transition-colors duration-300 group-hover:text-agency-accent">
                                Avant-Garde
                            </span>
                        </Link>

                        <div data-text-reveal="fade-up">
                            <p className="mb-6 text-sm leading-relaxed text-agency-neutral/70">
                                We create digital experiences that push
                                boundaries and inspire innovation. Let's build
                                something extraordinary together.
                            </p>
                        </div>

                        {/* Social Links with stagger animation */}
                        <div ref={socialRef} className="flex space-x-4">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transform text-agency-neutral/70 transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:text-agency-accent"
                                    aria-label={social.name}
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                    }}
                                >
                                    <social.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </AnimatedSection>

                    {/* Company Links */}
                    <AnimatedSection animation="slide-up" delay={200}>
                        <h3
                            className="mb-4 font-semibold text-agency-neutral"
                            data-text-reveal="fade-up"
                        >
                            Company
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link, index) => (
                                <li
                                    key={link.name}
                                    style={{
                                        animationDelay: `${(index + 1) * 0.1}s`,
                                    }}
                                >
                                    <Link
                                        href={link.href}
                                        className="inline-block transform text-sm text-agency-neutral/70 transition-all duration-300 hover:translate-x-1 hover:text-agency-accent"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </AnimatedSection>

                    {/* Resources Links */}
                    <AnimatedSection animation="slide-up" delay={300}>
                        <h3
                            className="mb-4 font-semibold text-agency-neutral"
                            data-text-reveal="fade-up"
                        >
                            Resources
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link, index) => (
                                <li
                                    key={link.name}
                                    style={{
                                        animationDelay: `${(index + 1) * 0.1}s`,
                                    }}
                                >
                                    <Link
                                        href={link.href}
                                        className="inline-block transform text-sm text-agency-neutral/70 transition-all duration-300 hover:translate-x-1 hover:text-agency-accent"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </AnimatedSection>

                    {/* Contact Info */}
                    <AnimatedSection animation="slide-right" delay={400}>
                        <h3
                            className="mb-4 font-semibold text-agency-neutral"
                            data-text-reveal="fade-up"
                        >
                            Contact
                        </h3>
                        <ul className="space-y-3">
                            {contactInfo.map((contact, index) => (
                                <li
                                    key={contact.label}
                                    className="group flex items-start space-x-3"
                                    style={{
                                        animationDelay: `${(index + 1) * 0.1}s`,
                                    }}
                                >
                                    <contact.icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-agency-accent transition-transform duration-300 group-hover:scale-110" />
                                    <div>
                                        {contact.href ? (
                                            <a
                                                href={contact.href}
                                                className="inline-block transform text-sm text-agency-neutral/70 transition-all duration-300 hover:translate-x-1 hover:text-agency-accent"
                                            >
                                                {contact.value}
                                            </a>
                                        ) : (
                                            <span className="text-sm text-agency-neutral/70">
                                                {contact.value}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </AnimatedSection>
                </AnimatedSection>

                {/* Bottom Section */}
                <AnimatedSection
                    animation="fade-up"
                    delay={500}
                    className="mt-12 border-t border-agency-neutral/20 pt-8"
                >
                    <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
                        <div
                            className="text-sm text-agency-neutral/70"
                            data-text-reveal="fade-up"
                        >
                            © {new Date().getFullYear()} Avant-Garde. All
                            rights reserved.
                        </div>

                        {/* Legal Links */}
                        <div className="flex space-x-6">
                            {footerLinks.legal.map((link, index) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="inline-block transform text-sm text-agency-neutral/70 transition-all duration-300 hover:-translate-y-0.5 hover:text-agency-accent"
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                    }}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </footer>
    );
};

export default Footer;
