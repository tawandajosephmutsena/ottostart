<?php

namespace App\Http\Controllers;

use App\Models\TeamMember;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    /**
     * Display a listing of the team members.
     */
    public function index(): Response
    {
        $teamMembers = TeamMember::active()
            ->ordered()
            ->get();

        return Inertia::render('Team', [
            'teamMembers' => $teamMembers,
        ]);
    }
}
