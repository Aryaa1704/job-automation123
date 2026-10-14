/**
 * Data Persistence and Seed Engine
 * Manages reactive local state with LocalStorage backing and full audit logging
 * Aligns with Section 05 Backend Schema and Appendix B Demonstration Workflow
 */

import {
  Application,
  ApplicationEvent,
  AuditEvent,
  AutomationRun,
  AutomationTask,
  Job,
  JobMatch,
  JobPreferences,
  MasterResume,
  OutreachMessage,
  RecruiterContact,
  ResumeVersion
} from '../types';
import { calculateMatchScore } from './scoringEngine';
import { createApprovalFingerprint, fastHash } from './hashService';

const STORAGE_KEYS = {
  PREFERENCES: 'jobagent_prefs_v1',
  MASTER_RESUME: 'jobagent_master_resume_v1',
  RESUME_VERSIONS: 'jobagent_resume_versions_v1',
  JOBS: 'jobagent_jobs_v1',
  MATCHES: 'jobagent_matches_v1',
  APPLICATIONS: 'jobagent_applications_v1',
  APPLICATION_EVENTS: 'jobagent_app_events_v1',
  CONTACTS: 'jobagent_contacts_v1',
  OUTREACH: 'jobagent_outreach_v1',
  AUTOMATION_RUNS: 'jobagent_runs_v1',
  AUDIT_EVENTS: 'jobagent_audit_v1'
};

export const INITIAL_PREFERENCES: JobPreferences = {
  targetRoles: ['Software Engineer Intern', 'Backend Intern', 'Full Stack Developer', 'Systems Engineer'],
  skills: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'Python', 'Docker', 'Redis', 'REST APIs'],
  locations: ['India', 'Bangalore', 'Remote', 'San Francisco', 'Bengaluru'],
  workModes: ['remote', 'hybrid'],
  experienceLevel: 'internship',
  graduationWindow: '2024 - 2026',
  workAuthorization: 'authorized_any',
  exclusions: ['unpaid', 'crypto-only', 'third-party-agency'],
  updatedAt: new Date().toISOString()
};

export const INITIAL_MASTER_RESUME: MasterResume = {
  id: 'res_master_001',
  displayName: 'Master_Resume_Aryan_2026.pdf',
  storageKey: 'resumes/master/res_master_001.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 142850,
  sha256: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  isMaster: true,
  uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  facts: [
    {
      id: 'fact_edu_1',
      factType: 'education',
      title: 'B.Tech in Computer Science & Engineering',
      factText: 'B.Tech in Computer Science & Engineering (2022 - 2026), GPA: 8.9/10. Relevant Coursework: Data Structures & Algorithms, Distributed Systems, Operating Systems, Database Management Systems, Computer Networks.',
      normalizedValue: { degree: 'B.Tech', field: 'Computer Science', period: '2022 - 2026', gpa: '8.9' },
      sourceLocator: 'Page 1, Section: Education, Lines 3-8',
      confidence: 100,
      verifiedByUserAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'fact_exp_1',
      factType: 'experience',
      title: 'Software Engineering Intern at TechVanguard Systems',
      factText: 'Designed and deployed high-concurrency Go and Node.js microservices processing 25,000 req/sec with 99.99% availability.\nOptimized PostgreSQL indexed queries and Redis caching layer, achieving a 35% latency reduction.\nEngineered CI/CD automated deployment pipelines with Docker and GitHub Actions, cutting release overhead by 40%.',
      normalizedValue: {
        role: 'Software Engineering Intern',
        company: 'TechVanguard Systems',
        dates: 'June 2024 - August 2024',
        location: 'Bangalore / Remote'
      },
      sourceLocator: 'Page 1, Section: Work Experience, Item #1',
      confidence: 98,
      verifiedByUserAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'fact_exp_2',
      factType: 'experience',
      title: 'Open Source Contributor at Apache Software Foundation',
      factText: 'Contributed 14 pull requests to distributed event log tooling; improved worker consumer rebalance latency by 22%.\nAuthored end-to-end integration test suites with zero flaky test tolerance.',
      normalizedValue: {
        role: 'Open Source Contributor',
        company: 'Apache Software Foundation',
        dates: 'January 2024 - Present'
      },
      sourceLocator: 'Page 1, Section: Open Source, Item #1',
      confidence: 96,
      verifiedByUserAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'fact_proj_1',
      factType: 'project',
      title: 'Distributed Key-Value Store with Raft Consensus',
      factText: 'Implemented a multi-node distributed storage engine implementing the Raft consensus algorithm in Go.\nSupported leader election, log replication, snapshotting, and linearizable read/write transactions under network partitions.',
      normalizedValue: { technologies: ['Go', 'Raft', 'gRPC', 'Protobuf', 'Docker'] },
      sourceLocator: 'Page 2, Section: Technical Projects, Project #1',
      confidence: 99,
      verifiedByUserAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'fact_proj_2',
      factType: 'project',
      title: 'Real-Time Collaborative Document Canvas',
      factText: 'Architected collaborative canvas utilizing Operational Transformation (OT) and WebSockets in TypeScript.\nHandled 1,200 concurrent active socket connections per worker node with sub-50ms synchronization.',
      normalizedValue: { technologies: ['TypeScript', 'React', 'Node.js', 'WebSocket', 'Redis'] },
      sourceLocator: 'Page 2, Section: Technical Projects, Project #2',
      confidence: 95,
      verifiedByUserAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'fact_skill_1',
      factType: 'skill',
      title: 'TypeScript',
      factText: 'Advanced TypeScript typing, generic abstractions, async programming, AST parsing.',
      sourceLocator: 'Page 2, Section: Skills',
      confidence: 100,
      verifiedByUserAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'fact_skill_2',
      factType: 'skill',
      title: 'PostgreSQL',
      factText: 'Schema design, indexing strategies, EXPLAIN ANALYZE, ACID transactions, connection pooling.',
      sourceLocator: 'Page 2, Section: Skills',
      confidence: 100,
      verifiedByUserAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'fact_skill_3',
      factType: 'skill',
      title: 'Node.js',
      factText: 'Event loop mechanics, stream processing, Express, Fastify, microservices.',
      sourceLocator: 'Page 2, Section: Skills',
      confidence: 100,
      verifiedByUserAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'fact_metric_1',
      factType: 'metric',
      title: '35% latency reduction',
      factText: 'Achieved 35% latency reduction via PostgreSQL composite indexing and Redis cache-aside caching.',
      sourceLocator: 'Page 1, Work Experience #1, Line 4',
      confidence: 99,
      verifiedByUserAt: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ]
};

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job_stripe_001',
    canonicalUrl: 'https://stripe.com/jobs/listing/software-engineer-intern-2026',
    normalizedCompany: 'stripe',
    normalizedTitle: 'software engineer intern backend',
    title: 'Software Engineer Intern (Backend & Infrastructure)',
    companyName: 'Stripe',
    location: 'Remote, India',
    workMode: 'remote',
    employmentType: 'internship',
    description: 'Join Stripe to build the economic infrastructure of the internet. Our backend intern engineers build resilient, low-latency APIs and payment rails processing billions in volume.\n\nRequirements:\n- Strong problem-solving foundation in modern languages (TypeScript, Go, Python, or Ruby).\n- Understanding of distributed systems, relational databases (PostgreSQL/MySQL), and REST APIs.\n- Currently enrolled in a Bachelor’s or Master’s program graduating in 2025 or 2026.\n- Location: Remote within India.',
    requirements: [
      'Graduating batch of 2025/2026',
      'Knowledge of distributed systems & databases',
      'Strong coding skills in TypeScript/Node.js or Go',
      'Passion for developer infrastructure'
    ],
    mustHaveSkills: ['TypeScript', 'PostgreSQL', 'REST APIs', 'Node.js'],
    preferredSkills: ['Docker', 'Distributed Systems', 'Redis'],
    postedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    firstSeenAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    lastSeenAt: new Date().toISOString(),
    status: 'active',
    isShortlisted: true,
    sources: [
      {
        id: 'src_gh_001',
        jobId: 'job_stripe_001',
        sourceName: 'Greenhouse API',
        externalId: 'gh_stripe_98721',
        sourceUrl: 'https://boards-api.greenhouse.io/v1/boards/stripe/jobs/98721',
        payloadHash: 'sha256:d9b23f81e3a...',
        fetchedAt: new Date(Date.now() - 3600000 * 10).toISOString()
      }
    ]
  },
  {
    id: 'job_datadog_002',
    canonicalUrl: 'https://careers.datadoghq.com/jobs/associate-engineer-distributed-systems',
    normalizedCompany: 'datadog',
    normalizedTitle: 'associate distributed systems engineer',
    title: 'Associate Distributed Systems Engineer',
    companyName: 'Datadog',
    location: 'Bangalore, India',
    workMode: 'hybrid',
    employmentType: 'full-time',
    description: 'Datadog is the monitoring and security platform for cloud applications. We are seeking an Associate Distributed Systems Engineer to scale our telemetry ingestion pipeline.\n\nQualifications:\n- Proficiency in Go, Python, or TypeScript.\n- Solid understanding of concurrency, event-driven architectures, and messaging queues (Kafka/Redis).\n- B.Tech/B.E. in Computer Science (2024 or 2025 graduates welcome).\n- Hybrid working mode: 2 days in our Bangalore office.',
    requirements: [
      'Degree in Computer Science or related field (2024-2025)',
      'Experience with Redis, Kafka, or queues',
      'Solid foundations in concurrency and operating systems',
      'Based in or willing to relocate to Bangalore'
    ],
    mustHaveSkills: ['TypeScript', 'Redis', 'Docker', 'Python'],
    preferredSkills: ['Kafka', 'Kubernetes', 'Go'],
    postedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    firstSeenAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    lastSeenAt: new Date().toISOString(),
    status: 'active',
    isShortlisted: true,
    sources: [
      {
        id: 'src_lever_002',
        jobId: 'job_datadog_002',
        sourceName: 'Lever RSS',
        externalId: 'lever_dd_54312',
        sourceUrl: 'https://jobs.lever.co/datadog/54312',
        payloadHash: 'sha256:88ffbc10...',
        fetchedAt: new Date(Date.now() - 3600000 * 30).toISOString()
      }
    ]
  },
  {
    id: 'job_cloudflare_003',
    canonicalUrl: 'https://www.cloudflare.com/careers/jobs/systems-engineer-intern-2026',
    normalizedCompany: 'cloudflare',
    normalizedTitle: 'systems engineer intern',
    title: 'Systems & Edge Platform Engineer Intern',
    companyName: 'Cloudflare',
    location: 'Remote',
    workMode: 'remote',
    employmentType: 'internship',
    description: 'Help build a better Internet at Cloudflare. We are looking for an Intern to join our Edge Platforms team working on globally distributed microservices and worker runtimes.\n\nRequirements:\n- Familiarity with networking protocols (TCP/IP, HTTP/3, WebSockets).\n- Hands-on coding experience with TypeScript/JavaScript or Rust/Go.\n- Analytical thinking and curiosity for edge computing.\n- graduating between 2025 and 2026.',
    requirements: [
      'Graduation between 2025-2026',
      'Strong grasp of HTTP protocols and WebSockets',
      'Experience with TypeScript/Node.js'
    ],
    mustHaveSkills: ['TypeScript', 'Node.js', 'REST APIs'],
    preferredSkills: ['WebSockets', 'Go', 'Docker'],
    postedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    firstSeenAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    lastSeenAt: new Date().toISOString(),
    status: 'active',
    sources: [
      {
        id: 'src_remoteok_003',
        jobId: 'job_cloudflare_003',
        sourceName: 'RemoteOK API',
        externalId: 'rok_cf_8912',
        sourceUrl: 'https://remoteok.com/remote-jobs/8912',
        payloadHash: 'sha256:77ba3312...',
        fetchedAt: new Date(Date.now() - 3600000 * 40).toISOString()
      }
    ]
  },
  {
    id: 'job_palantir_004',
    canonicalUrl: 'https://palantir.com/careers/lead-principal-architect-london',
    normalizedCompany: 'palantir',
    normalizedTitle: 'lead principal architect enterprise',
    title: 'Lead Principal Architect - Enterprise Data',
    companyName: 'Palantir Technologies',
    location: 'London, UK (Strict On-Site)',
    workMode: 'on-site',
    employmentType: 'full-time',
    description: 'We are seeking an executive Lead Principal Architect with 12+ years of enterprise architecture experience to design mission-critical data meshes. Mandatory full-time physical presence on-site in London office. UK work rights required.',
    requirements: [
      '12+ years enterprise software architecture',
      'Physical presence in London',
      'Track record leading 50+ engineer orgs'
    ],
    mustHaveSkills: ['Distributed Systems', 'Java', 'Kubernetes'],
    preferredSkills: ['C++', 'Executive Leadership'],
    postedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    firstSeenAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastSeenAt: new Date().toISOString(),
    status: 'active',
    sources: [
      {
        id: 'src_careers_004',
        jobId: 'job_palantir_004',
        sourceName: 'Official Careers Portal',
        externalId: 'pal_arch_009',
        sourceUrl: 'https://palantir.com/careers/lead-principal-architect-london',
        payloadHash: 'sha256:1199aacc...',
        fetchedAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ]
  },
  {
    id: 'job_defense_005',
    canonicalUrl: 'https://usgovtech.example.com/jobs/classified-backend-security',
    normalizedCompany: 'govtech us defense',
    normalizedTitle: 'defense backend engineer',
    title: 'Backend Systems Engineer (Security Clearance Required)',
    companyName: 'GovTech US Defense',
    location: 'Washington DC, USA',
    workMode: 'on-site',
    employmentType: 'full-time',
    description: 'Active Top Secret / SCI Security Clearance Required. Must be US Citizen. No sponsorship available under any circumstances. Physical attendance in SCIF facility in DC.',
    requirements: [
      'Must be US Citizen with Active TS/SCI',
      'No sponsorship or visa transfers',
      'SCIF attendance'
    ],
    mustHaveSkills: ['C++', 'Python', 'Linux'],
    preferredSkills: ['Kernel', 'Assembly'],
    postedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    firstSeenAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    lastSeenAt: new Date().toISOString(),
    status: 'active',
    sources: [
      {
        id: 'src_alert_005',
        jobId: 'job_defense_005',
        sourceName: 'Job Alert Email',
        externalId: 'gov_sec_99',
        sourceUrl: 'https://usgovtech.example.com/jobs/classified-backend-security',
        payloadHash: 'sha256:662134aa...',
        fetchedAt: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ]
  }
];

export const INITIAL_CONTACTS: RecruiterContact[] = [
  {
    id: 'ct_stripe_001',
    companyName: 'Stripe',
    fullName: 'Priya Sharma',
    roleTitle: 'University & Emerging Talent Recruiter',
    workEmail: 'priya.sharma@stripe.com',
    profileUrl: 'https://linkedin.com/in/priya-sharma-recruiter-stripe-mock',
    sourceUrl: 'https://boards-api.greenhouse.io/v1/boards/stripe/jobs/98721',
    sourceType: 'Company Directory',
    verificationStatus: 'verified',
    lastVerifiedAt: new Date(Date.now() - 86400000).toISOString(),
    relatedJobId: 'job_stripe_001',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'ct_datadog_002',
    companyName: 'Datadog',
    fullName: 'David Miller',
    roleTitle: 'Engineering Manager (Core Telemetry)',
    workEmail: 'dmiller@datadoghq.com',
    profileUrl: 'https://linkedin.com/in/david-miller-datadog-eng-mock',
    sourceUrl: 'https://jobs.lever.co/datadog/54312',
    sourceType: 'LinkedIn Public Profile',
    verificationStatus: 'verified',
    lastVerifiedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    relatedJobId: 'job_datadog_002',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'ct_unverified_003',
    companyName: 'Acme Software',
    fullName: 'Sarah Jenkins',
    roleTitle: 'Talent Sourcer',
    workEmail: 'sarah.jenkins@unverified-acme.net',
    profileUrl: 'https://linkedin.com/in/sarah-jenkins-mock',
    sourceUrl: 'https://unknown-listing.example.org',
    sourceType: 'Job Description Header',
    verificationStatus: 'unverified',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app_stripe_001',
    jobId: 'job_stripe_001',
    status: 'resume_ready',
    resumeVersionId: 'res_ver_stripe_001',
    contactId: 'ct_stripe_001',
    sourceUrl: 'https://stripe.com/jobs/listing/software-engineer-intern-2026',
    notes: 'Tailored resume generated with validated facts. Pending review before applying.',
    submissionState: 'prepared',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'app_datadog_002',
    jobId: 'job_datadog_002',
    status: 'applied',
    resumeVersionId: 'res_ver_datadog_002',
    contactId: 'ct_datadog_002',
    appliedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    deadlineAt: new Date(Date.now() + 86400000 * 14).toISOString(),
    sourceUrl: 'https://careers.datadoghq.com/jobs/associate-engineer-distributed-systems',
    notes: 'Submitted via official Lever portal with customized telemetry project evidence.',
    submissionState: 'submitted',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export const INITIAL_APPLICATION_EVENTS: ApplicationEvent[] = [
  {
    id: 'ev_1',
    applicationId: 'app_stripe_001',
    fromStatus: 'discovered',
    toStatus: 'shortlisted',
    actorType: 'user',
    note: 'Role matched with 92% relevance score and hard eligibility confirmed.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'ev_2',
    applicationId: 'app_stripe_001',
    fromStatus: 'shortlisted',
    toStatus: 'resume_ready',
    actorType: 'agent',
    note: 'Fact-preserving resume version v1 produced; zero unsupported claims detected.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'ev_3',
    applicationId: 'app_datadog_002',
    fromStatus: 'discovered',
    toStatus: 'shortlisted',
    actorType: 'user',
    note: 'Shortlisted from Lever RSS feed.',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
  },
  {
    id: 'ev_4',
    applicationId: 'app_datadog_002',
    fromStatus: 'shortlisted',
    toStatus: 'resume_ready',
    actorType: 'agent',
    note: 'Resume tailored with Redis and distributed systems bullet points.',
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString()
  },
  {
    id: 'ev_5',
    applicationId: 'app_datadog_002',
    fromStatus: 'resume_ready',
    toStatus: 'awaiting_approval',
    actorType: 'agent',
    note: 'Prepared application payload and validated recipient fields.',
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString()
  },
  {
    id: 'ev_6',
    applicationId: 'app_datadog_002',
    fromStatus: 'awaiting_approval',
    toStatus: 'ready_to_apply',
    actorType: 'user',
    note: 'Approved application submission payload.',
    createdAt: new Date(Date.now() - 3600000 * 25).toISOString()
  },
  {
    id: 'ev_7',
    applicationId: 'app_datadog_002',
    fromStatus: 'ready_to_apply',
    toStatus: 'applied',
    actorType: 'user',
    note: 'Application submitted to Lever careers endpoint. Recorded receipt confirmation.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export const INITIAL_OUTREACH: OutreachMessage[] = [
  {
    id: 'msg_stripe_001',
    applicationId: 'app_stripe_001',
    contactId: 'ct_stripe_001',
    channel: 'email',
    status: 'awaiting_approval',
    subject: 'Stripe Software Engineer Intern - Backend & Infrastructure (Aryan Sharma)',
    body: `Hi Priya,\n\nI recently applied for the Software Engineer Intern (Backend & Infrastructure) role at Stripe and wanted to express my enthusiasm for Stripe's payments infrastructure.\n\nDuring my internship at TechVanguard Systems, I engineered Node.js and Go microservices serving 25k req/sec and achieved a 35% latency drop via PostgreSQL indexing and Redis caching. I also built a distributed Raft consensus key-value store, which gave me hands-on appreciation for fault tolerance under network partitions.\n\nMy tailored resume is attached for your review. Would welcome the opportunity to connect regarding your team's intern cohort.\n\nBest regards,\nAryan Sharma\naryansharma009009@gmail.com`,
    contentVersion: 1,
    contentHash: 'sha256:6ef55711b702...',
    recipientSnapshot: 'priya.sharma@stripe.com',
    resumeVersionId: 'res_ver_stripe_001',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    followUpDueAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    followUpStatus: 'scheduled'
  }
];

export const INITIAL_AUTOMATION_RUNS: AutomationRun[] = [
  {
    id: 'run_disc_101',
    runType: 'discovery',
    status: 'completed',
    parameters: {
      sources: ['Greenhouse API', 'Lever RSS', 'RemoteOK API'],
      targetRoles: ['Software Engineer Intern', 'Backend Intern']
    },
    startedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 10 + 4200).toISOString(),
    createdBy: 'scheduler',
    tasks: [
      {
        id: 'task_gh_fetch',
        runId: 'run_disc_101',
        taskType: 'source_fetch',
        idempotencyKey: 'idemp_gh_20261013',
        status: 'succeeded',
        attemptCount: 1,
        maxAttempts: 3,
        resultSummary: { imported: 2, duplicatesSkipped: 0 },
        retryEligible: false,
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 10 + 1200).toISOString()
      },
      {
        id: 'task_dedup_check',
        runId: 'run_disc_101',
        taskType: 'dedup_normalize',
        idempotencyKey: 'idemp_dedup_20261013',
        status: 'succeeded',
        attemptCount: 1,
        maxAttempts: 3,
        resultSummary: { normalizedCanonicalJobs: 3, autoMergedSources: 1 },
        retryEligible: false,
        createdAt: new Date(Date.now() - 3600000 * 10 + 1200).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 10 + 2400).toISOString()
      }
    ]
  },
  {
    id: 'run_mock_retry_202',
    runType: 'outreach_batch',
    status: 'partial_failure',
    parameters: { recipient: 'dmiller@datadoghq.com', channel: 'email' },
    startedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    finishedAt: new Date(Date.now() - 3600000 * 20 + 1500).toISOString(),
    createdBy: 'user',
    errorSummary: 'Mock Provider ETIMEDOUT on send request. Retry eligible with idempotency key.',
    tasks: [
      {
        id: 'task_mock_retry_task',
        runId: 'run_mock_retry_202',
        taskType: 'send_outreach',
        idempotencyKey: 'idemp_send_datadog_mock_retry',
        status: 'failed',
        attemptCount: 2,
        maxAttempts: 3,
        errorCode: 'PROVIDER_TIMEOUT_408',
        errorMessage: 'Connection to mail provider gateway timed out after 3000ms. Safe for idempotent retry.',
        retryEligible: true,
        createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 20 + 1500).toISOString()
      }
    ]
  }
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud_1',
    actorType: 'user',
    action: 'preference_updated',
    entityType: 'job',
    entityId: 'pref_user_1',
    metadata: { roles: ['Software Engineer Intern', 'Backend Intern'], workMode: 'remote/hybrid' },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'aud_2',
    actorType: 'worker',
    action: 'discovery_executed',
    entityType: 'job',
    entityId: 'run_disc_101',
    metadata: { newJobs: 3, source: 'Greenhouse & Lever' },
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    id: 'aud_3',
    actorType: 'agent',
    action: 'resume_tailored',
    entityType: 'resume',
    entityId: 'res_ver_stripe_001',
    metadata: { jobId: 'job_stripe_001', factChecks: '100% verified' },
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

export const INITIAL_RESUME_VERSIONS: ResumeVersion[] = [
  {
    id: 'res_ver_stripe_001',
    masterResumeId: 'res_master_001',
    jobId: 'job_stripe_001',
    jobTitle: 'Software Engineer Intern (Backend & Infrastructure)',
    companyName: 'Stripe',
    versionNo: 1,
    storageKey: 'resumes/master/versions/stripe_v1.json',
    contentHash: 'sha256:4a88bc349...',
    validationStatus: 'validated',
    changeSummary: [
      'Emphasized Go, Node.js, and PostgreSQL indexing achievements',
      'Highlighted 25,000 req/sec microservices throughput fact',
      'Featured Raft consensus distributed key-value store project',
      'Preserved canonical 2022-2026 graduation timeline'
    ],
    tailoredContent: {
      headline: 'Software Engineer Intern (Backend & Distributed Systems)',
      summary: 'Computer Science undergraduate (2022-2026) with verified experience designing resilient Go/Node.js microservices and optimizing PostgreSQL/Redis data layers. Track record handling 25k req/sec peak throughput. Passionate about developer infrastructure and high-availability payment rails at Stripe.',
      highlightedSkills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Go', 'Redis', 'Docker', 'REST APIs', 'Raft Consensus'],
      experienceBulletPoints: [
        {
          roleTitle: 'Software Engineering Intern',
          company: 'TechVanguard Systems',
          dates: 'June 2024 - August 2024',
          bullets: [
            'Designed and deployed high-concurrency Go and Node.js microservices processing 25,000 req/sec with 99.99% availability.',
            'Optimized PostgreSQL indexed queries and Redis caching layer, achieving a 35% latency reduction.',
            'Engineered CI/CD automated deployment pipelines with Docker and GitHub Actions, cutting release overhead by 40%.'
          ]
        },
        {
          roleTitle: 'Open Source Contributor',
          company: 'Apache Software Foundation',
          dates: 'January 2024 - Present',
          bullets: [
            'Contributed 14 pull requests to distributed event log tooling; improved worker consumer rebalance latency by 22%.',
            'Authored end-to-end integration test suites with zero flaky test tolerance.'
          ]
        }
      ],
      targetedProjects: [
        {
          name: 'Distributed Key-Value Store with Raft Consensus',
          description: 'Multi-node distributed storage engine implementing the Raft consensus algorithm in Go with leader election, log replication, and linearizable transactions.',
          tech: ['Go', 'Raft', 'gRPC', 'Docker']
        },
        {
          name: 'Real-Time Collaborative Document Canvas',
          description: 'Architected collaborative canvas utilizing Operational Transformation and WebSockets with sub-50ms synchronization.',
          tech: ['TypeScript', 'React', 'Node.js', 'WebSocket', 'Redis']
        }
      ]
    },
    validationReport: [
      {
        id: 'val_1',
        type: 'supported',
        claimText: 'TechVanguard Systems (June 2024 - August 2024)',
        severity: 'pass',
        message: 'Employment dates and company match master verified facts.'
      },
      {
        id: 'val_2',
        type: 'verified_metric',
        claimText: '25,000 req/sec & 35% latency reduction',
        severity: 'pass',
        message: 'Metrics substantiated by recorded source locator.'
      },
      {
        id: 'val_3',
        type: 'supported',
        claimText: 'B.Tech in Computer Science (2022-2026)',
        severity: 'pass',
        message: 'Education verified with 100% confidence.'
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

class StorageService {
  getPreferences(): JobPreferences {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return raw ? JSON.parse(raw) : INITIAL_PREFERENCES;
  }

  savePreferences(prefs: JobPreferences): void {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    this.addAudit({
      actorType: 'user',
      action: 'preference_updated',
      entityType: 'job',
      entityId: 'user_preferences',
      metadata: { targetRoles: prefs.targetRoles, locations: prefs.locations }
    });
  }

  getMasterResume(): MasterResume {
    const raw = localStorage.getItem(STORAGE_KEYS.MASTER_RESUME);
    return raw ? JSON.parse(raw) : INITIAL_MASTER_RESUME;
  }

  saveMasterResume(resume: MasterResume): void {
    localStorage.setItem(STORAGE_KEYS.MASTER_RESUME, JSON.stringify(resume));
  }

  getResumeVersions(): ResumeVersion[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RESUME_VERSIONS);
    return raw ? JSON.parse(raw) : INITIAL_RESUME_VERSIONS;
  }

  saveResumeVersion(version: ResumeVersion): void {
    const list = this.getResumeVersions();
    const updated = [version, ...list.filter((v) => v.id !== version.id)];
    localStorage.setItem(STORAGE_KEYS.RESUME_VERSIONS, JSON.stringify(updated));
    this.addAudit({
      actorType: 'agent',
      action: 'resume_tailored',
      entityType: 'resume',
      entityId: version.id,
      metadata: { jobId: version.jobId, hash: version.contentHash }
    });
  }

  getJobs(): Job[] {
    const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
    return raw ? JSON.parse(raw) : INITIAL_JOBS;
  }

  saveJobs(jobs: Job[]): void {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  }

  getMatches(): JobMatch[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MATCHES);
    if (raw) return JSON.parse(raw);

    // Compute fresh matches for initial jobs
    const jobs = this.getJobs();
    const prefs = this.getPreferences();
    const resume = this.getMasterResume();
    const computed = jobs.map((j) => calculateMatchScore(j, prefs, resume));
    this.saveMatches(computed);
    return computed;
  }

  saveMatches(matches: JobMatch[]): void {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  }

  getApplications(): Application[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    return raw ? JSON.parse(raw) : INITIAL_APPLICATIONS;
  }

  saveApplications(apps: Application[]): void {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  }

  getApplicationEvents(): ApplicationEvent[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATION_EVENTS);
    return raw ? JSON.parse(raw) : INITIAL_APPLICATION_EVENTS;
  }

  addApplicationEvent(event: Omit<ApplicationEvent, 'id' | 'createdAt'>): ApplicationEvent {
    const events = this.getApplicationEvents();
    const newEvent: ApplicationEvent = {
      ...event,
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.APPLICATION_EVENTS, JSON.stringify([...events, newEvent]));
    return newEvent;
  }

  getContacts(): RecruiterContact[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return raw ? JSON.parse(raw) : INITIAL_CONTACTS;
  }

  saveContacts(contacts: RecruiterContact[]): void {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  }

  getOutreach(): OutreachMessage[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OUTREACH);
    return raw ? JSON.parse(raw) : INITIAL_OUTREACH;
  }

  saveOutreach(outreach: OutreachMessage[]): void {
    localStorage.setItem(STORAGE_KEYS.OUTREACH, JSON.stringify(outreach));
  }

  getAutomationRuns(): AutomationRun[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTOMATION_RUNS);
    return raw ? JSON.parse(raw) : INITIAL_AUTOMATION_RUNS;
  }

  saveAutomationRuns(runs: AutomationRun[]): void {
    localStorage.setItem(STORAGE_KEYS.AUTOMATION_RUNS, JSON.stringify(runs));
  }

  getAuditEvents(): AuditEvent[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_EVENTS);
    return raw ? JSON.parse(raw) : INITIAL_AUDIT_EVENTS;
  }

  addAudit(event: Omit<AuditEvent, 'id' | 'createdAt'>): void {
    const list = this.getAuditEvents();
    const newEv: AuditEvent = {
      ...event,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.AUDIT_EVENTS, JSON.stringify([newEv, ...list]));
  }

  resetAllData(): void {
    localStorage.clear();
  }
}

export const storage = new StorageService();
