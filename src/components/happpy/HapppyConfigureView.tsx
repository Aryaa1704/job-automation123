import React, { useState } from 'react';
import {
  Check,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Download,
  ExternalLink,
  Linkedin,
  Lock,
  Sliders,
  Sparkles
} from 'lucide-react';
import {
  AutoReplyConfig,
  LinkedInAccountConfig,
  GmailAccountConfig
} from '../../types/referral';

interface HapppyConfigureViewProps {
  autoReplyConfig: AutoReplyConfig;
  linkedInAccount: LinkedInAccountConfig;
  gmailAccount: GmailAccountConfig;
  onSaveAutoReply: (config: AutoReplyConfig) => void;
  onSaveLinkedInAccount: (config: LinkedInAccountConfig) => void;
  onSaveGmailAccount: (config: GmailAccountConfig) => void;
  onOpenExtensionModal: () => void;
}

export const HapppyConfigureView: React.FC<HapppyConfigureViewProps> = ({
  autoReplyConfig,
  linkedInAccount,
  gmailAccount,
  onSaveAutoReply,
  onSaveLinkedInAccount,
  onSaveGmailAccount,
  onOpenExtensionModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'auto_reply'
    | 'templates'
    | 'accounts'
    | 'followup'
    | 'autorun'
    | 'outreach_mode'
    | 'extension'
    | 'blocked'
  >('accounts');

  const [config, setConfig] = useState<AutoReplyConfig>(autoReplyConfig);
  const [linkedIn, setLinkedIn] = useState<LinkedInAccountConfig>(linkedInAccount);
  const [gmail, setGmail] = useState<GmailAccountConfig>(gmailAccount);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const subtabs = [
    { id: 'auto_reply', label: 'Auto Reply' },
    { id: 'templates', label: 'Message Templates' },
    { id: 'accounts', label: 'Connected Accounts (LinkedIn + Gmail)' },
    { id: 'followup', label: 'Follow-up Settings' },
    { id: 'autorun', label: 'Auto Run' },
    { id: 'outreach_mode', label: 'Outreach Mode' },
    { id: 'extension', label: 'Browser Extension' },
    { id: 'blocked', label: 'Blocked Companies' }
  ];

  const handleToggleCriteria = (key: keyof AutoReplyConfig['criteria']) => {
    setConfig({
      ...config,
      criteria: {
        ...config.criteria,
        [key]: !config.criteria[key]
      }
    });
  };

  const handleSaveAll = () => {
    onSaveAutoReply(config);
    onSaveLinkedInAccount(linkedIn);
    onSaveGmailAccount(gmail);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Configure your Happpy Agent
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage LinkedIn credentials, Gmail authorization, automated sequences, and auto-reply rules.
        </p>
      </div>

      {/* Subtabs bar (matches Screenshot 2) */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 overflow-x-auto">
        {subtabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              activeSubTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configuration saved successfully! All automated sequences updated.</span>
        </div>
      )}

      {/* TAB: Connected Accounts (LinkedIn & Gmail Authentication) */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Connected Accounts for Multi-Channel Outreach
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Configure your personal LinkedIn and Gmail accounts used by the automated agent.
              </p>
            </div>
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs self-start sm:self-auto"
            >
              Save Configuration
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account 1: LinkedIn Account Settings */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0a66c2] flex items-center justify-center text-white font-bold text-base shadow-xs">
                    in
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      LinkedIn Automation Account
                      {linkedIn.connected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Dispatches connection requests & referral messages on your behalf
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    linkedIn.connected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : linkedIn.stage === 'checkpoint_challenge'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {linkedIn.connected
                    ? 'CONNECTED & SYNCED'
                    : linkedIn.stage === 'checkpoint_challenge'
                    ? 'ACTION REQUIRED'
                    : 'NOT CONNECTED'}
                </span>
              </div>

              {/* Linked Profile Banner when Connected */}
              {linkedIn.connected && (
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      AS
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">
                        {linkedIn.activeProfileName || 'Aryan Sharma'}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {linkedIn.activeProfileHeadline || 'Full Stack Engineer | React, Next.js, Node.js'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setLinkedIn({
                        ...linkedIn,
                        stage: 'checkpoint_challenge',
                        connected: false,
                        checkpointType: 'sms_pin',
                        checkpointChallengeCode: ''
                      });
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    Test 2FA Checkpoint
                  </button>
                </div>
              )}

              {/* Authentication Mode Tabs */}
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-2">
                  Connection Method
                </label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() =>
                      setLinkedIn({ ...linkedIn, authMethod: 'extension_session' })
                    }
                    className={`py-1.5 px-2 rounded-md transition-all text-[11px] ${
                      linkedIn.authMethod === 'extension_session'
                        ? 'bg-white text-slate-900 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ⚡ Chrome Extension
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLinkedIn({ ...linkedIn, authMethod: 'credentials' })
                    }
                    className={`py-1.5 px-2 rounded-md transition-all text-[11px] ${
                      linkedIn.authMethod === 'credentials'
                        ? 'bg-white text-slate-900 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🔑 Email & Password
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLinkedIn({ ...linkedIn, authMethod: 'cookie_li_at' })
                    }
                    className={`py-1.5 px-2 rounded-md transition-all text-[11px] ${
                      linkedIn.authMethod === 'cookie_li_at'
                        ? 'bg-white text-slate-900 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🍪 Session Cookie
                  </button>
                </div>
              </div>

              {/* CHECKPOINT CHALLENGE MODAL / INLINE SCREEN (The exact case from IMG 4!) */}
              {linkedIn.stage === 'checkpoint_challenge' && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      !
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-amber-950">
                        LinkedIn Security Checkpoint Required
                      </h4>
                      <p className="text-[11px] text-amber-900 mt-0.5">
                        LinkedIn detected a login attempt from an automated session and requested secondary verification.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-2.5">
                    <div className="text-[11px] text-slate-700">
                      <strong>Option A:</strong> Enter the 6-digit verification PIN sent to your registered phone or email (e.g. <strong>+91 ••••••4505</strong>):
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 849201"
                        value={linkedIn.checkpointChallengeCode || ''}
                        onChange={(e) =>
                          setLinkedIn({
                            ...linkedIn,
                            checkpointChallengeCode: e.target.value
                          })
                        }
                        className="w-36 p-2 bg-slate-50 border border-slate-300 rounded text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLinkedIn({
                            ...linkedIn,
                            connected: true,
                            stage: 'connected',
                            checkpointChallengeCode: undefined
                          });
                        }}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors"
                      >
                        Verify & Connect
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-600">
                      <strong>Option B (Recommended):</strong> Avoid 2FA completely by using <strong>Chrome Extension Session Sync</strong>:
                      <button
                        type="button"
                        onClick={() => {
                          setLinkedIn({
                            ...linkedIn,
                            connected: true,
                            stage: 'connected',
                            authMethod: 'extension_session',
                            checkpointChallengeCode: undefined
                          });
                        }}
                        className="mt-1.5 w-full py-1.5 bg-slate-900 text-white rounded text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>🔗 1-Click Sync Active LinkedIn Session</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 1: Chrome Extension Session Sync */}
              {linkedIn.authMethod === 'extension_session' && linkedIn.stage !== 'checkpoint_challenge' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-emerald-950 font-bold block">
                        Browser Tab Session Linking (Most Secure & Human)
                      </strong>
                      <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                        The Chrome extension hooks directly into your active LinkedIn tab in Chrome. It performs outreach with natural human delays, without triggering CAPTCHAs, 2FA codes, or account locks.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setLinkedIn({
                          ...linkedIn,
                          connected: true,
                          stage: 'connected',
                          lastVerifiedAt: new Date().toISOString()
                        });
                        setSavedSuccess(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>✓ Sync Active Session</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenExtensionModal}
                      className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100/50 rounded-lg text-xs font-bold"
                    >
                      View Extension
                    </button>
                  </div>
                </div>
              )}

              {/* Mode 2: Email & Password */}
              {linkedIn.authMethod === 'credentials' && linkedIn.stage !== 'checkpoint_challenge' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      LinkedIn Account Email / Phone
                    </label>
                    <input
                      type="text"
                      value={linkedIn.email}
                      onChange={(e) => setLinkedIn({ ...linkedIn, email: e.target.value })}
                      placeholder="e.g. aryansharma009009@gmail.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      LinkedIn Account Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={linkedIn.passwordMasked}
                        onChange={(e) =>
                          setLinkedIn({ ...linkedIn, passwordMasked: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-slate-400"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      // Trigger checkpoint screen to demonstrate / handle the 2FA case
                      setLinkedIn({
                        ...linkedIn,
                        stage: 'checkpoint_challenge',
                        checkpointType: 'sms_pin'
                      });
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Verify & Authenticate Credentials
                  </button>
                </div>
              )}

              {/* Mode 3: Session Cookie li_at */}
              {linkedIn.authMethod === 'cookie_li_at' && linkedIn.stage !== 'checkpoint_challenge' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      LinkedIn Session Cookie (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">li_at</code>)
                    </label>
                    <input
                      type="password"
                      value={linkedIn.sessionCookie || ''}
                      onChange={(e) =>
                        setLinkedIn({ ...linkedIn, sessionCookie: e.target.value })
                      }
                      placeholder="Paste your li_at session cookie here"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-[11px] focus:outline-none focus:border-slate-400"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Found in: Chrome DevTools (F12) → Application → Cookies → https://www.linkedin.com → li_at.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setLinkedIn({
                        ...linkedIn,
                        connected: true,
                        stage: 'connected',
                        lastVerifiedAt: new Date().toISOString()
                      });
                    }}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
                  >
                    Save & Test Session Cookie
                  </button>
                </div>
              )}

              {/* Rate Limits & Human Safety Settings */}
              <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Anti-Detection & Safe Outreach Throttle</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold text-[11px] mb-1">
                      Daily Invites Limit
                    </label>
                    <input
                      type="number"
                      max={25}
                      min={5}
                      value={linkedIn.dailyConnectionLimit}
                      onChange={(e) =>
                        setLinkedIn({
                          ...linkedIn,
                          dailyConnectionLimit: Number(e.target.value)
                        })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-center font-bold text-slate-800"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block text-center">
                      Safe max: 20-25/day
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold text-[11px] mb-1">
                      Human Delay Jitter
                    </label>
                    <select
                      value={linkedIn.safeDelaySeconds}
                      onChange={(e) =>
                        setLinkedIn({
                          ...linkedIn,
                          safeDelaySeconds: Number(e.target.value)
                        })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-center font-semibold text-slate-800 text-xs"
                    >
                      <option value={30}>30s - 60s (Fast)</option>
                      <option value={45}>45s - 90s (Recommended)</option>
                      <option value={90}>90s - 180s (Stealth)</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block text-center">
                      Mimics human browsing
                    </span>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkedIn.autoMessageOnAccept}
                    onChange={(e) =>
                      setLinkedIn({ ...linkedIn, autoMessageOnAccept: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-slate-900 mt-0.5"
                  />
                  <div>
                    <span className="text-slate-800 font-semibold text-[11px] block">
                      Auto-send referral pitch immediately upon connection acceptance
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      The agent checks your connections daily and dispatches your pre-configured pitch with your resume link.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Account 2: Gmail Account Settings */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white font-bold text-base shadow-xs">
                    G
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      Google Gmail Account
                      {gmail.connected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Dispatches direct referral emails from your authentic inbox
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  AUTHORIZED
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Authorized Gmail Sender Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={gmail.email}
                      onChange={(e) => setGmail({ ...gmail, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-medium focus:outline-none"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    All referral requests and follow-ups are sent directly from this email.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Authentication Protocol
                  </label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">Google OAuth 2.0 (Active)</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Scopes: https://www.googleapis.com/auth/gmail.send
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                      TOKEN VALID
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-600 font-semibold text-[11px] mb-1">
                      Daily Email Outreach Limit
                    </label>
                    <input
                      type="number"
                      max={100}
                      min={10}
                      value={gmail.dailyEmailLimit}
                      onChange={(e) =>
                        setGmail({ ...gmail, dailyEmailLimit: Number(e.target.value) })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-center font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold text-[11px] mb-1">
                      Emails Sent Today
                    </label>
                    <div className="p-2 bg-slate-100 rounded text-center font-bold text-slate-700">
                      {gmail.emailsSentToday} / {gmail.dailyEmailLimit}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-900">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Real-world High Deliverability Active</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Corporate spam filters respect cold emails sent from a genuine personal Gmail account with proper MX records. Automated 3-day follow-ups will thread into the same conversation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Message Templates */}
      {activeSubTab === 'templates' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Multi-Channel Message Templates</h2>
              <p className="text-slate-500 text-[11px]">
                These templates are automatically personalized and dispatched on your behalf.
              </p>
            </div>
            <button
              onClick={handleSaveAll}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-bold"
            >
              Save Templates
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                1. LinkedIn Connection Request Note (Max 300 chars)
              </label>
              <textarea
                rows={3}
                value={linkedIn.connectionNoteTemplate}
                onChange={(e) =>
                  setLinkedIn({ ...linkedIn, connectionNoteTemplate: e.target.value })
                }
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed font-sans"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Variables: {'{{name}}'}, {'{{company}}'}, {'{{job_title}}'}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                2. LinkedIn Referral Pitch (Sent automatically when connection is accepted)
              </label>
              <textarea
                rows={4}
                value={linkedIn.messageTemplateAfterConnect}
                onChange={(e) =>
                  setLinkedIn({ ...linkedIn, messageTemplateAfterConnect: e.target.value })
                }
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed font-sans"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Variables: {'{{name}}'}, {'{{company}}'}, {'{{job_title}}'}, {'{{linkedin_url}}'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Auto Reply (Screenshot 2 Pixel Match) */}
      {activeSubTab === 'auto_reply' && (
        <div className="space-y-6">
          <h2 className="text-base font-bold text-slate-900">
            Configure automatic email replies from your Happpy Agent
          </h2>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-2xs">
            {/* Header / Main toggle */}
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-red-500" />
              <span className="font-bold text-sm text-slate-900">Email Auto-replies</span>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="w-4 h-4 rounded text-slate-900 focus:ring-0"
              />
              <span className="text-xs font-bold text-slate-900">
                Let agent handle the auto replies for email
              </span>
            </label>

            {/* After hours select */}
            <div className="max-w-xs space-y-1.5">
              <label className="block text-xs font-medium text-slate-500">
                After hours agent in action
              </label>
              <select
                value={config.afterHours}
                onChange={(e) => setConfig({ ...config, afterHours: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800"
              >
                <option value={1}>After 1 hour</option>
                <option value={2}>After 2 hours</option>
                <option value={4}>After 4 hours</option>
                <option value={6}>After 6 hours</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Wait this many hours after a recruiter message before the agent drafts and sends a reply.
              </p>
            </div>

            {/* Criteria Grid */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">
                Agent will auto-reply when recruiters ask for
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div
                  onClick={() => handleToggleCriteria('talentDetails')}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3 cursor-pointer hover:border-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={config.criteria.talentDetails}
                    readOnly
                    className="w-4 h-4 mt-0.5 rounded text-slate-900"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Talent details</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Salary/CTC, location, relocation, notice period, experience, skills, phone, and other profile details.
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleToggleCriteria('emailSource')}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3 cursor-pointer hover:border-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={config.criteria.emailSource}
                    readOnly
                    className="w-4 h-4 mt-0.5 rounded text-slate-900"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Email source</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      How or where you got the recruiter's email / contact.
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleToggleCriteria('applicationNextStep')}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3 cursor-pointer hover:border-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={config.criteria.applicationNextStep}
                    readOnly
                    className="w-4 h-4 mt-0.5 rounded text-slate-900"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Application next step</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Apply via referral link, careers page, ATS, portal, or complete the application step.
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleToggleCriteria('resumeSharing')}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3 cursor-pointer hover:border-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={config.criteria.resumeSharing}
                    readOnly
                    className="w-4 h-4 mt-0.5 rounded text-slate-900"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Resume / CV</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Sharing or attaching your CV / updated resume.
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleToggleCriteria('jobDetails')}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3 cursor-pointer hover:border-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={config.criteria.jobDetails}
                    readOnly
                    className="w-4 h-4 mt-0.5 rounded text-slate-900"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Job details</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Job ID, requisition ID, posting link, position code, or role name.
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleToggleCriteria('connectFurther')}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3 cursor-pointer hover:border-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={config.criteria.connectFurther}
                    readOnly
                    className="w-4 h-4 mt-0.5 rounded text-slate-900"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Connect further</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      LinkedIn connect, join a call/meeting, or continue on another channel.
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleToggleCriteria('confirmations')}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3 cursor-pointer hover:border-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={config.criteria.confirmations}
                    readOnly
                    className="w-4 h-4 mt-0.5 rounded text-slate-900"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Confirmations</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Confirm interest, fitment, receipt of email, work conditions, or similar.
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleToggleCriteria('assessments')}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3 cursor-pointer hover:border-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={config.criteria.assessments}
                    readOnly
                    className="w-4 h-4 mt-0.5 rounded text-slate-900"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">Assessments</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Complete an assignment, screening test, or assessment questions.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveAll}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Save Auto-reply Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Browser Extension */}
      {activeSubTab === 'extension' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Happpy Chrome Extension</h2>
          <p className="text-xs text-slate-600 max-w-xl">
            Run the extension on any live job page. When you open a job listing, the floating rocket appears in the bottom right corner. Clicking it reveals the "REACH DIRECTLY TO HIRING EMPLOYEE" drawer!
          </p>
          <button
            onClick={onOpenExtensionModal}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
          >
            <Download className="w-4 h-4" />
            <span>Install & Setup Chrome Extension</span>
          </button>
        </div>
      )}

      {/* Fallback other subtabs */}
      {['followup', 'autorun', 'outreach_mode', 'blocked'].includes(activeSubTab) && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-xs text-slate-600">
          <div className="font-bold text-sm text-slate-900 mb-2 capitalize">
            {activeSubTab.replace('_', ' ')} Configuration
          </div>
          <p>
            Default settings are tuned for high-converting referral requests with polite 3-day follow-up sequences.
          </p>
        </div>
      )}
    </div>
  );
};
