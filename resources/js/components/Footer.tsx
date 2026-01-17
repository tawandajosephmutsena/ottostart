import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
    Github,
    Instagram,
    Linkedin,
    Twitter,
} from 'lucide-react';
import React from 'react';
import { SharedData } from '@/types';
import AppLogo from './app-logo';

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



export const Footer: React.FC<FooterProps> = ({ className }) => {
    const { props } = usePage<SharedData>();
    const site = props.site || { name: 'Avant-Garde', logo: '', tagline: 'Premium Agency' };
    const menuItems = props.menus?.main || [];

    // Map social links from settings
    const socialLinks = [
        { name: 'Github', href: site.social?.github, icon: Github },
        { name: 'Twitter', href: site.social?.twitter, icon: Twitter },
        { name: 'LinkedIn', href: site.social?.linkedin, icon: Linkedin },
        { name: 'Instagram', href: site.social?.instagram, icon: Instagram },
    ].filter(link => link.href);

    return (
        <footer className={cn('bg-agency-dark text-white dark:bg-black pt-32 pb-12 overflow-hidden border-t border-white/5', className)}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-32">
                    {/* Massive Brand Side */}
                    <div className="lg:col-span-6 flex flex-col justify-between">
                        <div>
                            <Link href="/" className="inline-flex items-center mb-12 group overflow-visible">
                                <AppLogo 
                                    className="transition-transform duration-500 group-hover:rotate-[5deg] group-hover:scale-105" 
                                />
                            </Link>
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
                                Let's create <br/>
                                <span className="text-agency-accent">digital legacy</span> juntos.
                            </h2>
                        </div>
                        
                        <div className="flex gap-6">
                            {socialLinks.map((social) => (
                                <a 
                                    key={social.name} 
                                    href={social.href} 
                                    aria-label={social.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="size-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-agency-primary transition-all duration-500"
                                >
                                    <social.icon className="size-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-agency-accent mb-8">Navigation</h3>
                            <ul className="space-y-4">
                                {menuItems.length > 0 ? (
                                    menuItems.map((link) => (
                                        <li key={link.name}>
                                            <Link href={link.href} target={link.target} className="text-xl font-bold opacity-40 hover:opacity-100 transition-opacity">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    footerLinks.company.map((link) => (
                                        <li key={link.name}>
                                            <Link href={link.href} className="text-xl font-bold opacity-40 hover:opacity-100 transition-opacity">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-agency-accent mb-8">Resources</h3>
                            <ul className="space-y-4">
                                {footerLinks.resources.map((link) => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-xl font-bold opacity-40 hover:opacity-100 transition-opacity">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-agency-accent mb-8">Office</h3>
                            <address className="not-italic">
                                <p className="text-xl font-bold opacity-40 leading-tight">
                                    {site.contact?.address || '123 Creative Studio\nMarket Street 456\nSan Francisco, CA'}
                                </p>
                                <p className="mt-4 text-agency-accent font-bold">{site.contact?.phone}</p>
                            </address>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8 order-2 md:order-1">
                        <span className="text-sm opacity-30 font-medium">© {new Date().getFullYear()} {site.name?.toUpperCase() || 'AVANT-GARDE'} AGY</span>
                        <div className="hidden md:flex gap-6">
                            {footerLinks.legal.map((link) => (
                                <Link key={link.name} href={link.href} className="text-xs opacity-30 hover:opacity-100 transition-opacity uppercase tracking-widest font-bold">
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 order-1 md:order-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <span className="text-xs font-bold uppercase tracking-widest group-hover:text-agency-accent transition-colors">Back to top</span>
                        <div className="size-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-agency-accent group-hover:border-transparent group-hover:text-agency-primary transition-all">
                            <span className="material-symbols-outlined">arrow_upward</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Massive Text */}
            <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 pointer-events-none select-none opacity-[0.03] whitespace-nowrap">
                <span className="text-[25vw] font-black uppercase leading-none">{site.name || 'AVANT-GARDE'}</span>
            </div>
        </footer>
    );
};

export default Footer;
