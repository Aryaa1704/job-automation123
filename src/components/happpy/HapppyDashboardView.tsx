import React from 'react';
import {
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  Download,
  Eye,
  Sliders,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { INITIAL_JOBS_LIST } from '../../services/happpyStorage';
import { HapppyTab } from './HapppySidebar';

interface HapppyDashboardViewProps {
  onSelectTab: (tab: HapppyTab) => void;
  onRunAgentForJob: (job: (typeof INITIAL_JOBS_LIST)[0]) => void;
  onOpenExtensionModal: () => void;
}

export const HapppyDashboardView: React.FC<HapppyDashboardViewProps> = ({
  onSelectTab,
  onRunAgentForJob,
  onOpenExtensionModal
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Good Afternoon, Aryan</h1>
      </div>

      {/* Recommended Jobs Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Recommended Jobs</h2>
          <button
            onClick={() => onSelectTab('jobs')}
            className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700 uppercase tracking-wide"
          >
            <span>VIEW ALL RECOMMENDED JOBS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {INITIAL_JOBS_LIST.slice(1, 5).map((job) => (
            <div
              key={job.id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-[10px]">
                    {job.companyName.charAt(0)}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    {job.postedTime}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                  {job.title}
                </h3>
                <div className="text-xs text-slate-600 mt-1 font-medium">{job.companyName}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{job.location}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onSelectTab('jobs')}
                  className="w-full py-1.5 px-2 border border-slate-300 rounded-md text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors uppercase"
                >
                  VIEW JOB
                </button>
                <button
                  onClick={() => onRunAgentForJob(job)}
                  className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[11px] font-bold transition-colors uppercase shadow-xs"
                >
                  RUN AGENT
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your journey with Happpy Agent */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Your journey with Happpy Agent</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-3xl font-extrabold text-slate-900">27</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Jobs run on HAPPPY</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-3xl font-extrabold text-slate-900">16</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Jobs run via extension</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-3xl font-extrabold text-slate-900">0</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Jobs in Queue</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-3xl font-extrabold text-emerald-600">3</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Positive Responses</div>
          </div>
        </div>
      </div>

      {/* Your Next Moves */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Your Next Moves</h2>
        <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold">
                !
              </span>
              <span className="font-bold text-xs text-slate-900">
                1 Important Pending Action: Pending replies & approvals
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 pl-7">
              You have 1 pending recruiter reply from AIKING SOLUTIONS awaiting action.
            </p>
          </div>

          <button
            onClick={() => onSelectTab('activity')}
            className="self-start md:self-center shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#2d7a64] hover:bg-[#236653] text-white rounded-md text-xs font-bold uppercase transition-colors"
          >
            <span>RESPOND NOW</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Important Actions (4 Tiles) */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Important Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tile 1: Download Chrome Extension */}
          <button
            onClick={onOpenExtensionModal}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center text-center justify-center hover:border-slate-300 shadow-2xs transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-105 transition-transform">
              <Download className="w-7 h-7" />
            </div>
            <div className="font-bold text-xs text-slate-900">Download Browser Extension</div>
          </button>

          {/* Tile 2: Review Outreach Messages */}
          <button
            onClick={() => onSelectTab('activity')}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center text-center justify-center hover:border-slate-300 shadow-2xs transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-3 group-hover:scale-105 transition-transform">
              <Eye className="w-7 h-7" />
            </div>
            <div className="font-bold text-xs text-slate-900">Review Outreach Messages</div>
          </button>

          {/* Tile 3: Agent Configuration */}
          <button
            onClick={() => onSelectTab('configure')}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center text-center justify-center hover:border-slate-300 shadow-2xs transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-3 group-hover:scale-105 transition-transform">
              <Sliders className="w-7 h-7" />
            </div>
            <div className="font-bold text-xs text-slate-900">Agent Configuration Settings</div>
          </button>

          {/* Tile 4: Follow-Up Settings */}
          <button
            onClick={() => onSelectTab('configure')}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center text-center justify-center hover:border-slate-300 shadow-2xs transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-3 group-hover:scale-105 transition-transform">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="font-bold text-xs text-slate-900">Follow-Up Settings</div>
          </button>
        </div>
      </div>

      {/* Did you know banner */}
      <div className="bg-[#f0fbf8] border border-[#d2f3eb] rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl shrink-0">
            🦇
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">
              Did you know? I can help with referrals on any live job listing
            </div>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
              Just install the Happpy Agent extension, open any job listing, and click the floating Happpy Agent button to get started. Works on LinkedIn, Wellfound, Naukri, Google careers, Indeed, + any career page.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0 text-[11px] font-semibold text-slate-700">
          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">LinkedIn</span>
          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">Wellfound</span>
          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">Naukri</span>
          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">Indeed</span>
          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">+ any career page</span>
        </div>
      </div>
    </div>
  );
};
