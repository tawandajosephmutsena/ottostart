import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
// import { cn } from '@/lib/utils'; // Removed unused import
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import React, { useState } from 'react';
import { SharedData } from '@/types';

export default function Contact() {
    const { props } = usePage<SharedData>();
    const site = props.site;
    const [formSubmitted, setFormSubmitted] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => {
                setFormSubmitted(true);
                setTimeout(() => setFormSubmitted(false), 5000);
            },
        });
    };

    return (
        <MainLayout title="Contact Us - Avant-Garde">
            <Head title="Contact Us" />
            
            {/* Immersive Hero Section */}
            <section className="bg-white dark:bg-agency-dark pt-40 pb-20 relative overflow-hidden">
                <div className="absolute top-20 left-0 w-full overflow-hidden opacity-[0.03] select-none pointer-events-none">
                    <span className="text-[20vw] font-black uppercase whitespace-nowrap leading-none block marquee">
                        GET IN TOUCH GET IN TOUCH GET IN TOUCH
                    </span>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto">
                        <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Let's Connect</span>
                        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-agency-primary dark:text-white mb-12">
                            Start a <br/>
                            <span className="opacity-30 italic">Conversation.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-agency-primary/60 dark:text-white/60 font-light max-w-2xl mx-auto">
                            Ready to transform your vision into reality? We're here to listen, collaborate, and create something extraordinary together.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Form & Info Section */}
            <section className="bg-agency-secondary dark:bg-[#0a0a0a] py-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                        
                        {/* Contact Form */}
                        <AnimatedSection animation="slide-up" className="lg:col-span-7">
                            <div className="bg-white dark:bg-agency-dark rounded-[60px] p-12 md:p-16 shadow-2xl border border-agency-primary/5 dark:border-white/5">
                                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12">
                                    Send us a <span className="text-agency-accent">Message</span>
                                </h2>

                                {formSubmitted && (
                                    <div className="mb-8 p-6 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center gap-4">
                                        <CheckCircle2 className="size-6 text-green-500" />
                                        <p className="text-green-700 dark:text-green-400 font-medium">
                                            Thank you! We'll get back to you soon.
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    id="name"
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    required
                                                    placeholder=" "
                                                    className="peer w-full px-6 py-5 rounded-2xl bg-agency-primary/5 dark:bg-white/5 border border-agency-primary/10 dark:border-white/10 text-agency-primary dark:text-white focus:ring-2 focus:ring-agency-accent focus:border-transparent transition-all outline-none placeholder-transparent"
                                                />
                                                <label 
                                                    htmlFor="name"
                                                    className="absolute left-6 top-5 text-agency-primary/40 dark:text-white/40 text-sm font-bold uppercase tracking-widest transition-all duration-300 pointer-events-none 
                                                    peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-agency-primary/40 
                                                    peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-agency-accent
                                                    peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-agency-primary/60">
                                                    Your Name *
                                                </label>
                                            </div>
                                            {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <div className="relative group">
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={data.email}
                                                    onChange={e => setData('email', e.target.value)}
                                                    required
                                                    placeholder=" "
                                                    className="peer w-full px-6 py-5 rounded-2xl bg-agency-primary/5 dark:bg-white/5 border border-agency-primary/10 dark:border-white/10 text-agency-primary dark:text-white focus:ring-2 focus:ring-agency-accent focus:border-transparent transition-all outline-none placeholder-transparent"
                                                />
                                                <label 
                                                    htmlFor="email"
                                                    className="absolute left-6 top-5 text-agency-primary/40 dark:text-white/40 text-sm font-bold uppercase tracking-widest transition-all duration-300 pointer-events-none 
                                                    peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-agency-primary/40 
                                                    peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-agency-accent
                                                    peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-agency-primary/60">
                                                    Email Address *
                                                </label>
                                            </div>
                                            {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <div className="relative group">
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    value={data.phone}
                                                    onChange={e => setData('phone', e.target.value)}
                                                    placeholder=" "
                                                    className="peer w-full px-6 py-5 rounded-2xl bg-agency-primary/5 dark:bg-white/5 border border-agency-primary/10 dark:border-white/10 text-agency-primary dark:text-white focus:ring-2 focus:ring-agency-accent focus:border-transparent transition-all outline-none placeholder-transparent"
                                                />
                                                <label 
                                                    htmlFor="phone"
                                                    className="absolute left-6 top-5 text-agency-primary/40 dark:text-white/40 text-sm font-bold uppercase tracking-widest transition-all duration-300 pointer-events-none 
                                                    peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-agency-primary/40 
                                                    peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-agency-accent
                                                    peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-agency-primary/60">
                                                    Phone Number
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    id="subject"
                                                    value={data.subject}
                                                    onChange={e => setData('subject', e.target.value)}
                                                    placeholder=" "
                                                    className="peer w-full px-6 py-5 rounded-2xl bg-agency-primary/5 dark:bg-white/5 border border-agency-primary/10 dark:border-white/10 text-agency-primary dark:text-white focus:ring-2 focus:ring-agency-accent focus:border-transparent transition-all outline-none placeholder-transparent"
                                                />
                                                <label 
                                                    htmlFor="subject"
                                                    className="absolute left-6 top-5 text-agency-primary/40 dark:text-white/40 text-sm font-bold uppercase tracking-widest transition-all duration-300 pointer-events-none 
                                                    peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-agency-primary/40 
                                                    peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-agency-accent
                                                    peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-agency-primary/60">
                                                    Subject
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="relative group">
                                            <textarea
                                                id="message"
                                                value={data.message}
                                                onChange={e => setData('message', e.target.value)}
                                                required
                                                rows={6}
                                                placeholder=" "
                                                className="peer w-full px-6 py-5 rounded-2xl bg-agency-primary/5 dark:bg-white/5 border border-agency-primary/10 dark:border-white/10 text-agency-primary dark:text-white focus:ring-2 focus:ring-agency-accent focus:border-transparent transition-all resize-none outline-none placeholder-transparent"
                                            />
                                            <label 
                                                htmlFor="message"
                                                className="absolute left-6 top-5 text-agency-primary/40 dark:text-white/40 text-sm font-bold uppercase tracking-widest transition-all duration-300 pointer-events-none 
                                                peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-agency-primary/40 
                                                peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-agency-accent
                                                peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-agency-primary/60">
                                                Your Message *
                                            </label>
                                        </div>
                                        {errors.message && <p className="mt-2 text-sm text-red-500">{errors.message}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full md:w-auto px-12 py-6 rounded-full bg-agency-accent text-agency-primary font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-agency-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        <Send className="size-5" />
                                        {processing ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                        </AnimatedSection>

                        {/* Contact Info Sidebar */}
                        <AnimatedSection animation="slide-up" delay={200} className="lg:col-span-5 space-y-12">
                            
                            {/* Contact Details */}
                            <div className="space-y-8">
                                <h3 className="text-3xl font-black uppercase tracking-tighter">
                                    Get in <span className="text-agency-accent">Touch</span>
                                </h3>
                                
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 group">
                                        <div className="size-12 rounded-2xl bg-agency-accent/10 flex items-center justify-center group-hover:bg-agency-accent transition-colors">
                                            <Mail className="size-5 text-agency-accent group-hover:text-agency-primary transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-agency-primary/40 dark:text-white/40 mb-2">Email</p>
                                            <a href={`mailto:${site?.contact?.email || 'hello@avantgarde.com'}`} className="text-lg font-bold text-agency-primary dark:text-white hover:text-agency-accent transition-colors">
                                                {site?.contact?.email || 'hello@avantgarde.com'}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 group">
                                        <div className="size-12 rounded-2xl bg-agency-accent/10 flex items-center justify-center group-hover:bg-agency-accent transition-colors">
                                            <Phone className="size-5 text-agency-accent group-hover:text-agency-primary transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-agency-primary/40 dark:text-white/40 mb-2">Phone</p>
                                            <a href={`tel:${site?.contact?.phone?.replace(/\s+/g, '') || '+15551234567'}`} className="text-lg font-bold text-agency-primary dark:text-white hover:text-agency-accent transition-colors">
                                                {site?.contact?.phone || '+1 (555) 123-4567'}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 group">
                                        <div className="size-12 rounded-2xl bg-agency-accent/10 flex items-center justify-center group-hover:bg-agency-accent transition-colors">
                                            <MapPin className="size-5 text-agency-accent group-hover:text-agency-primary transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-agency-primary/40 dark:text-white/40 mb-2">Office</p>
                                            <p className="text-lg font-bold text-agency-primary dark:text-white whitespace-pre-line">
                                                {site?.contact?.address || '123 Creative Boulevard\nDesign District, CA 90210'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 group">
                                        <div className="size-12 rounded-2xl bg-agency-accent/10 flex items-center justify-center group-hover:bg-agency-accent transition-colors">
                                            <Clock className="size-5 text-agency-accent group-hover:text-agency-primary transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-agency-primary/40 dark:text-white/40 mb-2">Hours</p>
                                            <p className="text-lg font-bold text-agency-primary dark:text-white whitespace-pre-line">
                                                {site?.contact?.hours || 'Mon - Fri: 9:00 AM - 6:00 PM\nWeekend: By Appointment'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">
                                    Follow <span className="text-agency-accent">Us</span>
                                </h3>
                                <div className="flex gap-4">
                                    {[
                                        { icon: Facebook, href: site?.social?.facebook || 'https://facebook.com', label: 'Facebook' },
                                        { icon: Twitter, href: site?.social?.twitter || 'https://twitter.com', label: 'Twitter' },
                                        { icon: Instagram, href: site?.social?.instagram || 'https://instagram.com', label: 'Instagram' },
                                        { icon: Linkedin, href: site?.social?.linkedin || 'https://linkedin.com', label: 'LinkedIn' },
                                    ].map((social) => (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="size-14 rounded-2xl bg-agency-primary/5 dark:bg-white/5 border border-agency-primary/10 dark:border-white/10 flex items-center justify-center hover:bg-agency-accent hover:border-agency-accent hover:scale-110 transition-all group"
                                            title={social.label}
                                            aria-label={social.label}
                                        >
                                            <social.icon className="size-5 text-agency-primary/60 dark:text-white/60 group-hover:text-agency-primary" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            {!!site?.contact?.show_map && (
                <section className="bg-white dark:bg-agency-dark py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <AnimatedSection animation="slide-up">
                            <div className="relative rounded-[60px] overflow-hidden h-[500px] bg-agency-primary/5 dark:bg-white/5 border border-agency-primary/10 dark:border-white/10">
                                {site?.contact?.google_maps_url ? (
                                    <iframe
                                        src={String(site.contact.google_maps_url)}
                                        title="Google Maps"
                                        width="100%"
                                        height="100%"
                                        className="border-0"
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <MapPin className="size-16 mx-auto mb-4 text-agency-accent opacity-30" />
                                            <p className="text-lg font-bold uppercase tracking-widest text-agency-primary/40 dark:text-white/40">
                                                Map Integration Placeholder
                                            </p>
                                            <p className="text-sm mt-2 text-agency-primary/30 dark:text-white/30">
                                                Update Google Maps URL in Admin Settings
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </AnimatedSection>
                    </div>
                </section>
            )}
        </MainLayout>
    );
}
