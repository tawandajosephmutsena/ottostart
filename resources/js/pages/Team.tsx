import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Github, Linkedin, Twitter, ArrowUpRight } from 'lucide-react';
import React from 'react';

export default function Team() {
    const teamMembers = [
        {
            name: 'Sarah Johnson',
            position: 'Creative Director',
            bio: 'Sarah leads our creative vision with over 8 years of experience in digital design.',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop',
            social: { twitter: '#', linkedin: '#', github: '#' },
        },
        {
            name: 'Michael Chen',
            position: 'Lead Developer',
            bio: 'Michael architects our technical solutions with expertise in modern web systems.',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop',
            social: { twitter: '#', linkedin: '#', github: '#' },
        },
        {
            name: 'Emily Rodriguez',
            position: 'UX Lead',
            bio: 'Emily crafts user experiences that are both beautiful and functionally superior.',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop',
            social: { twitter: '#', linkedin: '#' },
        },
        {
            name: 'David Kim',
            position: 'Full Stack',
            bio: 'David builds robust applications from front to back, specializing in React and Node.',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop',
            social: { linkedin: '#', github: '#' },
        },
        {
            name: 'Lisa Thompson',
            position: 'Project Lead',
            bio: 'Lisa ensures projects run smoothly and on time, coordinating with exceptional skill.',
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop',
            social: { twitter: '#', linkedin: '#' },
        },
        {
            name: 'Alex Martinez',
            position: 'Mobile Dev',
            bio: 'Alex creates amazing mobile experiences for iOS and Android using React Native.',
            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2574&auto=format&fit=crop',
            social: { twitter: '#', github: '#' },
        },
    ];

    return (
        <MainLayout title="Team - Avant-Garde">
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
                            <AnimatedSection key={i} animation="slide-up" delay={i * 100} className="group flex flex-col items-center">
                                {/* Large Typography Portrait Card */}
                                <div className="relative w-full aspect-[3/4] rounded-[60px] overflow-hidden mb-12 shadow-2xl bg-agency-primary/5 dark:bg-white/5 group-hover:-translate-y-4 transition-all duration-700">
                                    <img 
                                        src={member.image} 
                                        alt={member.name} 
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 ease-out"
                                    />
                                    
                                    {/* Overlay content on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-agency-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    
                                    <div className="absolute inset-0 flex flex-col justify-end p-12 translate-y-20 group-hover:translate-y-0 transition-transform duration-700">
                                        <div className="flex space-x-4 mb-6">
                                            {member.social.twitter && <a href={member.social.twitter} aria-label={`${member.name} Twitter`} title={`${member.name} Twitter`} className="text-white hover:text-agency-accent transition-colors"><Twitter className="size-6" /></a>}
                                            {member.social.linkedin && <a href={member.social.linkedin} aria-label={`${member.name} LinkedIn`} title={`${member.name} LinkedIn`} className="text-white hover:text-agency-accent transition-colors"><Linkedin className="size-6" /></a>}
                                            {member.social.github && <a href={member.social.github} aria-label={`${member.name} GitHub`} title={`${member.name} GitHub`} className="text-white hover:text-agency-accent transition-colors"><Github className="size-6" /></a>}
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
                                        <span className="opacity-30">{member.name.split(' ')[1]}</span>
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
