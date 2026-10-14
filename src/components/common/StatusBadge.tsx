import React from 'react';
import { EligibilityStatus, ApplicationStatus, OutreachStatus, TaskStatus } from '../../types';

interface StatusBadgeProps {
  status: EligibilityStatus | ApplicationStatus | OutreachStatus | TaskStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const norm = status.toLowerCase();

  let dotColor = 'bg-slate-400';
  let textColor = 'text-slate-700';
  let bgColor = 'bg-slate-100';
  let label = status.replace(/_/g, ' ');

  // Eligibility
  if (norm === 'eligible') {
    dotColor = 'bg-emerald-500';
    textColor = 'text-emerald-800';
    bgColor = 'bg-emerald-50 border border-emerald-200/60';
    label = 'Eligible';
  } else if (norm === 'ineligible') {
    dotColor = 'bg-rose-500';
    textColor = 'text-rose-800';
    bgColor = 'bg-rose-50 border border-rose-200/60';
    label = 'Ineligible';
  } else if (norm === 'unknown') {
    dotColor = 'bg-amber-500';
    textColor = 'text-amber-800';
    bgColor = 'bg-amber-50 border border-amber-200/60';
    label = 'Unknown / Needs Review';
  }

  // Application & Outreach
  else if (norm === 'applied' || norm === 'sent' || norm === 'succeeded' || norm === 'validated') {
    dotColor = 'bg-emerald-500';
    textColor = 'text-emerald-800';
    bgColor = 'bg-emerald-50 border border-emerald-200/60';
  } else if (norm === 'awaiting_approval' || norm === 'resume_ready' || norm === 'warnings') {
    dotColor = 'bg-amber-500';
    textColor = 'text-amber-800';
    bgColor = 'bg-amber-50 border border-amber-200/60';
  } else if (norm === 'approved') {
    dotColor = 'bg-blue-500';
    textColor = 'text-blue-800';
    bgColor = 'bg-blue-50 border border-blue-200/60';
  } else if (norm === 'failed' || norm === 'blocked' || norm === 'rejected') {
    dotColor = 'bg-rose-500';
    textColor = 'text-rose-800';
    bgColor = 'bg-rose-50 border border-rose-200/60';
  } else if (norm === 'running' || norm === 'sending') {
    dotColor = 'bg-blue-500 animate-pulse';
    textColor = 'text-blue-800';
    bgColor = 'bg-blue-50 border border-blue-200/60';
  } else if (norm === 'replied') {
    dotColor = 'bg-purple-500';
    textColor = 'text-purple-800';
    bgColor = 'bg-purple-50 border border-purple-200/60';
  } else if (norm === 'shortlisted' || norm === 'interview') {
    dotColor = 'bg-indigo-500';
    textColor = 'text-indigo-800';
    bgColor = 'bg-indigo-50 border border-indigo-200/60';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded ${bgColor} ${textColor} ${px}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span className="capitalize">{label}</span>
    </span>
  );
};
