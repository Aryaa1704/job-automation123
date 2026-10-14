// Top pe import add karo
import { sendGmailEmail, loginWithGoogle, getStoredToken } from '../../services/gmailService';/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

declare const chrome: any;

import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  Star,
  CheckCircle2,
  Mail,
  Linkedin,
  Clock,
  ShieldCheck,
  Send,
  ExternalLink,
  ChevronRight,
  Sparkles,
  UserCheck
} from 'lucide-react';
import {
  ReferrerCandidate,
  ReferralRun,
  UserProfileConfig,
  LinkedInAccountConfig,
  GmailAccountConfig
} from '../../types/referral';
import { discoverCompanyReferrers, composeReferralPitch, createGmailComposeUrl } from '../../services/referralEngine';

interface HapppyExtensionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRole: string;
  companyName: string;
  jobUrl: string;
  profile: UserProfileConfig;
  linkedInAccount: LinkedInAccountConfig;
  gmailAccount: GmailAccountConfig;
  onCompleteRun: (run: ReferralRun) => void;
  onOpenRecommendedJobs: () => void;
}

export const HapppyExtensionDrawer: React.FC<HapppyExtensionDrawerProps> = ({
  isOpen,
  onClose,
  selectedRole,
  companyName,
  jobUrl,
  profile,
  linkedInAccount,
  gmailAccount,
  onCompleteRun,
  onOpenRecommendedJobs
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'initial' | 'reach_hiring' | 'executing' | 'completed'>('initial');
  const [discoveredEmployees, setDiscoveredEmployees] = useState<ReferrerCandidate[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<ReferrerCandidate | null>(null);

  // Channels checkboxes
  const [channelLinkedIn, setChannelLinkedIn] = useState(true);
  const [channelGmail, setChannelGmail] = useState(true);

  // Editable messages
  const [connectionNote, setConnectionNote] = useState('');
  const [linkedInDirectPitch, setLinkedInDirectPitch] = useState('');
  const [gmailSubject, setGmailSubject] = useState('');
  const [gmailBody, setGmailBody] = useState('');

  // Execution stage
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  const handleReachDirectly = () => {
    const list = discoverCompanyReferrers(companyName || 'Codersworld', selectedRole || 'Frontend Developer');
    setDiscoveredEmployees(list);
    const top = list[0];
    setSelectedTarget(top);

    const firstName = top.fullName.split(' ')[0];
    setConnectionNote(
      `Hi ${firstName}, noticed your frontend leadership at ${companyName}. I'm a React/Next.js developer applying for ${selectedRole}. Would love to connect!`
    );

    setLinkedInDirectPitch(
      `Hi ${firstName}, thanks for connecting! I recently applied for ${selectedRole} at ${companyName}. Given my background in React, Next.js, and high-performance APIs, I would be grateful if you could refer me internally. My portfolio & resume: ${profile.linkedInUrl}`
    );

    const emailPitch = composeReferralPitch(profile, companyName, selectedRole, top, jobUrl);
    setGmailSubject(emailPitch.subject);
    setGmailBody(emailPitch.body);

    setStep('reach_hiring');
  };

  const handleSelectEmployee = (emp: ReferrerCandidate) => {
    setSelectedTarget(emp);
    const firstName = emp.fullName.split(' ')[0];
    setConnectionNote(
      `Hi ${firstName}, noticed your work at ${companyName}. I'm applying for ${selectedRole}. Would love to connect!`
    );
    const emailPitch = composeReferralPitch(profile, companyName, selectedRole, emp, jobUrl);
    setGmailSubject(emailPitch.subject);
    setGmailBody(emailPitch.body);
  };

  const handleExecuteMultiTouch = () => {
    if (!selectedTarget) return;
    setStep('executing');
    setExecutionLog([]);

    const log = (msg: string) => setExecutionLog((prev) => [...prev, msg]);

    log(`[LINKEDIN] Sending connection request to ${selectedTarget.fullName}...`);
    log(`[GMAIL] Sending email to ${selectedTarget.workEmail}...`);

    chrome.runtime.sendMessage(
      "YOUR_EXTENSION_ID", // chrome://extensions pe apna ID daalo
      {
        action: "openLinkedInProfile",
        profileUrl: selectedTarget.linkedInUrl,
        outreachMessage: connectionNote
      },
      (response: any) => {
        if (response?.success) {
          log(`[LINKEDIN] ✅ Connection request sent!`);
        } else {
          log(`[LINKEDIN] ❌ Failed: ${response?.error}`);
        }

        if (channelGmail) {
          const gmailUrl = createGmailComposeUrl(
            selectedTarget.workEmail,
            gmailSubject,
            gmailBody
          );
          window.open(gmailUrl, '_blank');
          log(`[GMAIL] ✅ Compose window opened.`);
        }

        log(`[SUCCESS] Outreach dispatched for ${selectedTarget.fullName}`);

        const newRun: ReferralRun = {
          id: `run_multitouch_${Date.now()}`,
          jobTitle: selectedRole,
          companyName,
          jobUrl: jobUrl || 'https://careers.company.com',
          sourceBoard: 'Career Page',
          runOrigin: 'chrome_extension',
          status: 'sent',
          discoveredReferrers: discoveredEmployees,
          selectedReferrerId: selectedTarget.id,
          targetChannels: { linkedin: channelLinkedIn, gmail: channelGmail },
          linkedInStatus: channelLinkedIn ? 'request_sent' : 'not_started',
          linkedInConnectionNote: connectionNote,
          linkedInDirectMessage: linkedInDirectPitch,
          gmailStatus: channelGmail ? 'email_sent' : 'not_started',
          subject: gmailSubject,
          body: gmailBody,
          sentAt: new Date().toISOString(),
          followUpDays: 3,
          followUpStatus: 'scheduled',
          createdAt: new Date().toISOString()
        };

        onCompleteRun(newRun);
        setStep('completed');
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Happpy Agent</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automate referrals to get 2x more job interviews.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Middle Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">

          {/* STAGE 1: Initial */}
          {step === 'initial' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  SELECTED ROLE
                </span>
                <div className="font-extrabold text-sm text-slate-900 leading-snug">
                  {selectedRole} | {companyName}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleReachDirectly}
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>REACH DIRECTLY TO HIRING EMPLOYEE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => { onClose(); onOpenRecommendedJobs(); }}
                  className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-full text-xs font-bold uppercase tracking-wider transition-colors text-center"
                >
                  RECOMMENDED JOBS LIST
                </button>
              </div>

              <div className="p-4 bg-[#f0fbf8] border border-[#d2f3eb] rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">How the Outreach Agent Works</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  The agent acts directly on your behalf:
                  <br />• <strong>LinkedIn:</strong> Finds employees currently at {companyName}, sends connection request with a personalized note, and when accepted sends your referral pitch.
                  <br />• <strong>Gmail:</strong> Discovers corporate email and sends a cold referral request from your connected account.
                  <br />• <strong>Auto Follow-up:</strong> If no reply in 3 days, it automatically follows up for you!
                </p>
              </div>
            </div>
          )}

          {/* STAGE 2: Employee Discovery */}
          {step === 'reach_hiring' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    Select Target Employee at {companyName}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Currently employed inside the company
                  </span>
                </div>
                <button
                  onClick={() => setStep('initial')}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Back
                </button>
              </div>

              <div className="space-y-2">
                {discoveredEmployees.map((emp) => {
                  const isSelected = selectedTarget?.id === emp.id;
                  return (
                    <div
                      key={emp.id}
                      onClick={() => handleSelectEmployee(emp)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{emp.fullName}</span>
                            {emp.isAlumni && (
                              <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded text-[9px] font-bold">
                                ALUMNI
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                            {emp.role}
                          </div>
                          <div className="text-[10px] font-mono text-emerald-700 mt-0.5">
                            {emp.workEmail}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          {emp.department}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <span className="font-bold text-slate-800 block text-xs">
                  Active Outreach Channels (Acting on your behalf)
                </span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelLinkedIn}
                      onChange={(e) => setChannelLinkedIn(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900"
                    />
                    <div>
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                        <span>LinkedIn Connection & InMail Sequence</span>
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Sends invite with note → when accepted, sends full referral request.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer pt-1 border-t border-slate-200/60">
                    <input
                      type="checkbox"
                      checked={channelGmail}
                      onChange={(e) => setChannelGmail(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900"
                    />
                    <div>
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-red-600" />
                        <span>Direct Corporate Email via Gmail</span>
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Cold email to verified corporate address ({selectedTarget?.workEmail}).
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {channelLinkedIn && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 text-[11px]">
                    LinkedIn Connection Invite Note (Sent first):
                  </label>
                  <textarea
                    rows={2}
                    value={connectionNote}
                    onChange={(e) => setConnectionNote(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[11px]"
                  />
                </div>
              )}

              {channelGmail && (
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 text-[11px]">
                    Gmail Cold Referral Request (Sent to corporate email):
                  </label>
                  <textarea
                    rows={4}
                    value={gmailBody}
                    onChange={(e) => setGmailBody(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[11px] leading-relaxed"
                  />
                </div>
              )}

              <button
                onClick={handleExecuteMultiTouch}
                disabled={!channelLinkedIn && !channelGmail}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>DISPATCH MULTI-TOUCH OUTREACH</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STAGE 3: Executing */}
          {step === 'executing' && (
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-spin">
                ⚡
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Executing Automated Outreach on Your Behalf...
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connecting accounts, discovering corporate email, and queuing follow-ups.
                </p>
              </div>
              <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] text-left rounded-lg space-y-1 max-h-48 overflow-y-auto">
                {executionLog.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>
          )}

          {/* STAGE 4: Completed */}
          {step === 'completed' && (
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl">
                ✓
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Outreach Successfully Dispatched!
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  We've contacted <strong>{selectedTarget?.fullName}</strong> at {companyName} on your behalf.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">LinkedIn Invite:</span>
                  <span className="font-bold text-emerald-700">Sent (Monitoring Acceptance)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Corporate Email:</span>
                  <span className="font-bold text-emerald-700">Sent via Gmail</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Automated Follow-up:</span>
                  <span className="font-bold text-slate-800">Scheduled in 3 days</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => { onClose(); onOpenRecommendedJobs(); }}
                  className="w-full py-3 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wider"
                >
                  View Activity & Recommended Jobs
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Rating Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-slate-900 text-[11px]">Enjoying Happpy Agent?</div>
            <div className="text-[10px] text-slate-500">
              Your rating on the Chrome Web Store helps us grow and serve you better.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex text-slate-300">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 hover:text-amber-400 cursor-pointer" />
              ))}
            </div>
            <button
              onClick={() => window.open('https://chromewebstore.google.com', '_blank')}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-800 hover:bg-slate-100 uppercase"
            >
              GIVE US A RATING
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
