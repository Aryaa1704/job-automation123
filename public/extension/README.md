# Happpy Job Agent - Chrome Extension (Manifest V3)

This extension allows you to run the **Referral Outreach Agent** directly on any live job posting across LinkedIn, Naukri, Wellfound, Indeed, Greenhouse, Lever, and company career pages.

---

### How to Install in Google Chrome (Developer Mode / Unpacked)

1. Open **Google Chrome** on your computer.
2. In the URL bar, go to: `chrome://extensions/`
3. In the top-right corner, toggle **Developer mode** to **ON**.
4. Click the **Load unpacked** button in the top-left.
5. Select this `public/extension` folder (or the unpacked folder you downloaded from the app).
6. That's it! The **Happpy Job Agent** extension icon will appear in your Chrome toolbar.

---

### How to Use on Real Jobs

1. Open any job posting on **LinkedIn**, **Naukri**, **Wellfound**, **Indeed**, or any career portal (e.g. `https://www.linkedin.com/jobs/view/...`).
2. Notice the floating **⚡ Run Referral Agent** button on the bottom-right corner of the page (or click the toolbar icon and click **Run on This Page**).
3. The agent will immediately:
   - Extract the Job Title and Company Name
   - Discover current employees, alumni, and tech leads working at that company
   - Calculate verified corporate emails (`{first}.{last}@{company}.com`)
   - Pre-compose a high-converting referral request using your real profile (Aryan Sharma)
4. Click **"Send via Gmail"** to open Gmail with the recipient, subject, and body pre-filled ready for 1-click transmission!

---

### How to Publish to Chrome Web Store

1. Zip all files inside this `extension` directory (`manifest.json`, `content.js`, `content.css`, `popup.html`, `popup.js`, `background.js`, `icon.png`).
2. Visit the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
3. Click **Add new item**, upload the `.zip` file, add screenshots, and submit for review.
