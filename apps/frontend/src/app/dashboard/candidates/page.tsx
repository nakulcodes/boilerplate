'use client';

/**
 * CANDIDATES PAGE - Searchable Candidate Database
 *
 * Route: /dashboard/candidates
 * Permission: CANDIDATE_READ
 *
 * ============================================================================
 * PAGE DESIGN
 * ============================================================================
 *
 * Layout: Table-based list for searchability
 *
 * +------------------------------------------------------------------+
 * |  Candidates                                                       |
 * +------------------------------------------------------------------+
 * |  [Search by name or email...]                                     |
 * |  [Source: All v]  [Has Active Application: Any v]                |
 * +------------------------------------------------------------------+
 * |                                                                    |
 * |  Name              Email                 Applications    Source   |
 * |  +--------------------------------------------------------------+|
 * |  | Jane Doe        jane@email.com        2 (1 active)   LinkedIn ||
 * |  | Mike Smith      mike@email.com        1 (rejected)   Referral ||
 * |  | Sarah Lee       sarah@email.com       3 (1 active)   Direct   ||
 * |  +--------------------------------------------------------------+|
 * |                                                                    |
 * |  [Previous]  Page 1 of 24  [Next]                                |
 * +------------------------------------------------------------------+
 *
 * ============================================================================
 * FEATURES TO IMPLEMENT
 * ============================================================================
 *
 * 1. Table Columns:
 *    - Name (first + last, with avatar initials)
 *    - Email
 *    - Applications count (with active count in parentheses)
 *    - Source (LinkedIn, Referral, Direct, Indeed, Other)
 *
 * 2. Filters:
 *    - Search: Text search on name and email
 *    - Source: Dropdown filter by candidate source
 *    - Has Active Application: Yes/No/Any filter
 *
 * 3. Interactions:
 *    - Click row -> Opens candidate slide-out panel
 *    - Slide-out shows full candidate history with all applications
 *    - Links to Pipeline view for each application
 *
 * 4. Pagination:
 *    - Use TanStack React Table with pagination
 *    - POST /candidates/list with { page, limit, search?, source? }
 *
 * ============================================================================
 * CANDIDATE SLIDE-OUT PANEL
 * ============================================================================
 *
 * +------------------------------------------+
 * | Jane Doe                              X  |
 * +------------------------------------------+
 * | jane@email.com                           |
 * | +1 (555) 123-4567                        |
 * | LinkedIn: linkedin.com/in/janedoe        |
 * +------------------------------------------+
 * | Current: Product Manager at TechCorp     |
 * | Source: LinkedIn                         |
 * | Added: Jan 15, 2025 by Sarah Smith       |
 * +------------------------------------------+
 * | APPLICATIONS                             |
 * | +--------------------------------------+ |
 * | | Sr. Engineer - Interview    Active  | |
 * | | [View Pipeline ->]                   | |
 * | +--------------------------------------+ |
 * | | Product Manager - Rejected           | |
 * | | Dec 2024                             | |
 * | +--------------------------------------+ |
 * +------------------------------------------+
 * | NOTES                                    |
 * | Strong technical background...           |
 * | [+ Add note]                             |
 * +------------------------------------------+
 *
 * ============================================================================
 * API ROUTES NEEDED
 * ============================================================================
 *
 * - API_ROUTES.CANDIDATES.LIST - POST /candidates/list (paginated)
 * - API_ROUTES.CANDIDATES.GET(id) - GET /candidates/:id
 *
 * ============================================================================
 * COMPONENTS TO CREATE
 * ============================================================================
 *
 * - CandidateSlideOut - Slide-out panel with candidate details
 * - CandidateSourceBadge - Badge showing source with color coding
 *
 * ============================================================================
 * TYPES NEEDED (types/candidate.type.ts)
 * ============================================================================
 *
 * interface Candidate {
 *   id: string;
 *   email: string;
 *   firstName: string;
 *   lastName: string;
 *   phone?: string;
 *   linkedinUrl?: string;
 *   portfolioUrl?: string;
 *   currentCompany?: string;
 *   currentTitle?: string;
 *   source: CandidateSource;
 *   notes?: string;
 *   addedBy?: { id: string; firstName?: string; lastName?: string; email: string };
 *   applications?: ApplicationSummary[];
 *   createdAt: string;
 * }
 *
 * enum CandidateSource {
 *   DIRECT_APPLY = 'direct_apply',
 *   REFERRAL = 'referral',
 *   LINKEDIN = 'linkedin',
 *   AGENCY = 'agency',
 *   OTHER = 'other',
 * }
 */

import { PERMISSIONS_ENUM } from '@/constants/permissions.constants';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Card } from '@/components/ui/card';

function CandidatesContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Candidates</h2>
        <p className="text-sm text-muted-foreground">
          Searchable candidate database across all applications
        </p>
      </div>

      <Card className="p-8">
        <div className="text-center space-y-4">
          <div className="text-4xl">👥</div>
          <h3 className="text-lg font-medium">Candidates Database</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Search and manage your candidate database. View application history,
            add notes, and track candidates across multiple job openings.
          </p>
          <div className="pt-4 text-sm text-muted-foreground">
            <p className="font-medium">Features to implement:</p>
            <ul className="mt-2 space-y-1">
              <li>Table with search and filters</li>
              <li>Candidate slide-out panel with full history</li>
              <li>Source filtering (LinkedIn, Referral, Direct, etc.)</li>
              <li>Active application indicator</li>
              <li>Link to Pipeline view for each application</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <PermissionGuard
      permissions={PERMISSIONS_ENUM.CANDIDATE_READ}
      fallback={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          You don&apos;t have permission to view candidates
        </div>
      }
    >
      <CandidatesContent />
    </PermissionGuard>
  );
}
