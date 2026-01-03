<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeamMember;
use App\Http\Requests\Admin\TeamMemberRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TeamMemberController extends Controller
{
    /**
     * Display a listing of team members.
     */
    public function index(Request $request): Response
    {
        $query = TeamMember::query();

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('position', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('status')) {
            if ($request->status === 'active') {
                $query->active();
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            } elseif ($request->status === 'featured') {
                $query->featured();
            }
        }

        $teamMembers = $query->ordered()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/team/Index', [
            'teamMembers' => $teamMembers,
            'filters' => $request->only(['search', 'status']),
            'stats' => [
                'total' => TeamMember::count(),
                'active' => TeamMember::active()->count(),
                'featured' => TeamMember::featured()->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new team member.
     */
    public function create(): Response
    {
        return Inertia::render('admin/team/Create');
    }

    /**
     * Store a newly created team member.
     */
    public function store(TeamMemberRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $teamMember = TeamMember::create($validated);

        return redirect()->route('admin.team.show', $teamMember)
            ->with('success', 'Team member created successfully.');
    }

    /**
     * Display the specified team member.
     */
    public function show(TeamMember $team): Response
    {
        return Inertia::render('admin/team/Show', [
            'teamMember' => $team,
        ]);
    }

    /**
     * Show the form for editing the specified team member.
     */
    public function edit(TeamMember $team): Response
    {
        return Inertia::render('admin/team/Edit', [
            'teamMember' => $team,
        ]);
    }

    /**
     * Update the specified team member.
     */
    public function update(TeamMemberRequest $request, TeamMember $team): RedirectResponse
    {
        $validated = $request->validated();

        $team->update($validated);

        return redirect()->route('admin.team.show', $team)
            ->with('success', 'Team member updated successfully.');
    }

    /**
     * Remove the specified team member.
     */
    public function destroy(TeamMember $team): RedirectResponse
    {
        $team->delete();

        return redirect()->route('admin.team.index')
            ->with('success', 'Team member deleted successfully.');
    }

    /**
     * Toggle the featured status of a team member.
     */
    public function toggleFeatured(TeamMember $team): RedirectResponse
    {
        $team->update([
            'is_featured' => !$team->is_featured,
        ]);

        $status = $team->is_featured ? 'featured' : 'unfeatured';
        
        return back()->with('success', "Team member {$status} successfully.");
    }

    /**
     * Toggle the active status of a team member.
     */
    public function toggleActive(TeamMember $team): RedirectResponse
    {
        $team->update([
            'is_active' => !$team->is_active,
        ]);

        $status = $team->is_active ? 'activated' : 'deactivated';
        
        return back()->with('success', "Team member {$status} successfully.");
    }

    /**
     * Bulk actions for team members.
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:activate,deactivate,feature,unfeature,delete',
            'items' => 'required|array|min:1',
            'items.*' => 'exists:team_members,id',
        ]);

        $items = TeamMember::whereIn('id', $validated['items']);

        switch ($validated['action']) {
            case 'activate':
                $items->update(['is_active' => true]);
                $message = 'Team members activated successfully.';
                break;
            case 'deactivate':
                $items->update(['is_active' => false]);
                $message = 'Team members deactivated successfully.';
                break;
            case 'feature':
                $items->update(['is_featured' => true]);
                $message = 'Team members featured successfully.';
                break;
            case 'unfeature':
                $items->update(['is_featured' => false]);
                $message = 'Team members unfeatured successfully.';
                break;
            case 'delete':
                $items->delete();
                $message = 'Team members deleted successfully.';
                break;
        }

        return back()->with('success', $message);
    }

    /**
     * Update the sort order of team members.
     */
    public function updateOrder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:team_members,id',
            'items.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['items'] as $item) {
            TeamMember::where('id', $item['id'])->update([
                'sort_order' => $item['sort_order'],
            ]);
        }

        return back()->with('success', 'Team member order updated successfully.');
    }
}