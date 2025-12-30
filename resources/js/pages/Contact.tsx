import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import React, { useState } from 'react';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Form submitted:', formData);
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
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
        <MainLayout title="Contact Us - Avant-Garde CMS">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-agency-neutral via-white to-agency-neutral/50 py-20 dark:from-agency-dark dark:via-agency-dark dark:to-agency-primary/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <AnimatedSection
                        animation="fade-in"
                        className="text-center"
                    >
                        <h1 className="mb-6 font-display text-4xl font-bold text-agency-primary md:text-6xl dark:text-agency-neutral">
                            Get In{' '}
                            <span className="text-agency-accent">Touch</span>
                        </h1>
                        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-agency-primary/70 md:text-2xl dark:text-agency-neutral/70">
                            Ready to start your next project? We'd love to hear
                            from you. Let's discuss how we can bring your vision
                            to life.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            {/* Contact Form & Info */}
            <section className="bg-white py-20 dark:bg-agency-dark">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Contact Form */}
                        <AnimatedSection animation="slide-right">
                            <div className="rounded-lg bg-agency-neutral/30 p-8 dark:bg-agency-primary/5">
                                <h2 className="mb-6 font-display text-2xl font-bold text-agency-primary dark:text-agency-neutral">
                                    Send us a message
                                </h2>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="mb-2 block text-sm font-medium text-agency-primary dark:text-agency-neutral"
                                            >
                                                Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-agency-primary/20 px-4 py-3 focus:border-agency-accent focus:outline-none dark:border-agency-neutral/30 dark:bg-agency-dark dark:text-agency-neutral"
                                                placeholder="Your name"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="mb-2 block text-sm font-medium text-agency-primary dark:text-agency-neutral"
                                            >
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-agency-primary/20 px-4 py-3 focus:border-agency-accent focus:outline-none dark:border-agency-neutral/30 dark:bg-agency-dark dark:text-agency-neutral"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="type"
                                            className="mb-2 block text-sm font-medium text-agency-primary dark:text-agency-neutral"
                                        >
                                            Inquiry Type
                                        </label>
                                        <select
                                            id="type"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-agency-primary/20 px-4 py-3 focus:border-agency-accent focus:outline-none dark:border-agency-neutral/30 dark:bg-agency-dark dark:text-agency-neutral"
                                        >
                                            <option value="general">
                                                General Inquiry
                                            </option>
                                            <option value="project">
                                                New Project
                                            </option>
                                            <option value="career">
                                                Career Opportunity
                                            </option>
                                            <option value="support">
                                                Support
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="subject"
                                            className="mb-2 block text-sm font-medium text-agency-primary dark:text-agency-neutral"
                                        >
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-agency-primary/20 px-4 py-3 focus:border-agency-accent focus:outline-none dark:border-agency-neutral/30 dark:bg-agency-dark dark:text-agency-neutral"
                                            placeholder="What's this about?"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="message"
                                            className="mb-2 block text-sm font-medium text-agency-primary dark:text-agency-neutral"
                                        >
                                            Message *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            required
                                            rows={6}
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full resize-none rounded-lg border border-agency-primary/20 px-4 py-3 focus:border-agency-accent focus:outline-none dark:border-agency-neutral/30 dark:bg-agency-dark dark:text-agency-neutral"
                                            placeholder="Tell us about your project or inquiry..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="flex w-full items-center justify-center space-x-2 rounded-lg bg-agency-accent px-6 py-4 font-semibold text-white transition-colors duration-300 hover:bg-agency-accent/90"
                                    >
                                        <Send className="h-5 w-5" />
                                        <span>Send Message</span>
                                    </button>
                                </form>
                            </div>
                        </AnimatedSection>

                        {/* Contact Information */}
                        <AnimatedSection animation="slide-left">
                            <div className="space-y-8">
                                <div>
                                    <h2 className="mb-6 font-display text-2xl font-bold text-agency-primary dark:text-agency-neutral">
                                        Contact Information
                                    </h2>
                                    <p className="mb-8 leading-relaxed text-agency-primary/70 dark:text-agency-neutral/70">
                                        We're here to help and answer any
                                        questions you might have. We look
                                        forward to hearing from you.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {contactInfo.map((contact) => (
                                        <div
                                            key={contact.label}
                                            className="flex items-start space-x-4"
                                        >
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-agency-accent/10">
                                                <contact.icon className="h-6 w-6 text-agency-accent" />
                                            </div>
                                            <div>
                                                <div className="mb-1 font-semibold text-agency-primary dark:text-agency-neutral">
                                                    {contact.label}
                                                </div>
                                                {contact.href ? (
                                                    <a
                                                        href={contact.href}
                                                        className="text-agency-primary/70 transition-colors duration-300 hover:text-agency-accent dark:text-agency-neutral/70"
                                                    >
                                                        {contact.value}
                                                    </a>
                                                ) : (
                                                    <span className="text-agency-primary/70 dark:text-agency-neutral/70">
                                                        {contact.value}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="rounded-lg bg-agency-neutral/30 p-6 dark:bg-agency-primary/5">
                                    <h3 className="mb-4 font-semibold text-agency-primary dark:text-agency-neutral">
                                        Office Hours
                                    </h3>
                                    <div className="space-y-2 text-sm text-agency-primary/70 dark:text-agency-neutral/70">
                                        <div className="flex justify-between">
                                            <span>Monday - Friday</span>
                                            <span>9:00 AM - 6:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Saturday</span>
                                            <span>10:00 AM - 4:00 PM</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Sunday</span>
                                            <span>Closed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <AnimatedSection
                animation="fade-in"
                className="bg-agency-neutral/30 py-20 dark:bg-agency-primary/5"
            >
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 font-display text-3xl font-bold text-agency-primary md:text-4xl dark:text-agency-neutral">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-xl text-agency-primary/70 dark:text-agency-neutral/70">
                            Quick answers to common questions
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-lg bg-white p-6 dark:bg-agency-dark">
                            <h3 className="mb-2 font-semibold text-agency-primary dark:text-agency-neutral">
                                How long does a typical project take?
                            </h3>
                            <p className="text-agency-primary/70 dark:text-agency-neutral/70">
                                Project timelines vary depending on scope and
                                complexity. Most projects take 4-12 weeks from
                                start to finish.
                            </p>
                        </div>

                        <div className="rounded-lg bg-white p-6 dark:bg-agency-dark">
                            <h3 className="mb-2 font-semibold text-agency-primary dark:text-agency-neutral">
                                Do you work with small businesses?
                            </h3>
                            <p className="text-agency-primary/70 dark:text-agency-neutral/70">
                                Absolutely! We work with businesses of all
                                sizes, from startups to enterprise companies.
                            </p>
                        </div>

                        <div className="rounded-lg bg-white p-6 dark:bg-agency-dark">
                            <h3 className="mb-2 font-semibold text-agency-primary dark:text-agency-neutral">
                                What's included in your web development service?
                            </h3>
                            <p className="text-agency-primary/70 dark:text-agency-neutral/70">
                                Our web development includes design,
                                development, testing, deployment, and ongoing
                                support.
                            </p>
                        </div>
                    </div>
                </div>
            </AnimatedSection>
        </MainLayout>
    );
}
