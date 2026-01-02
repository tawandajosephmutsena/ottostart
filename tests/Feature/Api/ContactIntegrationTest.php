<?php

namespace Tests\Feature\Api;

use App\Models\ContactInquiry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ContactIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_stores_contact_inquiry()
    {
        $data = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'type' => 'Business',
            'message' => 'This is a test message with enough characters.',
        ];

        $response = $this->post(route('contact.store'), $data);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('contact_inquiries', [
            'email' => 'test@example.com',
            'status' => 'new',
        ]);
        
        $inquiry = ContactInquiry::where('email', 'test@example.com')->first();
        $this->assertEquals('Business Inquiry', $inquiry->subject);
    }

    public function test_it_validates_contact_inquiry()
    {
        $response = $this->post(route('contact.store'), []);

        $response->assertSessionHasErrors(['name', 'email', 'type', 'message']);
    }
}
