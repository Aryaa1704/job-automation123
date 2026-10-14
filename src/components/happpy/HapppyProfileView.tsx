import React, { useState } from 'react';
import { FileText, MoreVertical, CheckCircle2, Plus, Minus } from 'lucide-react';
import { UserProfileConfig } from '../../types/referral';

interface HapppyProfileViewProps {
  profile: UserProfileConfig;
  onSaveProfile: (profile: UserProfileConfig) => void;
}

export const HapppyProfileView: React.FC<HapppyProfileViewProps> = ({
  profile,
  onSaveProfile
}) => {
  const [formData, setFormData] = useState<UserProfileConfig>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const statusOptions: UserProfileConfig['jobSearchStatus'][] = [
    'Just Exploring',
    'Actively Applying',
    'Interviewing',
    'Have An Offer',
    'Laid Off'
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header (Matches Screenshot 5) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Preferences</h1>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Last updated on 10th Oct, 2026
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
        >
          SAVE PREFERENCES
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile and outreach preferences updated!</span>
        </div>
      )}

      {/* Form Cards (Matches Screenshot 5) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 text-xs shadow-2xs">
        {/* Resume Box */}
        <div className="space-y-1.5">
          <label className="block text-slate-700 font-bold">
            Resume <span className="text-rose-500">*</span>{' '}
            <span className="text-slate-400 font-normal text-[11px]">
              Last updated on: 10-Oct-26
            </span>
          </label>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-100 text-blue-700 rounded">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-900">{formData.resumeFileName}</span>
            </div>
            <button className="text-slate-400 hover:text-slate-700">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-slate-700 font-bold">
            Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none"
          />
        </div>

        {/* LinkedIn Profile */}
        <div className="space-y-1.5">
          <label className="block text-slate-700 font-bold">
            LinkedIn Profile <span className="text-rose-500">*</span>
          </label>
          <input
            type="url"
            value={formData.linkedInUrl}
            onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] focus:outline-none"
          />
        </div>

        {/* Phone number */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-slate-700 font-bold">
              Phone number <span className="text-rose-500">*</span>
            </label>
            <span className="text-blue-600 font-semibold cursor-pointer text-[11px]">Edit</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 font-semibold text-slate-900">
            <span>🇮🇳</span>
            <span>{formData.phoneNumber}</span>
          </div>
        </div>

        {/* Your Background */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="font-bold text-sm text-slate-900">Your Background</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-slate-700 font-semibold text-[11px]">
                Current Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.currentRole}
                onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
              >
                <option value="Full Stack Development">Full Stack Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="DevOps / Cloud">DevOps / Cloud</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-semibold text-[11px]">
                Work Experience <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.workExperienceYears}
                  onChange={(e) =>
                    setFormData({ ...formData, workExperienceYears: Number(e.target.value) })
                  }
                  className="w-20 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-center"
                />
                <span className="self-center text-slate-500">years</span>
                <input
                  type="number"
                  value={formData.workExperienceMonths}
                  onChange={(e) =>
                    setFormData({ ...formData, workExperienceMonths: Number(e.target.value) })
                  }
                  className="w-20 p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-center"
                />
                <span className="self-center text-slate-500">months</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notice Period */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-semibold text-[11px]">
              Notice Period <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.noticePeriod}
              onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
            >
              <option value="Immediately">Immediately</option>
              <option value="15 Days">15 Days</option>
              <option value="1 Month">1 Month</option>
              <option value="2 Months">2 Months</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-700 font-semibold text-[11px]">
              Let us know your last working day <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.lastWorkingDay}
              onChange={(e) => setFormData({ ...formData, lastWorkingDay: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* Compensation */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="font-bold text-sm text-slate-900">Compensation</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-slate-700 font-semibold text-[11px]">
                Expected CTC <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">₹</span>
                <input
                  type="number"
                  value={formData.expectedCtcLacs}
                  onChange={(e) =>
                    setFormData({ ...formData, expectedCtcLacs: Number(e.target.value) })
                  }
                  className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900"
                />
                <span className="text-slate-500">lacs per annum</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-semibold text-[11px]">
                Current CTC <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">₹</span>
                <input
                  type="number"
                  value={formData.currentCtcLacs}
                  onChange={(e) =>
                    setFormData({ ...formData, currentCtcLacs: Number(e.target.value) })
                  }
                  className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900"
                />
                <span className="text-slate-500">lacs per annum</span>
              </div>
            </div>
          </div>
        </div>

        {/* Where you're at right now */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="font-bold text-sm text-slate-900">Where you're at right now</div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((st) => (
              <button
                type="button"
                key={st}
                onClick={() => setFormData({ ...formData, jobSearchStatus: st })}
                className={`px-3.5 py-2 rounded-lg font-semibold text-xs transition-colors ${
                  formData.jobSearchStatus === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Target */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-900">How many jobs do you apply to per day?</div>
            <div className="text-[11px] text-slate-500">Daily referral run quota</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  dailyTargetRuns: Math.max(1, formData.dailyTargetRuns - 1)
                })
              }
              className="p-1.5 rounded border hover:bg-slate-50"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-sm text-slate-900">{formData.dailyTargetRuns}</span>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, dailyTargetRuns: formData.dailyTargetRuns + 1 })
              }
              className="p-1.5 rounded border hover:bg-slate-50"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
