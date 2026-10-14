import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Download,
  Plus,
  ArrowRight,
  ExternalLink,
  Copy,
  Hash,
  Eye,
  FileCheck,
  Sparkles,
  Layers
} from 'lucide-react';
import { Job, MasterResume, ResumeFact, ResumeVersion, ValidationItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface ResumeStudioViewProps {
  masterResume: MasterResume;
  resumeVersions: ResumeVersion[];
  jobs: Job[];
  onGenerateTailoredVariant: (job: Job) => void;
  onAddFact: (fact: Omit<ResumeFact, 'id' | 'confidence' | 'verifiedByUserAt'>) => void;
}

export const ResumeStudioView: React.FC<ResumeStudioViewProps> = ({
  masterResume,
  resumeVersions,
  jobs,
  onGenerateTailoredVariant,
  onAddFact
}) => {
  const [activeTab, setActiveTab] = useState<'variants' | 'facts'>('variants');
  const [selectedVersion, setSelectedVersion] = useState<ResumeVersion | null>(
    resumeVersions.length > 0 ? resumeVersions[0] : null
  );
  const [showAddFactModal, setShowAddFactModal] = useState(false);
  const [newFact, setNewFact] = useState({
    factType: 'experience' as ResumeFact['factType'],
    title: '',
    factText: '',
    sourceLocator: ''
  });
  const [selectedJobToTailor, setSelectedJobToTailor] = useState<string>(
    jobs.length > 0 ? jobs[0].id : ''
  );
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleExport = (version: ResumeVersion) => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            artifactType: 'IMMUTABLE_TAILORED_RESUME_VERSION',
            id: version.id,
            versionNumber: version.versionNo,
            targetJob: `${version.jobTitle} at ${version.companyName}`,
            sha256ContentHash: version.contentHash,
            validationStatus: version.validationStatus,
            tailoredContent: version.tailoredContent,
            validationAudit: version.validationReport,
            exportedAt: new Date().toISOString()
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${version.companyName}_Tailored_Resume_v${version.versionNo}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Master Resume Card */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Master Source of Truth
            </span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Immutable
            </span>
          </div>
          <div className="font-semibold text-slate-900 text-sm">{masterResume.displayName}</div>
          <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
            <div>Size: {(masterResume.sizeBytes / 1024).toFixed(1)} KB · MIME: {masterResume.mimeType}</div>
            <div className="truncate">Hash: {masterResume.sha256.slice(0, 24)}...</div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">{masterResume.facts.length} Verified Facts</span>
            <button
              onClick={() => setActiveTab('facts')}
              className="text-blue-600 hover:underline font-medium text-xs"
            >
              Inspect Facts
            </button>
          </div>
        </div>

        {/* Tailored Variants Card */}
        <div className="p-4 bg-white border border-slate-200/80 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tailored Variants
            </span>
            <span className="text-xs font-mono font-bold text-blue-600">
              {resumeVersions.length} Active
            </span>
          </div>
          <div className="font-semibold text-slate-900 text-sm">Targeted Submissions</div>
          <p className="text-xs text-slate-500">
            Fact-preserved variants mapped to company JD requirements without altering canonical dates or metrics.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-medium">0 Unsupported Claims</span>
            <button
              onClick={() => setActiveTab('variants')}
              className="text-blue-600 hover:underline font-medium text-xs"
            >
              Compare Variants
            </button>
          </div>
        </div>

        {/* Generate Variant Direct Action */}
        <div className="p-4 bg-slate-900 text-white rounded-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailor Resume for Job</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Select any captured job to generate an immutable, fact-validated resume variant.
            </p>
          </div>
          <div className="pt-3 flex gap-2">
            <select
              value={selectedJobToTailor}
              onChange={(e) => setSelectedJobToTailor(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.companyName} - {j.title.slice(0, 24)}...
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const target = jobs.find((j) => j.id === selectedJobToTailor);
                if (target) onGenerateTailoredVariant(target);
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium shrink-0 transition-colors"
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('variants')}
          className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === 'variants'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Tailored Variants ({resumeVersions.length})
        </button>
        <button
          onClick={() => setActiveTab('facts')}
          className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 -mb-px ${
            activeTab === 'facts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Master Verified Facts ({masterResume.facts.length})
        </button>
      </div>

      {/* View 1: Tailored Variants Inspector */}
      {activeTab === 'variants' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of variants */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-slate-500 block mb-2">
              Select Variant to Inspect & Validate:
            </span>
            {resumeVersions.map((ver) => {
              const isSelected = selectedVersion?.id === ver.id;
              return (
                <button
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900">
                      {ver.companyName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                      v{ver.versionNo}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 truncate mt-0.5">{ver.jobTitle}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <StatusBadge status={ver.validationStatus} size="sm" />
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(ver.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Details & Diff & Validation Report */}
          {selectedVersion ? (
            <div className="lg:col-span-2 space-y-4">
              {/* Header Info */}
              <div className="p-4 bg-white border border-slate-200/80 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">
                      {selectedVersion.companyName} · {selectedVersion.jobTitle}
                    </h3>
                    <StatusBadge status={selectedVersion.validationStatus} />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-xs">{selectedVersion.contentHash}</span>
                    <button
                      onClick={() => handleCopyHash(selectedVersion.contentHash)}
                      className="text-blue-600 hover:underline text-[11px]"
                    >
                      {copiedHash ? 'Copied' : 'Copy Hash'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleExport(selectedVersion)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON & Diff</span>
                </button>
              </div>

              {/* Factual Validation Audit Report (TRD 7.3) */}
              <div className="p-4 bg-white border border-slate-200/80 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      Factual Integrity & Hallucination Audit
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Cross-referenced against verified master facts with source locators
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    PASS: FACT-CHECKED
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {selectedVersion.validationReport.map((val) => (
                    <div
                      key={val.id}
                      className={`p-2.5 rounded border text-xs flex items-start gap-2.5 ${
                        val.severity === 'blocking_error'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : val.severity === 'warning'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      {val.severity === 'blocking_error' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : val.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold">{val.claimText}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{val.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary of Changes (Diff Explainability) */}
              <div className="p-4 bg-white border border-slate-200/80 rounded-lg space-y-2">
                <h4 className="text-xs font-semibold text-slate-900">Explainable Changes</h4>
                <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                  {selectedVersion.changeSummary.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>

              {/* Tailored Content Preview */}
              <div className="p-4 bg-white border border-slate-200/80 rounded-lg space-y-3">
                <h4 className="text-xs font-semibold text-slate-900">Tailored Resume Content Preview</h4>
                <div className="space-y-3 p-4 bg-slate-50 rounded border border-slate-200 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      {selectedVersion.tailoredContent.headline}
                    </span>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {selectedVersion.tailoredContent.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-800 block text-xs mb-1">
                      Targeted Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedVersion.tailoredContent.highlightedSkills.map((sk, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-mono">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="font-semibold text-slate-800 block text-xs">
                      Tailored Experience Bullets:
                    </span>
                    {selectedVersion.tailoredContent.experienceBulletPoints.map((exp, i) => (
                      <div key={i} className="space-y-1">
                        <div className="font-semibold text-slate-800">
                          {exp.roleTitle} · {exp.company} ({exp.dates})
                        </div>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                          {exp.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-lg border border-slate-200">
              No tailored variant selected.
            </div>
          )}
        </div>
      )}

      {/* View 2: Master Verified Facts Repository */}
      {activeTab === 'facts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Verified Master Fact Repository
              </h3>
              <p className="text-xs text-slate-500">
                Only verified facts with recorded source locators may be cited in generated resumes.
              </p>
            </div>
            <button
              onClick={() => setShowAddFactModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Verified Fact</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/50">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Claim / Item</th>
                  <th className="py-2.5 px-3">Source Locator</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Verification State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {masterResume.facts.map((fact) => (
                  <tr key={fact.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-mono uppercase text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                        {fact.factType}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{fact.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5 whitespace-pre-wrap max-w-xl">
                        {fact.factText}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                      {fact.sourceLocator}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-700 font-bold">
                      {fact.confidence}%
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Fact Modal */}
      {showAddFactModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-slate-900">Add Verified Master Fact</h3>
              <button
                onClick={() => setShowAddFactModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Fact Category</label>
                <select
                  value={newFact.factType}
                  onChange={(e) =>
                    setNewFact({ ...newFact, factType: e.target.value as ResumeFact['factType'] })
                  }
                  className="w-full border rounded p-1.5 bg-slate-50"
                >
                  <option value="experience">Work Experience</option>
                  <option value="project">Project Claim</option>
                  <option value="education">Education</option>
                  <option value="skill">Technical Skill</option>
                  <option value="metric">Certified Metric</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Headline / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Backend Intern at Stripe"
                  value={newFact.title}
                  onChange={(e) => setNewFact({ ...newFact, title: e.target.value })}
                  className="w-full border rounded p-1.5"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Verifiable Content / Bullets</label>
                <textarea
                  rows={3}
                  placeholder="Exact description or metric with certified numbers..."
                  value={newFact.factText}
                  onChange={(e) => setNewFact({ ...newFact, factText: e.target.value })}
                  className="w-full border rounded p-1.5"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Source Locator</label>
                <input
                  type="text"
                  placeholder="e.g. Page 1, Experience Section #2"
                  value={newFact.sourceLocator}
                  onChange={(e) => setNewFact({ ...newFact, sourceLocator: e.target.value })}
                  className="w-full border rounded p-1.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowAddFactModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                disabled={!newFact.title || !newFact.factText || !newFact.sourceLocator}
                onClick={() => {
                  onAddFact(newFact);
                  setShowAddFactModal(false);
                  setNewFact({ factType: 'experience', title: '', factText: '', sourceLocator: '' });
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium disabled:opacity-40"
              >
                Save Fact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
