const CLIENT_ID = import.meta.env.VITE_GMAIL_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_GMAIL_REDIRECT_URI;
const SCOPES = 'https://www.googleapis.com/auth/gmail.send';

// Step 1: Google login popup
export const loginWithGoogle = () => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${REDIRECT_URI}` +
    `&response_type=token` +
    `&scope=${encodeURIComponent(SCOPES)}`;
  window.location.href = url;
};

// Step 2: Token URL se extract karo (redirect ke baad)
export const extractTokenFromUrl = (): string | null => {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.replace('#', '?'));
  const token = params.get('access_token');
  if (token) {
    localStorage.setItem('gmail_access_token', token);
    window.location.hash = '';
  }
  return token;
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('gmail_access_token');
};

// Step 3: Real email bhejo
export const sendGmailEmail = async (
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; error?: string }> => {
  const token = getStoredToken();
  if (!token) return { success: false, error: 'Not authenticated. Login first.' };

  // RFC 2822 format
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=utf-8`,
    ``,
    body
  ];
  const rawEmail = emailLines.join('\r\n');
  const encoded = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encoded })
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.error?.message || 'Gmail API error' };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};
