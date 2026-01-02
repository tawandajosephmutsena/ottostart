<?php

use App\Models\User;
use Laravel\Dusk\Browser;

test('contact form submission', function () {
    $this->browse(function (Browser $browser) {
        $browser->visit('/contact')
                ->waitFor('form', 5)
                ->type('name', 'Dusk User')
                ->type('email', 'dusk@example.com')
                ->select('type', 'project') // Value from Contact.tsx select options
                ->type('message', 'This is a test message via Laravel Dusk.')
                ->press('SEND MESSAGE') 
                ->waitForText('Message Sent!')
                ->assertSee('Message Sent!');
    });
});

test('admin login flow', function () {
    // Cleanup previous run if exists
    User::where('email', 'admin_dusk@example.com')->delete();

    $user = User::factory()->create([
        'email' => 'admin_dusk@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
        'is_active' => true,
    ]);

    $this->browse(function (Browser $browser) use ($user) {
        $browser->visit('/login')
                ->type('email', $user->email)
                ->type('password', 'password')
                ->press('Log in')
                ->pause(2000) // Wait specifically for redirection
                ->screenshot('admin_login_redirect')
                ->assertPathIs('/admin');
    });

    // Cleanup after test
    $user->delete();
});
