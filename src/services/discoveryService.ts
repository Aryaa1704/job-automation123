/**
 * Job Discovery, Source Adapter, and Deduplication Service
 * Implements TRD 7.1 and Appendix B Demonstration Requirements
 */

import { Job, JobSource, AutomationRun, AutomationTask } from '../types';
import { normalizeJobUrl, computeSha256 } from './hashService';
import { storage } from './storage';
import { calculateMatchScore } from './scoringEngine';

export interface DiscoveryResult {
  run: AutomationRun;
  newJobsCount: number;
  duplicateMergedCount: number;
  totalCanonicalJobs: number;
  details: string[];
}

// Sample incoming adapter listings representing real external sources
const SIMULATED_FEED_DATA: Array<{
  sourceName: JobSource['sourceName'];
  externalId: string;
  sourceUrl: string;
  companyName: string;
  title: string;
  location: string;
  workMode: 'remote' | 'hybrid' | 'on-site';
  employmentType: 'full-time' | 'internship' | 'contract';
  description: string;
  requirements: string[];
  mustHaveSkills: string[];
  preferredSkills: string[];
}> = [
  // 1. Stripe Listing (repeat of existing to demonstrate idempotent deduplication!)
  {
    sourceName: 'Greenhouse API',
    externalId: 'gh_stripe_98721',
    sourceUrl: 'https://boards-api.greenhouse.io/v1/boards/stripe/jobs/98721?utm_source=linkedin&ref=jobboard',
    companyName: 'Stripe',
    title: 'Software Engineer Intern (Backend & Infrastructure)',
    location: 'Remote, India',
    workMode: 'remote',
    employmentType: 'internship',
    description: 'Join Stripe to build the economic infrastructure of the internet. Our backend intern engineers build resilient, low-latency APIs and payment rails processing billions in volume.\n\nRequirements:\n- Strong problem-solving foundation in modern languages (TypeScript, Go, Python, or Ruby).\n- Understanding of distributed systems, relational databases (PostgreSQL/MySQL), and REST APIs.\n- Currently enrolled in a Bachelor’s or Master’s program graduating in 2025 or 2026.\n- Location: Remote within India.',
    requirements: [
      'Graduating batch of 2025/2026',
      'Knowledge of distributed systems & databases',
      'Strong coding skills in TypeScript/Node.js or Go'
    ],
    mustHaveSkills: ['TypeScript', 'PostgreSQL', 'REST APIs', 'Node.js'],
    preferredSkills: ['Docker', 'Distributed Systems', 'Redis']
  },
  // 2. Fresh new listing from Lever RSS
  {
    sourceName: 'Lever RSS',
    externalId: 'lever_postman_84102',
    sourceUrl: 'https://jobs.lever.co/postman/84102?gh_src=crawler',
    companyName: 'Postman',
    title: 'Backend Engineer Intern - API Platform',
    location: 'Bangalore, India (Hybrid)',
    workMode: 'hybrid',
    employmentType: 'internship',
    description: 'Postman is looking for a Backend Engineer Intern to help expand our API developer tools and ecosystem. You will build high-throughput backend services using Node.js and TypeScript, work with distributed caches, and collaborate with globally distributed engineers.\n\nRequirements:\n- Strong foundation in JavaScript / TypeScript and asynchronous programming.\n- Familiarity with RESTful API architecture and HTTP specs.\n- Enrolled in B.Tech / M.Tech in CS or related field graduating in 2025 or 2026.',
    requirements: [
      'Pursuing B.Tech / M.Tech graduating 2025/2026',
      'Hands-on experience with TypeScript and Node.js',
      'Understanding of API lifecycles and microservices'
    ],
    mustHaveSkills: ['TypeScript', 'Node.js', 'REST APIs'],
    preferredSkills: ['Redis', 'Docker', 'PostgreSQL']
  },
  // 3. Fresh new listing from RemoteOK API
  {
    sourceName: 'RemoteOK API',
    externalId: 'rok_supabase_3309',
    sourceUrl: 'https://remoteok.com/remote-jobs/3309-supabase-platform-engineer?ref=rss',
    companyName: 'Supabase',
    title: 'Junior Platform & Database Engineer',
    location: 'Remote Worldwide',
    workMode: 'remote',
    employmentType: 'full-time',
    description: 'Supabase is the open source Firebase alternative. We provide backend services like PostgreSQL databases, Authentication, and instant APIs.\n\nWhat we are looking for:\n- Enthusiastic engineer with solid PostgreSQL fundamentals.\n- Proficiency in TypeScript, Go, or Elixir.\n- Open source mindset and interest in developer tooling.',
    requirements: [
      'Deep interest in database internals and PostgreSQL',
      'Proficiency in TypeScript or Go',
      'Strong written communication for remote async work'
    ],
    mustHaveSkills: ['PostgreSQL', 'TypeScript', 'Docker'],
    preferredSkills: ['Go', 'Redis', 'Linux']
  }
];

export async function runSourceDiscovery(): Promise<DiscoveryResult> {
  const runId = `run_disc_${Date.now()}`;
  const startTime = new Date().toISOString();
  const existingJobs = storage.getJobs();
  const existingJobSources: JobSource[] = existingJobs.flatMap((j) => j.sources);
  const preferences = storage.getPreferences();
  const masterResume = storage.getMasterResume();

  const details: string[] = [];
  let newJobsCount = 0;
  let duplicateMergedCount = 0;

  const tasks: AutomationTask[] = [];

  // Task 1: Fetch source adapters
  const fetchTaskId = `task_fetch_${Date.now()}`;
  tasks.push({
    id: fetchTaskId,
    runId,
    taskType: 'source_fetch',
    idempotencyKey: await computeSha256(`fetch:${runId}`),
    status: 'succeeded',
    attemptCount: 1,
    maxAttempts: 3,
    resultSummary: { sourcesQueried: ['Greenhouse API', 'Lever RSS', 'RemoteOK API'], itemsFound: SIMULATED_FEED_DATA.length },
    retryEligible: false,
    createdAt: startTime,
    updatedAt: new Date().toISOString()
  });

  const updatedJobsList = [...existingJobs];

  // Process and deduplicate feed items
  for (const item of SIMULATED_FEED_DATA) {
    const canonicalUrl = normalizeJobUrl(item.sourceUrl);
    const normalizedCompany = item.companyName.trim().toLowerCase();
    const normalizedTitle = item.title.trim().toLowerCase();

    // Check 1: Check by exact source_name and external_id
    const existingSource = existingJobSources.find(
      (s) => s.sourceName === item.sourceName && s.externalId === item.externalId
    );

    // Check 2: Check by canonical URL or (company + title)
    const existingCanonicalJob = updatedJobsList.find((j) => {
      if (j.canonicalUrl === canonicalUrl) return true;
      if (j.normalizedCompany === normalizedCompany && (j.normalizedTitle.includes(normalizedTitle) || normalizedTitle.includes(j.normalizedTitle))) {
        return true;
      }
      return false;
    });

    if (existingSource || existingCanonicalJob) {
      // Idempotent Match! Do NOT create duplicate canonical record.
      duplicateMergedCount++;
      const targetJob = existingCanonicalJob || updatedJobsList.find((j) => j.id === existingSource?.jobId)!;
      
      // Update last seen timestamp & ensure source record is retained
      targetJob.lastSeenAt = new Date().toISOString();
      const hasSourceRecord = targetJob.sources.some(
        (s) => s.sourceName === item.sourceName && s.externalId === item.externalId
      );

      if (!hasSourceRecord) {
        targetJob.sources.push({
          id: `src_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          jobId: targetJob.id,
          sourceName: item.sourceName,
          externalId: item.externalId,
          sourceUrl: item.sourceUrl,
          payloadHash: await computeSha256(JSON.stringify(item)),
          fetchedAt: new Date().toISOString()
        });
      }

      details.push(`[DEDUPE IDEMPOTENT] Preserved "${item.title}" at ${item.companyName} (${item.sourceName} external_id: ${item.externalId}). No duplicate created.`);
    } else {
      // New Canonical Job!
      newJobsCount++;
      const newJobId = `job_${normalizedCompany.replace(/[^a-z0-9]/g, '')}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const newJob: Job = {
        id: newJobId,
        canonicalUrl,
        normalizedCompany,
        normalizedTitle,
        title: item.title,
        companyName: item.companyName,
        location: item.location,
        workMode: item.workMode,
        employmentType: item.employmentType,
        description: item.description,
        requirements: item.requirements,
        mustHaveSkills: item.mustHaveSkills,
        preferredSkills: item.preferredSkills,
        postedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        firstSeenAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
        status: 'active',
        isShortlisted: false,
        sources: [
          {
            id: `src_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            jobId: newJobId,
            sourceName: item.sourceName,
            externalId: item.externalId,
            sourceUrl: item.sourceUrl,
            payloadHash: await computeSha256(JSON.stringify(item)),
            fetchedAt: new Date().toISOString()
          }
        ]
      };

      updatedJobsList.unshift(newJob);
      details.push(`[NEW CANONICAL] Ingested "${item.title}" at ${item.companyName} via ${item.sourceName}.`);
    }
  }

  // Task 2: Dedupe & Normalize Task
  tasks.push({
    id: `task_dedup_${Date.now()}`,
    runId,
    taskType: 'dedup_normalize',
    idempotencyKey: await computeSha256(`dedup:${runId}`),
    status: 'succeeded',
    attemptCount: 1,
    maxAttempts: 3,
    resultSummary: { newJobs: newJobsCount, duplicatesPreserved: duplicateMergedCount },
    retryEligible: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Task 3: Matching Evaluation
  tasks.push({
    id: `task_match_${Date.now()}`,
    runId,
    taskType: 'evaluate_match',
    idempotencyKey: await computeSha256(`match:${runId}`),
    status: 'succeeded',
    attemptCount: 1,
    maxAttempts: 3,
    resultSummary: { evaluated: updatedJobsList.length },
    retryEligible: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Save updated jobs and recompute matches
  storage.saveJobs(updatedJobsList);
  const recomputedMatches = updatedJobsList.map((j) => calculateMatchScore(j, preferences, masterResume));
  storage.saveMatches(recomputedMatches);

  const run: AutomationRun = {
    id: runId,
    runType: 'discovery',
    status: 'completed',
    parameters: { sources: ['Greenhouse API', 'Lever RSS', 'RemoteOK API'] },
    startedAt: startTime,
    finishedAt: new Date().toISOString(),
    createdBy: 'user',
    tasks
  };

  const runs = storage.getAutomationRuns();
  storage.saveAutomationRuns([run, ...runs]);

  storage.addAudit({
    actorType: 'user',
    action: 'discovery_executed',
    entityType: 'job',
    entityId: runId,
    metadata: { newJobsCount, duplicateMergedCount, total: updatedJobsList.length }
  });

  return {
    run,
    newJobsCount,
    duplicateMergedCount,
    totalCanonicalJobs: updatedJobsList.length,
    details
  };
}
