import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react';
import React from 'react';
import { useForm } from '@inertiajs/react';
import { cn } from '@/lib/utils';

export default function Contact() {
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        name: '',
        email: '',
        type: 'general',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

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

    return (
        <MainLayout title="Contact - Avant-Garde">
            {/* Immersive Hero Section */}
            <section className="bg-white dark:bg-agency-dark pt-40 pb-32 relative overflow-hidden">
                {/* Background Branding Marquee */}
                <div className="absolute top-20 left-0 w-full overflow-hidden opacity-[0.03] select-none pointer-events-none">
                    <span className="text-[20vw] font-black uppercase whitespace-nowrap leading-none block marquee">
                        CONTACT CONTACT CONTACT CONTACT
                    </span>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center md:text-left">
                    <div className="max-w-4xl">
                        <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Connect With Us</span>
                        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-agency-primary dark:text-white mb-12">
                            Start the <br/>
                            <span className="opacity-30 italic">Dialogue.</span>
                        </h1>
                        <p className="text-xl md:text-3xl text-agency-primary/60 dark:text-white/60 leading-relaxed font-light">
                            Whether you have a specific project in mind or just want to explore possibilities, 
                            we're ready to listen and build something extraordinary together.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Form & Info - Premium Side-by-Side */}
            <section id="contact-form" className="bg-agency-secondary dark:bg-[#0a0a0a] py-40 border-y border-agency-primary/5 dark:border-white/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                        {/* Info Column */}
                        <div>
                            <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Inquiries</span>
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-agency-primary dark:text-white mb-12">
                                We're <span className="opacity-30">Listening.</span>
                            </h2>
                            
                            <div className="space-y-12">
                                {contactInfo.map((item, i) => (
                                    <div key={i} className="group">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-agency-accent mb-4 block">
                                            {item.label}
                                        </span>
                                        {item.href ? (
                                            <a href={item.href} className="text-3xl md:text-5xl font-black text-agency-primary dark:text-white hover:text-agency-accent transition-colors">
                                                {item.value}
                                            </a>
                                        ) : (
                                            <span className="text-3xl md:text-5xl font-black text-agency-primary dark:text-white">
                                                {item.value}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-20 pt-20 border-t border-agency-primary/5 dark:border-white/5">
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-40">Office Hours</h3>
                                <div className="space-y-4 text-agency-primary/60 dark:text-white/60 font-bold uppercase tracking-tighter">
                                    <p>Mon — Fri: 09:00 — 18:00</p>
                                    <p>Sat: 10:00 — 14:00</p>
                                    <p>Sun: Closed</p>
                                </div>
                            </div>
                        </div>

                        {/* Form Column */}
                        <AnimatedSection animation="slide-up">
                            <div className="p-12 md:p-16 rounded-[40px] bg-white dark:bg-black/20 border border-agency-primary/5 dark:border-white/5 relative overflow-hidden">
                                {wasSuccessful ? (
                                    <div className="py-20 text-center animate-in fade-in zoom-in duration-700">
                                        <div className="size-24 bg-agency-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                            <CheckCircle2 className="size-12 text-agency-accent" />
                                        </div>
                                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Message Sent!</h3>
                                        <p className="text-agency-primary/60 dark:text-white/60 mb-12">
                                            Thank you for reaching out. Our team will review your inquiry and get back to you shortly.
                                        </p>
                                        <button 
                                            onClick={() => reset()}
                                            className="text-xs font-black uppercase tracking-widest text-agency-accent hover:underline"
                                        >
                                            Send another message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-4" htmlFor="name">Full Name</label>
                                            <input
                                                id="name"
                                                type="text"
                                                name="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="WHAT IS YOUR NAME?"
                                                className={cn(
                                                    "w-full h-16 rounded-full bg-agency-primary/5 dark:bg-white/5 border-none px-8 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-agency-accent transition-all",
                                                    errors.name && "ring-2 ring-destructive"
                                                )}
                                            />
                                            {errors.name && <p className="text-destructive text-[10px] font-bold px-4">{errors.name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-4" htmlFor="email">Email Address</label>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="HOW CAN WE REACH YOU?"
                                                className={cn(
                                                    "w-full h-16 rounded-full bg-agency-primary/5 dark:bg-white/5 border-none px-8 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-agency-accent transition-all",
                                                    errors.email && "ring-2 ring-destructive"
                                                )}
                                            />
                                            {errors.email && <p className="text-destructive text-[10px] font-bold px-4">{errors.email}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-4" htmlFor="type">Inquiry Type</label>
                                            <select
                                                id="type"
                                                name="type"
                                                value={data.type}
                                                onChange={(e) => setData('type', e.target.value)}
                                                className="w-full h-16 rounded-full bg-agency-primary/5 dark:bg-white/5 border-none px-8 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-agency-accent transition-all appearance-none"
                                            >
                                                <option value="general">GENERAL INQUIRY</option>
                                                <option value="project">NEW PROJECT</option>
                                                <option value="career">CAREER OPPORTUNITY</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-4" htmlFor="message">Your Message</label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows={6}
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                placeholder="TELL US ABOUT YOUR VISION..."
                                                className={cn(
                                                    "w-full rounded-[30px] bg-agency-primary/5 dark:bg-white/5 border-none p-8 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-agency-accent transition-all resize-none",
                                                    errors.message && "ring-2 ring-destructive"
                                                )}
                                            />
                                            {errors.message && <p className="text-destructive text-[10px] font-bold px-4">{errors.message}</p>}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full h-20 rounded-full bg-agency-accent text-agency-primary text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-agency-accent/20 flex items-center justify-center gap-4 disabled:opacity-50"
                                        >
                                            {processing ? 'SENDING...' : 'SEND MESSAGE'} <Send className="size-4" />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* Premium FAQ Bento */}
            <section className="bg-white dark:bg-agency-dark py-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <header className="mb-24 text-center">
                        <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-4 block">Quick Answers</span>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                            Common <span className="opacity-30 italic">Queries.</span>
                        </h2>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { q: 'How long does a typical project take?', a: 'Project timelines vary depending on scope and complexity. Most boutique projects take 4-12 weeks from start to finish.' },
                            { q: 'Do you work with global clients?', a: 'Absolutely. We are a digital-first agency and have successfully delivered excellence for clients across 4 continents.' },
                            { q: 'What is your primary tech stack?', a: 'We specialize in React, Next.js, and performance-first architectures tailored to each brand\'s unique needs.' }
                        ].map((faq, i) => (
                            <AnimatedSection key={i} animation="slide-up" delay={i * 100} className="p-10 rounded-[40px] bg-agency-secondary dark:bg-white/5 border border-agency-primary/5 dark:border-white/5">
                                <h3 className="text-xl font-black uppercase tracking-tighter text-agency-primary dark:text-white mb-6 leading-tight">
                                    {faq.q}
                                </h3>
                                <p className="text-agency-primary/60 dark:text-white/60 leading-relaxed font-light">
                                    {faq.a}
                                </p>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
