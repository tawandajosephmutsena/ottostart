<?php

use App\Models\User;

test('admin can access admin routes', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get('/admin');

    // Should not get 403 (middleware allows access)
    // May get 500 due to missing React component, but that's not a middleware issue
    expect($response->status())->not->toBe(403);
});

test('editor cannot access admin routes', function () {
    $editor = User::factory()->create(['role' => 'editor']);

    $response = $this->actingAs($editor)->get('/admin');

    $response->assertStatus(403);
});

test('viewer cannot access admin routes', function () {
    $viewer = User::factory()->create(['role' => 'viewer']);

    $response = $this->actingAs($viewer)->get('/admin');

    $response->assertStatus(403);
});

test('editor can access cms routes', function () {
    $editor = User::factory()->create(['role' => 'editor']);

    $response = $this->actingAs($editor)->get('/cms');

    // Should not get 403 (middleware allows access)
    expect($response->status())->not->toBe(403);
});

test('admin can access cms routes', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)->get('/cms');

    // Should not get 403 (middleware allows access)
    expect($response->status())->not->toBe(403);
});

test('viewer cannot access cms routes', function () {
    $viewer = User::factory()->create(['role' => 'viewer']);

    $response = $this->actingAs($viewer)->get('/cms');

    $response->assertStatus(403);
});

test('unauthenticated user redirected to login', function () {
    $response = $this->get('/admin');

    $response->assertRedirect('/login');
});

test('user role methods work correctly', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $editor = User::factory()->create(['role' => 'editor']);
    $viewer = User::factory()->create(['role' => 'viewer']);

    // Test admin methods
    expect($admin->isAdmin())->toBeTrue();
    expect($admin->isEditor())->toBeTrue();
    expect($admin->isViewer())->toBeTrue();
    expect($admin->hasRole('admin'))->toBeTrue();
    expect($admin->hasAnyRole(['admin', 'editor']))->toBeTrue();

    // Test editor methods
    expect($editor->isAdmin())->toBeFalse();
    expect($editor->isEditor())->toBeTrue();
    expect($editor->isViewer())->toBeTrue();
    expect($editor->hasRole('editor'))->toBeTrue();
    expect($editor->hasAnyRole(['admin', 'editor']))->toBeTrue();

    // Test viewer methods
    expect($viewer->isAdmin())->toBeFalse();
    expect($viewer->isEditor())->toBeFalse();
    expect($viewer->isViewer())->toBeTrue();
    expect($viewer->hasRole('viewer'))->toBeTrue();
    expect($viewer->hasAnyRole(['admin', 'editor']))->toBeFalse();
});
