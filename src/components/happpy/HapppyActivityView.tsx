import React, { useState } from 'react';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Mail,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Clock,
  ExternalLink,
  Linkedin,
  ShieldCheck,
  Send,
  AlertCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { ReferralRun } from '../../types/referral';
import { happpyStorage } from '../../services/happpyStorage';

interface HapppyActivityViewProps {
  referralRuns: ReferralRun[];
  onOpenPasteModal: () => void;
  onRefreshRuns?: () => void;
}

export const HapppyActivityView: React.FC<HapppyActivityViewProps> = ({
  referralRuns: initialRuns,
  onOpenPasteModal,
  onRefreshRuns
}) => {
  const [runs, setRuns] = useState<ReferralRun[]>(initialRuns);
  const [activeSubTab, setActiveSubTab] = useState<
    'all' | 'followup' | 'responses' | 'linkedin_pending'
  >('all');
  const [search, setSearch] = useState('');
  const [expandedRunId, setExpandedRunId] = useState<string | null>(
    runs[0]?.id || 'run_codersworld_00'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync if prop updates
  React.useEffect(() => {
    setRuns(initialRuns);
  }, [initialRuns]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Simulates LinkedIn connection acceptance and auto-dispatches post-connect pitch
  const handleSimulateAcceptance = (runId: string) => {
    const updated = runs.map((r) => {
      if (r.id === runId) {
        return {
          ...r,
          linkedInStatus: 'pitch_sent' as const,
          discoveredReferrers: r.discoveredReferrers.map((ref, idx) =>
            idx === 0 ? { ...ref, connectionStatus: 'messaged' as const } : ref
          )
        };
      }
      return r;
    });

    setRuns(updated);
    happpyStorage.saveReferralRuns(updated);
    if (onRefreshRuns) onRefreshRuns();
    showToast('✓ LinkedIn connection accepted! Agent auto-dispatched the referral pitch on your behalf.');
  };

  // Simulates employee reply (Stop-on-Reply cancels follow-ups immediately!)
  const handleSimulateReply = (runId: string) => {
    const updated = runs.map((r) => {
      if (r.id === runId) {
        return {
          ...r,
          status: 'replied' as const,
          replyStatus: 'positive' as const,
          replyChannel: 'gmail' as const,
          replySnippet:
            "Hi Aryan, I reviewed your GitHub and resume. You look like a great match for our team. I've submitted your internal referral in our portal!",
          replyReceivedAt: new Date().toISOString(),
          followUpStatus: 'cancelled' as const
        };
      }
      return r;
    });

    setRuns(updated);
    happpyStorage.saveReferralRuns(updated);
    if (onRefreshRuns) onRefreshRuns();
    showToast('✓ Positive reply received! Stop-on-Reply activated: follow-up cancelled.');
  };

  // Manually sends the scheduled 3-day follow-up
  const handleSendFollowUpNow = (runId: string) => {
    const updated = runs.map((r) => {
      if (r.id === runId) {
        return {
          ...r,
          gmailStatus: 'followup_sent' as const,
          followUpStatus: 'sent' as const
        };
      }
      return r;
    });

    setRuns(updated);
    happpyStorage.saveReferralRuns(updated);
    if (onRefreshRuns) onRefreshRuns();
    showToast('✓ 3-Day Follow-up email sent to corporate address.');
  };

  const subtabs = [
    { id: 'all', label: 'All Outreach Campaigns', count: runs.length },
    {
      id: 'linkedin_pending',
      label: 'LinkedIn Invites Pending',
      count: runs.filter((r) => r.linkedInStatus === 'request_sent').length
    },
    {
      id: 'followup',
      label: 'Upcoming Follow-ups',
      count: runs.filter((r) => r.followUpStatus === 'scheduled').length
    },
    {
      id: 'responses',
      label: 'Referral Replies Received',
      count: runs.filter((r) => r.replyStatus === 'positive').length
    }
  ];

  const filteredRuns = runs.filter((r) => {
    if (activeSubTab === 'responses' && !r.replyStatus) return false;
    if (activeSubTab === 'followup' && r.followUpStatus !== 'scheduled') return false;
    if (activeSubTab === 'linkedin_pending' && r.linkedInStatus !== 'request_sent') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.jobTitle.toLowerCase().includes(q) ||
        r.companyName.toLowerCase().includes(q) ||
        (r.discoveredReferrers[0]?.fullName || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-3.5 bg-slate-900 text-white border border-slate-700 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Search Bar (Matches Screenshot 3) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Job Referral Activity
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline of employee invites, messages on your behalf, and Stop-on-Reply follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company, role, employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:border-slate-400"
            />
          </div>

          <button
            onClick={onOpenPasteModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#42dab4] hover:bg-[#34c4a1] text-slate-950 rounded-md text-xs font-bold transition-colors shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Paste Job Link</span>
          </button>
        </div>
      </div>

      {/* Subtabs bar (matches Screenshot 3) */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 overflow-x-auto">
        {subtabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSubTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table section */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-900">
            {activeSubTab === 'responses'
              ? 'Confirmed Recruiter & Employee Responses'
              : 'Multi-Channel Referral Pipeline (LinkedIn + Gmail)'}
          </span>

          <span className="text-slate-400 text-xs">
            Showing {filteredRuns.length} campaigns
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50/50">
              <th className="py-3 px-4">Job & Target Employee</th>
              <th className="py-3 px-4">LinkedIn Status</th>
              <th className="py-3 px-4">Gmail Status</th>
              <th className="py-3 px-4">Follow-up</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRuns.map((run) => {
              const isExpanded = expandedRunId === run.id;
              const targetEmp = run.discoveredReferrers[0];

              return (
                <React.Fragment key={run.id}>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    {/* Col 1: Job & Target */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {run.companyName.charAt(0)}
                        </div>
                        <div>
                          <div
                            onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                            className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer"
                          >
                            {run.jobTitle}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1.5">
                            <span>{run.companyName}</span>
                            <span>·</span>
                            <span className="text-slate-700 font-medium">
                              Target: {targetEmp ? targetEmp.fullName : 'Engineering Team'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Col 2: LinkedIn Status */}
                    <td className="py-3.5 px-4">
                      {run.linkedInStatus === 'request_sent' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-bold">
                          <Linkedin className="w-3 h-3" />
                          <span>Invite Sent</span>
                        </span>
                      )}
                      {run.linkedInStatus === 'connection_accepted' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[11px] font-bold">
                          <UserCheck className="w-3 h-3" />
                          <span>Connected</span>
                        </span>
                      )}
                      {run.linkedInStatus === 'pitch_sent' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Pitch Sent</span>
                        </span>
                      )}
                      {(!run.linkedInStatus || run.linkedInStatus === 'not_started') && (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Col 3: Gmail Status */}
                    <td className="py-3.5 px-4">
                      {run.replyStatus === 'positive' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold">
                          <Mail className="w-3 h-3" />
                          <span>Replied! ✓</span>
                        </span>
                      ) : run.gmailStatus === 'followup_sent' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[11px] font-medium">
                          <span>Follow-up Sent</span>
                        </span>
                      ) : run.gmailStatus === 'email_sent' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-medium">
                          <Mail className="w-3 h-3 text-red-500" />
                          <span>Email Sent</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Col 4: Follow-up Status */}
                    <td className="py-3.5 px-4">
                      {run.followUpStatus === 'cancelled' ? (
                        <span className="text-[11px] text-slate-400 font-medium line-through">
                          Stopped on Reply
                        </span>
                      ) : run.followUpStatus === 'scheduled' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>Due in 3 days</span>
                        </span>
                      ) : run.followUpStatus === 'sent' ? (
                        <span className="text-[11px] text-slate-600 font-medium">
                          Completed
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">None</span>
                      )}
                    </td>

                    {/* Col 5: Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-slate-800 text-xs font-bold transition-colors"
                      >
                        <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Sequence & Action Center */}
                  {isExpanded && (
                    <tr className="bg-slate-50/80">
                      <td colSpan={5} className="p-5 border-b border-slate-200">
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                          {/* Top Controls: Interactive Test Triggers */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">
                                Outreach Sequence Actions:
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Test the agent's real-world behavior for this job.
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {run.linkedInStatus === 'request_sent' && (
                                <button
                                  onClick={() => handleSimulateAcceptance(run.id)}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>Test Acceptance & Send Pitch</span>
                                </button>
                              )}

                              {run.replyStatus !== 'positive' && (
                                <button
                                  onClick={() => handleSimulateReply(run.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Simulate Recruiter Reply</span>
                                </button>
                              )}

                              {run.followUpStatus === 'scheduled' && (
                                <button
                                  onClick={() => handleSendFollowUpNow(run.id)}
                                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Send Follow-up Email Now</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Recruiter Reply Banner (if replied) */}
                          {run.replyStatus === 'positive' && (
                            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1.5 text-emerald-950">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="font-bold text-xs text-emerald-900">
                                  Referral Reply from {targetEmp?.fullName || 'Hiring Lead'} (
                                  {new Date(run.replyReceivedAt || run.createdAt).toLocaleDateString()})
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed italic bg-white/80 p-3 rounded-lg border border-emerald-200">
                                "{run.replySnippet}"
                              </p>
                              <div className="text-[11px] text-emerald-700 font-semibold pt-0.5">
                                ✓ Stop-on-Reply: Automated follow-up sequence cancelled automatically.
                              </div>
                            </div>
                          )}

                          {/* Two-Column Detail: LinkedIn Outreach vs Gmail Outreach */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {/* Left: LinkedIn Channel */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <div className="flex items-center gap-2 font-bold text-slate-900">
                                  <Linkedin className="w-4 h-4 text-[#0a66c2]" />
                                  <span>LinkedIn Sequence</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase text-slate-500">
                                  {run.linkedInStatus?.replace('_', ' ') || 'Active'}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <span className="font-semibold text-slate-700 text-[11px] block">
                                    Step 1: Connection Request Note
                                  </span>
                                  <div className="p-2.5 bg-white rounded border border-slate-200 text-slate-700 font-sans text-[11px] leading-relaxed mt-1">
                                    {run.linkedInConnectionNote ||
                                      `Hi ${
                                        targetEmp?.fullName.split(' ')[0] || 'there'
                                      }, noticed your work at ${run.companyName}. I'm applying for ${
                                        run.jobTitle
                                      } and would love to connect!`}
                                  </div>
                                </div>

                                <div>
                                  <span className="font-semibold text-slate-700 text-[11px] block">
                                    Step 2: Auto-Message Upon Acceptance
                                  </span>
                                  <div className="p-2.5 bg-white rounded border border-slate-200 text-slate-700 font-sans text-[11px] leading-relaxed mt-1">
                                    {run.linkedInDirectMessage ||
                                      `Hi ${
                                        targetEmp?.fullName.split(' ')[0] || 'there'
                                      }, thanks for connecting! I recently applied for ${
                                        run.jobTitle
                                      } at ${run.companyName}. I would be grateful if you could refer me internally.`}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right: Gmail Channel */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <div className="flex items-center gap-2 font-bold text-slate-900">
                                  <Mail className="w-4 h-4 text-red-500" />
                                  <span>Gmail Direct Outreach</span>
                                </div>
                                <span className="font-mono text-[10px] text-slate-500">
                                  To: {targetEmp?.workEmail || 'employee@company.com'}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <span className="font-semibold text-slate-700 text-[11px] block">
                                    Subject:
                                  </span>
                                  <div className="p-2 bg-white rounded border border-slate-200 font-medium text-slate-900 text-[11px] mt-1">
                                    {run.subject}
                                  </div>
                                </div>

                                <div>
                                  <span className="font-semibold text-slate-700 text-[11px] block">
                                    Email Body:
                                  </span>
                                  <div className="p-2.5 bg-white rounded border border-slate-200 text-slate-700 whitespace-pre-wrap font-sans text-[11px] leading-relaxed max-h-40 overflow-y-auto mt-1">
                                    {run.body}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
