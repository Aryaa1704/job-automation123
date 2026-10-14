# Personal AI Job Referral & Outreach Agent (RefAgent)

An automated job referral outreach platform and Chrome Extension agent inspired by modern hiring outreach workflows (like Uplers HAPPPY agent). It enables candidate resume tailoring, direct hiring manager/recruiter contact discovery, automated LinkedIn connection requests & cold messages, Gmail cold outreach, and 72-hour smart follow-ups.

---

## 🚀 Deploy to Vercel (1-Click or Manual)

### Option 1: Direct GitHub Push + Vercel Dashboard (Recommended)

1. **Push this project to a GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of RefAgent"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** -> **"Project"**.
   - Select your GitHub repository and click **Import**.
   - Vercel automatically detects the framework as **Vite**.
   - Build Settings (already configured in `vercel.json`):
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`
     - **Install Command:** `npm install`
   - In **Environment Variables**, add:
     - `VITE_GMAIL_CLIENT_ID`: Your Google OAuth 2.0 Client ID (optional, default provided)
     - `GEMINI_API_KEY`: Your Google Gemini API Key (for AI drafting and parsing)
   - Click **Deploy**! 🚀

---

### Option 2: Deploy using Vercel CLI

1. Install the Vercel CLI if you haven't already:
   ```bash
   npm i -g vercel
   ```

2. Run the deployment command from the project root:
   ```bash
   vercel
   ```
   Follow the prompts in your terminal:
   - *Set up and deploy?* -> `y`
   - *Which scope?* -> Your personal account or team
   - *Link to existing project?* -> `n`
   - *Project name?* -> `ref-agent` (or your choice)
   - *In which directory is your code located?* -> `./`
   - *Auto-detected project settings (Vite):* -> `y`

3. For production deployment:
   ```bash
   vercel --prod
   ```

---

## ⚙️ Configuration Files Included

- **`vercel.json`**: Pre-configured with clean SPA rewrites (`/(.*) -> /index.html`) so routing, direct links, and downloads work seamlessly without 404 errors.
- **`package.json`**: Configured with Vite 6/Tailwind CSS 4, React 19, and JSZip for client-side extension packaging.

---

## 🧩 Installing the Chrome Extension

1. In the web app, click **"Chrome Extension (.zip)"** in the top navigation bar.
2. Click **"Download Complete Extension (.zip)"** or find the files in `public/extension/`.
3. Unzip the downloaded file.
4. Open Google Chrome and navigate to `chrome://extensions`.
5. Enable **Developer mode** (top-right toggle switch).
6. Click **"Load unpacked"** and select the unzipped `extension` folder.
7. Open any job posting on LinkedIn, Indeed, or company career pages and click the RefAgent floating badge to run the agent!
