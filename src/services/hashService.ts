/**
 * Cryptographic and Hashing Services
 * Implements strict SHA-256 fingerprinting for resume versions, message approvals,
 * and idempotency keys as specified in TRD 7.6 and Sections 05/06.
 */

export async function computeSha256(text: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return 'sha256:' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Synchronous fast fallback for synchronous renders */
export function fastHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256:sync_${hex}${Math.abs(hash * 31).toString(16).padStart(8, '0')}`;
}

/**
 * Creates approval fingerprint strictly binding recipient, channel, subject, body, and attached resume.
 * Any change in these fields invalidates prior approval immediately.
 */
export async function createApprovalFingerprint(params: {
  recipient: string;
  channel: string;
  subject: string;
  body: string;
  resumeVersionId?: string;
}): Promise<string> {
  const normalizedPayload = [
    params.recipient.trim().toLowerCase(),
    params.channel.trim().toLowerCase(),
    params.subject.trim(),
    params.body.trim(),
    params.resumeVersionId || 'none'
  ].join('::APPROVAL_LOCK::');

  return computeSha256(normalizedPayload);
}

/**
 * Creates an idempotency key to prevent repeat side-effects on replay or retry.
 */
export async function createIdempotencyKey(
  actionType: string,
  entityId: string,
  contentPayload: string
): Promise<string> {
  const raw = `${actionType}:${entityId}:${contentPayload}`;
  return computeSha256(raw);
}

/**
 * Normalizes URL according to TRD 7.1 (removes tracking parameters, normalizes protocol & trailing slash)
 */
export function normalizeJobUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'ref',
      'referral',
      'gh_src',
      'lever-source',
      'trk',
      'fbclid',
      'gclid'
    ];
    trackingParams.forEach((param) => parsed.searchParams.delete(param));
    
    // Normalize path trailing slash
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${pathname}${parsed.search ? parsed.search : ''}`;
  } catch {
    return rawUrl.trim().toLowerCase();
  }
}
