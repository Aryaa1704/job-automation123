/**
 * Matching and Eligibility Engine
 * Implements TRD 7.2 formula and hard-gate isolation:
 * score = 0.30 * skills_match + 0.25 * role_relevance + 0.15 * location_match
 *       + 0.15 * experience_fit + 0.10 * work_mode_fit + 0.05 * freshness_factor
 */

import {
  EligibilityStatus,
  HardGateEvaluation,
  Job,
  JobMatch,
  JobPreferences,
  MatchScoreBreakdown,
  MasterResume
} from '../types';

export function calculateMatchScore(
  job: Job,
  preferences: JobPreferences,
  masterResume?: MasterResume
): JobMatch {
  // 1. Skills Match (30%)
  const userSkills = new Set(preferences.skills.map((s) => s.toLowerCase()));
  if (masterResume) {
    masterResume.facts
      .filter((f) => f.factType === 'skill')
      .forEach((f) => userSkills.add(f.title.toLowerCase()));
  }

  const jobReqSkills = [...job.mustHaveSkills, ...job.preferredSkills].map((s) => s.toLowerCase());
  let matchedSkillsCount = 0;
  const matchedKeywords: string[] = [];
  const missingRequirements: string[] = [];

  jobReqSkills.forEach((req) => {
    const isMatch = Array.from(userSkills).some(
      (userSkill) => userSkill.includes(req) || req.includes(userSkill)
    );
    if (isMatch) {
      matchedSkillsCount++;
      matchedKeywords.push(req);
    } else {
      missingRequirements.push(req);
    }
  });

  const skillsMatch =
    jobReqSkills.length > 0 ? Math.round((matchedSkillsCount / jobReqSkills.length) * 100) : 75;

  // 2. Role Relevance (25%)
  const jobTitleNorm = job.title.toLowerCase();
  let roleRelevance = 30; // default baseline
  for (const role of preferences.targetRoles) {
    const roleLower = role.toLowerCase();
    if (jobTitleNorm === roleLower) {
      roleRelevance = 100;
      break;
    } else if (jobTitleNorm.includes(roleLower) || roleLower.includes(jobTitleNorm)) {
      roleRelevance = Math.max(roleRelevance, 88);
    } else {
      // word overlap check
      const wordsA = roleLower.split(/\s+/);
      const overlap = wordsA.filter((w) => jobTitleNorm.includes(w) && w.length > 2);
      if (overlap.length >= 2) {
        roleRelevance = Math.max(roleRelevance, 75);
      } else if (overlap.length === 1) {
        roleRelevance = Math.max(roleRelevance, 55);
      }
    }
  }

  // 3. Location Match (15%)
  const jobLoc = job.location.toLowerCase();
  let locationMatch = 20;
  if (job.workMode === 'remote' && preferences.workModes.includes('remote')) {
    locationMatch = 100;
  } else {
    for (const prefLoc of preferences.locations) {
      const locLower = prefLoc.toLowerCase();
      if (jobLoc.includes(locLower) || locLower.includes(jobLoc)) {
        locationMatch = 100;
        break;
      }
      if (locLower === 'india' && (jobLoc.includes('bangalore') || jobLoc.includes('bengaluru') || jobLoc.includes('delhi') || jobLoc.includes('pune') || jobLoc.includes('hyderabad') || jobLoc.includes('mumbai') || jobLoc.includes('gurgaon') || jobLoc.includes('noida'))) {
        locationMatch = 95;
        break;
      }
    }
  }

  // 4. Experience Fit (15%)
  let experienceFit = 50;
  const isInternshipReq = job.employmentType === 'internship' || job.title.toLowerCase().includes('intern');
  const userIsIntern = preferences.experienceLevel === 'internship' || preferences.experienceLevel === 'entry';
  
  if (isInternshipReq && userIsIntern) {
    experienceFit = 100;
  } else if (!isInternshipReq && preferences.experienceLevel === 'mid') {
    experienceFit = 90;
  } else if (preferences.experienceLevel === 'entry' && !job.title.toLowerCase().includes('senior') && !job.title.toLowerCase().includes('lead')) {
    experienceFit = 85;
  } else if (job.title.toLowerCase().includes('senior') && userIsIntern) {
    experienceFit = 20;
  } else {
    experienceFit = 70;
  }

  // 5. Work Mode Fit (10%)
  const workModeFit = preferences.workModes.includes(job.workMode) ? 100 : 35;

  // 6. Freshness Factor (5%)
  const postedDate = new Date(job.postedAt || job.firstSeenAt);
  const now = new Date();
  const diffHours = Math.max(0, (now.getTime() - postedDate.getTime()) / (1000 * 3600));
  let freshnessFactor = 100;
  if (diffHours < 24) freshnessFactor = 100;
  else if (diffHours < 72) freshnessFactor = 85;
  else if (diffHours < 168) freshnessFactor = 65; // 7 days
  else freshnessFactor = 40;

  // Calculate weighted score
  const totalScore = Math.round(
    0.30 * skillsMatch +
    0.25 * roleRelevance +
    0.15 * locationMatch +
    0.15 * experienceFit +
    0.10 * workModeFit +
    0.05 * freshnessFactor
  );

  const breakdown: MatchScoreBreakdown = {
    skillsMatch,
    roleRelevance,
    locationMatch,
    experienceFit,
    workModeFit,
    freshnessFactor,
    totalScore
  };

  // Hard-Gate Evaluator (Mandatory non-negotiable checks)
  const hardGates: HardGateEvaluation[] = [];

  // Gate 1: Work Authorization / Visa
  const descLower = job.description.toLowerCase();
  const visaExplicitDenied =
    descLower.includes('no sponsorship') ||
    descLower.includes('must be us citizen') ||
    descLower.includes('us citizenship required') ||
    descLower.includes('no c2c') ||
    descLower.includes('security clearance required');

  if (preferences.workAuthorization === 'requires_sponsorship' && visaExplicitDenied) {
    hardGates.push({
      criteria: 'work_authorization',
      name: 'Work Authorization / Visa Sponsorship',
      status: 'ineligible',
      reason: 'Role explicitly specifies no visa sponsorship or US citizenship / security clearance required.'
    });
  } else if (preferences.workAuthorization === 'authorized_any' || preferences.workAuthorization === 'citizen_or_pr') {
    hardGates.push({
      criteria: 'work_authorization',
      name: 'Work Authorization',
      status: 'eligible',
      reason: 'Candidate is fully authorized without immigration sponsorship restrictions.'
    });
  } else {
    hardGates.push({
      criteria: 'work_authorization',
      name: 'Work Authorization',
      status: 'eligible',
      reason: 'No explicit restriction detected in job specification.'
    });
  }

  // Gate 2: Graduation Window (for intern/entry)
  if (preferences.experienceLevel === 'internship' || preferences.experienceLevel === 'entry') {
    if (descLower.includes('graduating between') || descLower.includes('batch of 2024') || descLower.includes('2025/2026')) {
      hardGates.push({
        criteria: 'graduation_date',
        name: 'Graduation Window Match',
        status: 'eligible',
        reason: `Targeting 2025-2026 cohorts, aligns with candidate window (${preferences.graduationWindow}).`
      });
    } else {
      hardGates.push({
        criteria: 'graduation_date',
        name: 'Graduation Window',
        status: 'unknown',
        reason: 'Specific graduation batch not strictly constrained in JD text.'
      });
    }
  }

  // Gate 3: Seniority Level Restriction
  if (userIsIntern && (job.title.toLowerCase().includes('staff') || job.title.toLowerCase().includes('principal') || job.title.toLowerCase().includes('director'))) {
    hardGates.push({
      criteria: 'seniority_level',
      name: 'Seniority Level Fit',
      status: 'ineligible',
      reason: 'Staff/Principal/Director leadership position incompatible with internship/entry profile.'
    });
  } else {
    hardGates.push({
      criteria: 'seniority_level',
      name: 'Seniority Requirement',
      status: 'eligible',
      reason: 'Experience tier meets role scope requirements.'
    });
  }

  // Gate 4: Location Restriction
  if (!preferences.workModes.includes('on-site') && job.workMode === 'on-site' && locationMatch < 50) {
    hardGates.push({
      criteria: 'location_restriction',
      name: 'Strict On-Site Location',
      status: 'ineligible',
      reason: `Mandatory on-site attendance at ${job.location} with no remote option.`
    });
  } else {
    hardGates.push({
      criteria: 'location_restriction',
      name: 'Location Feasibility',
      status: 'eligible',
      reason: job.workMode === 'remote' ? 'Remote eligible.' : `Feasible in ${job.location}.`
    });
  }

  // Determine overall eligibility: any single 'ineligible' makes whole job ineligible
  let overallEligibility: EligibilityStatus = 'eligible';
  if (hardGates.some((g) => g.status === 'ineligible')) {
    overallEligibility = 'ineligible';
  } else if (hardGates.some((g) => g.status === 'unknown')) {
    overallEligibility = 'unknown';
  }

  return {
    id: `match_${job.id}_v1`,
    jobId: job.id,
    score: totalScore,
    breakdown,
    eligibilityStatus: overallEligibility,
    hardGates,
    missingRequirements,
    matchedKeywords,
    rulesVersion: '1.0.0-trd72',
    evaluatedAt: new Date().toISOString()
  };
}
