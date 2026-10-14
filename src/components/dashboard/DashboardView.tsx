import React from 'react';
import {
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Send,
  FileText,
  Search,
  ExternalLink,
  RotateCcw,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import {
  Application,
  AutomationRun,
  Job,
  JobMatch,
  OutreachMessage,
  RecruiterContact
} from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { NavView } from '../common/Sidebar';

interface DashboardViewProps {
  jobs: Job[];
  matches: JobMatch[];
  applications: Application[];
  outreachMessages: OutreachMessage[];
  contacts: RecruiterContact[];
  automationRuns: AutomationRun[];
  onNavigate: (view: NavView) => void;
  onSelectJob: (job: Job) => void;
  onSelectOutreach: (msg: OutreachMessage) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs,
  matches,
  applications,
  outreachMessages,
  contacts,
  automationRuns,
  onNavigate,
  onSelectJob,
  onSelectOutreach
}) => {
  // KPI computations
  const totalJobs = jobs.length;
  const eligibleMatches = matches.filter((m) => m.eligibilityStatus === 'eligible' && m.score >= 70).length;
  const hardGatedOut = matches.filter((m) => m.eligibilityStatus === 'ineligible').length;
  const pendingApprovals = outreachMessages.filter((m) => m.status === 'awaiting_approval');
  const activeApps = applications.filter((a) => !['rejected', 'withdrawn'].includes(a.status));
  
  // Failed tasks across runs
  const failedTasks = automationRuns
    .flatMap((r) => r.tasks)
    .filter((t) => t.status === 'failed' || t.status === 'retry_wait');

  // Top matches
  const sortedJobsWithMatch = [...jobs]
    .map((job) => ({
      job,
      match: matches.find((m) => m.jobId === job.id)
    }))
    .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));

  return (
    <div className="space-y-6">
      {/* Non-negotiable invariant reminder box */}
      <div className="bg-slate-900 text-white rounded-lg p-4 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <h3 className="text-xs uppercase font-mono tracking-wider text-blue-300">
              System Invariant Guaranteed
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            AI recommends, classifies, and drafts. It never overrides hard eligibility gates, mutates canonical workflow state, or sends external communications without a cryptographically verified user approval fingerprint.
          </p>
        </div>
        <button
          onClick={() => onNavigate('discovery')}
          className="self-start md:self-center shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors"
        >
          <span>Explore Job Queue</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* KPI 1: Ingested Jobs */}
        <button
          onClick={() => onNavigate('discovery')}
          className="p-3.5 bg-white border border-slate-200/80 rounded-lg hover:border-slate-300 text-left transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Captured Jobs</span>
            <Search className="w-3.5 h-3.5 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{totalJobs}</div>
          <div className="text-[11px] text-slate-500 mt-1">4 verified adapters</div>
        </button>

        {/* KPI 2: Eligible Matches */}
        <button
          onClick={() => onNavigate('discovery')}
          className="p-3.5 bg-white border border-slate-200/80 rounded-lg hover:border-slate-300 text-left transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Eligible High Matches</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 tracking-tight">{eligibleMatches}</div>
          <div className="text-[11px] text-slate-500 mt-1">Score $\ge$ 70% & passed gates</div>
        </button>

        {/* KPI 3: Hard Gated Ineligible */}
        <button
          onClick={() => onNavigate('discovery')}
          className="p-3.5 bg-white border border-slate-200/80 rounded-lg hover:border-slate-300 text-left transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Hard-Gated Out</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 tracking-tight">{hardGatedOut}</div>
          <div className="text-[11px] text-slate-500 mt-1">Visa or Seniority failed</div>
        </button>

        {/* KPI 4: Pending Approvals */}
        <button
          onClick={() => onNavigate('outreach')}
          className="p-3.5 bg-white border border-amber-300/80 bg-amber-50/20 rounded-lg hover:border-amber-400 text-left transition-all group"
        >
          <div className="flex items-center justify-between text-amber-800 text-xs mb-1 font-medium">
            <span>Pending Approvals</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-900 tracking-tight">
            {pendingApprovals.length}
          </div>
          <div className="text-[11px] text-amber-700/80 mt-1">Fingerprint lock required</div>
        </button>

        {/* KPI 5: Active Applications */}
        <button
          onClick={() => onNavigate('applications')}
          className="p-3.5 bg-white border border-slate-200/80 rounded-lg hover:border-slate-300 text-left transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Active Pipeline</span>
            <Briefcase className="w-3.5 h-3.5 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{activeApps.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Tracked in lifecycle</div>
        </button>

        {/* KPI 6: Failed Tasks */}
        <button
          onClick={() => onNavigate('automation')}
          className="p-3.5 bg-white border border-slate-200/80 rounded-lg hover:border-slate-300 text-left transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Worker Errors</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{failedTasks.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">100% visible & retryable</div>
        </button>
      </div>

      {/* Main Grid: Next Best Actions & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Best Actions (2 cols on large) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Next Best Actions</h3>
              <p className="text-xs text-slate-500">Triage tasks prioritized by urgency and impact</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">3 actions ready</span>
          </div>

          <div className="space-y-3">
            {/* Action 1: Pending Outreach Approval */}
            {pendingApprovals.length > 0 && (
              <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-md flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">
                      Approve Recruiter Outreach: {pendingApprovals[0].recipientSnapshot}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                      Subject: {pendingApprovals[0].subject}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-amber-800">
                      <span>Requires SHA-256 fingerprint approval before sending</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onNavigate('outreach');
                    onSelectOutreach(pendingApprovals[0]);
                  }}
                  className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Review Draft
                </button>
              </div>
            )}

            {/* Action 2: Tailored Resume Ready */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center shrink-0 text-blue-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    Verify Tailored Resume for Stripe (Backend & Infrastructure)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Variant v1 prepared with 3 verified facts and 0 unsupported claims.
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                    <span>Validation status: Validated (Hash: sha256:4a88bc...)</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigate('resume_studio')}
                className="shrink-0 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded transition-colors"
              >
                Inspect Diff
              </button>
            </div>

            {/* Action 3: Review Hard-Gated Roles */}
            {hardGatedOut > 0 && (
              <div className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-md flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-rose-100 flex items-center justify-center shrink-0 text-rose-700">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">
                      2 Ineligible Jobs Filtered (Palantir & Defense GovTech)
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Hard eligibility gate prevented false match due to 12+ yr seniority and US citizen SCIF restrictions.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('discovery')}
                  className="shrink-0 px-3 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-medium rounded transition-colors"
                >
                  View Gates
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Operational Status & Recent Runs (1 col) */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Recent Automation Tasks</h3>
                <p className="text-xs text-slate-500">Execution ledger and retry health</p>
              </div>
              <button
                onClick={() => onNavigate('automation')}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {automationRuns.slice(0, 3).map((run) => (
                <div key={run.id} className="p-2.5 bg-slate-50 rounded border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 capitalize">
                      {run.runType.replace('_', ' ')}
                    </span>
                    <StatusBadge status={run.status} size="sm" />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 font-mono">
                    ID: {run.id.slice(0, 16)} · Tasks: {run.tasks.length}
                  </div>
                  {run.errorSummary && (
                    <div className="mt-1.5 text-[11px] text-rose-600 line-clamp-1 bg-rose-50 px-1.5 py-0.5 rounded">
                      {run.errorSummary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Deduplication: Active</span>
            <span className="font-mono text-[11px] text-emerald-600">IDEMPOTENT</span>
          </div>
        </div>
      </div>

      {/* Top Ranked Jobs Table */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Ranked Job Discovery Preview</h3>
            <p className="text-xs text-slate-500">
              Evaluated with TRD 7.2 weighted scoring formula and hard-gate isolation
            </p>
          </div>
          <button
            onClick={() => onNavigate('discovery')}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
          >
            <span>Full Inventory ({jobs.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/50">
                <th className="py-2.5 px-3">Role & Company</th>
                <th className="py-2.5 px-3">Location & Mode</th>
                <th className="py-2.5 px-3">Relevance Score</th>
                <th className="py-2.5 px-3">Eligibility Gate</th>
                <th className="py-2.5 px-3">Source Provenance</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedJobsWithMatch.slice(0, 4).map(({ job, match }) => (
                <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{job.title}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{job.companyName}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-700">{job.location}</div>
                    <div className="text-slate-400 text-[11px] capitalize">{job.workMode}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold font-mono text-xs ${
                          (match?.score || 0) >= 80
                            ? 'text-emerald-700'
                            : (match?.score || 0) >= 50
                            ? 'text-blue-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {match ? `${match.score}/100` : 'Pending'}
                      </span>
                      {match && (
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              match.score >= 80 ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${match.score}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={match?.eligibilityStatus || 'unknown'} />
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <span>{job.sources[0]?.sourceName || 'Direct'}</span>
                      <a
                        href={job.canonicalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-blue-600"
                        title="View original listing"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        onNavigate('discovery');
                        onSelectJob(job);
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Inspect Match
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
