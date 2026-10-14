import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  FileText,
  X,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Info,
  Calendar,
  MapPin,
  Building,
  RefreshCw
} from 'lucide-react';
import { Job, JobMatch, WorkMode, EligibilityStatus, MasterResume } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface JobDiscoveryViewProps {
  jobs: Job[];
  matches: JobMatch[];
  masterResume: MasterResume;
  onToggleShortlist: (jobId: string) => void;
  onTailorResume: (job: Job) => void;
  selectedJob: Job | null;
  onSelectJob: (job: Job | null) => void;
  onRunDiscovery: () => void;
  isDiscovering: boolean;
}

export const JobDiscoveryView: React.FC<JobDiscoveryViewProps> = ({
  jobs,
  matches,
  masterResume,
  onToggleShortlist,
  onTailorResume,
  selectedJob,
  onSelectJob,
  onRunDiscovery,
  isDiscovering
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState<'all' | WorkMode>('all');
  const [eligibilityFilter, setEligibilityFilter] = useState<'all' | EligibilityStatus>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [shortlistedOnly, setShortlistedOnly] = useState<boolean>(false);

  // Match lookup map
  const matchMap = useMemo(() => {
    const map = new Map<string, JobMatch>();
    matches.forEach((m) => map.set(m.jobId, m));
    return map;
  }, [matches]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const match = matchMap.get(job.id);
      const score = match?.score || 0;
      const eligibility = match?.eligibilityStatus || 'unknown';

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText =
          job.title.toLowerCase().includes(q) ||
          job.companyName.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          job.mustHaveSkills.some((s) => s.toLowerCase().includes(q));
        if (!matchesText) return false;
      }

      // Work mode
      if (workModeFilter !== 'all' && job.workMode !== workModeFilter) {
        return false;
      }

      // Eligibility
      if (eligibilityFilter !== 'all' && eligibility !== eligibilityFilter) {
        return false;
      }

      // Min score
      if (score < minScore) {
        return false;
      }

      // Shortlisted only
      if (shortlistedOnly && !job.isShortlisted) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const scoreA = matchMap.get(a.id)?.score || 0;
      const scoreB = matchMap.get(b.id)?.score || 0;
      return scoreB - scoreA;
    });
  }, [jobs, matchMap, searchQuery, workModeFilter, eligibilityFilter, minScore, shortlistedOnly]);

  const activeMatch = selectedJob ? matchMap.get(selectedJob.id) : null;

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role, company, location, or skill (e.g. TypeScript, Stripe)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Run Discovery */}
            <button
              onClick={onRunDiscovery}
              disabled={isDiscovering}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
              <span>{isDiscovering ? 'Scanning...' : 'Sync Sources'}</span>
            </button>
          </div>
        </div>

        {/* Filter Chips / Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium text-[11px] mr-1">Work Mode:</span>
          {(['all', 'remote', 'hybrid', 'on-site'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setWorkModeFilter(mode)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                workModeFilter === mode
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {mode === 'all' ? 'All Modes' : mode.toUpperCase()}
            </button>
          ))}

          <span className="text-slate-300 mx-1">|</span>

          <span className="text-slate-500 font-medium text-[11px] mr-1">Eligibility:</span>
          {(['all', 'eligible', 'ineligible', 'unknown'] as const).map((elig) => (
            <button
              key={elig}
              onClick={() => setEligibilityFilter(elig)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                eligibilityFilter === elig
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {elig === 'all' ? 'All' : elig.charAt(0).toUpperCase() + elig.slice(1)}
            </button>
          ))}

          <span className="text-slate-300 mx-1">|</span>

          {/* Shortlisted Toggle */}
          <button
            onClick={() => setShortlistedOnly(!shortlistedOnly)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded font-medium transition-colors ${
              shortlistedOnly
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>Shortlisted Only</span>
          </button>

          {/* Reset Filters */}
          {(searchQuery || workModeFilter !== 'all' || eligibilityFilter !== 'all' || shortlistedOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setWorkModeFilter('all');
                setEligibilityFilter('all');
                setShortlistedOnly(false);
              }}
              className="ml-auto text-blue-600 hover:underline text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Jobs Table */}
      <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{filteredJobs.length}</strong> of{' '}
            <strong className="text-slate-800">{jobs.length}</strong> jobs
          </div>
          <div className="text-[11px] font-mono">Ranked by Deterministic Match Score (TRD 7.2)</div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No listings match your active filters. Try resetting the filters or running source discovery.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/50">
                  <th className="py-2.5 px-3 w-8"></th>
                  <th className="py-2.5 px-3">Role & Company</th>
                  <th className="py-2.5 px-3">Location & Work Mode</th>
                  <th className="py-2.5 px-3">Match Score</th>
                  <th className="py-2.5 px-3">Hard Eligibility Gate</th>
                  <th className="py-2.5 px-3">Primary Source</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => {
                  const match = matchMap.get(job.id);
                  const isSelected = selectedJob?.id === job.id;
                  return (
                    <tr
                      key={job.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Shortlist action */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => onToggleShortlist(job.id)}
                          title={job.isShortlisted ? 'Remove bookmark' : 'Shortlist job'}
                          className={`p-1 rounded hover:bg-slate-200/70 transition-colors ${
                            job.isShortlisted ? 'text-blue-600' : 'text-slate-300'
                          }`}
                        >
                          {job.isShortlisted ? (
                            <BookmarkCheck className="w-4 h-4 fill-blue-600" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Title & Company */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => onSelectJob(job)}
                          className="font-semibold text-slate-900 hover:text-blue-600 text-left transition-colors"
                        >
                          {job.title}
                        </button>
                        <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-2">
                          <span>{job.companyName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{job.employmentType}</span>
                        </div>
                      </td>

                      {/* Location & Mode */}
                      <td className="py-3 px-3">
                        <div className="text-slate-700">{job.location}</div>
                        <div className="text-slate-400 text-[11px] capitalize">{job.workMode}</div>
                      </td>

                      {/* Match Score */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-xs ${
                              (match?.score || 0) >= 80
                                ? 'text-emerald-700'
                                : (match?.score || 0) >= 50
                                ? 'text-blue-700'
                                : 'text-slate-600'
                            }`}
                          >
                            {match ? `${match.score}%` : 'N/A'}
                          </span>
                          {match && (
                            <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  match.score >= 80
                                    ? 'bg-emerald-500'
                                    : match.score >= 50
                                    ? 'bg-blue-500'
                                    : 'bg-slate-400'
                                }`}
                                style={{ width: `${match.score}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Hard Eligibility Gate */}
                      <td className="py-3 px-3">
                        <StatusBadge status={match?.eligibilityStatus || 'unknown'} />
                      </td>

                      {/* Source Link */}
                      <td className="py-3 px-3 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-slate-600">
                            {job.sources[0]?.sourceName || 'Direct'}
                          </span>
                          <a
                            href={job.canonicalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-600"
                            title="Open original listing in new tab"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => onSelectJob(job)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onTailorResume(job)}
                          disabled={match?.eligibilityStatus === 'ineligible'}
                          className="px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-40 disabled:hover:bg-blue-600"
                          title={
                            match?.eligibilityStatus === 'ineligible'
                              ? 'Disabled: Hard eligibility gate failed'
                              : 'Generate tailored fact-checked resume'
                          }
                        >
                          Tailor Resume
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Job Details Drawer */}
      {selectedJob && (
        <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-start justify-between bg-slate-50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Job Match & Provenance
                </span>
                <StatusBadge status={activeMatch?.eligibilityStatus || 'unknown'} size="sm" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1 leading-tight">
                {selectedJob.title}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">{selectedJob.companyName}</span>
                <span aria-hidden="true">·</span>
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedJob.location}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{selectedJob.workMode}</span>
              </p>
            </div>
            <button
              onClick={() => onSelectJob(null)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* Hard-Gate Rule Evaluation Card */}
            <div
              className={`p-4 rounded-lg border ${
                activeMatch?.eligibilityStatus === 'ineligible'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50/60 border-emerald-200/80 text-emerald-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-semibold">
                  {activeMatch?.eligibilityStatus === 'ineligible' ? (
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>Hard-Gate Decision: {activeMatch?.eligibilityStatus.toUpperCase()}</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-white/60 rounded">
                  Non-Negotiable
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90 mb-3">
                Mandatory criteria (visa sponsorship, graduation date, seniority) are evaluated separately.
                Relevance scores cannot override an ineligible hard requirement.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-slate-200/40">
                {activeMatch?.hardGates.map((gate, i) => (
                  <div key={i} className="flex items-start justify-between text-[11px] gap-2">
                    <span className="font-medium text-slate-800">{gate.name}:</span>
                    <span
                      className={`text-right font-medium ${
                        gate.status === 'ineligible'
                          ? 'text-rose-700'
                          : gate.status === 'eligible'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {gate.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explainable Match Score Breakdown (TRD 7.2) */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">Match Score Breakdown</h4>
                  <p className="text-[11px] text-slate-500">
                    Weighted formula across 6 normalized factors
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-blue-700">
                    {activeMatch?.score || 0}%
                  </div>
                  <div className="text-[10px] text-slate-400">Total Score</div>
                </div>
              </div>

              {activeMatch && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600">Skills Match (30%)</span>
                      <span className="font-mono font-medium">{activeMatch.breakdown.skillsMatch}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${activeMatch.breakdown.skillsMatch}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600">Role Relevance (25%)</span>
                      <span className="font-mono font-medium">{activeMatch.breakdown.roleRelevance}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${activeMatch.breakdown.roleRelevance}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600">Location Feasibility (15%)</span>
                      <span className="font-mono font-medium">{activeMatch.breakdown.locationMatch}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${activeMatch.breakdown.locationMatch}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600">Experience Tier Fit (15%)</span>
                      <span className="font-mono font-medium">{activeMatch.breakdown.experienceFit}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${activeMatch.breakdown.experienceFit}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600">Work Mode Alignment (10%)</span>
                      <span className="font-mono font-medium">{activeMatch.breakdown.workModeFit}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${activeMatch.breakdown.workModeFit}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600">Listing Freshness (5%)</span>
                      <span className="font-mono font-medium">{activeMatch.breakdown.freshnessFactor}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full"
                        style={{ width: `${activeMatch.breakdown.freshnessFactor}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Matched Keywords & Missing Requirements */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="font-semibold text-slate-800 block mb-1.5">Matched Keywords</span>
                <div className="flex flex-wrap gap-1">
                  {activeMatch?.matchedKeywords.map((kw, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-mono">
                      {kw}
                    </span>
                  ))}
                  {(!activeMatch?.matchedKeywords || activeMatch.matchedKeywords.length === 0) && (
                    <span className="text-slate-400 text-[11px]">None detected</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="font-semibold text-slate-800 block mb-1.5">Missing Requirements</span>
                <div className="flex flex-wrap gap-1">
                  {activeMatch?.missingRequirements.map((mr, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-mono">
                      {mr}
                    </span>
                  ))}
                  {(!activeMatch?.missingRequirements || activeMatch.missingRequirements.length === 0) && (
                    <span className="text-emerald-600 text-[11px]">100% requirements covered</span>
                  )}
                </div>
              </div>
            </div>

            {/* Source Provenance Ledger */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <h4 className="font-semibold text-slate-900">Source Provenance & Deduplication</h4>
              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Canonical URL:</span>
                  <a
                    href={selectedJob.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 truncate max-w-xs hover:underline"
                  >
                    {selectedJob.canonicalUrl}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Retained Source Records:</span>
                  <span className="font-mono text-slate-800">{selectedJob.sources.length}</span>
                </div>
                {selectedJob.sources.map((s, idx) => (
                  <div key={s.id} className="pt-1.5 border-t border-slate-200 font-mono text-[10px]">
                    <div className="flex justify-between text-slate-700">
                      <span>Source #{idx + 1}: {s.sourceName}</span>
                      <span>Ext ID: {s.externalId}</span>
                    </div>
                    <div className="text-slate-400 truncate">Payload Hash: {s.payloadHash}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Job Description */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">Job Description</h4>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 whitespace-pre-wrap leading-relaxed text-[11px]">
                {selectedJob.description}
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <button
              onClick={() => onToggleShortlist(selectedJob.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-700 text-xs font-medium"
            >
              <Bookmark className={`w-3.5 h-3.5 ${selectedJob.isShortlisted ? 'fill-blue-600 text-blue-600' : ''}`} />
              <span>{selectedJob.isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
            </button>

            <div className="flex items-center gap-2">
              <a
                href={selectedJob.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1"
              >
                <span>External Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => {
                  onTailorResume(selectedJob);
                  onSelectJob(null);
                }}
                disabled={activeMatch?.eligibilityStatus === 'ineligible'}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold disabled:opacity-40"
              >
                Tailor Fact-Checked Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
