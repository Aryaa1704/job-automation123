import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Search,
  ExternalLink,
  Send,
  Mail,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  Building,
  Briefcase,
  Linkedin,
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';
import { UserProfileConfig, ReferrerCandidate, ReferralRun } from '../../types/referral';
import { parseJobUrl, createGmailComposeUrl } from '../../services/referralEngine';
import { searchContactsAtCompany } from '../../services/contactFinderService';
import { generatePersonalizedOutreach } from '../../services/aiDrafterService';

interface HapppyRunAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileConfig;
  initialJobUrl?: string;
  initialJobTitle?: string;
  initialCompanyName?: string;
  onCompleteRun: (run: ReferralRun) => void;
}

export const HapppyRunAgentModal: React.FC<HapppyRunAgentModalProps> = ({
  isOpen,
  onClose,
  profile,
  initialJobUrl = '',
  initialJobTitle = '',
  initialCompanyName = '',
  onCompleteRun
}) => {
  if (!isOpen) return null;

  const [inputUrl, setInputUrl] = useState(initialJobUrl);
  const [jobTitle, setJobTitle] = useState(initialJobTitle || 'Software Engineer');
  const [companyName, setCompanyName] = useState(initialCompanyName || '');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [discoveredReferrers, setDiscoveredReferrers] = useState<any[]>([]);
  const [selectedReferrer, setSelectedReferrer] = useState<any | null>(null);

  // Drafts
  const [pitchSubject, setPitchSubject] = useState('');
  const [pitchBody, setPitchBody] = useState('');
  const [linkedInNote, setLinkedInNote] = useState('');
  const [activeTab, setActiveTab] = useState<'email' | 'linkedin'>('email');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [aiGeneratedBadge, setAiGeneratedBadge] = useState(false);

  // Trigger discovery when company name or job title is ready
  const executeDiscovery = async (company: string, title: string, url: string) => {
    if (!company) return;
    setIsDiscovering(true);
    try {
      const enrichment = await searchContactsAtCompany(company, title);
      setDiscoveredReferrers(enrichment.contacts);
      const topRef = enrichment.contacts[0];
      setSelectedReferrer(topRef);

      // AI Draft outreach
      await generateOutreachDraft(topRef, company, title);
    } catch (err) {
      console.error('Discovery error:', err);
    } finally {
      setIsDiscovering(false);
    }
  };

  const generateOutreachDraft = async (ref: ReferrerCandidate, comp: string, title: string) => {
    setIsAiDrafting(true);
    try {
      const draft = await generatePersonalizedOutreach(profile, comp, title, ref);
      setPitchSubject(draft.emailSubject);
      setPitchBody(draft.emailBody);
      setLinkedInNote(draft.linkedInConnectionNote);
      setAiGeneratedBadge(draft.isAiGenerated);
    } catch (err) {
      console.error('Drafting error:', err);
    } finally {
      setIsAiDrafting(false);
    }
  };

  useEffect(() => {
    if (initialCompanyName) {
      setCompanyName(initialCompanyName);
      setJobTitle(initialJobTitle || 'Software Engineer');
      executeDiscovery(initialCompanyName, initialJobTitle || 'Software Engineer', initialJobUrl);
    }
  }, [initialCompanyName, initialJobTitle, initialJobUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputUrl(val);
    if (val.trim().length > 10) {
      const parsed = parseJobUrl(val);
      setCompanyName(parsed.companyName);
      setJobTitle(parsed.jobTitle);
      executeDiscovery(parsed.companyName, parsed.jobTitle, val);
    }
  };

  const handleSelectReferrer = async (ref: any) => {
    setSelectedReferrer(ref);
    await generateOutreachDraft(ref, companyName, jobTitle);
  };

  const handleSendViaGmailDirect = () => {
    if (!selectedReferrer) return;
    const gmailUrl = createGmailComposeUrl(
      selectedReferrer.workEmail || '',
      pitchSubject,
      pitchBody
    );
    window.open(gmailUrl, '_blank');

    // Record run
    const newRun: ReferralRun = {
      id: `run_${Date.now()}`,
      jobTitle,
      companyName,
      jobUrl: inputUrl || 'https://careers.company.com',
      sourceBoard: 'LinkedIn',
      runOrigin: 'paste_link',
      status: 'sent',
      targetChannels: { linkedin: true, gmail: true },
      discoveredReferrers,
      selectedReferrerId: selectedReferrer.id,
      linkedInStatus: 'request_sent',
      linkedInConnectionNote: linkedInNote,
      gmailStatus: 'email_sent',
      subject: pitchSubject,
      body: pitchBody,
      sentAt: new Date().toISOString(),
      followUpDays: 3,
      followUpStatus: 'scheduled',
      createdAt: new Date().toISOString()
    };

    onCompleteRun(newRun);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xs">
              ⚡
            </div>
            <div>
              <h3 className="font-bold text-sm">Happpy / RefAgent Outreach Runner</h3>
              <p className="text-[11px] text-slate-400">
                Apollo.io + Hunter.io Contact Discovery & Gemini AI Referral Drafting
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {sentSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Referral email opened in Gmail & outreach run recorded in My Activity!</span>
            </div>
          )}

          {/* Paste Job Link input */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-bold">
              Paste Any Job URL (LinkedIn, Naukri, Indeed, Wellfound, Greenhouse, Lever, Career Page):
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. https://www.linkedin.com/jobs/view/... or https://company.com/careers/..."
                value={inputUrl}
                onChange={handleUrlChange}
                className="w-full pl-3 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                onClick={() => {
                  if (inputUrl) {
                    const parsed = parseJobUrl(inputUrl);
                    setCompanyName(parsed.companyName);
                    setJobTitle(parsed.jobTitle);
                    executeDiscovery(parsed.companyName, parsed.jobTitle, inputUrl);
                  }
                }}
                disabled={!inputUrl || isDiscovering}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-[11px] font-bold uppercase transition-colors"
              >
                {isDiscovering ? 'Analyzing...' : 'Discover'}
              </button>
            </div>
          </div>

          {/* Detected Opportunity */}
          {(companyName || jobTitle) && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-base">
                  {companyName ? companyName.charAt(0) : 'J'}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900">{jobTitle}</div>
                  <div className="text-slate-500 font-semibold text-xs mt-0.5">
                    Company: <span className="text-slate-900">{companyName}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => executeDiscovery(companyName, jobTitle, inputUrl)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isDiscovering ? 'animate-spin' : ''}`} />
                <span>Enrich Contacts</span>
              </button>
            </div>
          )}

          {/* Discovered Current Employees / B2B Contacts */}
          {discoveredReferrers.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 block">
                  Identified Hiring Managers & Peers (Hunter.io / Apollo B2B Data):
                </span>
                <span className="text-[11px] text-slate-500">
                  Select employee to target for referral
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {discoveredReferrers.map((ref) => {
                  const isSelected = selectedReferrer?.id === ref.id;
                  return (
                    <div
                      key={ref.id}
                      onClick={() => handleSelectReferrer(ref)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-500 shadow-xs ring-1 ring-emerald-400'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{ref.fullName}</span>
                            {ref.isHiringManager && (
                              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[9px] font-bold">
                                HIRING MGR
                              </span>
                            )}
                            {ref.isAlumni && (
                              <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded text-[9px] font-bold">
                                ALUMNI
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                            {ref.role}
                          </div>
                          <div className="text-[10px] font-mono text-emerald-700 mt-1">
                            {ref.workEmail}
                          </div>
                        </div>

                        <span className="text-[9px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold shrink-0">
                          {ref.verifiedVia || `${ref.emailConfidence}% verified`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Outreach Drafter Panel */}
          {selectedReferrer && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Personalized Outreach Draft:</span>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Gemini AI 150-Word Personalized</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => generateOutreachDraft(selectedReferrer, companyName, jobTitle)}
                  disabled={isAiDrafting}
                  className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 hover:underline"
                >
                  <RefreshCw className={`w-3 h-3 ${isAiDrafting ? 'animate-spin' : ''}`} />
                  <span>{isAiDrafting ? 'Drafting...' : 'Regenerate with Gemini'}</span>
                </button>
              </div>

              {/* Channel Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
                <button
                  onClick={() => setActiveTab('email')}
                  className={`px-3 py-1 text-xs font-bold rounded-t-md transition-colors flex items-center gap-1.5 ${
                    activeTab === 'email'
                      ? 'border-b-2 border-slate-900 text-slate-900'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-red-500" />
                  <span>Cold Email ({selectedReferrer.workEmail})</span>
                </button>
                <button
                  onClick={() => setActiveTab('linkedin')}
                  className={`px-3 py-1 text-xs font-bold rounded-t-md transition-colors flex items-center gap-1.5 ${
                    activeTab === 'linkedin'
                      ? 'border-b-2 border-slate-900 text-slate-900'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                  <span>LinkedIn Invite Note (&lt;200 chars)</span>
                </button>
              </div>

              {activeTab === 'email' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-500 text-[11px] font-semibold mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={pitchSubject}
                      onChange={(e) => setPitchSubject(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[11px] font-semibold mb-1">
                      150-Word Cold Referral Email
                    </label>
                    <textarea
                      rows={7}
                      value={pitchBody}
                      onChange={(e) => setPitchBody(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs leading-relaxed font-sans"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'linkedin' && (
                <div className="space-y-2">
                  <label className="block text-slate-500 text-[11px] font-semibold">
                    Personalized Connection Request Note:
                  </label>
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={linkedInNote}
                    onChange={(e) => setLinkedInNote(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs leading-relaxed font-sans"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Safe human limit: under 300 chars</span>
                    <span>{linkedInNote.length}/300</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Rate Limiting: Max 10/day · 72h Stop-on-Reply follow-up</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSendViaGmailDirect}
              disabled={!selectedReferrer}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>Send via Gmail & Queue Sequence</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
