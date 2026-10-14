import React from 'react';
import { Plus, ExternalLink, Bell } from 'lucide-react';

interface HapppyHeaderProps {
  dailyRunsUsed: number;
  dailyRunsTotal: number;
  onOpenPasteModal: () => void;
  onOpenExtensionGuide: () => void;
}

export const HapppyHeader: React.FC<HapppyHeaderProps> = ({
  dailyRunsUsed,
  dailyRunsTotal,
  onOpenPasteModal,
  onOpenExtensionGuide
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      {/* Daily referral runs tracker */}
      <div className="flex items-center gap-3">
        <div className="text-xs">
          <span className="text-slate-500 block text-[11px] font-medium">Daily referral runs</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex gap-1">
              {Array.from({ length: dailyRunsTotal }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-1.5 rounded-xs ${
                    idx < dailyRunsUsed ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {dailyRunsUsed}/{dailyRunsTotal} today
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {/* Paste Job Link */}
        <button
          onClick={onOpenPasteModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 hover:text-emerald-700 uppercase tracking-wide transition-colors"
        >
          <span>PASTE JOB LINK</span>
          <Plus className="w-4 h-4" />
        </button>

        {/* Run Agent Anywhere (Chrome Extension) */}
        <button
          onClick={onOpenExtensionGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-md text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors uppercase tracking-wide"
        >
          <span>RUN AGENT ANYWHERE</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {/* Upgrade Plan */}
        <button className="flex items-center gap-1.5 px-4 py-1.5 bg-[#42dab4] hover:bg-[#34c4a1] text-slate-950 rounded-md text-xs font-bold uppercase tracking-wide transition-colors shadow-2xs">
          <span>⚡ UPGRADE PLAN</span>
        </button>

        {/* Notification Bell */}
        <div className="relative p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
        </div>
      </div>
    </header>
  );
};
