import FeaturedProjects from '@/components/FeaturedProjects';
import HeroSection from '@/components/HeroSection';
import RecentInsights from '@/components/RecentInsights';
import ServicesSection from '@/components/ServicesSection';
import StatsSection from '@/components/StatsSection';
import MainLayout from '@/layouts/MainLayout';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface HomePageProps extends SharedData {
    featuredProjects: Array<{
        id: number;
        title: string;
        slug: string;
        description: string;
        featured_image?: string;
        client?: string;
        technologies?: string[];
    }>;
    featuredServices: Array<{
        id: number;
        title: string;
        slug: string;
        description: string;
        icon?: string;
        featured_image?: string;
        price_range?: string;
    }>;
    recentInsights: Array<{
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
    }>;
    stats: Array<{
        value: string;
        label: string;
        suffix?: string;
    }>;
}

export default function Home() {
    // Get page props with typed data
    const { featuredProjects, featuredServices, recentInsights, stats } =
        usePage<HomePageProps>().props;

    return (
        <MainLayout title="Avant-Garde CMS - Digital Innovation Agency">
            {/* Hero Section with Parallax */}
            <HeroSection
                title="Digital Innovation Redefined"
                subtitle="Avant-Garde Agency"
                description="We create avant-garde digital experiences that push boundaries and inspire innovation through cutting-edge design and technology."
                ctaText="View Our Work"
                ctaHref="/portfolio"
            />

            {/* Stats Section */}
            <StatsSection stats={stats} />

            {/* Services Section with Stacked Cards */}
            <ServicesSection
                services={featuredServices}
                useStackedCards={true}
            />

            {/* Featured Projects Section */}
            <FeaturedProjects projects={featuredProjects} />

            {/* Recent Insights Section */}
            <RecentInsights insights={recentInsights} />

            {/* Premium CTA Section */}
            <section className="bg-white dark:bg-[#0a0a0a] py-40 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-agency-primary/10 to-transparent"></div>
                
                <div className="mx-auto max-w-7xl px-4 flex flex-col items-center text-center relative z-10">
                    <span className="text-agency-accent font-bold uppercase tracking-[0.4em] text-xs mb-8 block">Project Inquiry</span>
                    
                    <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-agency-primary dark:text-white leading-[0.8] mb-12">
                        Let's build <br/>
                        <span className="italic opacity-30">the future.</span>
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        <Link
                            href="/contact"
                            className="group relative inline-flex items-center justify-center size-48 md:size-64 rounded-full bg-agency-accent text-agency-primary font-black text-xl tracking-tighter hover:scale-105 transition-all shadow-2xl shadow-agency-accent/30"
                        >
                            <span className="relative z-10">START NOW</span>
                            <div className="absolute inset-0 rounded-full border border-agency-primary/10 scale-110 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                        </Link>

                        <div className="text-left">
                            <p className="text-agency-primary/60 dark:text-white/60 mb-2 font-mono uppercase tracking-widest text-xs">Email us at</p>
                            <a href="mailto:hello@avant-garde.com" className="text-2xl md:text-3xl font-bold dark:text-white hover:text-agency-accent transition-colors">hello@avant-garde.com</a>
                        </div>
                    </div>
                </div>

                {/* Background Large Text */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden opacity-[0.02] pointer-events-none select-none">
                    <span className="text-[30vw] font-black uppercase leading-none whitespace-nowrap -mb-10 block">
                        AVANT GARDE AVANT GARDE
                    </span>
                </div>
            </section>
        </MainLayout>
    );
}
