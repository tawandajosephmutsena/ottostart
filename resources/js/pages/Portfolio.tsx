import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';

export default function Portfolio() {
    const projects = [
        {
            title: 'E-commerce Platform',
            category: 'Web Development',
            description:
                'A modern e-commerce platform with advanced features and seamless user experience.',
            image: '/placeholder-project-1.jpg',
            tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        },
        {
            title: 'Mobile Banking App',
            category: 'Mobile Development',
            description:
                'Secure and intuitive mobile banking application with biometric authentication.',
            image: '/placeholder-project-2.jpg',
            tags: ['React Native', 'Firebase', 'Biometrics', 'Security'],
        },
        {
            title: 'Brand Identity System',
            category: 'Branding',
            description:
                'Complete brand identity redesign for a tech startup including logo and guidelines.',
            image: '/placeholder-project-3.jpg',
            tags: ['Logo Design', 'Brand Guidelines', 'Visual Identity'],
        },
        {
            title: 'SaaS Dashboard',
            category: 'UI/UX Design',
            description:
                'Analytics dashboard for a SaaS platform with complex data visualization.',
            image: '/placeholder-project-4.jpg',
            tags: ['Dashboard', 'Data Viz', 'UX Research', 'Prototyping'],
        },
        {
            title: 'Restaurant Website',
            category: 'Web Development',
            description:
                'Responsive website with online ordering system and reservation management.',
            image: '/placeholder-project-5.jpg',
            tags: ['WordPress', 'Online Ordering', 'Responsive Design'],
        },
        {
            title: 'Fitness App',
            category: 'Mobile Development',
            description:
                'Comprehensive fitness tracking app with workout plans and progress monitoring.',
            image: '/placeholder-project-6.jpg',
            tags: ['Flutter', 'Health Kit', 'Wearables', 'Analytics'],
        },
    ];

    const categories = [
        'All',
        'Web Development',
        'Mobile Development',
        'UI/UX Design',
        'Branding',
    ];

    return (
        <MainLayout title="Our Portfolio - Avant-Garde CMS">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-agency-neutral via-white to-agency-neutral/50 py-20 dark:from-agency-dark dark:via-agency-dark dark:to-agency-primary/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <AnimatedSection
                        animation="fade-in"
                        className="text-center"
                    >
                        <h1 className="mb-6 font-display text-4xl font-bold text-agency-primary md:text-6xl dark:text-agency-neutral">
                            Our{' '}
                            <span className="text-agency-accent">
                                Portfolio
                            </span>
                        </h1>
                        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-agency-primary/70 md:text-2xl dark:text-agency-neutral/70">
                            Explore our latest projects and see how we've helped
                            businesses transform their digital presence.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            {/* Filter Section */}
            <section className="border-b border-agency-secondary/10 bg-white py-12 dark:border-agency-neutral/10 dark:bg-agency-dark">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <AnimatedSection
                        animation="slide-up"
                        className="flex flex-wrap justify-center gap-4"
                    >
                        {categories.map((category) => (
                            <button
                                key={category}
                                className="rounded-full border border-agency-primary/20 px-6 py-2 text-agency-primary transition-colors duration-300 hover:border-agency-accent hover:bg-agency-accent hover:text-white dark:border-agency-neutral/30 dark:text-agency-neutral dark:hover:border-agency-accent dark:hover:bg-agency-accent"
                            >
                                {category}
                            </button>
                        ))}
                    </AnimatedSection>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="bg-white py-20 dark:bg-agency-dark">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project, index) => (
                            <AnimatedSection
                                key={project.title}
                                animation="slide-up"
                                className="group cursor-pointer"
                            >
                                <div className="overflow-hidden rounded-lg bg-agency-neutral/30 transition-shadow duration-300 hover:shadow-xl dark:bg-agency-primary/5">
                                    {/* Project Image Placeholder */}
                                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-agency-accent/20 to-agency-accent/10 transition-transform duration-300 group-hover:scale-105">
                                        <div className="text-center">
                                            <div className="mb-2 text-4xl">
                                                🎨
                                            </div>
                                            <div className="text-sm text-agency-primary/60 dark:text-agency-neutral/60">
                                                Project Image
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="mb-2 text-sm font-medium text-agency-accent">
                                            {project.category}
                                        </div>

                                        <h3 className="mb-3 font-display text-xl font-bold text-agency-primary dark:text-agency-neutral">
                                            {project.title}
                                        </h3>

                                        <p className="mb-4 leading-relaxed text-agency-primary/70 dark:text-agency-neutral/70">
                                            {project.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {project.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-full bg-agency-accent/10 px-3 py-1 text-xs text-agency-accent"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <AnimatedSection
                animation="fade-in"
                className="bg-agency-neutral/30 py-20 dark:bg-agency-primary/5"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 font-display text-3xl font-bold text-agency-primary md:text-5xl dark:text-agency-neutral">
                            Project Results
                        </h2>
                        <p className="mx-auto max-w-2xl text-xl text-agency-primary/70 dark:text-agency-neutral/70">
                            The impact of our work speaks for itself
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                        <div>
                            <div className="mb-2 text-4xl font-bold text-agency-accent">
                                150+
                            </div>
                            <div className="text-agency-primary/70 dark:text-agency-neutral/70">
                                Projects Completed
                            </div>
                        </div>
                        <div>
                            <div className="mb-2 text-4xl font-bold text-agency-accent">
                                98%
                            </div>
                            <div className="text-agency-primary/70 dark:text-agency-neutral/70">
                                Client Satisfaction
                            </div>
                        </div>
                        <div>
                            <div className="mb-2 text-4xl font-bold text-agency-accent">
                                50+
                            </div>
                            <div className="text-agency-primary/70 dark:text-agency-neutral/70">
                                Happy Clients
                            </div>
                        </div>
                        <div>
                            <div className="mb-2 text-4xl font-bold text-agency-accent">
                                24/7
                            </div>
                            <div className="text-agency-primary/70 dark:text-agency-neutral/70">
                                Support
                            </div>
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
                        Ready for Your Project?
                    </h2>
                    <p className="mb-8 text-xl text-agency-neutral/80">
                        Let's create something amazing together
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
