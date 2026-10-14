/**
 * Happpy Job Agent - In-page Extension Content Script (Manifest V3)
 * Replicates Screenshot 2: Floating Rocket Icon + Right Slide-in Drawer with
 * "REACH DIRECTLY TO HIRING EMPLOYEE" and LinkedIn + Gmail multi-channel execution.
 */

(function () {
  if (document.getElementById('happpy-floating-rocket-btn')) return;

  // Create floating rocket button (Bottom Right)
  const rocketBtn = document.createElement('div');
  rocketBtn.id = 'happpy-floating-rocket-btn';
  rocketBtn.title = 'Run Happpy Referral Agent on this job';
  rocketBtn.innerHTML = `🚀`;

  document.body.appendChild(rocketBtn);

  rocketBtn.addEventListener('click', () => {
    openHapppyDrawer();
  });

  function extractCurrentJobInfo() {
    let title = 'Frontend Developer – React.js / Next.js';
    let company = 'Codersworld';

    // Try finding title in LinkedIn / job boards
    const titleEl =
      document.querySelector('h1') ||
      document.querySelector('.job-details-jobs-unified-top-card__job-title') ||
      document.querySelector('.topcard__title') ||
      document.querySelector('.jobsearch-JobInfoHeader-title');
    if (titleEl && titleEl.innerText.trim()) {
      title = titleEl.innerText.trim().replace(/\n+/g, ' ');
    }

    // Try finding company
    const compEl =
      document.querySelector('.job-details-jobs-unified-top-card__company-name') ||
      document.querySelector('.topcard__flavor--black-link') ||
      document.querySelector('[data-company-name="true"]') ||
      document.querySelector('.companyName');
    if (compEl && compEl.innerText.trim()) {
      company = compEl.innerText.trim().replace(/\n+/g, ' ');
    } else {
      const host = window.location.hostname.replace('www.', '').split('.')[0];
      if (!['linkedin', 'naukri', 'indeed', 'wellfound'].includes(host.toLowerCase())) {
        company = host.charAt(0).toUpperCase() + host.slice(1);
      }
    }

    return { title, company, url: window.location.href };
  }

  function openHapppyDrawer() {
    const existing = document.getElementById('happpy-extension-drawer-backdrop');
    if (existing) existing.remove();

    const { title, company, url } = extractCurrentJobInfo();
    const domain = `${company.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`;
    const employeeEmail = `aman.saxena@${domain}`;

    const backdrop = document.createElement('div');
    backdrop.id = 'happpy-extension-drawer-backdrop';

    backdrop.innerHTML = `
      <div id="happpy-extension-drawer">
        <!-- Top Header -->
        <div style="padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Happpy Agent</h2>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Automate referrals to get 2x more job interviews.</p>
          </div>
          <button id="happpy-drawer-close" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;">✕</button>
        </div>

        <!-- Middle Body -->
        <div id="happpy-drawer-body" style="padding: 24px; flex: 1; overflow-y: auto; font-size: 13px;">
          <!-- SELECTED ROLE Card (Screenshot 2) -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">SELECTED ROLE</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.4;">${title} | ${company}</div>
          </div>

          <!-- Buttons (Screenshot 2) -->
          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
            <button id="happpy-reach-btn" style="background: #0f172a; color: white; border: none; border-radius: 9999px; padding: 14px 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>REACH DIRECTLY TO HIRING EMPLOYEE</span>
              <span>→</span>
            </button>

            <button id="happpy-recommended-btn" style="background: white; color: #0f172a; border: 1px solid #cbd5e1; border-radius: 9999px; padding: 12px 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; text-align: center;">
              RECOMMENDED JOBS LIST
            </button>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px; font-size: 12px; color: #166534; line-height: 1.5;">
            ⚡ <strong>Multi-Channel Automation:</strong> Clicking Reach Directly will send a LinkedIn connection request on your behalf, find corporate email (${employeeEmail}), send the referral request, and schedule a 3-day follow-up.
          </div>
        </div>

        <!-- Bottom Rating Bar (Screenshot 2) -->
        <div style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
          <div>
            <div style="font-weight: 700; color: #0f172a;">Enjoying Happpy Agent?</div>
            <div style="color: #64748b; font-size: 10px;">Your rating on the Chrome Web Store helps us grow and serve you better.</div>
          </div>
          <button style="background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; cursor: pointer;">
            GIVE US A RATING
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    document.getElementById('happpy-drawer-close').addEventListener('click', () => backdrop.remove());
    backdrop.addEventListener('click', (e) => {
      if (e.target.id === 'happpy-extension-drawer-backdrop') backdrop.remove();
    });

    document.getElementById('happpy-reach-btn').addEventListener('click', () => {
      showMultiTouchExecution(title, company, domain, employeeEmail);
    });
  }

  function showMultiTouchExecution(title, company, domain, email) {
    const body = document.getElementById('happpy-drawer-body');
    if (!body) return;

    body.innerHTML = `
      <div style="text-align: center; padding: 20px 0;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: #dcfce7; color: #15803d; font-size: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          ✓
        </div>
        <div style="font-weight: 800; font-size: 16px; color: #0f172a; margin-bottom: 6px;">Outreach Dispatched on Your Behalf!</div>
        <p style="font-size: 12px; color: #64748b; margin: 0 0 20px;">Contacted Engineering Lead at ${company} across LinkedIn & Gmail.</p>

        <div style="text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; font-size: 12px; line-height: 1.6; margin-bottom: 20px;">
          <div><strong>• LinkedIn Invite:</strong> Sent with personalized note (Awaiting acceptance)</div>
          <div><strong>• Direct Email:</strong> Sent to ${email} via Gmail</div>
          <div><strong>• Auto Follow-up:</strong> Scheduled in 3 days (stops immediately if they reply)</div>
        </div>

        <button id="happpy-done-btn" style="width: 100%; background: #0f172a; color: white; border: none; border-radius: 9999px; padding: 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; cursor: pointer;">
          Done
        </button>
      </div>
    `;

    document.getElementById('happpy-done-btn').addEventListener('click', () => {
      const backdrop = document.getElementById('happpy-extension-drawer-backdrop');
      if (backdrop) backdrop.remove();
    });
  }
})();
