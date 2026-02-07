'use client';

/**
 * PIPELINE PAGE - Kanban Board for Applications
 *
 * Route: /dashboard/jobs/pipeline?id=xxx
 * Permission: APPLICATION_READ
 *
 * ============================================================================
 * PAGE DESIGN
 * ============================================================================
 *
 * Horizontal Kanban board with drag-and-drop using @dnd-kit
 *
 * +------------------------------------------------------------------+
 * |  <- Jobs    Sr. Software Engineer              [Edit] [Close Job] |
 * +------------------------------------------------------------------+
 * |  [Search candidates...]                    [Filter: Assignee v]   |
 * +------------------------------------------------------------------+
 * |                                                                    |
 * |  Applied (8)    Screening (6)   Interview (4)   Offer (2)  Hired |
 * |  +-----------+  +-----------+   +-----------+   +---------+ +---+|
 * |  | Jane Doe  |  | Mike S.   |   | Sarah L.  |   | Tom B.  | | 2 ||
 * |  | 2 days    |  | 5 days    |   | 1 week    |   | 3 days  | |   ||
 * |  | [Resume]  |  |    !      |   |           |   |         | |   ||
 * |  +-----------+  +-----------+   +-----------+   +---------+ +---+|
 * |  | Alex T.   |  | Kim J.    |   | Pat M.    |   | Lee C.  |     |
 * |  | 1 day     |  | 3 days    |   | 3 days    |   | 1 day   |     |
 * |  +-----------+  +-----------+   +-----------+   +---------+     |
 * |  | ...       |  | ...       |   | ...       |                    |
 * |  +-----------+  +-----------+   +-----------+                    |
 * |                                                                    |
 * +------------------------------------------------------------------+
 *
 * ============================================================================
 * PIPELINE STAGES (Fixed - Not Configurable)
 * ============================================================================
 *
 * 1. Applied    - New applications
 * 2. Screening  - Initial review
 * 3. Interview  - In interview process
 * 4. Offer      - Offer extended
 * 5. Hired      - Accepted (collapsed, shows count only)
 * 6. Rejected   - Declined (hidden by default, toggle to show)
 *
 * ============================================================================
 * FEATURES TO IMPLEMENT
 * ============================================================================
 *
 * 1. Kanban Board:
 *    - Horizontal columns for each stage
 *    - Drag-drop cards between columns using @dnd-kit
 *    - Visual feedback during drag
 *    - Auto-scroll when dragging near edges
 *
 * 2. Pipeline Card:
 *    - Candidate name (first + last)
 *    - Time in current stage (e.g., "2 days", "1 week")
 *    - Resume indicator if attachment exists
 *    - Warning icon if stalled > 5 days
 *    - Assigned to avatar (if assigned)
 *
 * 3. Card Click -> Slide-out Panel:
 *    - Candidate contact info
 *    - Source badge
 *    - Resume viewer/download
 *    - Current stage with quick actions:
 *      [Advance ->] moves to next stage
 *      [Reject] opens rejection reason picker
 *    - Notes section (add/view)
 *    - Timeline (read-only, auto-generated)
 *
 * 4. Filters:
 *    - Search by candidate name
 *    - Filter by assignee (team member dropdown)
 *
 * 5. Job Header:
 *    - Back arrow to Jobs list
 *    - Job title and metadata
 *    - Edit job button
 *    - Close job button (if published)
 *
 * ============================================================================
 * DRAG-DROP IMPLEMENTATION (@dnd-kit)
 * ============================================================================
 *
 * Dependencies:
 *   pnpm --filter frontend add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
 *
 * Components:
 *   - DndContext - Wraps the entire board
 *   - SortableContext - Wraps each column
 *   - useSortable - Hook for draggable cards
 *   - DragOverlay - Visual feedback during drag
 *
 * On Drop:
 *   - Call API_ROUTES.APPLICATIONS.UPDATE_STATUS(applicationId)
 *   - Optimistic update (move card immediately, revert on error)
 *   - Toast on success/error
 *
 * ============================================================================
 * CANDIDATE SLIDE-OUT PANEL
 * ============================================================================
 *
 * +------------------------------------------+
 * | Jane Doe                              X  |
 * +------------------------------------------+
 * | jane@email.com                           |
 * | Applied via LinkedIn                     |
 * | 2 days ago                               |
 * +------------------------------------------+
 * | [View Resume]         [Download Resume]  |
 * +------------------------------------------+
 * | Stage: Applied                           |
 * | [Advance to Screening ->]    [Reject]    |
 * +------------------------------------------+
 * | NOTES                                    |
 * | Strong background in React...            |
 * | - Added by Sarah, Jan 15                 |
 * | [+ Add note]                             |
 * +------------------------------------------+
 * | TIMELINE                                 |
 * | Applied - Jan 15, 2025                   |
 * |   via LinkedIn                           |
 * +------------------------------------------+
 *
 * ============================================================================
 * API ROUTES NEEDED
 * ============================================================================
 *
 * - API_ROUTES.JOBS.GET(id) - GET /jobs/:id (job details for header)
 * - API_ROUTES.APPLICATIONS.LIST - POST /applications/list (with jobId filter)
 * - API_ROUTES.APPLICATIONS.UPDATE_STATUS(id) - POST /applications/:id/status
 * - API_ROUTES.APPLICATIONS.ASSIGN(id) - POST /applications/:id/assign
 * - API_ROUTES.COMMENTS.LIST - POST /comments/list (with entityType=application)
 * - API_ROUTES.COMMENTS.CREATE - POST /comments
 * - API_ROUTES.TIMELINE.LIST - POST /timeline/list (with entityType=application)
 * - API_ROUTES.ATTACHMENTS.LIST - POST /attachments/list (for resume)
 *
 * ============================================================================
 * COMPONENTS TO CREATE
 * ============================================================================
 *
 * - PipelineBoard - Main kanban container with DndContext
 * - PipelineColumn - Single column (Applied, Screening, etc.)
 * - PipelineCard - Draggable candidate card
 * - CandidateSlideOut - Slide-out panel with details and actions
 * - RejectionReasonPicker - Modal/dropdown for rejection reasons
 * - NotesList - Display and add notes
 * - TimelineView - Read-only timeline of events
 *
 * ============================================================================
 * TYPES NEEDED (types/application.type.ts)
 * ============================================================================
 *
 * interface Application {
 *   id: string;
 *   jobId: string;
 *   candidateId: string;
 *   status: ApplicationStatus;
 *   assignedToId?: string;
 *   assignedTo?: { id: string; firstName?: string; lastName?: string };
 *   rejectionReason?: string;
 *   appliedAt: string;
 *   candidate: {
 *     id: string;
 *     firstName: string;
 *     lastName: string;
 *     email: string;
 *     source: CandidateSource;
 *   };
 *   createdAt: string;
 *   updatedAt: string;
 * }
 *
 * enum ApplicationStatus {
 *   APPLIED = 'applied',
 *   SCREENING = 'screening',
 *   INTERVIEW = 'interview',
 *   OFFER = 'offer',
 *   HIRED = 'hired',
 *   REJECTED = 'rejected',
 *   WITHDRAWN = 'withdrawn',
 * }
 */

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

function PipelineContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('id');

  if (!jobId) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No job selected. Please select a job from the Jobs list.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/jobs">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-lg font-medium">Pipeline: Job Title Here</h2>
          <p className="text-sm text-muted-foreground">
            Engineering - Remote - Published
          </p>
        </div>
        <Button variant="outline">Edit</Button>
        <Button variant="destructive">Close Job</Button>
      </div>

      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="text-4xl">📋</div>
          <h3 className="text-lg font-medium">Application Pipeline</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Drag-and-drop kanban board to manage candidates through the hiring
            process. Move candidates between stages with a simple drag.
          </p>

          <div className="pt-4">
            <div className="flex justify-center gap-4 text-sm">
              <div className="px-3 py-2 bg-muted rounded-md">Applied</div>
              <div className="px-3 py-2 bg-muted rounded-md">Screening</div>
              <div className="px-3 py-2 bg-muted rounded-md">Interview</div>
              <div className="px-3 py-2 bg-muted rounded-md">Offer</div>
              <div className="px-3 py-2 bg-green-100 dark:bg-green-900 rounded-md">
                Hired
              </div>
            </div>
          </div>

          <div className="pt-4 text-sm text-muted-foreground">
            <p className="font-medium">Features to implement:</p>
            <ul className="mt-2 space-y-1">
              <li>Drag-drop kanban with @dnd-kit</li>
              <li>Candidate cards with time-in-stage indicator</li>
              <li>Click card for slide-out with details</li>
              <li>Quick actions: Advance, Reject with reasons</li>
              <li>Notes and Timeline sections</li>
              <li>Resume attachment viewer</li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground pt-2">Job ID: {jobId}</p>
        </div>
      </Card>
    </div>
  );
}

export default function PipelinePage() {
  return (
    <PermissionGuard
      permissions={PERMISSIONS_ENUM.APPLICATION_READ}
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don&apos;t have permission to view applications
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        }
      >
        <PipelineContent />
      </Suspense>
    </PermissionGuard>
  );
}
