/**
 * Personal AI Job Agent - Core Data Contracts and Domain Types
 * Based on Project Blueprint Specification v1.0
 */

export type WorkMode = 'remote' | 'hybrid' | 'on-site';
export type ExperienceLevel = 'internship' | 'entry' | 'mid' | 'senior' | 'lead';
export type EligibilityStatus = 'eligible' | 'ineligible' | 'unknown';

export interface JobPreferences {
  targetRoles: string[];
  skills: string[];
  locations: string[];
  workModes: WorkMode[];
  experienceLevel: ExperienceLevel;
  graduationWindow: string; // e.g. "2024 - 2026"
  workAuthorization: 'authorized_any' | 'requires_sponsorship' | 'citizen_or_pr';
  exclusions: string[]; // e.g. ["contract-only", "unpaid", "crypto"]
  updatedAt: string;
}

export interface ResumeFact {
  id: string;
  factType: 'education' | 'experience' | 'project' | 'skill' | 'metric' | 'certification';
  title: string;
  factText: string;
  normalizedValue?: Record<string, any>;
  sourceLocator: string; // e.g. "Page 1, Experience Section #2"
  confidence: number; // 0 - 100
  verifiedByUserAt: string | null;
}

export interface MasterResume {
  id: string;
  displayName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  isMaster: boolean;
  uploadedAt: string;
  facts: ResumeFact[];
}

export interface ValidationItem {
  id: string;
  type: 'supported' | 'unsupported_claim' | 'coverage_gap' | 'date_mismatch' | 'verified_metric';
  claimText: string;
  sourceFactId?: string;
  severity: 'pass' | 'warning' | 'blocking_error';
  message: string;
}

export interface ResumeVersion {
  id: string;
  masterResumeId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  versionNo: number;
  storageKey: string;
  contentHash: string; // SHA-256 of the generated content
  validationStatus: 'validated' | 'warnings' | 'blocked';
  changeSummary: string[];
  tailoredContent: {
    headline: string;
    summary: string;
    highlightedSkills: string[];
    experienceBulletPoints: {
      roleTitle: string;
      company: string;
      dates: string;
      bullets: string[];
    }[];
    targetedProjects: {
      name: string;
      description: string;
      tech: string[];
    }[];
  };
  validationReport: ValidationItem[];
  createdAt: string;
}

export interface JobSource {
  id: string;
  jobId: string;
  sourceName: 'Greenhouse API' | 'Lever RSS' | 'RemoteOK API' | 'Official Careers Portal' | 'Job Alert Email';
  externalId: string;
  sourceUrl: string;
  payloadHash: string;
  fetchedAt: string;
}

export interface MatchScoreBreakdown {
  skillsMatch: number; // 30%
  roleRelevance: number; // 25%
  locationMatch: number; // 15%
  experienceFit: number; // 15%
  workModeFit: number; // 10%
  freshnessFactor: number; // 5%
  totalScore: number; // 0 - 100
}

export interface HardGateEvaluation {
  criteria: 'graduation_date' | 'work_authorization' | 'seniority_level' | 'location_restriction';
  name: string;
  status: EligibilityStatus;
  reason: string;
}

export interface JobMatch {
  id: string;
  jobId: string;
  score: number;
  breakdown: MatchScoreBreakdown;
  eligibilityStatus: EligibilityStatus;
  hardGates: HardGateEvaluation[];
  missingRequirements: string[];
  matchedKeywords: string[];
  rulesVersion: string;
  evaluatedAt: string;
}

export type JobStatus = 'active' | 'stale' | 'closed';

export interface Job {
  id: string;
  canonicalUrl: string;
  normalizedCompany: string;
  normalizedTitle: string;
  title: string;
  companyName: string;
  location: string;
  workMode: WorkMode;
  employmentType: 'full-time' | 'internship' | 'contract';
  description: string;
  requirements: string[];
  mustHaveSkills: string[];
  preferredSkills: string[];
  postedAt: string;
  firstSeenAt: string;
  lastSeenAt: string;
  status: JobStatus;
  isShortlisted?: boolean;
  isSkipped?: boolean;
  sources: JobSource[];
}

export type ApplicationStatus =
  | 'discovered'
  | 'shortlisted'
  | 'resume_ready'
  | 'awaiting_approval'
  | 'ready_to_apply'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface ApplicationEvent {
  id: string;
  applicationId: string;
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  actorType: 'user' | 'agent' | 'system';
  note: string;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  resumeVersionId?: string;
  contactId?: string;
  appliedAt?: string;
  deadlineAt?: string;
  sourceUrl: string;
  notes: string;
  submissionState?: 'prepared' | 'approved' | 'submitted' | 'submission_unknown';
  createdAt: string;
  updatedAt: string;
}

export interface RecruiterContact {
  id: string;
  companyName: string;
  fullName: string;
  roleTitle: string;
  workEmail?: string;
  profileUrl?: string;
  sourceUrl: string;
  sourceType: 'Company Directory' | 'LinkedIn Public Profile' | 'Job Description Header' | 'Direct Communication';
  verificationStatus: 'verified' | 'unverified' | 'pending';
  lastVerifiedAt?: string;
  relatedJobId?: string;
  createdAt: string;
}

export type OutreachStatus =
  | 'draft'
  | 'awaiting_approval'
  | 'approved'
  | 'sending'
  | 'sent'
  | 'replied'
  | 'failed'
  | 'cancelled'
  | 'unknown_outcome';

export interface MessageApproval {
  id: string;
  messageId: string;
  contentHash: string; // SHA-256 of subject + body
  recipientHash: string; // SHA-256 of recipient
  channel: 'email' | 'linkedin';
  resumeVersionId?: string;
  fingerprint: string;
  approvedAt: string;
  revokedAt?: string;
}

export interface OutreachMessage {
  id: string;
  applicationId: string;
  contactId: string;
  channel: 'email' | 'linkedin';
  status: OutreachStatus;
  subject: string;
  body: string;
  contentVersion: number;
  contentHash: string;
  recipientSnapshot: string;
  resumeVersionId?: string;
  approvedFingerprint?: string;
  approvedAt?: string;
  sentAt?: string;
  providerMessageId?: string;
  replyReceivedAt?: string;
  replySnippet?: string;
  followUpDueAt?: string;
  followUpStatus?: 'none' | 'scheduled' | 'cancelled' | 'sent';
  idempotencyKey?: string;
  createdAt: string;
}

export type TaskStatus =
  | 'queued'
  | 'running'
  | 'retry_wait'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'unknown_outcome';

export interface AutomationTask {
  id: string;
  runId: string;
  taskType: 'source_fetch' | 'dedup_normalize' | 'evaluate_match' | 'tailor_resume' | 'send_outreach' | 'sync_replies';
  idempotencyKey: string;
  status: TaskStatus;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt?: string;
  resultSummary?: Record<string, any>;
  errorCode?: string;
  errorMessage?: string;
  retryEligible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRun {
  id: string;
  runType: 'discovery' | 'matching' | 'resume_tailor' | 'outreach_batch' | 'reply_sync';
  status: 'running' | 'completed' | 'partial_failure' | 'failed';
  parameters: Record<string, any>;
  startedAt: string;
  finishedAt?: string;
  createdBy: 'user' | 'scheduler' | 'trigger';
  errorSummary?: string;
  tasks: AutomationTask[];
}

export interface AuditEvent {
  id: string;
  actorType: 'user' | 'agent' | 'worker' | 'system';
  action:
    | 'preference_updated'
    | 'discovery_executed'
    | 'job_shortlisted'
    | 'job_skipped'
    | 'resume_uploaded'
    | 'resume_tailored'
    | 'resume_exported'
    | 'outreach_drafted'
    | 'outreach_approved'
    | 'outreach_approval_invalidated'
    | 'outreach_sent'
    | 'reply_detected'
    | 'followup_cancelled'
    | 'task_retried'
    | 'data_exported';
  entityType: 'job' | 'application' | 'resume' | 'outreach' | 'contact' | 'automation_task';
  entityId: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface IntegrationStatus {
  provider: 'gmail' | 'linkedin' | 'greenhouse' | 'lever';
  connected: boolean;
  grantedScopes: string[];
  connectedAt?: string;
  lastSyncAt?: string;
  lastError?: string;
}
