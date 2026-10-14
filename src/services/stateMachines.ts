/**
 * State Machine and Legal Transition Guardrails
 * Based on TRD 7.7 Application & Outreach State Machines
 */

import { ApplicationStatus, OutreachStatus } from '../types';

// Legal application status transitions map
export const LEGAL_APPLICATION_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  discovered: ['shortlisted'],
  shortlisted: ['resume_ready', 'withdrawn'],
  resume_ready: ['awaiting_approval', 'withdrawn'],
  awaiting_approval: ['ready_to_apply', 'withdrawn'],
  ready_to_apply: ['applied', 'withdrawn'],
  applied: ['screening', 'interview', 'rejected', 'withdrawn'],
  screening: ['interview', 'rejected', 'withdrawn'],
  interview: ['offer', 'rejected', 'withdrawn'],
  offer: ['rejected', 'withdrawn'], // accepted/withdrawn
  rejected: [],
  withdrawn: []
};

export function canTransitionApplication(
  currentStatus: ApplicationStatus,
  targetStatus: ApplicationStatus
): { allowed: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { allowed: true };
  }

  const allowedNext = LEGAL_APPLICATION_TRANSITIONS[currentStatus] || [];
  if (allowedNext.includes(targetStatus)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Invalid lifecycle transition: Cannot move directly from '${currentStatus}' to '${targetStatus}'. Permitted transitions are: ${allowedNext.join(', ') || 'None (Terminal state)'}.`
  };
}

// Legal outreach message transitions map
export const LEGAL_OUTREACH_TRANSITIONS: Record<OutreachStatus, OutreachStatus[]> = {
  draft: ['awaiting_approval', 'cancelled'],
  awaiting_approval: ['approved', 'draft', 'cancelled'],
  approved: ['sending', 'draft', 'cancelled'], // note: editing reverts to draft
  sending: ['sent', 'failed', 'unknown_outcome'],
  sent: ['replied', 'cancelled'],
  replied: [],
  failed: ['awaiting_approval', 'cancelled'], // can retry from approval
  cancelled: [],
  unknown_outcome: ['sent', 'failed', 'cancelled'] // manual reconciliation
};

export function canTransitionOutreach(
  currentStatus: OutreachStatus,
  targetStatus: OutreachStatus
): { allowed: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { allowed: true };
  }

  const allowedNext = LEGAL_OUTREACH_TRANSITIONS[currentStatus] || [];
  if (allowedNext.includes(targetStatus)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Invalid outreach transition: Cannot move from '${currentStatus}' to '${targetStatus}'. Permitted transitions: ${allowedNext.join(', ')}.`
  };
}
