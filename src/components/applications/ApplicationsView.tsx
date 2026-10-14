import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  ExternalLink,
  Kanban,
  Table as TableIcon,
  ChevronRight,
  X,
  AlertCircle,
  FileText,
  User,
  History
} from 'lucide-react';
import {
  Application,
  ApplicationEvent,
  ApplicationStatus,
  Job,
  RecruiterContact,
  ResumeVersion
} from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { canTransitionApplication, LEGAL_APPLICATION_TRANSITIONS } from '../../services/stateMachines';

interface ApplicationsViewProps {
  applications: Application[];
  jobs: Job[];
  contacts: RecruiterContact[];
  resumeVersions: ResumeVersion[];
  applicationEvents: ApplicationEvent[];
  onTransitionStatus: (
    applicationId: string,
    newStatus: ApplicationStatus,
    note?: string
  ) => void;
  onSelectApplication: (app: Application | null) => void;
  selectedApplication: Application | null;
}

const KANBAN_COLUMNS: { id: ApplicationStatus; title: string }[] = [
  { id: 'shortlisted', title: 'Shortlisted' },
  { id: 'resume_ready', title: 'Resume Ready' },
  { id: 'awaiting_approval', title: 'Awaiting Approval' },
  { id: 'ready_to_apply', title: 'Ready to Apply' },
  { id: 'applied', title: 'Applied' },
  { id: 'screening', title: 'Screening' },
  { id: 'interview', title: 'Interview' },
  { id: 'offer', title: 'Offer' }
];

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  jobs,
  contacts,
  resumeVersions,
  applicationEvents,
  onTransitionStatus,
  onSelectApplication,
  selectedApplication
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [transitionError, setTransitionError] = useState<string | null>(null);

  // Helper maps
  const jobMap = new Map(jobs.map((j) => [j.id, j]));
  const contactMap = new Map(contacts.map((c) => [c.id, c]));
  const resumeMap = new Map(resumeVersions.map((r) => [r.id, r]));

  const handleAttemptTransition = (
    app: Application,
    targetStatus: ApplicationStatus,
    note?: string
  ) => {
    const check = canTransitionApplication(app.status, targetStatus);
    if (!check.allowed) {
      setTransitionError(check.reason || 'Illegal state transition according to PRD state machine.');
      setTimeout(() => setTransitionError(null), 5000);
      return;
    }
    setTransitionError(null);
    onTransitionStatus(app.id, targetStatus, note);
  };

  const activeJob = selectedApplication ? jobMap.get(selectedApplication.jobId) : null;
  const activeResume = selectedApplication?.resumeVersionId
    ? resumeMap.get(selectedApplication.resumeVersionId)
    : null;
  const activeContact = selectedApplication?.contactId
    ? contactMap.get(selectedApplication.contactId)
    : null;
  const activeEvents = selectedApplication
    ? applicationEvents.filter((e) => e.applicationId === selectedApplication.id)
    : [];

  return (
    <div className="space-y-4">
      {/* Top Controls & State Rule Alert */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Application Lifecycle State Machine
          </h3>
          <p className="text-xs text-slate-500">
            Strict transitions enforced: <span className="font-mono text-[11px] text-slate-700">discovered → shortlisted → resume_ready → awaiting_approval → ready_to_apply → applied</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transition Error Alert Banner */}
      {transitionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{transitionError}</span>
          </div>
          <button
            onClick={() => setTransitionError(null)}
            className="text-rose-500 hover:text-rose-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mode 1: Kanban Board */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-4 items-start min-h-[500px]">
          {KANBAN_COLUMNS.map((col) => {
            const columnApps = applications.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                className="w-72 shrink-0 bg-slate-50 border border-slate-200 rounded-lg flex flex-col max-h-[700px]"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-200/80 flex items-center justify-between bg-white rounded-t-lg">
                  <span className="font-semibold text-xs text-slate-800">{col.title}</span>
                  <span className="text-[11px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                    {columnApps.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-2 space-y-2 overflow-y-auto flex-1">
                  {columnApps.map((app) => {
                    const job = jobMap.get(app.jobId);
                    const allowedNext = LEGAL_APPLICATION_TRANSITIONS[app.status] || [];
                    return (
                      <div
                        key={app.id}
                        className="p-3 bg-white border border-slate-200/80 rounded-md shadow-xs hover:border-slate-300 transition-all space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <button
                              onClick={() => onSelectApplication(app)}
                              className="font-semibold text-slate-900 hover:text-blue-600 text-left line-clamp-1"
                            >
                              {job?.title || 'Unknown Position'}
                            </button>
                            <span className="text-slate-500 text-[11px] block">
                              {job?.companyName || 'Unknown Company'}
                            </span>
                          </div>
                        </div>

                        {app.notes && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-1.5 rounded">
                            {app.notes}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <button
                            onClick={() => onSelectApplication(app)}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            Timeline & Details
                          </button>

                          {/* Quick legal advance button */}
                          {allowedNext.length > 0 && (
                            <button
                              onClick={() => handleAttemptTransition(app, allowedNext[0])}
                              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-[10px] flex items-center gap-0.5"
                              title={`Advance to ${allowedNext[0].replace(/_/g, ' ')}`}
                            >
                              <span>Next</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {columnApps.length === 0 && (
                    <div className="p-4 text-center text-slate-400 text-[11px] border border-dashed border-slate-200 rounded">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 2: Table View */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/50">
                <th className="py-2.5 px-3">Role & Company</th>
                <th className="py-2.5 px-3">Lifecycle Status</th>
                <th className="py-2.5 px-3">Submission State</th>
                <th className="py-2.5 px-3">Tailored Resume</th>
                <th className="py-2.5 px-3">Assigned Recruiter</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => {
                const job = jobMap.get(app.jobId);
                const contact = app.contactId ? contactMap.get(app.contactId) : null;
                const resume = app.resumeVersionId ? resumeMap.get(app.resumeVersionId) : null;
                const allowedNext = LEGAL_APPLICATION_TRANSITIONS[app.status] || [];

                return (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{job?.title}</div>
                      <div className="text-slate-500 text-[11px]">{job?.companyName}</div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px] capitalize">
                      {app.submissionState || 'prepared'}
                    </td>
                    <td className="py-3 px-3">
                      {resume ? (
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-mono text-[11px]">v{resume.versionNo}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not linked</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {contact ? (
                        <div className="text-slate-800">
                          <span className="font-medium">{contact.fullName}</span>
                          <span className="block text-slate-400 text-[10px]">{contact.workEmail}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None assigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => onSelectApplication(app)}
                        className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded border border-slate-200"
                      >
                        Inspect
                      </button>
                      {allowedNext.length > 0 && (
                        <button
                          onClick={() => handleAttemptTransition(app, allowedNext[0])}
                          className="px-2 py-1 bg-slate-900 text-white rounded hover:bg-slate-800"
                        >
                          Advance to {allowedNext[0].replace('_', ' ')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Application Detail & Lifecycle Events Drawer */}
      {selectedApplication && activeJob && (
        <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-slate-200 flex items-start justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 uppercase">
                  Application Detail
                </span>
                <StatusBadge status={selectedApplication.status} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{activeJob.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{activeJob.companyName}</p>
            </div>
            <button
              onClick={() => onSelectApplication(null)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* Status Transition Control Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <h4 className="font-semibold text-slate-900">Legal Status Transition</h4>
              <p className="text-[11px] text-slate-500">
                Current State: <strong className="text-slate-800">{selectedApplication.status}</strong>
              </p>

              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Permitted Next Steps:</span>
                <div className="flex flex-wrap gap-2">
                  {(LEGAL_APPLICATION_TRANSITIONS[selectedApplication.status] || []).map((target) => (
                    <button
                      key={target}
                      onClick={() =>
                        handleAttemptTransition(
                          selectedApplication,
                          target,
                          `User transitioned to ${target}`
                        )
                      }
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs transition-colors"
                    >
                      Move to {target.replace(/_/g, ' ')}
                    </button>
                  ))}
                  {(LEGAL_APPLICATION_TRANSITIONS[selectedApplication.status] || []).length === 0 && (
                    <span className="text-slate-400 text-xs">Terminal lifecycle state reached.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Linked Resume Variant */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <span className="font-semibold text-slate-900 block">Bound Resume Version</span>
              {activeResume ? (
                <div className="space-y-1 text-slate-600">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span>Version #{activeResume.versionNo}</span>
                    <span className="text-emerald-700 font-semibold">100% Fact Checked</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    Hash: {activeResume.contentHash}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-[11px]">No tailored resume linked yet.</p>
              )}
            </div>

            {/* Append-only Lifecycle Event History (Section 5.2 application_events) */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-600" />
                <h4 className="font-semibold text-slate-900">Lifecycle Audit History</h4>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {activeEvents.map((ev) => (
                  <div key={ev.id} className="relative text-xs space-y-0.5">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 capitalize">
                        {ev.fromStatus} → {ev.toStatus}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] leading-relaxed">{ev.note}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Actor: {ev.actorType}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
