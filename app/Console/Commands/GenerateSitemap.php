<?php

namespace App\Console\Commands;

use App\Models\Insight;
use App\Models\Page;
use App\Models\PortfolioItem;
use App\Models\Service;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sitemap:generate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate the sitemap.xml file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating sitemap...');

        $sitemap = \Spatie\Sitemap\Sitemap::create()
            ->add(\Spatie\Sitemap\Tags\Url::create('/')
                ->setPriority(1.0)
                ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_DAILY))
            ->add(\Spatie\Sitemap\Tags\Url::create('/about')
                ->setPriority(0.8)
                ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_MONTHLY))
            ->add(\Spatie\Sitemap\Tags\Url::create('/contact')
                ->setPriority(0.8)
                ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_MONTHLY))
            ->add(\Spatie\Sitemap\Tags\Url::create('/portfolio')
                ->setPriority(0.9)
                ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_WEEKLY))
            ->add(\Spatie\Sitemap\Tags\Url::create('/services')
                ->setPriority(0.9)
                ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_MONTHLY))
            ->add(\Spatie\Sitemap\Tags\Url::create('/blog')
                ->setPriority(0.9)
                ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_WEEKLY))
            ->add(\Spatie\Sitemap\Tags\Url::create('/team')
                ->setPriority(0.7)
                ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_MONTHLY));

        // Dynamic Pages
        Page::where('is_published', true)->each(function ($page) use ($sitemap) {
            if ($page->slug === 'home') return;
            // Avoid duplicates with static pages if they exist as dynamic pages
            if (in_array($page->slug, ['about', 'contact', 'portfolio', 'services', 'blog', 'team'])) return;

            $sitemap->add(\Spatie\Sitemap\Tags\Url::create("/{$page->slug}")
                ->setPriority(0.8)
                ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_WEEKLY)
                ->setLastModificationDate($page->updated_at));
        });

        // Portfolio
        PortfolioItem::published()->each(function ($item) use ($sitemap) {
            $sitemap->add(\Spatie\Sitemap\Tags\Url::create("/portfolio/{$item->slug}")
                ->setPriority(0.8)
                ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_MONTHLY)
                ->setLastModificationDate($item->updated_at));
        });

        // Services
        Service::published()->each(function ($item) use ($sitemap) {
            $sitemap->add(\Spatie\Sitemap\Tags\Url::create("/services/{$item->slug}")
                ->setPriority(0.8)
                ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_MONTHLY)
                ->setLastModificationDate($item->updated_at));
        });

        // Insights
        Insight::published()->each(function ($item) use ($sitemap) {
            $sitemap->add(\Spatie\Sitemap\Tags\Url::create("/blog/{$item->slug}")
                ->setPriority(0.7)
                ->setChangeFrequency(\Spatie\Sitemap\Tags\Url::CHANGE_FREQUENCY_WEEKLY)
                ->setLastModificationDate($item->updated_at));
        });

        $sitemap->writeToFile(public_path('sitemap.xml'));

        $this->info('Sitemap generated successfully at public/sitemap.xml');
    }
}
