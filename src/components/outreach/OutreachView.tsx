import React, { useState, useEffect } from 'react';
import {
  Send,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Clock,
  RotateCcw,
  MessageSquare,
  FileText,
  User,
  Sparkles,
  Hash,
  XCircle,
  MailCheck,
  Ban
} from 'lucide-react';
import {
  Application,
  Job,
  OutreachMessage,
  RecruiterContact,
  ResumeVersion
} from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { createApprovalFingerprint, computeSha256 } from '../../services/hashService';

interface OutreachViewProps {
  outreachMessages: OutreachMessage[];
  applications: Application[];
  jobs: Job[];
  contacts: RecruiterContact[];
  resumeVersions: ResumeVersion[];
  selectedMessage: OutreachMessage | null;
  onSelectMessage: (msg: OutreachMessage | null) => void;
  onUpdateMessage: (updated: OutreachMessage) => void;
  onApproveMessage: (messageId: string, fingerprint: string) => void;
  onSendMessage: (messageId: string) => void;
  onSimulateReply: (messageId: string) => void;
  onCancelFollowUp: (messageId: string) => void;
}

export const OutreachView: React.FC<OutreachViewProps> = ({
  outreachMessages,
  applications,
  jobs,
  contacts,
  resumeVersions,
  selectedMessage,
  onSelectMessage,
  onUpdateMessage,
  onApproveMessage,
  onSendMessage,
  onSimulateReply,
  onCancelFollowUp
}) => {
  const [activeMessageId, setActiveMessageId] = useState<string>(
    selectedMessage ? selectedMessage.id : outreachMessages[0]?.id || ''
  );

  const activeMsg = outreachMessages.find((m) => m.id === activeMessageId) || outreachMessages[0];

  const [editSubject, setEditSubject] = useState(activeMsg?.subject || '');
  const [editBody, setEditBody] = useState(activeMsg?.body || '');
  const [calculatedFingerprint, setCalculatedFingerprint] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // Re-sync editor when activeMsg changes
  useEffect(() => {
    if (activeMsg) {
      setEditSubject(activeMsg.subject);
      setEditBody(activeMsg.body);
    }
  }, [activeMsg?.id]);

  // Dynamically calculate live fingerprint of current editor buffer
  useEffect(() => {
    if (!activeMsg) return;
    let isSubscribed = true;
    createApprovalFingerprint({
      recipient: activeMsg.recipientSnapshot,
      channel: activeMsg.channel,
      subject: editSubject,
      body: editBody,
      resumeVersionId: activeMsg.resumeVersionId
    }).then((fp) => {
      if (isSubscribed) setCalculatedFingerprint(fp);
    });
    return () => {
      isSubscribed = false;
    };
  }, [activeMsg?.recipientSnapshot, activeMsg?.channel, activeMsg?.resumeVersionId, editSubject, editBody]);

  // Check if live buffer matches stored approved fingerprint
  const isApproved =
    activeMsg?.status === 'approved' &&
    activeMsg?.approvedFingerprint === calculatedFingerprint;

  const isStale =
    activeMsg?.status === 'approved' &&
    activeMsg?.approvedFingerprint !== calculatedFingerprint;

  const canSend = isApproved && activeMsg?.status === 'approved';

  const jobMap = new Map(jobs.map((j) => [j.id, j]));
  const contactMap = new Map(contacts.map((c) => [c.id, c]));
  const appMap = new Map(applications.map((a) => [a.id, a]));
  const resumeMap = new Map(resumeVersions.map((r) => [r.id, r]));

  const currentApp = activeMsg ? appMap.get(activeMsg.applicationId) : null;
  const currentJob = currentApp ? jobMap.get(currentApp.jobId) : null;
  const currentContact = activeMsg ? contactMap.get(activeMsg.contactId) : null;
  const currentResume = activeMsg?.resumeVersionId ? resumeMap.get(activeMsg.resumeVersionId) : null;

  const handleSaveDraftChanges = () => {
    if (!activeMsg) return;
    const updated: OutreachMessage = {
      ...activeMsg,
      subject: editSubject,
      body: editBody,
      contentVersion: activeMsg.contentVersion + 1,
      // Any content modification automatically voids prior approval!
      status: activeMsg.status === 'approved' ? 'awaiting_approval' : activeMsg.status,
      approvedFingerprint: undefined,
      approvedAt: undefined
    };
    onUpdateMessage(updated);
  };

  const handleApprove = async () => {
    if (!activeMsg) return;
    const fp = await createApprovalFingerprint({
      recipient: activeMsg.recipientSnapshot,
      channel: activeMsg.channel,
      subject: editSubject,
      body: editBody,
      resumeVersionId: activeMsg.resumeVersionId
    });
    onApproveMessage(activeMsg.id, fp);
  };

  const handleTriggerSend = () => {
    if (!canSend || !activeMsg) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      onSendMessage(activeMsg.id);
      setSendSuccessMessage(
        `Email verified & sent to ${activeMsg.recipientSnapshot} under authorized OAuth scopes.`
      );
      setTimeout(() => setSendSuccessMessage(null), 5000);
    }, 700);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner explaining Section 6.4 Approval Locking */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Cryptographically Bound Approval Architecture (FR-11 & Section 6.4)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Every outreach draft is locked by a SHA-256 fingerprint binding the exact recipient, subject, body, and attached resume version. Any mutation of text immediately invalidates approval. Zero unapproved external sends.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 rounded text-slate-700 border border-slate-200">
            PROVIDER: GMAIL API MOCK
          </span>
        </div>
      </div>

      {sendSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{sendSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Outreach Queue List & Editor / Approval Station */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages Queue List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Outreach Queue</span>
            <span>{outreachMessages.length} total</span>
          </div>

          {outreachMessages.map((msg) => {
            const isSelected = activeMsg?.id === msg.id;
            const contact = contactMap.get(msg.contactId);
            return (
              <button
                key={msg.id}
                onClick={() => {
                  setActiveMessageId(msg.id);
                  onSelectMessage(msg);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-blue-50/50 border-blue-400 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 truncate">
                    {contact?.fullName || msg.recipientSnapshot}
                  </span>
                  <StatusBadge status={msg.status} size="sm" />
                </div>
                <div className="text-xs text-slate-600 line-clamp-1 mt-0.5">{msg.subject}</div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="capitalize">{msg.channel}</span>
                  <span className="font-mono text-[10px]">
                    {msg.status === 'sent' && msg.replyReceivedAt
                      ? 'Replied'
                      : msg.followUpDueAt
                      ? `Follow-up in 5d`
                      : ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Editor & Approval Station */}
        {activeMsg ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Approval Status Header Card */}
            <div
              className={`p-4 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                isApproved
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : isStale
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  {isApproved ? (
                    <Lock className="w-4 h-4 text-emerald-600" />
                  ) : isStale ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Unlock className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="font-bold">
                    {isApproved
                      ? 'Approved & Sealed with SHA-256 Fingerprint'
                      : isStale
                      ? 'APPROVAL STALE: Content modified after approval!'
                      : 'Draft Awaiting Explicit User Approval'}
                  </span>
                </div>
                <p className="text-[11px] opacity-80 mt-1 max-w-xl">
                  {isApproved
                    ? 'The exact content matches the authorization token. Ready to transmit.'
                    : isStale
                    ? 'You modified text in the subject or body. Previous approval was automatically invalidated according to TRD 7.7. Re-approval required.'
                    : 'Review the message content and attached evidence before granting send authorization.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isApproved && activeMsg.status !== 'sent' && (
                  <button
                    onClick={handleApprove}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs shadow-xs transition-colors"
                  >
                    Approve Exact Content
                  </button>
                )}

                {canSend && activeMsg.status !== 'sent' && (
                  <button
                    onClick={handleTriggerSend}
                    disabled={isSending}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs shadow-xs transition-colors disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-pulse' : ''}`} />
                    <span>{isSending ? 'Sending...' : 'Send Message'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Recipient & Attachment Metadata */}
            <div className="bg-white border border-slate-200/80 rounded-lg p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Authorized Recruiter:</span>
                  <div className="font-semibold text-slate-800">
                    {currentContact?.fullName} ({currentContact?.roleTitle})
                  </div>
                  <div className="font-mono text-slate-600 text-[11px] mt-0.5">
                    {activeMsg.recipientSnapshot}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Attached Evidence Artifact:</span>
                  {currentResume ? (
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tailored Resume Variant #{currentResume.versionNo}</span>
                      <span className="text-slate-400 text-[10px] font-mono">
                        ({currentResume.contentHash.slice(0, 16)}...)
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400">None attached</span>
                  )}
                </div>
              </div>

              {/* SHA-256 Fingerprint Display */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Hash className="w-3 h-3 text-slate-400" />
                  <span>Calculated Payload Fingerprint:</span>
                </div>
                <span className="text-slate-800 font-semibold truncate max-w-sm">
                  {calculatedFingerprint || 'Computing...'}
                </span>
              </div>
            </div>

            {/* Message Subject & Body Editor */}
            <div className="bg-white border border-slate-200/80 rounded-lg p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Subject Line</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  disabled={activeMsg.status === 'sent'}
                  className="w-full p-2 border border-slate-200 rounded text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Message Body (Facts Verified Against Master Resume)
                </label>
                <textarea
                  rows={9}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  disabled={activeMsg.status === 'sent'}
                  className="w-full p-3 border border-slate-200 rounded text-slate-800 font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
                />
              </div>

              {activeMsg.status !== 'sent' && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    Version #{activeMsg.contentVersion} · Changes trigger approval invalidation
                  </span>
                  <button
                    onClick={handleSaveDraftChanges}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium"
                  >
                    Save Draft Buffer
                  </button>
                </div>
              )}
            </div>

            {/* Follow-up Sequence & Reply Simulation (FR-12 & Appendix B Step 6) */}
            <div className="bg-white border border-slate-200/80 rounded-lg p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">Follow-up Sequence Automation</h4>
                  <p className="text-[11px] text-slate-500">
                    Automatically halts and cancels future follow-ups when recruiter replies (FR-12)
                  </p>
                </div>
                {activeMsg.followUpStatus === 'cancelled' ? (
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-mono">
                    CANCELLED ON REPLY
                  </span>
                ) : activeMsg.followUpStatus === 'scheduled' ? (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-mono">
                    SCHEDULED (5 DAYS)
                  </span>
                ) : (
                  <span className="text-slate-400 font-mono text-[10px]">INACTIVE</span>
                )}
              </div>

              {activeMsg.status === 'sent' && !activeMsg.replyReceivedAt && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Follow-up #1 scheduled in 5 days if no reply is received.</span>
                  </div>

                  {/* Appendix B Step 6 Simulation Trigger */}
                  <button
                    onClick={() => onSimulateReply(activeMsg.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors"
                  >
                    <MailCheck className="w-3.5 h-3.5" />
                    <span>Simulate Recruiter Reply</span>
                  </button>
                </div>
              )}

              {activeMsg.replyReceivedAt && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded text-purple-950 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <MailCheck className="w-4 h-4 text-purple-700" />
                    <span>Reply Detected & Follow-up Automatically Cancelled</span>
                  </div>
                  <p className="text-[11px] italic text-purple-900">
                    "{activeMsg.replySnippet || 'Thanks for reaching out Aryan! We would love to set up an introductory chat.'}"
                  </p>
                  <div className="text-[10px] text-purple-700 font-mono pt-1">
                    Timestamp: {new Date(activeMsg.replyReceivedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-lg border border-slate-200">
            No outreach message selected.
          </div>
        )}
      </div>
    </div>
  );
};
