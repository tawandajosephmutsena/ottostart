import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Github, Linkedin, Twitter } from 'lucide-react';

export default function Team() {
    const teamMembers = [
        {
            name: 'Sarah Johnson',
            position: 'Creative Director',
            bio: 'Sarah leads our creative vision with over 8 years of experience in digital design and brand strategy.',
            avatar: '/placeholder-avatar-1.jpg',
            social: {
                twitter: 'https://twitter.com',
                linkedin: 'https://linkedin.com',
                github: 'https://github.com',
            },
        },
        {
            name: 'Michael Chen',
            position: 'Lead Developer',
            bio: 'Michael architets our technical solutions and leads development with expertise in modern web technologies.',
            avatar: '/placeholder-avatar-2.jpg',
            social: {
                twitter: 'https://twitter.com',
                linkedin: 'https://linkedin.com',
                github: 'https://github.com',
            },
        },
        {
            name: 'Emily Rodriguez',
            position: 'UX Designer',
            bio: 'Emily crafts user experiences that are both beautiful and functional, with a focus on user research and testing.',
            avatar: '/placeholder-avatar-3.jpg',
            social: {
                twitter: 'https://twitter.com',
                linkedin: 'https://linkedin.com',
            },
        },
        {
            name: 'David Kim',
            position: 'Full Stack Developer',
            bio: 'David builds robust applications from front to back, specializing in React, Node.js, and cloud architecture.',
            avatar: '/placeholder-avatar-4.jpg',
            social: {
                linkedin: 'https://linkedin.com',
                github: 'https://github.com',
            },
        },
        {
            name: 'Lisa Thompson',
            position: 'Project Manager',
            bio: 'Lisa ensures projects run smoothly and on time, coordinating between teams and clients with exceptional skill.',
            avatar: '/placeholder-avatar-5.jpg',
            social: {
                twitter: 'https://twitter.com',
                linkedin: 'https://linkedin.com',
            },
        },
        {
            name: 'Alex Martinez',
            position: 'Mobile Developer',
            bio: 'Alex creates amazing mobile experiences for iOS and Android, with expertise in React Native and Flutter.',
            avatar: '/placeholder-avatar-6.jpg',
            social: {
                twitter: 'https://twitter.com',
                github: 'https://github.com',
            },
        },
    ];

    return (
        <MainLayout title="Our Team - Avant-Garde CMS">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-agency-neutral via-white to-agency-neutral/50 py-20 dark:from-agency-dark dark:via-agency-dark dark:to-agency-primary/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <AnimatedSection
                        animation="fade-in"
                        className="text-center"
                    >
                        <h1 className="mb-6 font-display text-4xl font-bold text-agency-primary md:text-6xl dark:text-agency-neutral">
                            Meet Our{' '}
                            <span className="text-agency-accent">Team</span>
                        </h1>
                        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-agency-primary/70 md:text-2xl dark:text-agency-neutral/70">
                            The talented individuals behind every successful
                            project. We're passionate creators, innovators, and
                            problem solvers.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            {/* Team Grid */}
            <section className="bg-white py-20 dark:bg-agency-dark">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {teamMembers.map((member, index) => (
                            <AnimatedSection
                                key={member.name}
                                animation="slide-up"
                                className="group text-center"
                            >
                                <div className="rounded-lg bg-agency-neutral/30 p-8 transition-shadow duration-300 hover:shadow-lg dark:bg-agency-primary/5">
                                    {/* Avatar Placeholder */}
                                    <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-agency-accent/20 to-agency-accent/10 transition-transform duration-300 group-hover:scale-105">
                                        <div className="text-4xl">👤</div>
                                    </div>

                                    <h3 className="mb-2 font-display text-xl font-bold text-agency-primary dark:text-agency-neutral">
                                        {member.name}
                                    </h3>

                                    <div className="mb-4 font-medium text-agency-accent">
                                        {member.position}
                                    </div>

                                    <p className="mb-6 leading-relaxed text-agency-primary/70 dark:text-agency-neutral/70">
                                        {member.bio}
                                    </p>

                                    {/* Social Links */}
                                    <div className="flex justify-center space-x-4">
                                        {member.social.twitter && (
                                            <a
                                                href={member.social.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-agency-primary/60 transition-colors duration-300 hover:text-agency-accent dark:text-agency-neutral/60"
                                            >
                                                <Twitter className="h-5 w-5" />
                                            </a>
                                        )}
                                        {member.social.linkedin && (
                                            <a
                                                href={member.social.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-agency-primary/60 transition-colors duration-300 hover:text-agency-accent dark:text-agency-neutral/60"
                                            >
                                                <Linkedin className="h-5 w-5" />
                                            </a>
                                        )}
                                        {member.social.github && (
                                            <a
                                                href={member.social.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-agency-primary/60 transition-colors duration-300 hover:text-agency-accent dark:text-agency-neutral/60"
                                            >
                                                <Github className="h-5 w-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Culture Section */}
            <AnimatedSection
                animation="fade-in"
                className="bg-agency-neutral/30 py-20 dark:bg-agency-primary/5"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 font-display text-3xl font-bold text-agency-primary md:text-5xl dark:text-agency-neutral">
                            Our Culture
                        </h2>
                        <p className="mx-auto max-w-2xl text-xl text-agency-primary/70 dark:text-agency-neutral/70">
                            What makes working at Avant-Garde special
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-8 text-center shadow-lg dark:bg-agency-dark">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-agency-accent/10">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <h3 className="mb-4 text-xl font-semibold text-agency-primary dark:text-agency-neutral">
                                Innovation Driven
                            </h3>
                            <p className="text-agency-primary/70 dark:text-agency-neutral/70">
                                We encourage experimentation and creative
                                thinking in everything we do.
                            </p>
                        </div>

                        <div className="rounded-lg bg-white p-8 text-center shadow-lg dark:bg-agency-dark">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-agency-accent/10">
                                <span className="text-2xl">🤝</span>
                            </div>
                            <h3 className="mb-4 text-xl font-semibold text-agency-primary dark:text-agency-neutral">
                                Collaborative
                            </h3>
                            <p className="text-agency-primary/70 dark:text-agency-neutral/70">
                                We believe the best ideas come from working
                                together and sharing knowledge.
                            </p>
                        </div>

                        <div className="rounded-lg bg-white p-8 text-center shadow-lg dark:bg-agency-dark">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-agency-accent/10">
                                <span className="text-2xl">🌱</span>
                            </div>
                            <h3 className="mb-4 text-xl font-semibold text-agency-primary dark:text-agency-neutral">
                                Growth Focused
                            </h3>
                            <p className="text-agency-primary/70 dark:text-agency-neutral/70">
                                We invest in our team's professional development
                                and career growth.
                            </p>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* Join Us Section */}
            <AnimatedSection
                animation="slide-up"
                className="bg-agency-primary py-20 dark:bg-agency-dark"
            >
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-6 font-display text-3xl font-bold text-agency-neutral md:text-5xl">
                        Join Our Team
                    </h2>
                    <p className="mb-8 text-xl text-agency-neutral/80">
                        We're always looking for talented individuals to join
                        our growing team
                    </p>
                    <a
                        href="/contact"
                        className="inline-block rounded-lg bg-agency-accent px-8 py-4 font-semibold text-white transition-colors duration-300 hover:bg-agency-accent/90"
                    >
                        View Open Positions
                    </a>
                </div>
            </AnimatedSection>
        </MainLayout>
    );
}
