<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactInquiryController extends Controller
{
    /**
     * Display a listing of the inquiries.
     */
    public function index()
    {
        $inquiries = ContactInquiry::latest()
            ->paginate(15);

        return Inertia::render('admin/contact-inquiries/Index', [
            'inquiries' => $inquiries
        ]);
    }

    /**
     * Display the specified inquiry.
     */
    public function show(ContactInquiry $contactInquiry)
    {
        if ($contactInquiry->status === 'new') {
            $contactInquiry->update(['status' => 'read']);
        }

        return Inertia::render('admin/contact-inquiries/Show', [
            'inquiry' => $contactInquiry
        ]);
    }

    /**
     * Update the status of an inquiry.
     */
    public function update(Request $request, ContactInquiry $contactInquiry)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:new,read,replied,archived',
        ]);

        $contactInquiry->update($validated);

        return back()->with('success', 'Inquiry status updated.');
    }

    /**
     * Remove the specified inquiry from storage.
     */
    public function destroy(ContactInquiry $contactInquiry)
    {
        $contactInquiry->delete();

        return redirect()->route('admin.contact-inquiries.index')
            ->with('success', 'Inquiry deleted successfully.');
    }
}
