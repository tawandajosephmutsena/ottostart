import AnimatedSection from '@/components/AnimatedSection';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import React from 'react';

interface ProjectItem {
    id: number;
    title: string;
    slug: string;
    description: string;
    featured_image?: string | null;
    client?: string | null;
    technologies?: string[] | null;
}

interface FeaturedProjectsProps {
    projects?: ProjectItem[];
    title?: string;
    subtitle?: string;
    className?: string;
    showViewAll?: boolean;
}

const defaultProjects: ProjectItem[] = [
    {
        id: 1,
        title: 'E-Commerce Platform',
        slug: 'ecommerce-platform',
        description: 'Modern shopping experience with advanced features',
        client: 'TechCorp',
        technologies: ['React', 'Node.js', 'MongoDB'],
    },
    {
        id: 2,
        title: 'Analytics Dashboard',
        slug: 'analytics-dashboard',
        description: 'Data visualization tool for business insights',
        client: 'DataFlow Inc',
        technologies: ['Vue.js', 'Python', 'PostgreSQL'],
    },
    {
        id: 3,
        title: 'Music Streaming App',
        slug: 'music-streaming-app',
        description: 'Next-gen audio experience with social features',
        client: 'SoundWave',
        technologies: ['React Native', 'GraphQL', 'AWS'],
    },
];

/**
 * Featured Projects Section component
 * Displays a grid of featured portfolio items
 */
export const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({
    projects = defaultProjects,
    title = 'Featured Work',
    subtitle = 'Case Studies',
    className,
    showViewAll = true,
}) => {
    return (
        <section className={cn('flex flex-col lg:flex-row min-h-screen bg-agency-secondary dark:bg-agency-dark', className)}>
            <aside className="lg:w-[40%] lg:h-screen lg:sticky lg:top-0 p-10 lg:p-20 flex flex-col justify-center gap-8">
                <header>
                    <span className="text-agency-accent font-bold uppercase tracking-widest text-sm mb-4 block">
                        {subtitle}
                    </span>
                    <h2 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter text-agency-primary dark:text-white leading-[0.85]">
                        {title.split(' ')[0]} <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-current to-transparent opacity-30">
                            {title.split(' ').slice(1).join(' ') || 'Projects'}
                        </span>
                    </h2>
                </header>
                <div className="w-20 h-1 bg-agency-accent"></div>
                <p className="text-xl text-agency-primary/60 dark:text-white/60 max-w-sm">
                    Defining digital experiences for forward-thinking brands across the globe.
                </p>
                {showViewAll && (
                    <Link
                        href="/portfolio"
                        className="group flex items-center gap-4 text-agency-primary dark:text-white font-bold text-lg hover:text-agency-accent transition-colors underline decoration-agency-accent/30"
                    >
                        <span>View All Projects</span>
                        <div className="size-10 rounded-full border border-current flex items-center justify-center group-hover:bg-agency-accent group-hover:border-transparent group-hover:text-agency-primary transition-all">
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </div>
                    </Link>
                )}
            </aside>

            <main className="lg:w-[60%] p-6 lg:p-20 lg:pt-40 flex flex-col gap-12 lg:gap-20 border-l border-agency-primary/5 dark:border-white/5">
                {projects.map((project, index) => (
                    <AnimatedSection
                        key={project.id}
                        animation="slide-up"
                        delay={100}
                        className="group cursor-pointer"
                    >
                        <Link href={`/portfolio/${project.slug}`} className="block">
                            <div className="aspect-[4/5] rounded-[40px] overflow-hidden mb-8 relative shadow-2xl card-3d-hover">
                                {project.featured_image ? (
                                    <img 
                                        src={project.featured_image} 
                                        alt={project.title}
                                        loading="lazy"
                                        className="absolute inset-0 !w-full !h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-agency-accent/5 flex items-center justify-center text-8xl">
                                        🚀
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="size-32 rounded-full bg-agency-accent flex items-center justify-center font-black text-agency-primary text-sm tracking-widest scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 shadow-2xl">
                                        VIEW PROJECT
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-end border-b border-agency-primary/10 dark:border-white/10 pb-6">
                                <div className="max-w-md">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs font-mono opacity-40 uppercase tracking-widest">0{index + 1}</span>
                                        <div className="h-px w-8 bg-current opacity-20"></div>
                                        <span className="text-xs font-bold text-agency-accent uppercase tracking-widest">{project.client || 'Client'}</span>
                                    </div>
                                    <h3 className="text-4xl md:text-5xl font-black text-agency-primary dark:text-white group-hover:text-agency-accent transition-colors duration-300 tracking-tighter">
                                        {project.title}
                                    </h3>
                                    <p className="mt-4 text-agency-primary/60 dark:text-white/60 text-lg leading-relaxed">
                                        {project.description}
                                    </p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <div className="flex flex-wrap justify-end gap-2">
                                        {project.technologies?.slice(0, 2).map((tech, i) => (
                                            <span key={i} className="text-[10px] font-bold uppercase tracking-widest border border-current/20 px-3 py-1 rounded-full opacity-60">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </AnimatedSection>
                ))}
            </main>
        </section>
    );
};

export default FeaturedProjects;
