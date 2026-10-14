import React, { useState } from 'react';
import {
  ExternalLink,
  Plus,
  Bookmark,
  Share2,
  Clock,
  Building,
  MapPin,
  CheckCircle2,
  Sparkles,
  Download
} from 'lucide-react';
import { INITIAL_JOBS_LIST } from '../../services/happpyStorage';

interface HapppyJobsViewProps {
  onRunAgentForJob: (job: (typeof INITIAL_JOBS_LIST)[0]) => void;
  onOpenPasteModal: () => void;
  onOpenExtensionModal: () => void;
}

export const HapppyJobsView: React.FC<HapppyJobsViewProps> = ({
  onRunAgentForJob,
  onOpenPasteModal,
  onOpenExtensionModal
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(INITIAL_JOBS_LIST[0].id);
  const [activeTab, setActiveTab] = useState<'all' | 'inbox'>('all');

  const selectedJob = INITIAL_JOBS_LIST.find((j) => j.id === selectedJobId) || INITIAL_JOBS_LIST[0];

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Banner (Matches Screenshot 4) */}
      <div className="bg-[#f0fbf8] border border-[#d2f3eb] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold shrink-0">
            ⚡
          </div>
          <div>
            <span className="font-bold text-slate-900 block">
              Can't find the job you want? Take HAPPPY to that job
            </span>
            <span className="text-slate-600 text-[11px]">
              Install the extension to run the agent on your favourite job boards (LinkedIn, Indeed, Naukri).
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenExtensionModal}
            className="px-3 py-1.5 bg-[#42dab4] hover:bg-[#34c4a1] text-slate-950 rounded text-xs font-bold uppercase tracking-wider"
          >
            GET CHROME EXTENSION
          </button>
          <button
            onClick={onOpenPasteModal}
            className="px-3 py-1.5 border border-slate-300 hover:bg-white text-slate-800 rounded text-xs font-bold uppercase tracking-wider"
          >
            PASTE JOB LINK +
          </button>
        </div>
      </div>

      {/* Subtabs and Counts */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`font-bold pb-2 border-b-2 -mb-2.5 transition-colors ${
              activeTab === 'all'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            All Jobs
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`font-bold pb-2 border-b-2 -mb-2.5 transition-colors ${
              activeTab === 'inbox'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Recommended Job From Your Inbox (65)
          </button>
        </div>

        <span className="text-slate-500 font-medium">Showing 2k+ jobs</span>
      </div>

      {/* Two Pane Layout (Left: Job Cards, Right: Detailed Job View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Job Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[780px] overflow-y-auto pr-1">
          {INITIAL_JOBS_LIST.map((job) => {
            const isSelected = selectedJob.id === job.id;
            return (
              <div
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-50/40 border-emerald-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <div className="flex items-center gap-2">
                    <span>{job.postedTime}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-semibold">Be an early applicant</span>
                  </div>
                  <Bookmark className="w-3.5 h-3.5 text-slate-300 hover:text-slate-600" />
                </div>

                <h3 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                  {job.title}
                </h3>
                <div className="text-xs font-semibold text-slate-600 mt-1">{job.companyName}</div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                  <span>Freshers</span>
                  <span aria-hidden="true">·</span>
                  <span>{job.workMode}</span>
                </div>

                <div className="text-[11px] text-slate-500 mt-1.5 truncate">
                  <span className="font-semibold text-slate-700">Skills:</span>{' '}
                  {job.mustHaveSkills.join(' · ')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Job Specification (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6 max-h-[780px] overflow-y-auto shadow-2xs">
          {/* Top Title & Primary Action */}
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
              <span>{selectedJob.postedTime}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold">Be an early applicant</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                  {selectedJob.title}
                </h2>
                <div className="text-sm font-bold text-slate-700 mt-1">
                  {selectedJob.companyName}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-500">
                  <Bookmark className="w-4 h-4" />
                </button>
                <button className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-500">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* RUN HAPPPY AGENT Button (Matches Screenshot 4) */}
            <div className="mt-4">
              <button
                onClick={() => onRunAgentForJob(selectedJob)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-2"
              >
                <span>RUN HAPPPY AGENT</span>
                <span className="text-emerald-400 font-normal text-[11px]">→ Discovers Referrers</span>
              </button>
            </div>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
            <span className="px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-semibold">
              Freshers
            </span>
            <span className="px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-semibold">
              {selectedJob.workMode}
            </span>
            <span className="px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-semibold">
              {selectedJob.employmentType}
            </span>
            {selectedJob.stipend && (
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold">
                {selectedJob.stipend}
              </span>
            )}
          </div>

          {/* Must Have & Good to Have Skills */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1.5">
                Must Have Skills Required:
              </div>
              <div className="text-xs text-slate-700 leading-relaxed font-mono">
                {selectedJob.mustHaveSkills.join(', ')}
              </div>
            </div>

            {selectedJob.goodToHaveSkills && (
              <div>
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1.5">
                  Good to Have Skills:
                </div>
                <div className="text-xs text-slate-700 leading-relaxed font-mono">
                  {selectedJob.goodToHaveSkills.join(', ')}
                </div>
              </div>
            )}
          </div>

          {/* Overview */}
          <div className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-700 leading-relaxed">
            <div>
              <div className="font-bold text-slate-900 mb-1">Role Overview</div>
              <p>{selectedJob.overview}</p>
            </div>

            {selectedJob.responsibilities && (
              <div>
                <div className="font-bold text-slate-900 mb-1">What You'll Work On</div>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  {selectedJob.responsibilities.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJob.candidateProfile && (
              <div>
                <div className="font-bold text-slate-900 mb-1">Candidate Profile</div>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  {selectedJob.candidateProfile.map((cp, idx) => (
                    <li key={idx}>{cp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
