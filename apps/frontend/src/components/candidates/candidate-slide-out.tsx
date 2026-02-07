'use client';

import { Candidate } from '@/types/candidate.type';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InitialsAvatar } from '@/components/ui/initials-avatar';
import { CandidateSourceBadge } from './candidate-source-badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Mail,
  Phone,
  Briefcase,
  Link as LinkIcon,
  Linkedin,
} from 'lucide-react';

interface CandidateSlideOutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  onEdit?: () => void;
  canEdit?: boolean;
}

export function CandidateSlideOut({
  open,
  onOpenChange,
  candidate,
  onEdit,
  canEdit = false,
}: CandidateSlideOutProps) {
  if (!candidate) return null;

  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const addedByName = candidate.addedBy
    ? `${candidate.addedBy.firstName || ''} ${candidate.addedBy.lastName || ''}`.trim() ||
      candidate.addedBy.email
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start gap-4">
            <InitialsAvatar name={fullName} className="h-12 w-12 text-lg" />
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl">{fullName}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <CandidateSourceBadge source={candidate.source} />
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${candidate.email}`}
                className="text-primary hover:underline"
              >
                {candidate.email}
              </a>
            </div>

            {candidate.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.phone}</span>
              </div>
            )}

            {(candidate.currentCompany || candidate.currentTitle) && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>
                  {candidate.currentTitle}
                  {candidate.currentTitle && candidate.currentCompany && ' at '}
                  {candidate.currentCompany}
                </span>
              </div>
            )}

            {candidate.linkedinUrl && (
              <div className="flex items-center gap-3 text-sm">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                <a
                  href={candidate.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                >
                  {candidate.linkedinUrl}
                </a>
              </div>
            )}

            {candidate.portfolioUrl && (
              <div className="flex items-center gap-3 text-sm">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <a
                  href={candidate.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                >
                  {candidate.portfolioUrl}
                </a>
              </div>
            )}
          </div>

          {candidate.notes && (
            <div className="space-y-2 border-t pt-4">
              <Label className="text-muted-foreground">Notes</Label>
              <p className="text-sm whitespace-pre-wrap">{candidate.notes}</p>
            </div>
          )}

          <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Added</span>
              <span>{formatDate(candidate.createdAt)}</span>
            </div>
            {addedByName && (
              <div className="flex justify-between">
                <span>Added by</span>
                <span>{addedByName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Last updated</span>
              <span>{formatDate(candidate.updatedAt)}</span>
            </div>
          </div>
        </div>

        {canEdit && onEdit && (
          <div className="flex justify-end border-t pt-4">
            <Button onClick={onEdit}>Edit Candidate</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
