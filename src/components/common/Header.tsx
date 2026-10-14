import React from 'react';
import { Search, Sparkles, Shield, AlertTriangle, RefreshCw } from 'lucide-react';
import { NavView } from './Sidebar';

interface HeaderProps {
  currentView: NavView;
  onTriggerDiscovery: () => void;
  isDiscovering: boolean;
  onOpenDemo: () => void;
}

const VIEW_TITLES: Record<NavView, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Executive Dashboard',
    subtitle: 'Daily triage view of job matches, pending approvals, and execution state'
  },
  discovery: {
    title: 'Job Discovery & Ranking',
    subtitle: 'Source-backed job inventory with deterministic scoring and hard-gate isolation'
  },
  resume_studio: {
    title: 'Resume Studio',
    subtitle: 'Fact-preserving resume tailoring with verified master evidence and strict diff validation'
  },
  applications: {
    title: 'Application Pipeline',
    subtitle: 'Lifecycle state machine tracking with append-only audit trail'
  },
  crm: {
    title: 'Recruiter CRM',
    subtitle: 'Lawfully sourced contact provenance, company context, and verification status'
  },
  outreach: {
    title: 'Outreach & Sequences',
    subtitle: 'Cryptographically bound message approvals, send safety, and reply tracking'
  },
  automation: {
    title: 'Automation Operations',
    subtitle: 'Worker ledger, retry status, idempotency keys, and error recovery'
  },
  settings: {
    title: 'Settings & Integrations',
    subtitle: 'Search parameters, provider connection scopes, and data ownership controls'
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onTriggerDiscovery,
  isDiscovering,
  onOpenDemo
}) => {
  const current = VIEW_TITLES[currentView];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-base font-semibold text-slate-900 tracking-tight leading-snug">
          {current.title}
        </h2>
        <p className="text-xs text-slate-500 leading-none mt-0.5">
          {current.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Invariant indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-600 text-[11px] font-mono">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>INVARIANTS: AUDITABLE</span>
        </div>

        {/* Discovery Action Button */}
        <button
          onClick={onTriggerDiscovery}
          disabled={isDiscovering}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
          <span>{isDiscovering ? 'Ingesting Sources...' : 'Run Discovery'}</span>
        </button>

        {/* Appendix B Quick Demo button */}
        <button
          onClick={onOpenDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors border border-slate-200"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Demo Guide</span>
        </button>
      </div>
    </header>
  );
};
