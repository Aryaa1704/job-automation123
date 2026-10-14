/**
 * Referral Outreach and Multi-Channel Automation Types
 * Supports both LinkedIn connection/messaging and Gmail corporate email outreach
 */

export interface ReferrerCandidate {
  id: string;
  fullName: string;
  role: string;
  companyName: string;
  department: 'Engineering' | 'Product' | 'Talent / HR' | 'Leadership';
  isAlumni?: boolean;
  alumniCollege?: string;
  linkedInUrl: string;
  workEmail?: string;
  emailConfidence: number; // e.g. 95%
  emailFormat: string; // e.g. {first}.{last}@{company}.com
  avatarUrl?: string;
  connectionStatus?: 'not_connected' | 'request_sent' | 'connected' | 'messaged';
}

export type LinkedInConnectionStage =
  | 'not_connected'
  | 'entering_credentials'
  | 'connecting'
  | 'checkpoint_challenge'
  | 'connected';

export interface LinkedInAccountConfig {
  connected: boolean;
  stage: LinkedInConnectionStage;
  email: string;
  passwordMasked: string;
  authMethod: 'credentials' | 'extension_session' | 'cookie_li_at';
  sessionCookie?: string;
  checkpointType?: 'phone_app' | 'sms_pin' | 'email_pin' | 'extension_cookie';
  checkpointChallengeCode?: string;
  checkpointSentTo?: string;
  activeProfileName?: string;
  activeProfileHeadline?: string;
  activeProfileAvatar?: string;
  dailyConnectionLimit: number;
  connectionsSentToday: number;
  safeDelaySeconds: number;
  autoMessageOnAccept: boolean;
  connectionNoteTemplate: string;
  messageTemplateAfterConnect: string;
  lastVerifiedAt?: string;
}

export interface GmailAccountConfig {
  connected: boolean;
  email: string;
  authType: 'google_oauth' | 'app_password';
  dailyEmailLimit: number;
  emailsSentToday: number;
  lastVerifiedAt?: string;
}

export interface FollowUpConfig {
  gmail: {
    enabled: boolean;
    afterDays: number;
    templateId: string;
    messageTemplate: string;
  };
  linkedIn: {
    enabled: boolean;
    afterDays: number;
    templateId: string;
    messageTemplate: string;
  };
}

export interface AutoRunConfig {
  enabled: boolean;
  inactivityDays: number; // e.g. 2
}

export interface ReferralRun {
  id: string;
  jobTitle: string;
  companyName: string;
  jobUrl: string;
  sourceBoard: 'LinkedIn' | 'Indeed' | 'Wellfound' | 'Naukri' | 'Greenhouse' | 'Lever' | 'Career Page';
  runOrigin: 'web_dashboard' | 'chrome_extension' | 'paste_link';
  status: 'discovered' | 'referrers_found' | 'outreach_drafted' | 'sent' | 'replied';
  discoveredReferrers: ReferrerCandidate[];
  selectedReferrerId?: string;

  // Channels targeted
  targetChannels: {
    linkedin: boolean;
    gmail: boolean;
  };

  // LinkedIn Specific Tracking
  linkedInStatus?: 'not_started' | 'request_sent' | 'connection_accepted' | 'pitch_sent' | 'replied';
  linkedInConnectionNote?: string;
  linkedInDirectMessage?: string;

  // Gmail Specific Tracking
  gmailStatus?: 'not_started' | 'email_sent' | 'followup_sent' | 'replied';
  subject: string;
  body: string;
  sentAt?: string;

  // Reply & Follow-up tracking
  replyStatus?: 'none' | 'positive' | 'negative' | 'neutral';
  replyChannel?: 'linkedin' | 'gmail';
  replySnippet?: string;
  replyReceivedAt?: string;
  followUpDays: number;
  followUpDate?: string;
  followUpStatus?: 'scheduled' | 'sent' | 'cancelled';
  createdAt: string;
}

export interface AutoReplyConfig {
  enabled: boolean;
  afterHours: number; // e.g. 2
  criteria: {
    talentDetails: boolean;
    emailSource: boolean;
    applicationNextStep: boolean;
    resumeSharing: boolean;
    jobDetails: boolean;
    connectFurther: boolean;
    confirmations: boolean;
    assessments: boolean;
  };
}

export interface UserProfileConfig {
  name: string;
  role: string;
  headline: string;
  resumeFileName: string;
  resumeFileUrl?: string;
  linkedInUrl: string;
  phoneNumber: string;
  email: string;
  currentRole: string;
  workExperienceYears: number;
  workExperienceMonths: number;
  noticePeriod: string;
  lastWorkingDay?: string;
  expectedCtcLacs: number;
  currentCtcLacs: number;
  jobSearchStatus: 'Actively Applying' | 'Just Exploring' | 'Interviewing' | 'Have An Offer' | 'Laid Off';
  dailyTargetRuns: number;
}
