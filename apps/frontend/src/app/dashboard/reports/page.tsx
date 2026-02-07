'use client';

/**
 * REPORTS PAGE - Shopify-style Analytics Dashboard
 *
 * Route: /dashboard/reports
 * Permission: JOB_READ (or create a dedicated REPORTS_READ permission)
 * Priority: V1.1 (Post-MVP)
 *
 * ============================================================================
 * PAGE DESIGN (Shopify-inspired)
 * ============================================================================
 *
 * +------------------------------------------------------------------+
 * |  Reports                                        [Last 30 days v] |
 * +------------------------------------------------------------------+
 * |                                                                    |
 * |  HIRING VELOCITY                           PIPELINE HEALTH         |
 * |  +---------------------------+             +--------------------+  |
 * |  |  12 hires this month      |             |  78%               |  |
 * |  |  ^ 3 from last month      |             |  Pipeline active   |  |
 * |  |  [Sparkline trend]        |             |  42 active apps    |  |
 * |  +---------------------------+             +--------------------+  |
 * |                                                                    |
 * |  TIME METRICS                                                      |
 * |  +---------------------------+  +---------------------------+      |
 * |  |  18 days                  |  |  4.2 days                 |      |
 * |  |  Avg. time to hire        |  |  Avg. time in stage       |      |
 * |  |  v 3 days faster          |  |  Screening longest (6d)   |      |
 * |  +---------------------------+  +---------------------------+      |
 * |                                                                    |
 * |  +--------------------------------------------------------------+  |
 * |  |  APPLICATIONS BY STATUS                                       |  |
 * |  |  [Horizontal stacked bar chart]                               |  |
 * |  |                                                               |  |
 * |  |  Applied     ████████████████████  32                        |  |
 * |  |  Screening   ██████████  18                                   |  |
 * |  |  Interview   ██████  12                                       |  |
 * |  |  Offer       ██  4                                            |  |
 * |  |  Hired       ███  6                                           |  |
 * |  +--------------------------------------------------------------+  |
 * |                                                                    |
 * |  +--------------------------------------------------------------+  |
 * |  |  APPLICATIONS OVER TIME                    [Weekly v]         |  |
 * |  |  [Line chart showing trend]                                   |  |
 * |  |                                                               |  |
 * |  |      ╭─╮                                                      |  |
 * |  |    ╭─╯ ╰─╮    ╭──╮                                           |  |
 * |  |  ──╯     ╰────╯  ╰──                                         |  |
 * |  |  W1   W2   W3   W4                                           |  |
 * |  +--------------------------------------------------------------+  |
 * |                                                                    |
 * |  +---------------------------+  +---------------------------+      |
 * |  |  TOP SOURCES              |  |  JOBS PERFORMANCE         |      |
 * |  |  LinkedIn      45%  ████  |  |  Sr. Engineer    24 apps  |      |
 * |  |  Referral      28%  ███   |  |  Product Manager 18 apps  |      |
 * |  |  Direct Apply  18%  ██    |  |  Designer        12 apps  |      |
 * |  |  Indeed         9%  █     |  |  [View all ->]            |      |
 * |  +---------------------------+  +---------------------------+      |
 * |                                                                    |
 * +------------------------------------------------------------------+
 *
 * ============================================================================
 * METRICS TO DISPLAY
 * ============================================================================
 *
 * Tier 1 - Top Cards (Always Show):
 * 1. Hires this period - Ultimate outcome metric
 * 2. Pipeline health % - Applications moving vs stalled
 * 3. Time to hire - Efficiency indicator
 * 4. Active applications - Current workload
 *
 * Tier 2 - Charts:
 * 5. Applications by status - Funnel/bar visualization
 * 6. Applications over time - Trend line
 *
 * Tier 3 - Tables:
 * 7. Source breakdown - Where candidates come from
 * 8. Jobs by application count - Which roles are hot/cold
 *
 * ============================================================================
 * TIME PERIOD SELECTOR
 * ============================================================================
 *
 * Options:
 * - Last 7 days
 * - Last 30 days (default)
 * - Last 90 days
 * - This year
 * - Custom range (V1.2)
 *
 * ============================================================================
 * WHAT NOT TO INCLUDE (Keep It Simple)
 * ============================================================================
 *
 * - Conversion rates between stages (requires more data maturity)
 * - Recruiter performance comparisons (politically sensitive)
 * - Cost-per-hire (requires budget integration)
 * - Detailed source ROI (requires attribution complexity)
 * - Exportable reports (just screenshot for now)
 * - Scheduled email reports (premature automation)
 *
 * ============================================================================
 * COMPONENTS TO CREATE
 * ============================================================================
 *
 * - MetricCard - Reusable card with value, label, trend indicator
 * - ApplicationsStatusChart - Horizontal bar chart
 * - ApplicationsTrendChart - Line chart over time
 * - SourceBreakdownTable - Simple table with percentages
 * - JobsPerformanceTable - Jobs ranked by applications
 * - TimePeriodSelector - Dropdown for date range
 *
 * ============================================================================
 * CHARTING LIBRARY OPTIONS
 * ============================================================================
 *
 * Recommended: recharts (React-based, declarative, good defaults)
 *   pnpm --filter frontend add recharts
 *
 * Alternative: Chart.js with react-chartjs-2
 * Alternative: Lightweight custom SVG charts
 *
 * ============================================================================
 * API ROUTES NEEDED
 * ============================================================================
 *
 * Option A: Single aggregated endpoint
 * - API_ROUTES.REPORTS.DASHBOARD - GET /reports/dashboard?period=30d
 *   Returns: { hires, pipelineHealth, avgTimeToHire, avgTimeInStage,
 *              applicationsByStatus, applicationsTrend, sourceBreakdown,
 *              jobsPerformance }
 *
 * Option B: Multiple focused endpoints
 * - API_ROUTES.REPORTS.HIRING_METRICS - GET /reports/hiring?period=30d
 * - API_ROUTES.REPORTS.APPLICATIONS - GET /reports/applications?period=30d
 * - API_ROUTES.REPORTS.SOURCES - GET /reports/sources?period=30d
 *
 * ============================================================================
 * BACKEND IMPLEMENTATION NOTES
 * ============================================================================
 *
 * Metrics calculations:
 *
 * 1. Hires this period:
 *    COUNT applications WHERE status = 'hired' AND updatedAt >= periodStart
 *
 * 2. Pipeline health %:
 *    (Applications with status change in last 7 days / Total active) * 100
 *
 * 3. Avg time to hire:
 *    AVG(updatedAt - appliedAt) WHERE status = 'hired' AND period
 *
 * 4. Avg time in stage:
 *    Use timeline events to calculate time between status changes
 *
 * 5. Applications by status:
 *    GROUP BY status, COUNT
 *
 * 6. Applications trend:
 *    GROUP BY date/week, COUNT WHERE appliedAt in period
 *
 * 7. Source breakdown:
 *    JOIN candidates, GROUP BY source, COUNT, calculate %
 *
 * 8. Jobs performance:
 *    JOIN jobs, GROUP BY jobId, COUNT, ORDER BY count DESC
 */

import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function ReportsContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Reports</h2>
          <p className="text-sm text-muted-foreground">
            Hiring analytics and performance metrics
          </p>
        </div>
        <Badge variant="secondary">V1.1 - Coming Soon</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Hires This Month</div>
          <div className="text-2xl font-bold">--</div>
          <div className="text-xs text-muted-foreground">vs last month</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pipeline Health</div>
          <div className="text-2xl font-bold">--%</div>
          <div className="text-xs text-muted-foreground">
            active applications
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Avg. Time to Hire</div>
          <div className="text-2xl font-bold">-- days</div>
          <div className="text-xs text-muted-foreground">vs last month</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">
            Active Applications
          </div>
          <div className="text-2xl font-bold">--</div>
          <div className="text-xs text-muted-foreground">in pipeline</div>
        </Card>
      </div>

      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="text-4xl">📊</div>
          <h3 className="text-lg font-medium">Analytics Dashboard</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Shopify-style analytics with hiring velocity, pipeline health,
            source effectiveness, and job performance metrics.
          </p>
          <div className="pt-4 text-sm text-muted-foreground">
            <p className="font-medium">Metrics to implement:</p>
            <ul className="mt-2 space-y-1">
              <li>Hires this period with trend comparison</li>
              <li>Pipeline health percentage</li>
              <li>Average time to hire and time in stage</li>
              <li>Applications by status (bar chart)</li>
              <li>Applications over time (line chart)</li>
              <li>Top sources breakdown</li>
              <li>Jobs ranked by application count</li>
            </ul>
          </div>
          <div className="pt-4 text-sm text-muted-foreground">
            <p className="font-medium">Time period options:</p>
            <p>Last 7 days | Last 30 days | Last 90 days | This year</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <PermissionGuard
      permissions={PERMISSIONS_ENUM.JOB_READ}
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don&apos;t have permission to view reports
        </div>
      }
    >
      <ReportsContent />
    </PermissionGuard>
  );
}
