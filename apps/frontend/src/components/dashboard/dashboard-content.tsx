'use client';

/**
 * DASHBOARD - ATS Command Center
 *
 * Route: /dashboard
 * Purpose: Daily command center answering "What needs my attention today?"
 *
 * ============================================================================
 * PAGE DESIGN
 * ============================================================================
 *
 * +------------------------------------------------------------------+
 * |  Good morning, [Name]                          [Last 7 days v]    |
 * +------------------------------------------------------------------+
 * |                                                                    |
 * |  +-----------------+  +-----------------+  +-----------------+    |
 * |  |  8              |  |  3              |  |  2              |    |
 * |  |  New apps today |  |  Interviews     |  |  Offers pending |    |
 * |  |  [View ->]      |  |  this week      |  |  response       |    |
 * |  +-----------------+  +-----------------+  +-----------------+    |
 * |                                                                    |
 * |  NEEDS ATTENTION                                                   |
 * |  +--------------------------------------------------------------+  |
 * |  |  [!] 5 applications waiting > 3 days          [Review ->]    |  |
 * |  |  [!] 2 candidates in Interview > 7 days       [Follow up ->] |  |
 * |  +--------------------------------------------------------------+  |
 * |                                                                    |
 * |  RECENT ACTIVITY                                                   |
 * |  +--------------------------------------------------------------+  |
 * |  |  Jane Doe moved to Offer - Sr. Engineer        2 hours ago   |  |
 * |  |  New application - Product Manager             3 hours ago   |  |
 * |  |  Mike Smith rejected - Designer                Yesterday     |  |
 * |  |  [View all activity ->]                                      |  |
 * |  +--------------------------------------------------------------+  |
 * |                                                                    |
 * |  OPEN JOBS                                        [+ New Job]     |
 * |  +--------------------------------------------------------------+  |
 * |  |  Sr. Engineer      12 apps   2 in Interview   [Pipeline ->]  |  |
 * |  |  Product Manager    8 apps   1 in Offer       [Pipeline ->]  |  |
 * |  |  Designer           4 apps   0 in Interview   [Pipeline ->]  |  |
 * |  +--------------------------------------------------------------+  |
 * |                                                                    |
 * +------------------------------------------------------------------+
 *
 * ============================================================================
 * SECTIONS TO IMPLEMENT
 * ============================================================================
 *
 * 1. GREETING HEADER
 *    - "Good morning/afternoon/evening, {firstName}"
 *    - Time period selector (Last 7 days default)
 *
 * 2. QUICK STATS (3 cards)
 *    - New applications today/this week
 *    - Interviews scheduled this week
 *    - Offers pending response
 *    - Each card links to filtered Pipeline view
 *
 * 3. NEEDS ATTENTION (Alert cards)
 *    - Applications waiting > 3 days in Applied/Screening stage
 *    - Candidates stalled > 7 days in Interview stage
 *    - Each alert links to filtered view
 *    - Rules are simple: stale = needs attention
 *
 * 4. RECENT ACTIVITY (Timeline feed)
 *    - Last 5 timeline events across all jobs
 *    - Shows: candidate name, action, job, time ago
 *    - "View all activity" links to full activity page (optional)
 *
 * 5. OPEN JOBS (Quick access list)
 *    - Published jobs sorted by most applications
 *    - Shows: title, total apps, apps in interview
 *    - "Pipeline" button links to /dashboard/jobs/pipeline?id=xxx
 *    - "+ New Job" button in header
 *
 * ============================================================================
 * API ROUTES NEEDED
 * ============================================================================
 *
 * Option A: Single dashboard endpoint (recommended)
 * - API_ROUTES.DASHBOARD.SUMMARY - GET /dashboard/summary?period=7d
 *   Returns: { newApps, interviews, pendingOffers, needsAttention[],
 *              recentActivity[], openJobs[] }
 *
 * Option B: Multiple endpoints (parallel fetch)
 * - API_ROUTES.APPLICATIONS.STATS - GET /applications/stats
 * - API_ROUTES.APPLICATIONS.STALE - GET /applications/stale
 * - API_ROUTES.TIMELINE.RECENT - GET /timeline/recent?limit=5
 * - API_ROUTES.JOBS.ACTIVE - GET /jobs/active
 *
 * ============================================================================
 * COMPONENTS TO CREATE
 * ============================================================================
 *
 * - DashboardMetricCard - Stat card with icon, value, label, link
 * - NeedsAttentionAlert - Alert row with icon, message, action button
 * - ActivityFeedItem - Timeline item with avatar, action, time
 * - OpenJobRow - Job row with title, stats, pipeline button
 *
 * ============================================================================
 * BACKEND CALCULATIONS
 * ============================================================================
 *
 * New apps today:
 *   COUNT applications WHERE appliedAt >= today
 *
 * Interviews this week:
 *   COUNT applications WHERE status = 'interview'
 *     AND updatedAt >= startOfWeek
 *
 * Pending offers:
 *   COUNT applications WHERE status = 'offer'
 *
 * Stale applications:
 *   SELECT * FROM applications
 *   WHERE status IN ('applied', 'screening')
 *     AND updatedAt < now() - interval '3 days'
 *
 * Stalled interviews:
 *   SELECT * FROM applications
 *   WHERE status = 'interview'
 *     AND updatedAt < now() - interval '7 days'
 *
 * Recent activity:
 *   SELECT * FROM timeline
 *   WHERE entityType = 'application'
 *   ORDER BY createdAt DESC
 *   LIMIT 5
 */

import { useSession } from '@/contexts/session-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardContent() {
  const { user } = useSession();

  return (
    <div className="space-y-8 container mx-auto dark:text-dark-text">
      <div className="space-y-2">
        <h1 className="text-3xl font-medium tracking-tight">
          {getGreeting()}
          {user?.firstName ? `, ${user.firstName}` : ''}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Your recruiting command center
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-sm text-muted-foreground">New Applications</div>
          <div className="text-3xl font-bold mt-1">--</div>
          <div className="text-xs text-muted-foreground mt-1">this week</div>
        </Card>
        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-sm text-muted-foreground">In Interview</div>
          <div className="text-3xl font-bold mt-1">--</div>
          <div className="text-xs text-muted-foreground mt-1">candidates</div>
        </Card>
        <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-sm text-muted-foreground">Pending Offers</div>
          <div className="text-3xl font-bold mt-1">--</div>
          <div className="text-xs text-muted-foreground mt-1">
            awaiting response
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-medium mb-4">Needs Attention</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-amber-600">!</span>
              <span>-- applications waiting more than 3 days</span>
            </div>
            <Button variant="ghost" size="sm">
              Review
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-amber-600">!</span>
              <span>-- candidates in Interview stage more than 7 days</span>
            </div>
            <Button variant="ghost" size="sm">
              Follow up
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Alerts based on stale applications and stalled candidates
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="font-medium mb-4">Recent Activity</h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Activity feed will show here...</span>
            <span>--</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Timeline events from applications, status changes, and assignments
        </p>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Open Jobs</h3>
          <Link href="/dashboard/jobs/new">
            <Button size="sm">+ New Job</Button>
          </Link>
        </div>
        <Card className="p-6">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>Published jobs with application counts will show here...</p>
            <p className="text-xs">
              Each job links to its Pipeline view for quick candidate management
            </p>
          </div>
          <div className="mt-4">
            <Link href="/dashboard/jobs">
              <Button variant="outline" size="sm">
                View All Jobs
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-muted/30">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">
            ATS Dashboard - Implementation Notes
          </p>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            This dashboard will be the daily command center for recruiters. Each
            section links to detailed views (Pipeline, Jobs, Candidates). Needs
            Attention alerts use simple rules (stale = needs action). See the
            detailed plan in the page comments for full specifications.
          </p>
        </div>
      </Card>
    </div>
  );
}
