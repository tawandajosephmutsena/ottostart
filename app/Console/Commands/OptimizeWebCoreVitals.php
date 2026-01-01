<?php

namespace App\Console\Commands;

use App\Services\WebCoreVitalsOptimizationService;
use Illuminate\Console\Command;

class OptimizeWebCoreVitals extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'optimize:web-core-vitals 
                            {--apply : Apply automatic optimizations}
                            {--report : Generate optimization report}';

    /**
     * The console command description.
     */
    protected $description = 'Optimize application for Web Core Vitals (LCP, FID, CLS)';

    /**
     * Execute the console command.
     */
    public function handle(WebCoreVitalsOptimizationService $optimizationService): int
    {
        $this->info('🚀 Web Core Vitals Optimization Tool');
        $this->newLine();

        if ($this->option('apply')) {
            return $this->applyOptimizations($optimizationService);
        }

        if ($this->option('report')) {
            return $this->generateReport($optimizationService);
        }

        // Default: Show analysis
        return $this->showAnalysis($optimizationService);
    }

    /**
     * Show Web Core Vitals analysis
     */
    private function showAnalysis(WebCoreVitalsOptimizationService $optimizationService): int
    {
        $this->info('📊 Analyzing Web Core Vitals optimization opportunities...');
        $this->newLine();

        $optimizations = $optimizationService->optimizeWebCoreVitals();

        // Display LCP optimizations
        $this->displayMetricOptimizations('Largest Contentful Paint (LCP)', $optimizations['lcp']);

        // Display FID optimizations
        $this->displayMetricOptimizations('First Input Delay (FID)', $optimizations['fid']);

        // Display CLS optimizations
        $this->displayMetricOptimizations('Cumulative Layout Shift (CLS)', $optimizations['cls']);

        // Display overall recommendations
        $this->displayOverallRecommendations($optimizations['overall']);

        $this->newLine();
        $this->info('💡 Run with --apply to automatically apply safe optimizations');
        $this->info('📋 Run with --report to generate a detailed report');

        return Command::SUCCESS;
    }

    /**
     * Apply automatic optimizations
     */
    private function applyOptimizations(WebCoreVitalsOptimizationService $optimizationService): int
    {
        $this->info('🔧 Applying automatic Web Core Vitals optimizations...');
        $this->newLine();

        $applied = $optimizationService->applyAutomaticOptimizations();

        if (empty($applied)) {
            $this->warn('No automatic optimizations were applied.');
            return Command::SUCCESS;
        }

        $this->info('✅ Applied optimizations:');
        foreach ($applied as $optimization) {
            $this->line("  • {$optimization}");
        }

        $this->newLine();
        $this->info('🎉 Automatic optimizations completed!');
        $this->info('💡 Run the analysis again to see remaining optimization opportunities');

        return Command::SUCCESS;
    }

    /**
     * Generate detailed report
     */
    private function generateReport(WebCoreVitalsOptimizationService $optimizationService): int
    {
        $this->info('📋 Generating Web Core Vitals optimization report...');
        $this->newLine();

        $optimizations = $optimizationService->optimizeWebCoreVitals();
        
        // Generate report content
        $report = $this->generateReportContent($optimizations);
        
        // Save report to file
        $reportPath = storage_path('logs/web-core-vitals-report-' . date('Y-m-d-H-i-s') . '.md');
        file_put_contents($reportPath, $report);

        $this->info("📄 Report saved to: {$reportPath}");
        $this->newLine();

        // Display summary
        $this->displayReportSummary($optimizations);

        return Command::SUCCESS;
    }

    /**
     * Display metric optimizations
     */
    private function displayMetricOptimizations(string $metricName, array $optimizations): void
    {
        if (empty($optimizations)) {
            $this->info("✅ {$metricName}: No issues found");
            $this->newLine();
            return;
        }

        $this->warn("⚠️  {$metricName}: Issues found");
        
        foreach ($optimizations as $category => $issues) {
            if (empty($issues)) continue;

            $this->line("  📂 " . ucwords(str_replace('_', ' ', $category)) . ":");
            
            foreach ($issues as $issue) {
                if (is_array($issue)) {
                    $this->line("    • {$issue['issue']}");
                    if (isset($issue['recommendation'])) {
                        $this->line("      💡 {$issue['recommendation']}");
                    }
                    if (isset($issue['count'])) {
                        $this->line("      📊 Count: {$issue['count']}");
                    }
                } else {
                    $this->line("    • {$issue}");
                }
            }
        }
        
        $this->newLine();
    }

    /**
     * Display overall recommendations
     */
    private function displayOverallRecommendations(array $recommendations): void
    {
        if (empty($recommendations)) {
            return;
        }

        $this->info('🎯 Overall Recommendations:');
        
        foreach ($recommendations as $recommendation) {
            $priority = strtoupper($recommendation['priority']);
            $icon = match($recommendation['priority']) {
                'high' => '🔴',
                'medium' => '🟡',
                'low' => '🟢',
                default => '⚪'
            };
            
            $this->line("  {$icon} [{$priority}] {$recommendation['title']}");
            $this->line("    {$recommendation['description']}");
            $this->line("    Action: {$recommendation['action']}");
        }
        
        $this->newLine();
    }

    /**
     * Generate report content
     */
    private function generateReportContent(array $optimizations): string
    {
        $report = "# Web Core Vitals Optimization Report\n\n";
        $report .= "Generated: " . date('Y-m-d H:i:s') . "\n\n";

        // Executive Summary
        $totalIssues = $this->countTotalIssues($optimizations);
        $report .= "## Executive Summary\n\n";
        $report .= "- **Total Issues Found**: {$totalIssues}\n";
        $report .= "- **LCP Issues**: " . $this->countMetricIssues($optimizations['lcp']) . "\n";
        $report .= "- **FID Issues**: " . $this->countMetricIssues($optimizations['fid']) . "\n";
        $report .= "- **CLS Issues**: " . $this->countMetricIssues($optimizations['cls']) . "\n\n";

        // Detailed findings
        $report .= "## Detailed Findings\n\n";
        
        foreach (['lcp' => 'Largest Contentful Paint', 'fid' => 'First Input Delay', 'cls' => 'Cumulative Layout Shift'] as $key => $name) {
            $report .= "### {$name}\n\n";
            
            if (empty($optimizations[$key])) {
                $report .= "✅ No issues found\n\n";
                continue;
            }
            
            foreach ($optimizations[$key] as $category => $issues) {
                $report .= "#### " . ucwords(str_replace('_', ' ', $category)) . "\n\n";
                
                foreach ($issues as $issue) {
                    if (is_array($issue)) {
                        $report .= "- **Issue**: {$issue['issue']}\n";
                        if (isset($issue['recommendation'])) {
                            $report .= "  - **Recommendation**: {$issue['recommendation']}\n";
                        }
                        if (isset($issue['count'])) {
                            $report .= "  - **Count**: {$issue['count']}\n";
                        }
                        $report .= "\n";
                    }
                }
            }
        }

        // Recommendations
        $report .= "## Recommendations\n\n";
        foreach ($optimizations['overall'] as $recommendation) {
            $report .= "### {$recommendation['title']} ({$recommendation['priority']} priority)\n\n";
            $report .= "{$recommendation['description']}\n\n";
            $report .= "**Action**: {$recommendation['action']}\n\n";
        }

        return $report;
    }

    /**
     * Count total issues
     */
    private function countTotalIssues(array $optimizations): int
    {
        $total = 0;
        
        foreach (['lcp', 'fid', 'cls'] as $metric) {
            $total += $this->countMetricIssues($optimizations[$metric]);
        }
        
        return $total;
    }

    /**
     * Count metric issues
     */
    private function countMetricIssues(array $metricOptimizations): int
    {
        $count = 0;
        
        foreach ($metricOptimizations as $category) {
            if (is_array($category)) {
                $count += count($category);
            } else {
                $count++;
            }
        }
        
        return $count;
    }

    /**
     * Display report summary
     */
    private function displayReportSummary(array $optimizations): void
    {
        $totalIssues = $this->countTotalIssues($optimizations);
        
        if ($totalIssues === 0) {
            $this->info('🎉 Excellent! No Web Core Vitals issues found.');
        } elseif ($totalIssues <= 5) {
            $this->info("✅ Good! Only {$totalIssues} minor issues found.");
        } elseif ($totalIssues <= 15) {
            $this->warn("⚠️  Moderate: {$totalIssues} issues found that should be addressed.");
        } else {
            $this->error("🚨 Critical: {$totalIssues} issues found that need immediate attention.");
        }

        $this->newLine();
        $this->info('📈 Priority Actions:');
        
        $highPriorityRecommendations = array_filter($optimizations['overall'], function($rec) {
            return $rec['priority'] === 'high';
        });
        
        if (empty($highPriorityRecommendations)) {
            $this->line('  • Continue monitoring Web Core Vitals metrics');
            $this->line('  • Implement remaining medium and low priority optimizations');
        } else {
            foreach ($highPriorityRecommendations as $rec) {
                $this->line("  • {$rec['title']}");
            }
        }
    }
}