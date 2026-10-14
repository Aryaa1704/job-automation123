import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Search,
  FileText,
  Briefcase,
  Send,
  Terminal,
  X,
  Play
} from 'lucide-react';
import { NavView } from '../common/Sidebar';

interface MilestoneDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: NavView) => void;
  onRunDiscovery: () => void;
  onSimulateWorkerFailure: () => void;
}

export const MilestoneDemoModal: React.FC<MilestoneDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onRunDiscovery,
  onSimulateWorkerFailure
}) => {
  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: 'Configure Roles, India/Remote & Work Modes',
      specRef: 'PRD FR-01 & Appendix B.1',
      description:
        'Verify user preferences: Target roles (Software Engineer Intern, Backend Intern), India/Remote locations, and graduation window 2024-2026.',
      actionLabel: 'Open Preferences',
      action: () => {
        onNavigate('settings');
        onClose();
      }
    },
    {
      step: 2,
      title: 'Ingest Source Adapters & Verify Deduplication',
      specRef: 'PRD FR-03, FR-04 & Appendix B.2',
      description:
        'Run source discovery from Greenhouse, Lever, and RemoteOK. Re-running the discovery preserves stable canonical jobs and demonstrates 0 duplicate creation.',
      actionLabel: 'Trigger Discovery Sync',
      action: () => {
        onRunDiscovery();
        onNavigate('discovery');
        onClose();
      }
    },
    {
      step: 3,
      title: 'Inspect Relevance Score & Hard Eligibility Gate',
      specRef: 'TRD 7.2 & Appendix B.3',
      description:
        'Inspect Stripe (92% Eligible) vs. Palantir & GovTech (Ineligible). Confirm hard gates (seniority & visa restriction) take precedence over match scores.',
      actionLabel: 'View Job Inventory',
      action: () => {
        onNavigate('discovery');
        onClose();
      }
    },
    {
      step: 4,
      title: 'Generate Tailored Resume & Inspect Fact Checks',
      specRef: 'TRD 7.3 & Appendix B.4',
      description:
        'Compare Master Resume vs Tailored Variant v1. Review factual integrity audit: 0 unsupported claims, verified dates, and SHA-256 content hash.',
      actionLabel: 'Open Resume Studio',
      action: () => {
        onNavigate('resume_studio');
        onClose();
      }
    },
    {
      step: 5,
      title: 'Trace Application State Machine',
      specRef: 'TRD 7.7 & Appendix B.5',
      description:
        'Test legal application transitions (shortlisted → resume_ready → awaiting_approval → ready_to_apply → applied). Notice illegal transitions are blocked.',
      actionLabel: 'Open Applications Kanban',
      action: () => {
        onNavigate('applications');
        onClose();
      }
    },
    {
      step: 6,
      title: 'Approve Outreach & Test Approval Invalidation',
      specRef: 'TRD 7.6, 7.7 & Appendix B.6',
      description:
        'Inspect approval fingerprint. Edit any letter in subject or body to see instant status change to APPROVAL_STALE requiring re-approval before send.',
      actionLabel: 'Review Outreach & Lock',
      action: () => {
        onNavigate('outreach');
        onClose();
      }
    },
    {
      step: 7,
      title: 'Test Provider Failure & Idempotent Safe Retry',
      specRef: 'TRD 7.5, 7.6 & Appendix B.7',
      description:
        'Simulate a worker timeout error. Verify 100% failure visibility and click "Safe Retry" with idempotency key to prove replay does not duplicate side-effects.',
      actionLabel: 'View Automation Ledger',
      action: () => {
        onNavigate('automation');
        onClose();
      }
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="font-semibold text-sm">Appendix B — Milestone Demo Walkthrough</h3>
              <p className="text-[11px] text-slate-400">
                Interactive verification checklist directly from the Project Blueprint
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
          {demoSteps.map((step) => (
            <div
              key={step.step}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {step.step}
                  </span>
                  <span className="font-semibold text-slate-900">{step.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-200 rounded text-slate-600">
                    {step.specRef}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed pl-7">
                  {step.description}
                </p>
              </div>

              <button
                onClick={step.action}
                className="shrink-0 mt-1 flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 rounded text-slate-700 font-medium text-xs transition-colors shadow-2xs"
              >
                <span>{step.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Personal AI Job Agent v1.0 MVP Specification</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded font-medium text-xs hover:bg-slate-800"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
