import AnimatedSection from '@/components/AnimatedSection';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import React from 'react';

interface InsightItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image?: string;
    author?: {
        name: string;
        avatar?: string;
    };
    category?: {
        name: string;
        slug: string;
    };
    published_at: string;
    reading_time?: number;
}

interface RecentInsightsProps {
    insights?: InsightItem[];
    title?: string;
    subtitle?: string;
    className?: string;
    showViewAll?: boolean;
}

const defaultInsights: InsightItem[] = [
    {
        id: 1,
        title: 'The Future of Web Design: Trends to Watch in 2024',
        slug: 'future-web-design-trends-2024',
        excerpt:
            'Explore the latest design trends that are shaping the digital landscape and how they can impact your business.',
        author: { name: 'Sarah Johnson' },
        category: { name: 'Design', slug: 'design' },
        published_at: '2024-01-15',
        reading_time: 5,
    },
    {
        id: 2,
        title: 'Building Scalable React Applications: Best Practices',
        slug: 'scalable-react-applications-best-practices',
        excerpt:
            'Learn how to structure and optimize React applications for better performance and maintainability.',
        author: { name: 'Mike Chen' },
        category: { name: 'Development', slug: 'development' },
        published_at: '2024-01-10',
        reading_time: 8,
    },
    {
        id: 3,
        title: 'User Experience Design: Creating Meaningful Interactions',
        slug: 'ux-design-meaningful-interactions',
        excerpt:
            'Discover how to design user experiences that not only look great but also provide real value to your users.',
        author: { name: 'Emma Davis' },
        category: { name: 'UX', slug: 'ux' },
        published_at: '2024-01-05',
        reading_time: 6,
    },
];

/**
 * Recent Insights Section component
 * Displays a grid of recent blog posts/insights
 */
export const RecentInsights: React.FC<RecentInsightsProps> = ({
    insights = defaultInsights,
    title = 'Insights',
    subtitle = 'Thought Leadership',
    className,
    showViewAll = true,
}) => {
    return (
        <section className={cn('bg-agency-secondary dark:bg-agency-dark py-32', className)}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-24 text-center">
                    <span className="text-agency-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">
                        {subtitle}
                    </span>
                    <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-agency-primary dark:text-white">
                        {title}
                    </h2>
                </header>

                <div className="flex flex-col border-t border-agency-primary/10 dark:border-white/10">
                    {insights.map((insight, index) => (
                        <AnimatedSection 
                            key={insight.id}
                            animation="slide-up"
                            delay={index * 100}
                        >
                            <Link 
                                href={`/blog/${insight.slug}`}
                                className="group flex flex-col md:flex-row items-start md:items-center justify-between py-12 border-b border-agency-primary/10 dark:border-white/10 relative"
                            >
                                <div className="flex items-center gap-6 md:gap-12 relative z-10 pointer-events-none">
                                    <span className="text-xl font-mono opacity-30">0{index + 1}</span>
                                    <div className="max-w-2xl">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="text-xs font-bold text-agency-accent uppercase tracking-widest">{insight.category?.name || 'Article'}</span>
                                            <span className="text-xs opacity-40 uppercase tracking-widest">{insight.reading_time || 5} MIN READ</span>
                                        </div>
                                        <h3 className="text-3xl md:text-5xl font-bold text-agency-primary dark:text-white leading-tight group-hover:text-agency-accent transition-colors duration-300">
                                            {insight.title}
                                        </h3>
                                    </div>
                                </div>

                                <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 aspect-video rounded-2xl overflow-hidden opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 pointer-events-none z-20 shadow-2xl">
                                    {insight.featured_image ? (
                                        <img 
                                            src={insight.featured_image} 
                                            alt={insight.title}
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-agency-accent flex items-center justify-center text-5xl">📝</div>
                                    )}
                                </div>

                                <div className="mt-6 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="size-16 rounded-full border border-agency-accent flex items-center justify-center text-agency-accent group-hover:bg-agency-accent group-hover:text-agency-primary transition-all">
                                        <span className="material-symbols-outlined text-3xl">arrow_forward</span>
                                    </div>
                                </div>
                            </Link>
                        </AnimatedSection>
                    ))}
                </div>

                {showViewAll && (
                    <div className="mt-20 text-center">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-4 text-agency-primary dark:text-white font-black text-2xl uppercase tracking-tighter hover:text-agency-accent transition-colors group"
                        >
                            <span>Explore all thoughts</span>
                            <div className="h-[2px] w-24 bg-agency-accent group-hover:w-32 transition-all"></div>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default RecentInsights;
