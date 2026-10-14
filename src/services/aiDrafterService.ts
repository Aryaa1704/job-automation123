/**
 * AI Email & LinkedIn Outreach Drafter Service
 * Uses Google Gemini API (gemini-3.8-flash) via @google/genai SDK
 * Implements the prompt specification:
 * - 150-word cold referral email from candidate to recruiter/hiring manager
 * - Tailored using candidate resume skills + job requirements
 * - Professional but warm tone
 * - Subject line included + personalized LinkedIn note (<200 chars)
 */

import { GoogleGenAI } from '@google/genai';
import { UserProfileConfig, ReferrerCandidate } from '../types/referral';

export interface DraftResult {
  emailSubject: string;
  emailBody: string;
  linkedInConnectionNote: string;
  linkedInDirectMessage: string;
  followUpBody: string;
  isAiGenerated: boolean;
}

export async function generatePersonalizedOutreach(
  profile: UserProfileConfig,
  companyName: string,
  jobTitle: string,
  referrer: ReferrerCandidate,
  jobRequirements?: string[]
): Promise<DraftResult> {
  const firstName = referrer.fullName.split(' ')[0];
  const roleType = referrer.department === 'Talent / HR' ? 'Recruiter' : 'Engineering Manager / Peer';
  const reqsText = (jobRequirements && jobRequirements.length > 0)
    ? jobRequirements.slice(0, 4).join(', ')
    : 'React, Node.js, TypeScript, REST APIs, scalable systems';

  // Check if GEMINI_API_KEY is available
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY)
    ? process.env.GEMINI_API_KEY
    : (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are an expert career agent drafting high-converting job referral outreach.
Write a 150-word cold referral email from [${profile.name}] to [${referrer.fullName}] (${roleType}) at [${companyName}] for the [${jobTitle}] role.

Candidate Background:
- Role: ${profile.currentRole}
- Experience: ${profile.workExperienceMonths} months professional experience, immediate notice period (${profile.noticePeriod})
- Core Skills: React, Next.js, Node.js, TypeScript, PostgreSQL, high-performance web applications
- Resume: ${profile.resumeFileName}
- LinkedIn: ${profile.linkedInUrl}

Target Job Requirements: ${reqsText}

Tone: Professional, concise, warm, and highly respectful of their time.
Output Format strictly JSON with keys:
{
  "subject": "Clear 5-8 word subject line",
  "emailBody": "The 150-word email body starting with Hi ${firstName},",
  "linkedInConnectionNote": "Personalized LinkedIn connection note under 200 characters",
  "linkedInDirectMessage": "Message to send once connection is accepted (70-90 words)",
  "followUpBody": "Polite 3-day follow-up nudge (50-70 words)"
}
Return only valid raw JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        return {
          emailSubject: parsed.subject || `Referral request for ${jobTitle} – ${profile.name}`,
          emailBody: parsed.emailBody || '',
          linkedInConnectionNote: parsed.linkedInConnectionNote || `Hi ${firstName}, noticed your work at ${companyName}. I'm applying for ${jobTitle} and would love to connect!`,
          linkedInDirectMessage: parsed.linkedInDirectMessage || '',
          followUpBody: parsed.followUpBody || '',
          isAiGenerated: true
        };
      }
    } catch (err) {
      console.warn('Gemini API draft fallback active:', err);
    }
  }

  // High-conversion deterministic template (exact spec fallback)
  const isHR = referrer.department === 'Talent / HR';
  const emailSubject = isHR
    ? `Application for ${jobTitle} - ${profile.name} (${profile.currentRole})`
    : `Quick referral inquiry: ${jobTitle} at ${companyName} (${profile.name})`;

  const emailBody = `Hi ${firstName},

I noticed you are on the team at ${companyName}. I came across the ${jobTitle} opening and would be deeply grateful if you'd consider referring me internally.

Quick overview of my background:
• Stack: React.js, Next.js, TypeScript, Node.js, PostgreSQL, and scalable microservices.
• Projects: Built real-time collaborative canvases, high-throughput backend APIs, and modern responsive frontends.
• Availability: Immediate joiner (0 notice period).

My resume (${profile.resumeFileName}) and portfolio/LinkedIn (${profile.linkedInUrl}) detail my recent work. If you're open to referring, I can share any specific job ID needed. Thank you so much for your time!

Warm regards,
${profile.name}
${profile.phoneNumber} | ${profile.email}`;

  const linkedInConnectionNote = `Hi ${firstName}, noticed your work at ${companyName}. I'm a ${profile.currentRole} actively applying for ${jobTitle} and would love to connect!`;

  const linkedInDirectMessage = `Hi ${firstName}, thanks for connecting! I recently applied for the ${jobTitle} role at ${companyName}. Given my background in React, Node.js, and high-performance web systems, I'd be very grateful for an internal referral. My profile & resume: ${profile.linkedInUrl}`;

  const followUpBody = `Hi ${firstName},

Hope you're having a great week! Just wanted to gently bump my previous note regarding the ${jobTitle} opening at ${companyName}. 

I remain very excited about the team's work. If you've got a moment to review my profile, I'd be honored to chat briefly.

Best,
${profile.name}`;

  return {
    emailSubject,
    emailBody,
    linkedInConnectionNote,
    linkedInDirectMessage,
    followUpBody,
    isAiGenerated: false
  };
}
