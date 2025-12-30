<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PortfolioItem;
use App\Models\Service;
use App\Models\Insight;
use App\Models\TeamMember;
use App\Models\MediaAsset;
use App\Models\User;
use App\Models\ContactInquiry;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Display the admin dashboard with overview statistics and quick actions.
     */
    public function dashboard(): Response
    {
        $stats = [
            'portfolio_items' => [
                'total' => PortfolioItem::count(),
                'published' => PortfolioItem::published()->count(),
                'featured' => PortfolioItem::featured()->count(),
            ],
            'services' => [
                'total' => Service::count(),
                'published' => Service::published()->count(),
                'featured' => Service::featured()->count(),
            ],
            'insights' => [
                'total' => Insight::count(),
                'published' => Insight::published()->count(),
                'featured' => Insight::featured()->count(),
            ],
            'team_members' => [
                'total' => TeamMember::count(),
                'active' => TeamMember::active()->count(),
                'featured' => TeamMember::featured()->count(),
            ],
            'media_assets' => [
                'total' => MediaAsset::count(),
                'images' => MediaAsset::images()->count(),
                'videos' => MediaAsset::videos()->count(),
            ],
            'users' => [
                'total' => User::count(),
                'admins' => User::where('role', 'admin')->count(),
                'editors' => User::where('role', 'editor')->count(),
            ],
            'contact_inquiries' => [
                'total' => ContactInquiry::count(),
                'new' => ContactInquiry::where('status', 'new')->count(),
                'unread' => ContactInquiry::whereIn('status', ['new', 'read'])->count(),
            ],
        ];

        // Recent activity
        $recent_portfolio = PortfolioItem::latest()->take(5)->get(['id', 'title', 'created_at', 'is_published']);
        $recent_insights = Insight::latest()->take(5)->get(['id', 'title', 'created_at', 'is_published']);
        $recent_inquiries = ContactInquiry::latest()->take(5)->get(['id', 'name', 'subject', 'status', 'created_at']);

        return Inertia::render('admin/Dashboard', [
            'stats' => $stats,
            'recent_activity' => [
                'portfolio' => $recent_portfolio,
                'insights' => $recent_insights,
                'inquiries' => $recent_inquiries,
            ],
        ]);
    }

    /**
     * Get quick action data for dashboard widgets.
     */
    public function quickActions()
    {
        return response()->json([
            'actions' => [
                [
                    'title' => 'New Portfolio Item',
                    'description' => 'Add a new project to showcase',
                    'route' => 'admin.portfolio.create',
                    'icon' => 'plus-circle',
                    'color' => 'blue',
                ],
                [
                    'title' => 'New Blog Post',
                    'description' => 'Write a new insight or article',
                    'route' => 'admin.insights.create',
                    'icon' => 'document-text',
                    'color' => 'green',
                ],
                [
                    'title' => 'Upload Media',
                    'description' => 'Add images and files',
                    'route' => 'admin.media.upload',
                    'icon' => 'photograph',
                    'color' => 'purple',
                ],
                [
                    'title' => 'Manage Team',
                    'description' => 'Add or update team members',
                    'route' => 'admin.team.index',
                    'icon' => 'user-group',
                    'color' => 'orange',
                ],
            ],
        ]);
    }
}