/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HapppySidebar, HapppyTab } from './components/happpy/HapppySidebar';
import { HapppyHeader } from './components/happpy/HapppyHeader';
import { HapppyDashboardView } from './components/happpy/HapppyDashboardView';
import { HapppyConfigureView } from './components/happpy/HapppyConfigureView';
import { HapppyActivityView } from './components/happpy/HapppyActivityView';
import { HapppyJobsView } from './components/happpy/HapppyJobsView';
import { HapppyProfileView } from './components/happpy/HapppyProfileView';
import { HapppyHelpView } from './components/happpy/HapppyHelpView';
import { HapppyRunAgentModal } from './components/happpy/HapppyRunAgentModal';
import { HapppyExtensionDrawer } from './components/happpy/HapppyExtensionDrawer';
import { ChromeExtensionModal } from './components/happpy/ChromeExtensionModal';
import { VercelDeployModal } from './components/happpy/VercelDeployModal';

import {
  happpyStorage,
  DEFAULT_PROFILE,
  DEFAULT_AUTO_REPLY,
  DEFAULT_LINKEDIN_ACCOUNT,
  DEFAULT_GMAIL_ACCOUNT,
  INITIAL_JOBS_LIST
} from './services/happpyStorage';
import {
  UserProfileConfig,
  AutoReplyConfig,
  ReferralRun,
  LinkedInAccountConfig,
  GmailAccountConfig
} from './types/referral';

export default function App() {
  const [currentTab, setCurrentTab] = useState<HapppyTab>('dashboard');
  const [profile, setProfile] = useState<UserProfileConfig>(happpyStorage.getProfile());
  const [autoReply, setAutoReply] = useState<AutoReplyConfig>(happpyStorage.getAutoReply());
  const [linkedInAccount, setLinkedInAccount] = useState<LinkedInAccountConfig>(
    happpyStorage.getLinkedInAccount()
  );
  const [gmailAccount, setGmailAccount] = useState<GmailAccountConfig>(
    happpyStorage.getGmailAccount()
  );
  const [referralRuns, setReferralRuns] = useState<ReferralRun[]>(happpyStorage.getReferralRuns());

  // Modal & Drawer states
  const [showRunModal, setShowRunModal] = useState(false);
  const [showExtensionDrawer, setShowExtensionDrawer] = useState(false);
  const [drawerJobData, setDrawerJobData] = useState<{
    jobTitle: string;
    companyName: string;
    jobUrl: string;
  }>({
    jobTitle: 'Frontend Developer – React.js / Next.js',
    companyName: 'Codersworld',
    jobUrl: 'https://codersworld.in/careers/frontend-developer'
  });

  const [modalJobData, setModalJobData] = useState<{
    jobUrl?: string;
    jobTitle?: string;
    companyName?: string;
  }>({});
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showVercelModal, setShowVercelModal] = useState(false);

  // Daily quota
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const runsToday = referralRuns.filter((r) => r.createdAt.startsWith(todayDateStr)).length;
  const dailyTotal = 10;

  const handleOpenPasteModal = () => {
    setModalJobData({
      jobUrl: '',
      jobTitle: '',
      companyName: ''
    });
    setShowRunModal(true);
  };

  const handleRunAgentForJob = (job: (typeof INITIAL_JOBS_LIST)[0]) => {
    setDrawerJobData({
      jobTitle: job.title,
      companyName: job.companyName,
      jobUrl: `https://${job.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/careers/${job.id}`
    });
    setShowExtensionDrawer(true);
  };

  const handleCompleteRun = (newRun: ReferralRun) => {
    happpyStorage.addReferralRun(newRun);
    setReferralRuns(happpyStorage.getReferralRuns());
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa] font-sans antialiased text-slate-900 select-text relative">
      {/* Sidebar (Matches Screenshot 1 & 5) */}
      <HapppySidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <HapppyHeader
          dailyRunsUsed={runsToday}
          dailyRunsTotal={dailyTotal}
          onOpenPasteModal={handleOpenPasteModal}
          onOpenExtensionGuide={() => setShowExtensionModal(true)}
          onOpenVercelDeploy={() => setShowVercelModal(true)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentTab === 'dashboard' && (
            <HapppyDashboardView
              onSelectTab={setCurrentTab}
              onRunAgentForJob={handleRunAgentForJob}
              onOpenExtensionModal={() => setShowExtensionModal(true)}
            />
          )}

          {currentTab === 'configure' && (
            <HapppyConfigureView
              autoReplyConfig={autoReply}
              linkedInAccount={linkedInAccount}
              gmailAccount={gmailAccount}
              onSaveAutoReply={(cfg) => {
                setAutoReply(cfg);
                happpyStorage.saveAutoReply(cfg);
              }}
              onSaveLinkedInAccount={(acc) => {
                setLinkedInAccount(acc);
                happpyStorage.saveLinkedInAccount(acc);
              }}
              onSaveGmailAccount={(acc) => {
                setGmailAccount(acc);
                happpyStorage.saveGmailAccount(acc);
              }}
              onOpenExtensionModal={() => setShowExtensionModal(true)}
            />
          )}

          {currentTab === 'activity' && (
            <HapppyActivityView
              referralRuns={referralRuns}
              onOpenPasteModal={handleOpenPasteModal}
              onRefreshRuns={() => setReferralRuns(happpyStorage.getReferralRuns())}
            />
          )}

          {currentTab === 'jobs' && (
            <HapppyJobsView
              onRunAgentForJob={handleRunAgentForJob}
              onOpenPasteModal={handleOpenPasteModal}
              onOpenExtensionModal={() => setShowExtensionModal(true)}
            />
          )}

          {currentTab === 'profile' && (
            <HapppyProfileView
              profile={profile}
              onSaveProfile={(p) => {
                setProfile(p);
                happpyStorage.saveProfile(p);
              }}
            />
          )}

          {currentTab === 'help' && <HapppyHelpView />}
        </main>
      </div>

      {/* Floating Rocket Icon on Bottom Right (Screenshot 2 Trigger) */}
      <button
        onClick={() => setShowExtensionDrawer(true)}
        title="Open Happpy Referral Extension Drawer on this job"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#42dab4] hover:bg-[#34c4a1] text-slate-950 flex items-center justify-center text-2xl shadow-xl border-2 border-white transition-transform hover:scale-110 active:scale-95"
      >
        🚀
      </button>

      {/* Screenshot 2 Exact In-Page Extension Drawer */}
      <HapppyExtensionDrawer
        isOpen={showExtensionDrawer}
        onClose={() => setShowExtensionDrawer(false)}
        selectedRole={drawerJobData.jobTitle}
        companyName={drawerJobData.companyName}
        jobUrl={drawerJobData.jobUrl}
        profile={profile}
        linkedInAccount={linkedInAccount}
        gmailAccount={gmailAccount}
        onCompleteRun={handleCompleteRun}
        onOpenRecommendedJobs={() => setCurrentTab('jobs')}
      />

      {/* Referral Outreach Run Modal (Triggered by Paste Job Link) */}
      <HapppyRunAgentModal
        isOpen={showRunModal}
        onClose={() => setShowRunModal(false)}
        profile={profile}
        initialJobUrl={modalJobData.jobUrl}
        initialJobTitle={modalJobData.jobTitle}
        initialCompanyName={modalJobData.companyName}
        onCompleteRun={handleCompleteRun}
      />

      {/* Chrome Extension Setup Modal */}
      <ChromeExtensionModal
        isOpen={showExtensionModal}
        onClose={() => setShowExtensionModal(false)}
        onRunTestExtension={() => {
          setDrawerJobData({
            jobTitle: 'Frontend Developer – React.js / Next.js',
            companyName: 'Codersworld',
            jobUrl: 'https://codersworld.in/careers/frontend-developer'
          });
          setShowExtensionDrawer(true);
        }}
      />

      {/* Vercel Deployment Modal */}
      <VercelDeployModal
        isOpen={showVercelModal}
        onClose={() => setShowVercelModal(false)}
      />
    </div>
  );
}
