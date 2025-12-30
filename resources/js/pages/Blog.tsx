import AnimatedSection from '@/components/AnimatedSection';
import MainLayout from '@/layouts/MainLayout';
import { Calendar, Clock, User } from 'lucide-react';

export default function Blog() {
    const blogPosts = [
        {
            title: 'The Future of Web Design: Trends to Watch in 2024',
            excerpt:
                'Explore the latest trends shaping the future of web design, from AI-powered interfaces to immersive experiences.',
            author: 'Sarah Johnson',
            date: '2024-01-15',
            readTime: '5 min read',
            category: 'Design',
            image: '/placeholder-blog-1.jpg',
        },
        {
            title: 'Building Scalable React Applications: Best Practices',
            excerpt:
                'Learn how to structure and optimize React applications for better performance and maintainability.',
            author: 'Michael Chen',
            date: '2024-01-10',
            readTime: '8 min read',
            category: 'Development',
            image: '/placeholder-blog-2.jpg',
        },
        {
            title: 'UX Research Methods That Actually Work',
            excerpt:
                'Discover proven UX research methods that help create user-centered designs and improve conversion rates.',
            author: 'Emily Rodriguez',
            date: '2024-01-05',
            readTime: '6 min read',
            category: 'UX Research',
            image: '/placeholder-blog-3.jpg',
        },
        {
            title: 'Mobile-First Design: Why It Matters More Than Ever',
            excerpt:
                'Understanding the importance of mobile-first approach in modern web development and design.',
            author: 'David Kim',
            date: '2023-12-28',
            readTime: '4 min read',
            category: 'Mobile',
            image: '/placeholder-blog-4.jpg',
        },
        {
            title: 'The Art of Minimalist Web Design',
            excerpt:
                'How to create beautiful, functional websites using minimalist design principles and clean aesthetics.',
            author: 'Sarah Johnson',
            date: '2023-12-20',
            readTime: '7 min read',
            category: 'Design',
            image: '/placeholder-blog-5.jpg',
        },
        {
            title: 'API Design Best Practices for Modern Applications',
            excerpt:
                'Essential guidelines for designing robust, scalable APIs that developers love to work with.',
            author: 'Michael Chen',
            date: '2023-12-15',
            readTime: '9 min read',
            category: 'Development',
            image: '/placeholder-blog-6.jpg',
        },
    ];

    const categories = [
        'All',
        'Design',
        'Development',
        'UX Research',
        'Mobile',
    ];

    return (
        <MainLayout title="Blog & Insights - Avant-Garde CMS">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-agency-neutral via-white to-agency-neutral/50 py-20 dark:from-agency-dark dark:via-agency-dark dark:to-agency-primary/5">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <AnimatedSection
                        animation="fade-in"
                        className="text-center"
                    >
                        <h1 className="mb-6 font-display text-4xl font-bold text-agency-primary md:text-6xl dark:text-agency-neutral">
                            Blog &{' '}
                            <span className="text-agency-accent">Insights</span>
                        </h1>
                        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-agency-primary/70 md:text-2xl dark:text-agency-neutral/70">
                            Stay updated with the latest trends, tips, and
                            insights from the world of digital design and
                            development.
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

            {/* Featured Post */}
            <section className="bg-white py-20 dark:bg-agency-dark">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <AnimatedSection animation="slide-up" className="mb-16">
                        <div className="overflow-hidden rounded-lg bg-agency-neutral/30 dark:bg-agency-primary/5">
                            <div className="md:flex">
                                <div className="md:w-1/2">
                                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-agency-accent/20 to-agency-accent/10">
                                        <div className="text-center">
                                            <div className="mb-4 text-6xl">
                                                📝
                                            </div>
                                            <div className="text-agency-primary/60 dark:text-agency-neutral/60">
                                                Featured Article
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 md:w-1/2 md:p-12">
                                    <div className="mb-2 text-sm font-medium text-agency-accent">
                                        Featured Post
                                    </div>
                                    <h2 className="mb-4 font-display text-2xl font-bold text-agency-primary md:text-3xl dark:text-agency-neutral">
                                        {blogPosts[0].title}
                                    </h2>
                                    <p className="mb-6 leading-relaxed text-agency-primary/70 dark:text-agency-neutral/70">
                                        {blogPosts[0].excerpt}
                                    </p>
                                    <div className="mb-6 flex items-center space-x-4 text-sm text-agency-primary/60 dark:text-agency-neutral/60">
                                        <div className="flex items-center space-x-1">
                                            <User className="h-4 w-4" />
                                            <span>{blogPosts[0].author}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {new Date(
                                                    blogPosts[0].date,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{blogPosts[0].readTime}</span>
                                        </div>
                                    </div>
                                    <button className="rounded-lg bg-agency-accent px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-agency-accent/90">
                                        Read More
                                    </button>
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Blog Posts Grid */}
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {blogPosts.slice(1).map((post, index) => (
                            <AnimatedSection
                                key={post.title}
                                animation="slide-up"
                                className="group cursor-pointer"
                            >
                                <article className="overflow-hidden rounded-lg bg-agency-neutral/30 transition-shadow duration-300 hover:shadow-lg dark:bg-agency-primary/5">
                                    {/* Post Image Placeholder */}
                                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-agency-accent/20 to-agency-accent/10 transition-transform duration-300 group-hover:scale-105">
                                        <div className="text-center">
                                            <div className="mb-2 text-4xl">
                                                📄
                                            </div>
                                            <div className="text-sm text-agency-primary/60 dark:text-agency-neutral/60">
                                                Article Image
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="mb-2 text-sm font-medium text-agency-accent">
                                            {post.category}
                                        </div>

                                        <h3 className="mb-3 line-clamp-2 font-display text-lg font-bold text-agency-primary dark:text-agency-neutral">
                                            {post.title}
                                        </h3>

                                        <p className="mb-4 line-clamp-3 leading-relaxed text-agency-primary/70 dark:text-agency-neutral/70">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-agency-primary/60 dark:text-agency-neutral/60">
                                            <div className="flex items-center space-x-1">
                                                <User className="h-3 w-3" />
                                                <span>{post.author}</span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>
                                                        {new Date(
                                                            post.date,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{post.readTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <AnimatedSection
                animation="fade-in"
                className="bg-agency-neutral/30 py-20 dark:bg-agency-primary/5"
            >
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-4 font-display text-3xl font-bold text-agency-primary md:text-4xl dark:text-agency-neutral">
                        Stay Updated
                    </h2>
                    <p className="mb-8 text-xl text-agency-primary/70 dark:text-agency-neutral/70">
                        Subscribe to our newsletter for the latest insights and
                        updates
                    </p>
                    <div className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 rounded-lg border border-agency-primary/20 px-4 py-3 focus:border-agency-accent focus:outline-none dark:border-agency-neutral/30 dark:bg-agency-dark dark:text-agency-neutral"
                        />
                        <button className="rounded-lg bg-agency-accent px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-agency-accent/90">
                            Subscribe
                        </button>
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
                        Have a Project in Mind?
                    </h2>
                    <p className="mb-8 text-xl text-agency-neutral/80">
                        Let's discuss how we can help bring your ideas to life
                    </p>
                    <a
                        href="/contact"
                        className="inline-block rounded-lg bg-agency-accent px-8 py-4 font-semibold text-white transition-colors duration-300 hover:bg-agency-accent/90"
                    >
                        Get in Touch
                    </a>
                </div>
            </AnimatedSection>
        </MainLayout>
    );
}
