import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { TeamMember } from '@/types';
import { Head } from '@inertiajs/react';
import { Github, Linkedin, Twitter, ArrowUpRight, Globe } from 'lucide-react';
import React from 'react';

interface Props {
    teamMembers: TeamMember[];
}

export default function Team({ teamMembers }: Props) {
    return (
        <MainLayout title="Team - Avant-Garde">
            <Head title="Our Team" />
            
            {/* Minimal High-Impact Hero */}
            <section className="bg-white dark:bg-agency-dark pt-40 pb-20 relative overflow-hidden">
                <div className="absolute top-20 right-0 w-full overflow-hidden opacity-[0.03] select-none pointer-events-none text-right">
                    <span className="text-[25vw] font-black uppercase whitespace-nowrap leading-none block marquee-reverse">
                        COLLECTIVE GENIUS COLLECTIVE GENIUS
                    </span>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl">
                        <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Who We Are</span>
                        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-agency-primary dark:text-white mb-12">
                            The <br/>
                            <span className="opacity-30 italic">Dream Team.</span>
                        </h1>
                        <p className="text-xl md:text-3xl text-agency-primary/60 dark:text-white/60 leading-relaxed font-light">
                            A diverse collective of thinkers, designers, and builders 
                            dedicated to pushing the boundaries of what's possible in the digital realm.
                        </p>
                    </div>
                </div>
            </section>

            {/* Creative Team Grid - Out-of-the-box card layout */}
            <section className="bg-agency-secondary dark:bg-black/40 py-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {teamMembers.map((member, i) => (
                            <AnimatedSection key={member.id} animation="slide-up" delay={i * 100} className="group flex flex-col items-center">
                                {/* Large Typography Portrait Card */}
                                <div className="relative w-full aspect-[3/4] rounded-[60px] overflow-hidden mb-12 shadow-2xl bg-agency-primary/5 dark:bg-white/5 group-hover:-translate-y-4 transition-all duration-700">
                                    {member.avatar ? (
                                        <img 
                                            src={member.avatar} 
                                            alt={member.name} 
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-agency-accent/10 flex items-center justify-center opacity-40">
                                            <span className="text-9xl font-black">{member.name.charAt(0)}</span>
                                        </div>
                                    )}
                                    
                                    {/* Overlay content on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-agency-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    
                                    <div className="absolute inset-0 flex flex-col justify-end p-12 translate-y-20 group-hover:translate-y-0 transition-transform duration-700">
                                        <div className="flex space-x-4 mb-6">
                                            {member.social_links?.linkedin && <a href={member.social_links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="text-white hover:text-agency-accent transition-colors"><Linkedin className="size-6" /></a>}
                                            {member.social_links?.github && <a href={member.social_links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="text-white hover:text-agency-accent transition-colors"><Github className="size-6" /></a>}
                                            {member.social_links?.twitter && <a href={member.social_links.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter Profile" className="text-white hover:text-agency-accent transition-colors"><Twitter className="size-6" /></a>}
                                            {member.social_links?.website && <a href={member.social_links.website} target="_blank" rel="noopener noreferrer" aria-label="Personal Website" className="text-white hover:text-agency-accent transition-colors"><Globe className="size-6" /></a>}
                                        </div>
                                        <p className="text-white/70 text-sm leading-relaxed mb-4">
                                            {member.bio}
                                        </p>
                                    </div>
                                </div>

                                {/* Base Content */}
                                <div className="text-center w-full px-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-agency-accent mb-2 block">{member.position}</span>
                                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-agency-primary dark:text-white group-hover:italic group-hover:translate-x-2 transition-all duration-500">
                                        {member.name.split(' ')[0]} <br/>
                                        <span className="opacity-30">{member.name.split(' ').slice(1).join(' ')}</span>
                                    </h3>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* shared Culture Bento */}
            <section className="bg-white dark:bg-agency-dark py-40 border-t border-agency-primary/5 dark:border-white/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <div className="md:col-span-8 p-16 rounded-[60px] bg-agency-accent text-agency-primary flex flex-col justify-between min-h-[400px]">
                            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                                We Value <br/>
                                Quality Above <br/>
                                <span className="italic">Everything.</span>
                            </h2>
                            <div className="flex justify-between items-end">
                                <p className="max-w-md font-bold uppercase tracking-tight opacity-70">
                                    Our culture is built on mutual respect, continuous learning, and a relentless pursuit of excellence.
                                </p>
                                <div className="size-20 rounded-full border border-agency-primary/20 flex items-center justify-center">
                                    <ArrowUpRight className="size-10" />
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-4 p-12 rounded-[60px] bg-agency-primary text-white flex flex-col justify-center text-center">
                            <span className="text-6xl font-black mb-4">100%</span>
                            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Human Centered</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Join the Tribe */}
            <section className="bg-agency-primary dark:bg-black py-40 relative">
                <div className="mx-auto max-w-5xl px-4 text-center">
                    <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Careers</span>
                    <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-12">
                        Be Part of <br/>
                        <span className="text-agency-accent italic">The Movement.</span>
                    </h2>
                    <a href="/contact" className="inline-flex h-20 px-12 items-center justify-center rounded-full bg-white text-agency-primary font-black text-lg uppercase tracking-widest hover:bg-agency-accent transition-all shadow-2xl">
                        JOIN OUR TEAM
                    </a>
                </div>
            </section>
        </MainLayout>
    );
}
