import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';

export default function About() {
    return (
        <MainLayout title="About Us - Avant-Garde CMS">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-agency-neutral via-white to-agency-neutral/50 py-20 dark:from-agency-dark dark:via-agency-dark dark:to-agency-primary/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <AnimatedSection
                        animation="fade-in"
                        className="text-center"
                    >
                        <h1 className="mb-6 font-display text-4xl font-bold text-agency-primary md:text-6xl dark:text-agency-neutral">
                            About{' '}
                            <span className="text-agency-accent">
                                Avant-Garde
                            </span>
                        </h1>
                        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-agency-primary/70 md:text-2xl dark:text-agency-neutral/70">
                            We are a team of passionate designers and developers
                            creating digital experiences that push the
                            boundaries of what's possible.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            {/* Story Section */}
            <AnimatedSection
                animation="slide-up"
                className="bg-white py-20 dark:bg-agency-dark"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid items-center gap-12 md:grid-cols-2">
                        <div>
                            <h2 className="mb-6 font-display text-3xl font-bold text-agency-primary md:text-4xl dark:text-agency-neutral">
                                Our Story
                            </h2>
                            <p className="mb-6 text-lg leading-relaxed text-agency-primary/70 dark:text-agency-neutral/70">
                                Founded in 2019, Avant-Garde emerged from a
                                simple belief: digital experiences should be
                                extraordinary, not ordinary. We started as a
                                small team of creatives who were frustrated with
                                the status quo of web design and development.
                            </p>
                            <p className="text-lg leading-relaxed text-agency-primary/70 dark:text-agency-neutral/70">
                                Today, we've grown into a full-service digital
                                agency that combines cutting-edge technology
                                with innovative design to create experiences
                                that captivate, engage, and inspire.
                            </p>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-agency-accent/10 to-agency-accent/5 p-8 dark:from-agency-accent/20 dark:to-agency-accent/10">
                            <div className="text-center">
                                <div className="mb-4 font-display text-6xl font-bold text-agency-accent">
                                    5+
                                </div>
                                <div className="text-lg text-agency-primary dark:text-agency-neutral">
                                    Years of Innovation
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* Values Section */}
            <AnimatedSection
                animation="fade-in"
                className="bg-agency-neutral/30 py-20 dark:bg-agency-primary/5"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 font-display text-3xl font-bold text-agency-primary md:text-5xl dark:text-agency-neutral">
                            Our Values
                        </h2>
                        <p className="mx-auto max-w-2xl text-xl text-agency-primary/70 dark:text-agency-neutral/70">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-8 text-center shadow-lg dark:bg-agency-dark">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-agency-accent/10">
                                <span className="text-2xl">🚀</span>
                            </div>
                            <h3 className="mb-4 text-xl font-semibold text-agency-primary dark:text-agency-neutral">
                                Innovation First
                            </h3>
                            <p className="text-agency-primary/70 dark:text-agency-neutral/70">
                                We constantly push boundaries and explore new
                                technologies to deliver cutting-edge solutions.
                            </p>
                        </div>

                        <div className="rounded-lg bg-white p-8 text-center shadow-lg dark:bg-agency-dark">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-agency-accent/10">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h3 className="mb-4 text-xl font-semibold text-agency-primary dark:text-agency-neutral">
                                Quality Focus
                            </h3>
                            <p className="text-agency-primary/70 dark:text-agency-neutral/70">
                                Every project receives meticulous attention to
                                detail and rigorous quality assurance.
                            </p>
                        </div>

                        <div className="rounded-lg bg-white p-8 text-center shadow-lg dark:bg-agency-dark">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-agency-accent/10">
                                <span className="text-2xl">🤝</span>
                            </div>
                            <h3 className="mb-4 text-xl font-semibold text-agency-primary dark:text-agency-neutral">
                                Collaboration
                            </h3>
                            <p className="text-agency-primary/70 dark:text-agency-neutral/70">
                                We work closely with our clients as partners to
                                achieve extraordinary results together.
                            </p>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* CTA Section */}
            <AnimatedSection
                animation="slide-up"
                className="bg-agency-primary py-20 dark:bg-agency-dark"
            >
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-6 font-display text-3xl font-bold text-agency-neutral md:text-5xl">
                        Ready to Work Together?
                    </h2>
                    <p className="mb-8 text-xl text-agency-neutral/80">
                        Let's create something extraordinary for your business
                    </p>
                    <a
                        href="/contact"
                        className="inline-block rounded-lg bg-agency-accent px-8 py-4 font-semibold text-white transition-colors duration-300 hover:bg-agency-accent/90"
                    >
                        Start Your Project
                    </a>
                </div>
            </AnimatedSection>
        </MainLayout>
    );
}
