import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';

export default function Services() {
    const services = [
        {
            title: 'UI/UX Design',
            description:
                'Creating intuitive and beautiful user experiences that engage and convert.',
            features: [
                'User Research',
                'Wireframing',
                'Prototyping',
                'Visual Design',
                'Usability Testing',
            ],
            icon: '🎨',
        },
        {
            title: 'Web Development',
            description:
                'Building fast, scalable, and modern web applications with cutting-edge technology.',
            features: [
                'Frontend Development',
                'Backend Development',
                'API Integration',
                'Performance Optimization',
                'SEO',
            ],
            icon: '💻',
        },
        {
            title: 'Mobile Apps',
            description:
                'Native and cross-platform mobile solutions for iOS and Android.',
            features: [
                'iOS Development',
                'Android Development',
                'React Native',
                'Flutter',
                'App Store Optimization',
            ],
            icon: '📱',
        },
        {
            title: 'E-commerce',
            description:
                'Complete e-commerce solutions that drive sales and enhance customer experience.',
            features: [
                'Online Stores',
                'Payment Integration',
                'Inventory Management',
                'Analytics',
                'Marketing Tools',
            ],
            icon: '🛒',
        },
        {
            title: 'Branding',
            description:
                'Comprehensive brand identity design that makes your business stand out.',
            features: [
                'Logo Design',
                'Brand Guidelines',
                'Marketing Materials',
                'Brand Strategy',
                'Visual Identity',
            ],
            icon: '🎯',
        },
        {
            title: 'Digital Marketing',
            description:
                'Strategic digital marketing campaigns that grow your online presence.',
            features: [
                'SEO/SEM',
                'Social Media',
                'Content Marketing',
                'Email Marketing',
                'Analytics',
            ],
            icon: '📈',
        },
    ];

    return (
        <MainLayout title="Our Services - Avant-Garde CMS">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-agency-neutral via-white to-agency-neutral/50 py-20 dark:from-agency-dark dark:via-agency-dark dark:to-agency-primary/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <AnimatedSection
                        animation="fade-in"
                        className="text-center"
                    >
                        <h1 className="mb-6 font-display text-4xl font-bold text-agency-primary md:text-6xl dark:text-agency-neutral">
                            Our{' '}
                            <span className="text-agency-accent">Services</span>
                        </h1>
                        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-agency-primary/70 md:text-2xl dark:text-agency-neutral/70">
                            Comprehensive digital solutions to transform your
                            business and create exceptional user experiences.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            {/* Services Grid */}
            <section className="bg-white py-20 dark:bg-agency-dark">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {services.map((service, index) => (
                            <AnimatedSection
                                key={service.title}
                                animation="slide-up"
                                className="rounded-lg bg-agency-neutral/30 p-8 transition-shadow duration-300 hover:shadow-lg dark:bg-agency-primary/5"
                            >
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-agency-accent/10">
                                    <span className="text-3xl">
                                        {service.icon}
                                    </span>
                                </div>

                                <h3 className="mb-4 font-display text-2xl font-bold text-agency-primary dark:text-agency-neutral">
                                    {service.title}
                                </h3>

                                <p className="mb-6 leading-relaxed text-agency-primary/70 dark:text-agency-neutral/70">
                                    {service.description}
                                </p>

                                <ul className="space-y-2">
                                    {service.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-center text-sm text-agency-primary/60 dark:text-agency-neutral/60"
                                        >
                                            <div className="mr-3 h-2 w-2 rounded-full bg-agency-accent"></div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <AnimatedSection
                animation="fade-in"
                className="bg-agency-neutral/30 py-20 dark:bg-agency-primary/5"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 font-display text-3xl font-bold text-agency-primary md:text-5xl dark:text-agency-neutral">
                            Our Process
                        </h2>
                        <p className="mx-auto max-w-2xl text-xl text-agency-primary/70 dark:text-agency-neutral/70">
                            A proven methodology that delivers exceptional
                            results
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-4">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-agency-accent text-xl font-bold text-white">
                                1
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-agency-primary dark:text-agency-neutral">
                                Discovery
                            </h3>
                            <p className="text-sm text-agency-primary/70 dark:text-agency-neutral/70">
                                Understanding your goals, audience, and
                                requirements
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-agency-accent text-xl font-bold text-white">
                                2
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-agency-primary dark:text-agency-neutral">
                                Strategy
                            </h3>
                            <p className="text-sm text-agency-primary/70 dark:text-agency-neutral/70">
                                Developing a comprehensive plan and roadmap
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-agency-accent text-xl font-bold text-white">
                                3
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-agency-primary dark:text-agency-neutral">
                                Design & Build
                            </h3>
                            <p className="text-sm text-agency-primary/70 dark:text-agency-neutral/70">
                                Creating and developing your digital solution
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-agency-accent text-xl font-bold text-white">
                                4
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-agency-primary dark:text-agency-neutral">
                                Launch & Support
                            </h3>
                            <p className="text-sm text-agency-primary/70 dark:text-agency-neutral/70">
                                Deploying and maintaining your solution
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
                        Let's Discuss Your Project
                    </h2>
                    <p className="mb-8 text-xl text-agency-neutral/80">
                        Ready to transform your digital presence? We're here to
                        help.
                    </p>
                    <a
                        href="/contact"
                        className="inline-block rounded-lg bg-agency-accent px-8 py-4 font-semibold text-white transition-colors duration-300 hover:bg-agency-accent/90"
                    >
                        Get Started
                    </a>
                </div>
            </AnimatedSection>
        </MainLayout>
    );
}
