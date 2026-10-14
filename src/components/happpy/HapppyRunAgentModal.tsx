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
  Briefcase
} from 'lucide-react';
import { UserProfileConfig, ReferrerCandidate, ReferralRun } from '../../types/referral';
import {
  parseJobUrl,
  discoverCompanyReferrers,
  composeReferralPitch,
  createGmailComposeUrl
} from '../../services/referralEngine';

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
  const [discoveredReferrers, setDiscoveredReferrers] = useState<ReferrerCandidate[]>([]);
  const [selectedReferrer, setSelectedReferrer] = useState<ReferrerCandidate | null>(null);
  const [pitchSubject, setPitchSubject] = useState('');
  const [pitchBody, setPitchBody] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  // Trigger discovery when company name or job title is ready
  const executeDiscovery = (company: string, title: string, url: string) => {
    if (!company) return;
    setIsDiscovering(true);
    setTimeout(() => {
      const referrers = discoverCompanyReferrers(company, title);
      setDiscoveredReferrers(referrers);
      const topRef = referrers[0];
      setSelectedReferrer(topRef);

      const pitch = composeReferralPitch(profile, company, title, topRef, url);
      setPitchSubject(pitch.subject);
      setPitchBody(pitch.body);
      setIsDiscovering(false);
    }, 600);
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

  const handleSelectReferrer = (ref: ReferrerCandidate) => {
    setSelectedReferrer(ref);
    const pitch = composeReferralPitch(profile, companyName, jobTitle, ref, inputUrl);
    setPitchSubject(pitch.subject);
    setPitchBody(pitch.body);
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
      targetChannels: { linkedin: false, gmail: true },
      discoveredReferrers,
      selectedReferrerId: selectedReferrer.id,
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
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-xs">
              ⚡
            </div>
            <div>
              <h3 className="font-bold text-sm">Happpy Referral Outreach Agent</h3>
              <p className="text-[11px] text-slate-400">
                Direct LinkedIn company employee discovery & high-conversion Gmail referral
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
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Referral email opened in Gmail & outreach run recorded in My Activity!</span>
            </div>
          )}

          {/* Paste Job Link input */}
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-bold">
              Paste Job URL from any site (LinkedIn, Wellfound, Naukri, Indeed, or Career Page):
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. https://www.linkedin.com/jobs/view/4123456789 or https://wellfound.com/..."
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
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${isDiscovering ? 'animate-spin' : ''}`} />
                <span>Refresh Referrers</span>
              </button>
            </div>
          )}

          {/* Discovered Current Employees / Referrers */}
          {discoveredReferrers.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 block">
                  Discovered Current Employees (Target Referrers):
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
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-500 shadow-xs ring-1 ring-emerald-400'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{ref.fullName}</span>
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
                            {ref.workEmail} ({ref.emailConfidence}% verified)
                          </div>
                        </div>

                        <a
                          href={ref.linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:underline text-[10px] flex items-center gap-0.5 shrink-0"
                        >
                          <span>LinkedIn</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Generated Personalized Referral Request */}
          {selectedReferrer && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Personalized Referral Request Draft:</span>
                <span className="text-[11px] font-mono text-slate-500">
                  Target: {selectedReferrer.workEmail}
                </span>
              </div>

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
                  Email Body (Incorporates Aryan Sharma's Verified Credentials)
                </label>
                <textarea
                  rows={8}
                  value={pitchBody}
                  onChange={(e) => setPitchBody(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-slate-800 text-xs leading-relaxed font-sans"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-semibold hover:bg-slate-100"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendViaGmailDirect}
              disabled={!selectedReferrer}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              <span>Send via Gmail & Record Run</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
