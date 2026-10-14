import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Linkedin,
  Radio,
  FileCode
} from 'lucide-react';
import { JobPreferences, IntegrationStatus } from '../../types';

interface SettingsViewProps {
  preferences: JobPreferences;
  onSavePreferences: (prefs: JobPreferences) => void;
  onExportAllData: () => void;
  onResetFactoryData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onSavePreferences,
  onExportAllData,
  onResetFactoryData
}) => {
  const [formPrefs, setFormPrefs] = useState<JobPreferences>({ ...preferences });
  const [newRole, setNewRole] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newExclusion, setNewExclusion] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Integrations state
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    {
      provider: 'gmail',
      connected: true,
      grantedScopes: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly'
      ],
      connectedAt: '2026-10-10T12:00:00Z',
      lastSyncAt: new Date().toISOString()
    },
    {
      provider: 'linkedin',
      connected: false,
      grantedScopes: ['r_liteprofile', 'w_member_social'],
      lastError: 'Optional adapter (ADR-006 deferred to post-MVP)'
    },
    {
      provider: 'greenhouse',
      connected: true,
      grantedScopes: ['read:jobs', 'read:boards'],
      connectedAt: '2026-10-10T12:00:00Z',
      lastSyncAt: new Date().toISOString()
    },
    {
      provider: 'lever',
      connected: true,
      grantedScopes: ['read:postings'],
      connectedAt: '2026-10-10T12:00:00Z',
      lastSyncAt: new Date().toISOString()
    }
  ]);

  const handleToggleIntegration = (provider: IntegrationStatus['provider']) => {
    setIntegrations((prev) =>
      prev.map((i) => {
        if (i.provider === provider) {
          return {
            ...i,
            connected: !i.connected,
            lastSyncAt: !i.connected ? new Date().toISOString() : undefined
          };
        }
        return i;
      })
    );
  };

  const handleSave = () => {
    onSavePreferences({
      ...formPrefs,
      updatedAt: new Date().toISOString()
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const addTag = (
    field: 'targetRoles' | 'skills' | 'locations' | 'exclusions',
    value: string,
    setter: (val: string) => void
  ) => {
    if (!value.trim()) return;
    if (!formPrefs[field].includes(value.trim())) {
      setFormPrefs({
        ...formPrefs,
        [field]: [...formPrefs[field], value.trim()]
      });
    }
    setter('');
  };

  const removeTag = (
    field: 'targetRoles' | 'skills' | 'locations' | 'exclusions',
    tag: string
  ) => {
    setFormPrefs({
      ...formPrefs,
      [field]: formPrefs[field].filter((t) => t !== tag)
    });
  };

  const toggleWorkMode = (mode: 'remote' | 'hybrid' | 'on-site') => {
    const current = formPrefs.workModes;
    if (current.includes(mode)) {
      if (current.length === 1) return; // keep at least 1
      setFormPrefs({ ...formPrefs, workModes: current.filter((m) => m !== mode) });
    } else {
      setFormPrefs({ ...formPrefs, workModes: [...current, mode] });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Job search preferences updated and versioned. All match scores recomputed.</span>
        </div>
      )}

      {/* Preferences Form (FR-01) */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-5 space-y-5 text-xs">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Profile & Candidate Search Preferences (FR-01)
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Governs the TRD 7.2 weighted scoring algorithm and hard eligibility evaluation.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs shadow-xs transition-colors"
          >
            Save Preferences
          </button>
        </div>

        {/* Target Roles */}
        <div className="space-y-2">
          <label className="block font-semibold text-slate-800">Target Roles</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {formPrefs.targetRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded font-medium text-xs"
              >
                <span>{role}</span>
                <button
                  type="button"
                  onClick={() => removeTag('targetRoles', role)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add target role (e.g. Distributed Systems Intern)..."
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && addTag('targetRoles', newRole, setNewRole)
              }
              className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => addTag('targetRoles', newRole, setNewRole)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {/* Core Skills */}
        <div className="space-y-2">
          <label className="block font-semibold text-slate-800">Technical Skills</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {formPrefs.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded font-medium text-xs font-mono"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeTag('skills', skill)}
                  className="text-blue-400 hover:text-blue-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add skill (e.g. Go, Raft, Docker)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag('skills', newSkill, setNewSkill)}
              className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => addTag('skills', newSkill, setNewSkill)}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {/* Locations & Work Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block font-semibold text-slate-800">Target Locations</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {formPrefs.locations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-xs"
                >
                  <span>{loc}</span>
                  <button
                    type="button"
                    onClick={() => removeTag('locations', loc)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add location (e.g. India, Bangalore)..."
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && addTag('locations', newLocation, setNewLocation)
                }
                className="flex-1 p-1.5 bg-slate-50 border border-slate-200 rounded text-slate-800"
              />
              <button
                type="button"
                onClick={() => addTag('locations', newLocation, setNewLocation)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
              >
                Add
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-slate-800">Permitted Work Modes</label>
            <div className="flex gap-2 pt-1">
              {(['remote', 'hybrid', 'on-site'] as const).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => toggleWorkMode(mode)}
                  className={`px-3 py-1.5 rounded font-medium capitalize text-xs transition-colors ${
                    formPrefs.workModes.includes(mode)
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hard Gate Criteria: Graduation Window & Work Authorization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div className="space-y-1">
            <label className="block font-semibold text-slate-800">
              Graduation Window (Hard-Gate)
            </label>
            <input
              type="text"
              value={formPrefs.graduationWindow}
              onChange={(e) =>
                setFormPrefs({ ...formPrefs, graduationWindow: e.target.value })
              }
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-800 font-mono"
            />
            <span className="text-[10px] text-slate-400 block">
              Used to evaluate internship eligibility rules
            </span>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-slate-800">
              Work Authorization (Hard-Gate)
            </label>
            <select
              value={formPrefs.workAuthorization}
              onChange={(e) =>
                setFormPrefs({
                  ...formPrefs,
                  workAuthorization: e.target.value as JobPreferences['workAuthorization']
                })
              }
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
            >
              <option value="authorized_any">Authorized to work without sponsorship</option>
              <option value="requires_sponsorship">Requires Visa Sponsorship (H-1B, etc.)</option>
              <option value="citizen_or_pr">Citizen / Permanent Resident only</option>
            </select>
            <span className="text-[10px] text-slate-400 block">
              Immediately triggers hard-gate ineligibility if JD requires US citizenship/clearance
            </span>
          </div>
        </div>
      </div>

      {/* Integration Registry & Scopes (FR-15 & Section 7.8) */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-5 space-y-4 text-xs">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Integration Registry & Least-Privilege Scopes (FR-15)
          </h3>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Integrations use bounded OAuth scopes. Revocation deletes tokens immediately.
          </p>
        </div>

        <div className="space-y-3">
          {integrations.map((item) => (
            <div
              key={item.provider}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 uppercase tracking-wide">
                    {item.provider}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      item.connected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Scopes:{' '}
                  <span className="font-mono text-slate-700">
                    {item.grantedScopes.join(', ')}
                  </span>
                </div>
                {item.lastError && (
                  <div className="text-[10px] text-slate-500 italic mt-0.5">{item.lastError}</div>
                )}
              </div>

              <button
                onClick={() => handleToggleIntegration(item.provider)}
                className={`px-3 py-1.5 rounded font-medium text-xs transition-colors ${
                  item.connected
                    ? 'bg-white border border-rose-300 text-rose-700 hover:bg-rose-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {item.connected ? 'Disconnect & Revoke' : 'Connect Provider'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Ownership & Export / Reset (FR-14 & Section 2.7) */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-5 space-y-4 text-xs">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Data Ownership, Audit Export & Recovery (FR-14)
          </h3>
          <p className="text-slate-500 text-[11px] mt-0.5">
            You own 100% of your job search data, match breakdowns, resume artifacts, and communication records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onExportAllData}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Complete Database (JSON)</span>
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  'Are you sure you want to restore initial demo fixtures? This resets local state.'
                )
              ) {
                onResetFactoryData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>
        </div>
      </div>
    </div>
  );
};
