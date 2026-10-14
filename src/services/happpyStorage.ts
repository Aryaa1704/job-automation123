/**
 * HAPPPY Agent Storage and Profile Engine
 * Manages Aryan Sharma's LinkedIn credentials, Gmail OAuth, templates, and multi-channel referral pipeline
 */

import {
  UserProfileConfig,
  AutoReplyConfig,
  ReferralRun,
  LinkedInAccountConfig,
  GmailAccountConfig
} from '../types/referral';

const STORAGE_KEYS = {
  PROFILE: 'happpy_profile_v2',
  AUTO_REPLY: 'happpy_autoreply_v2',
  REFERRAL_RUNS: 'happpy_referral_runs_v2',
  LINKEDIN_ACCOUNT: 'happpy_linkedin_acc_v2',
  GMAIL_ACCOUNT: 'happpy_gmail_acc_v2'
};

export const DEFAULT_PROFILE: UserProfileConfig = {
  name: 'Aryan Sharma',
  role: 'Full Stack Development',
  headline: 'Full Stack Engineer | React, Node.js, TypeScript, PostgreSQL',
  resumeFileName: 'Talent CV 939679.docx',
  linkedInUrl: 'https://www.linkedin.com/in/aryan-sharma-04582b244/',
  phoneNumber: '+91 9311814505',
  email: 'aryansharma009009@gmail.com',
  currentRole: 'Full Stack Development',
  workExperienceYears: 0,
  workExperienceMonths: 3,
  noticePeriod: 'Immediately',
  lastWorkingDay: '2026-09-30',
  expectedCtcLacs: 9,
  currentCtcLacs: 0,
  jobSearchStatus: 'Actively Applying',
  dailyTargetRuns: 5
};

export const DEFAULT_LINKEDIN_ACCOUNT: LinkedInAccountConfig = {
  connected: true,
  stage: 'connected',
  email: 'aryansharma009009@gmail.com',
  passwordMasked: '••••••••••••',
  authMethod: 'extension_session',
  sessionCookie: 'AQEDATXXXXXX_ENCRYPTED_LI_AT',
  activeProfileName: 'Aryan Sharma',
  activeProfileHeadline: 'Full Stack Engineer | React, Next.js, Node.js, TypeScript',
  activeProfileAvatar: '',
  dailyConnectionLimit: 20,
  connectionsSentToday: 4,
  safeDelaySeconds: 45,
  autoMessageOnAccept: true,
  connectionNoteTemplate: `Hi {{name}}, I noticed your work at {{company}}. I'm a Full Stack Engineer (React/Node.js) actively applying for the {{job_title}} role. Would love to connect!`,
  messageTemplateAfterConnect: `Hi {{name}}, thanks for connecting! I recently came across the {{job_title}} opening at {{company}}. Given my background in React, Node.js, and scalable APIs, I would be grateful if you could refer me internally. Here is my resume & LinkedIn: {{linkedin_url}}`,
  lastVerifiedAt: '2026-10-14T03:00:00Z'
};

export const DEFAULT_GMAIL_ACCOUNT: GmailAccountConfig = {
  connected: true,
  email: 'aryansharma009009@gmail.com',
  authType: 'google_oauth',
  dailyEmailLimit: 50,
  emailsSentToday: 3
};

export const DEFAULT_AUTO_REPLY: AutoReplyConfig = {
  enabled: true,
  afterHours: 2,
  criteria: {
    talentDetails: true,
    emailSource: true,
    applicationNextStep: true,
    resumeSharing: true,
    jobDetails: true,
    connectFurther: true,
    confirmations: true,
    assessments: true
  }
};

export const INITIAL_REFERRAL_RUNS: ReferralRun[] = [
  {
    id: 'run_codersworld_00',
    jobTitle: 'Frontend Developer – React.js / Next.js',
    companyName: 'Codersworld',
    jobUrl: 'https://codersworld.in/careers/frontend-developer',
    sourceBoard: 'Career Page',
    runOrigin: 'chrome_extension',
    status: 'sent',
    targetChannels: { linkedin: true, gmail: true },
    discoveredReferrers: [
      {
        id: 'ref_cw_1',
        fullName: 'Aman Saxena',
        role: 'Engineering Lead (Frontend)',
        companyName: 'Codersworld',
        department: 'Engineering',
        linkedInUrl: 'https://www.linkedin.com/in/aman-saxena-lead',
        workEmail: 'aman.saxena@codersworld.in',
        emailConfidence: 98,
        emailFormat: '{first}.{last}@codersworld.in',
        connectionStatus: 'request_sent'
      },
      {
        id: 'ref_cw_2',
        fullName: 'Neha Kapoor',
        role: 'Senior Technical Sourcer',
        companyName: 'Codersworld',
        department: 'Talent / HR',
        linkedInUrl: 'https://www.linkedin.com/in/neha-kapoor-cw',
        workEmail: 'neha@codersworld.in',
        emailConfidence: 95,
        emailFormat: '{first}@codersworld.in',
        connectionStatus: 'connected'
      }
    ],
    selectedReferrerId: 'ref_cw_1',
    linkedInStatus: 'request_sent',
    linkedInConnectionNote: "Hi Aman, noticed your frontend leadership at Codersworld. I'm a React/Next.js developer applying for Frontend Developer. Would love to connect!",
    gmailStatus: 'email_sent',
    subject: 'Referral Request for Frontend Developer – React.js / Next.js (Aryan Sharma)',
    body: `Hi Aman,\n\nI noticed you lead frontend engineering at Codersworld. I recently came across the Frontend Developer (React.js / Next.js) role and would love to ask if you'd be open to referring me internally.\n\nQuick overview:\n• Stack: React.js, Next.js, TypeScript, TailwindCSS, State Management.\n• Availability: Immediate notice period.\n• Profile: https://www.linkedin.com/in/aryan-sharma-04582b244/\n\nThank you so much for your time!\n\nBest regards,\nAryan Sharma\n+91 9311814505`,
    sentAt: '2026-10-14T01:30:00Z',
    followUpDays: 3,
    followUpDate: '2026-10-17T01:30:00Z',
    followUpStatus: 'scheduled',
    createdAt: '2026-10-14T01:25:00Z'
  },
  {
    id: 'run_aiking_01',
    jobTitle: 'GenAI / LLM Engineer',
    companyName: 'AIKING SOLUTIONS',
    jobUrl: 'https://aikingsolutions.com/careers/genai-engineer',
    sourceBoard: 'Career Page',
    runOrigin: 'web_dashboard',
    status: 'replied',
    targetChannels: { linkedin: true, gmail: true },
    discoveredReferrers: [
      {
        id: 'ref_ak_1',
        fullName: 'Vikram Joshi',
        role: 'Lead AI Engineer',
        companyName: 'AIKING SOLUTIONS',
        department: 'Engineering',
        linkedInUrl: 'https://www.linkedin.com/in/vikram-joshi-ai',
        workEmail: 'vikram.joshi@aikingsolutions.com',
        emailConfidence: 96,
        emailFormat: '{first}.{last}@aikingsolutions.com',
        connectionStatus: 'messaged'
      }
    ],
    selectedReferrerId: 'ref_ak_1',
    linkedInStatus: 'pitch_sent',
    gmailStatus: 'replied',
    subject: 'Referral Request for GenAI / LLM Engineer - Aryan Sharma',
    body: 'Hi Vikram, I noticed you lead AI engineering at AIKING SOLUTIONS. I would love to ask if you could refer me for the GenAI/LLM Engineer role. I have hands-on experience building LLM pipelines, microservices, and distributed backends. Notice period is immediate.',
    sentAt: '2026-10-09T11:20:00Z',
    replyStatus: 'positive',
    replyChannel: 'gmail',
    replySnippet: 'Hi Aryan, thanks for reaching out. Your project experience looks solid. I have forwarded your profile to our hiring team for the interview loop!',
    replyReceivedAt: '2026-10-12T14:15:00Z',
    followUpDays: 3,
    followUpStatus: 'cancelled',
    createdAt: '2026-10-09T11:00:00Z'
  },
  {
    id: 'run_eshal_02',
    jobTitle: 'Associate DevOps Engineer',
    companyName: 'ESHAL',
    jobUrl: 'https://eshal.ai/jobs/associate-devops',
    sourceBoard: 'Wellfound',
    runOrigin: 'chrome_extension',
    status: 'replied',
    targetChannels: { linkedin: true, gmail: true },
    discoveredReferrers: [
      {
        id: 'ref_es_1',
        fullName: 'Sameer Khan',
        role: 'Senior Cloud & Systems Architect',
        companyName: 'ESHAL',
        department: 'Engineering',
        linkedInUrl: 'https://www.linkedin.com/in/sameer-khan-cloud',
        workEmail: 'sameer@eshal.ai',
        emailConfidence: 98,
        emailFormat: '{first}@eshal.ai',
        connectionStatus: 'connected'
      }
    ],
    selectedReferrerId: 'ref_es_1',
    linkedInStatus: 'connection_accepted',
    gmailStatus: 'replied',
    subject: 'Application & Referral for Associate DevOps - Aryan Sharma',
    body: 'Hi Sameer, I am applying for the Associate DevOps position at ESHAL. I have worked with Docker, CI/CD GitHub Actions pipelines, and PostgreSQL indexing. Would be grateful for a referral!',
    sentAt: '2026-10-03T09:30:00Z',
    replyStatus: 'positive',
    replyChannel: 'linkedin',
    replySnippet: 'Hey Aryan, glad to connect. I just submitted your referral in our internal portal. You should receive an ATS confirmation email shortly.',
    replyReceivedAt: '2026-10-12T16:00:00Z',
    followUpDays: 4,
    followUpStatus: 'cancelled',
    createdAt: '2026-10-03T09:15:00Z'
  }
];

export const INITIAL_JOBS_LIST = [
  {
    id: 'job_codersworld_00',
    title: 'Frontend Developer – React.js / Next.js',
    companyName: 'Codersworld',
    postedTime: '2 hours ago',
    location: 'Noida / Remote',
    workMode: 'Remote',
    employmentType: 'Full time Permanent Position',
    duration: 'Full-time',
    stipend: '₹7 - 11 LPA',
    mustHaveSkills: ['React.js', 'Next.js', 'TypeScript', 'TailwindCSS', 'Redux / Zustand'],
    goodToHaveSkills: ['REST APIs', 'GraphQL', 'Vite', 'Testing Library'],
    overview: 'Codersworld is hiring a talented Frontend Developer with hands-on experience in modern React and Next.js ecosystems. You will build high-performance client applications with responsive design and seamless API integrations.',
    responsibilities: [
      'Build performant, reusable UI components using React and Next.js.',
      'Optimize web vitals, client bundles, and accessibility standards.',
      'Integrate REST/GraphQL backend services with robust caching.'
    ],
    candidateProfile: [
      'Strong proficiency in JavaScript (ES6+), TypeScript, React.js, and Next.js.',
      'Freshers and early engineers with strong portfolios welcome.'
    ]
  },
  {
    id: 'job_crossing_01',
    title: 'Backend Developer Intern | Freshers Welcome | APIs, Python/Node.js & Databases | Remote',
    companyName: 'Crossing Infotech',
    postedTime: '15 hours ago',
    location: 'India',
    workMode: 'Remote',
    employmentType: 'Full time Permanent Position',
    duration: '1-3 months',
    stipend: '₹16,500/month',
    mustHaveSkills: ['Python', 'Node.js', 'Rest APIs', 'SQL', 'JSON', 'Git'],
    goodToHaveSkills: ['FastAPI', 'Django', 'MySQL', 'MongoDB', 'Docker'],
    overview: 'Crossing Infotech is looking for a Backend Developer Intern who wants to learn how the server-side of modern applications is designed, developed, and maintained.',
    responsibilities: [
      'Assist in developing backend features and application services.',
      'Build or integrate REST APIs under team guidance.'
    ],
    candidateProfile: ['Students or recent graduates with backend/API personal projects.']
  },
  {
    id: 'job_sellfront_02',
    title: 'Software Engineering Intern (Full-Stack)',
    companyName: 'Sell Front',
    postedTime: '1d ago',
    location: 'Mumbai, Remote',
    workMode: 'Remote',
    employmentType: 'Internship',
    duration: '6 months',
    stipend: '₹25,000/month',
    mustHaveSkills: ['JavaScript', 'TypeScript', 'Git', 'SQL', 'HTTP', 'APIs'],
    goodToHaveSkills: ['React', 'Next.js', 'Node.js', 'PostgreSQL'],
    overview: 'Join Sell Front to build lightning fast commerce tools with founding engineers.',
    responsibilities: ['Develop user-facing features in React and TypeScript.'],
    candidateProfile: ['Strong fundamentals in JavaScript, TypeScript, and modern web frameworks.']
  },
  {
    id: 'job_stealth_03',
    title: 'Founding Full-Stack Engineer - Fitness Tech',
    companyName: 'Stealth Startup',
    postedTime: '1d ago',
    location: 'Remote',
    workMode: 'Remote',
    employmentType: 'Full-time',
    duration: 'Permanent',
    stipend: '₹8 - 14 LPA',
    mustHaveSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    goodToHaveSkills: ['GraphQL', 'AWS', 'Docker'],
    overview: 'Stealth stage startup building next generation athletic fitness tracking.',
    responsibilities: ['Architect web and backend services from zero to one.'],
    candidateProfile: ['0-3 years experience with strong startup ownership mindset.']
  },
  {
    id: 'job_techtomorrow_04',
    title: 'Full Stack Web Development + AI Tools',
    companyName: 'Tech Tomorrow',
    postedTime: '20h ago',
    location: 'Remote',
    workMode: 'Remote',
    employmentType: 'Internship',
    duration: '3 months',
    stipend: '₹20,000/month',
    mustHaveSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'APIs'],
    goodToHaveSkills: ['OpenAI API', 'Gemini API', 'TailwindCSS'],
    overview: 'Tech Tomorrow is creating AI workflows for enterprise marketing.',
    responsibilities: ['Create reusable UI components and integrate AI generation models.'],
    candidateProfile: ['Hands-on project experience with React and modern CSS.']
  },
  {
    id: 'job_zetheta_05',
    title: 'Full Stack Engineer',
    companyName: 'Zetheta Algorithms Private Limited',
    postedTime: '1d ago',
    location: 'Remote',
    workMode: 'Remote',
    employmentType: 'Full-time',
    duration: 'Permanent',
    stipend: '₹6 - 10 LPA',
    mustHaveSkills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL'],
    goodToHaveSkills: ['Redis', 'Docker', 'AWS'],
    overview: 'Algorithmic trading and financial analytics platform scaling backend infrastructure.',
    responsibilities: ['Implement high-concurrency microservices and real-time dashboard widgets.'],
    candidateProfile: ['Passionate engineer with focus on database indexing and clean code.']
  }
];

class HapppyStorageService {
  getProfile(): UserProfileConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
  }

  saveProfile(profile: UserProfileConfig): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  getLinkedInAccount(): LinkedInAccountConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.LINKEDIN_ACCOUNT);
    return raw ? JSON.parse(raw) : DEFAULT_LINKEDIN_ACCOUNT;
  }

  saveLinkedInAccount(acc: LinkedInAccountConfig): void {
    localStorage.setItem(STORAGE_KEYS.LINKEDIN_ACCOUNT, JSON.stringify(acc));
  }

  getGmailAccount(): GmailAccountConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.GMAIL_ACCOUNT);
    return raw ? JSON.parse(raw) : DEFAULT_GMAIL_ACCOUNT;
  }

  saveGmailAccount(acc: GmailAccountConfig): void {
    localStorage.setItem(STORAGE_KEYS.GMAIL_ACCOUNT, JSON.stringify(acc));
  }

  getAutoReply(): AutoReplyConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTO_REPLY);
    return raw ? JSON.parse(raw) : DEFAULT_AUTO_REPLY;
  }

  saveAutoReply(config: AutoReplyConfig): void {
    localStorage.setItem(STORAGE_KEYS.AUTO_REPLY, JSON.stringify(config));
  }

  getReferralRuns(): ReferralRun[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REFERRAL_RUNS);
    return raw ? JSON.parse(raw) : INITIAL_REFERRAL_RUNS;
  }

  saveReferralRuns(runs: ReferralRun[]): void {
    localStorage.setItem(STORAGE_KEYS.REFERRAL_RUNS, JSON.stringify(runs));
  }

  addReferralRun(run: ReferralRun): void {
    const runs = this.getReferralRuns();
    this.saveReferralRuns([run, ...runs]);
  }
}

export const happpyStorage = new HapppyStorageService();
