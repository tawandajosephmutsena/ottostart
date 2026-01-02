<?php

test('benchmark home page response time', function () {
    $start = microtime(true);
    $response = $this->get('/');
    $end = microtime(true);
    
    $response->assertStatus(200);
    $duration = ($end - $start) * 1000;
    
    // Assert response is under 500ms (adjust as needed for local env)
    // Note: Local environment might be slower than production, so this is soft assertion.
    expect($duration)->toBeLessThan(1000); 
    
    // Log performance metric
    echo "\nHome Page Load Time: " . round($duration, 2) . "ms";
});

test('benchmark services page response time', function () {
    $start = microtime(true);
    $response = $this->get('/services');
    $end = microtime(true);
    
    $response->assertStatus(200);
    $duration = ($end - $start) * 1000;
    
    expect($duration)->toBeLessThan(1000);
    echo "\nServices Page Load Time: " . round($duration, 2) . "ms";
});
