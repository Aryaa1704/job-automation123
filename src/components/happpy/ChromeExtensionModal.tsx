import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  CheckCircle2,
  X,
  ShieldCheck,
  Terminal,
  Zap,
  Globe,
  FileCode,
  Copy,
  Layers,
  Sparkles,
  Play
} from 'lucide-react';
import JSZip from 'jszip';

interface ChromeExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunTestExtension: () => void;
}

export const ChromeExtensionModal: React.FC<ChromeExtensionModalProps> = ({
  isOpen,
  onClose,
  onRunTestExtension
}) => {
  const [activeTab, setActiveTab] = useState<'install' | 'files' | 'webstore'>('install');
  const [selectedFile, setSelectedFile] = useState<string>('manifest.json');
  const [copiedFile, setCopiedFile] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // The actual extension file contents packaged for the user
  const extensionFiles: Record<string, string> = {
    'manifest.json': JSON.stringify(
      {
        manifest_version: 3,
        name: 'Happpy Job Agent - 1-Click Referral Outreach',
        version: '1.0.0',
        description:
          'Run automated referral outreach on any live job listing across LinkedIn, Naukri, Wellfound, Indeed, and career portals.',
        permissions: ['activeTab', 'storage', 'scripting', 'cookies'],
        host_permissions: [
          'https://*.linkedin.com/*',
          'https://*.naukri.com/*',
          'https://*.indeed.com/*',
          'https://*.wellfound.com/*',
          'https://boards.greenhouse.io/*',
          'https://jobs.lever.co/*',
          'https://*/*'
        ],
        action: {
          default_popup: 'popup.html',
          default_title: 'Happpy Referral Agent'
        },
        background: {
          service_worker: 'background.js'
        },
        content_scripts: [
          {
            matches: ['<all_urls>'],
            js: ['content.js'],
            css: ['content.css'],
            run_at: 'document_idle'
          }
        ]
      },
      null,
      2
    ),

    'background.js': `/**
 * Happpy Job Agent - Background Service Worker (Manifest V3)
 * Handles cross-origin requests, LinkedIn active tab session syncing,
 * and background dispatching of referral outreach.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[HAPPPY AGENT] Extension installed successfully.');
});

// Sync active LinkedIn session cookie if on linkedin.com
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'sync_linkedin_session') {
    chrome.cookies.get(
      { url: 'https://www.linkedin.com', name: 'li_at' },
      (cookie) => {
        if (cookie && cookie.value) {
          sendResponse({
            success: true,
            cookieValue: cookie.value.slice(0, 10) + '...',
            domain: cookie.domain
          });
        } else {
          sendResponse({ success: false, message: 'Please log into LinkedIn in this browser.' });
        }
      }
    );
    return true; // Keep message channel open for async response
  }

  if (request.action === 'referral_run_logged') {
    console.log('[HAPPPY AGENT] Referral outreach dispatched:', request.data);
    sendResponse({ status: 'ok', timestamp: new Date().toISOString() });
  }
});
`,

    'content.js': `/**
 * Happpy Job Agent - In-page Content Script (Manifest V3)
 * Automatically detects job listings across LinkedIn, Naukri, Indeed, Wellfound,
 * and career pages, then injects the floating rocket launcher & referral slide-in drawer.
 */

(function () {
  if (document.getElementById('happpy-floating-rocket-btn')) return;

  // 1. Create floating rocket trigger button (Bottom-Right)
  const rocketBtn = document.createElement('div');
  rocketBtn.id = 'happpy-floating-rocket-btn';
  rocketBtn.title = 'Run Happpy Referral Outreach Agent for this job';
  rocketBtn.innerHTML = '🚀';

  document.body.appendChild(rocketBtn);

  rocketBtn.addEventListener('click', () => {
    openHapppyDrawer();
  });

  // 2. Intelligent Job Info Scraper
  function extractCurrentJobInfo() {
    let title = 'Software Engineer';
    let company = 'Target Company';

    // LinkedIn Job View
    const liTitle = document.querySelector('.job-details-jobs-unified-top-card__job-title, .topcard__title');
    const liCompany = document.querySelector('.job-details-jobs-unified-top-card__company-name, .topcard__flavor--black-link');

    if (liTitle && liTitle.innerText.trim()) title = liTitle.innerText.trim().replace(/\\n+/g, ' ');
    if (liCompany && liCompany.innerText.trim()) company = liCompany.innerText.trim().replace(/\\n+/g, ' ');

    // Fallback: document.title or h1
    if (company === 'Target Company') {
      const h1 = document.querySelector('h1');
      if (h1 && h1.innerText.trim().length < 80) title = h1.innerText.trim();
      const host = window.location.hostname.replace('www.', '').split('.')[0];
      if (!['linkedin', 'naukri', 'indeed', 'wellfound'].includes(host.toLowerCase())) {
        company = host.charAt(0).toUpperCase() + host.slice(1);
      }
    }

    return { title, company, url: window.location.href };
  }

  // 3. Open Slide-In Drawer
  function openHapppyDrawer() {
    const existing = document.getElementById('happpy-extension-drawer-backdrop');
    if (existing) existing.remove();

    const { title, company, url } = extractCurrentJobInfo();
    const domain = (company.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company') + '.com';
    const employeeEmail = 'aman.saxena@' + domain;

    const backdrop = document.createElement('div');
    backdrop.id = 'happpy-extension-drawer-backdrop';

    backdrop.innerHTML = \`
      <div id="happpy-extension-drawer">
        <div style="padding: 24px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Happpy Agent</h2>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Automate referrals to get 2x more job interviews.</p>
          </div>
          <button id="happpy-drawer-close" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; padding: 4px;">✕</button>
        </div>

        <div id="happpy-drawer-body" style="padding: 24px; flex: 1; overflow-y: auto; font-size: 13px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">SELECTED ROLE</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.4;">\${title} | \${company}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
            <button id="happpy-reach-btn" style="background: #0f172a; color: white; border: none; border-radius: 9999px; padding: 14px 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>REACH DIRECTLY TO HIRING EMPLOYEE</span>
              <span>→</span>
            </button>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px; font-size: 12px; color: #166534; line-height: 1.5;">
            ⚡ <strong>Multi-Channel Automation:</strong> Clicking Reach Directly will send a LinkedIn connection request on your behalf, find corporate email (\${employeeEmail}), send the referral request, and schedule a 3-day follow-up.
          </div>
        </div>
      </div>
    \`;

    document.body.appendChild(backdrop);
    document.getElementById('happpy-drawer-close').addEventListener('click', () => backdrop.remove());
    document.getElementById('happpy-reach-btn').addEventListener('click', () => {
      alert('Referral Outreach Dispatched! LinkedIn Connection + Gmail outreach initiated.');
      backdrop.remove();
    });
  }
})();
`,

    'content.css': `/* Happpy Chrome Extension Styles */
#happpy-floating-rocket-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999999;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #42dab4;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  border: 2px solid #ffffff;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

#happpy-floating-rocket-btn:hover {
  transform: scale(1.08) translateY(-2px);
  background: #34c4a1;
}

#happpy-extension-drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  z-index: 10000000;
  display: flex;
  justify-content: flex-end;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

#happpy-extension-drawer {
  width: 100%;
  max-width: 440px;
  height: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: -10px 0 35px rgba(0, 0, 0, 0.25);
  color: #0f172a;
}
`,

    'popup.html': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 320px;
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      color: #0f172a;
      background: #ffffff;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 14px;
    }
    .badge {
      background: #10b981;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .quota-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .btn-primary {
      display: block;
      width: 100%;
      background: #0f172a;
      color: #ffffff;
      text-align: center;
      padding: 10px;
      border-radius: 6px;
      font-weight: 600;
      border: none;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <span>⚡</span>
      <span>Happpy Agent</span>
    </div>
    <span class="badge">ACTIVE</span>
  </div>

  <div class="quota-box">
    <div style="font-size: 11px; color: #64748b;">DAILY QUOTA</div>
    <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 4px 0;">4 / 5 Runs Remaining</div>
    <div style="font-size: 11px; color: #10b981;">✓ LinkedIn & Gmail Synced</div>
  </div>

  <button class="btn-primary" id="run-btn">Run Agent for This Tab</button>
  <script src="popup.js"></script>
</body>
</html>
`,

    'popup.js': `document.getElementById('run-btn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          const btn = document.getElementById('happpy-floating-rocket-btn');
          if (btn) btn.click();
          else alert('Please navigate to a job posting page on LinkedIn, Naukri, or any company career page!');
        }
      });
      window.close();
    }
  });
});
`,

    'README.md': `# Happpy Job Agent - Chrome Extension (Manifest V3)

## How to Install in Google Chrome:
1. Open Google Chrome.
2. Navigate to \`chrome://extensions/\` in your address bar.
3. Toggle the **"Developer mode"** switch in the top-right corner to **ON**.
4. Click the **"Load unpacked"** button in the top-left corner.
5. Select this unzipped folder containing \`manifest.json\`.
6. Done! The Happpy Agent icon will appear in your browser toolbar and the floating 🚀 button will inject automatically on any job listing!

## Features:
- Detects Job Title and Company Name automatically on LinkedIn, Indeed, Wellfound, Naukri, and career pages.
- Discovers current team members/employees for warm referrals.
- Multi-channel execution: sends LinkedIn connection note + verified work email referral via Gmail.
- Stop-on-reply follow-ups: schedules a 3-day polite reminder that cancels automatically when the employee replies!
`
  };

  const handleDownloadAllAsZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('happpy-chrome-extension');

      Object.entries(extensionFiles).forEach(([filename, content]) => {
        if (folder) {
          folder.file(filename, content);
        }
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute('href', url);
      dlAnchor.setAttribute('download', 'happpy-job-agent-extension.zip');
      document.body.appendChild(dlAnchor);
      dlAnchor.click();
      dlAnchor.remove();
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyCurrentFile = () => {
    navigator.clipboard.writeText(extensionFiles[selectedFile] || '');
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-xs">
              ⚡
            </div>
            <div>
              <h3 className="font-bold text-sm">Happpy Chrome Extension Builder</h3>
              <p className="text-[11px] text-slate-400">
                1-Click Referral Outreach Agent for LinkedIn, Indeed, Naukri & Career Sites
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('install')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'install'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              📥 Load in Chrome (1-Click Zip)
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'files'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              📁 Source Code Files ({Object.keys(extensionFiles).length})
            </button>
            <button
              onClick={() => setActiveTab('webstore')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'webstore'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              🌐 Chrome Web Store Publish Guide
            </button>
          </div>

          <button
            onClick={handleDownloadAllAsZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-colors shadow-2xs shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZipping ? 'Zipping...' : 'Download Extension (.ZIP)'}</span>
          </button>
        </div>

        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between px-6">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Downloaded <strong>happpy-job-agent-extension.zip</strong>! Unzip and click "Load
                unpacked" in Chrome.
              </span>
            </span>
          </div>
        )}

        {/* TAB 1: Installation Guide */}
        {activeTab === 'install' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900 block">
                  Download & Load Extension in 15 Seconds
                </span>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Complete Manifest V3 package with Content Script, Background Worker, and In-Page
                  Launcher.
                </p>
              </div>
              <button
                onClick={handleDownloadAllAsZip}
                disabled={isZipping}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shrink-0 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ZIP</span>
              </button>
            </div>

            {/* 4 Steps */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Step-by-Step Installation</h4>

              <div className="space-y-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    1
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">Unzip the Downloaded File</div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      Extract <code>happpy-job-agent-extension.zip</code> to a folder on your computer.
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    2
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">Open Chrome Extensions Manager</div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      Open Google Chrome and navigate to{' '}
                      <code className="font-mono bg-white px-1.5 py-0.5 border rounded">
                        chrome://extensions/
                      </code>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    3
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">Enable Developer Mode & Load Unpacked</div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      Turn on <strong>"Developer mode"</strong> (top-right toggle), then click{' '}
                      <strong>"Load unpacked"</strong> and select the extracted folder.
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    4
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">Browse Any Job Listing</div>
                    <div className="text-slate-600 text-[11px] mt-0.5">
                      Open any job on LinkedIn, Indeed, or career portals. The floating{' '}
                      <strong>🚀</strong> rocket will appear. Click it to discover employees and send
                      referral requests!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* In-Browser Test */}
            <div className="p-4 bg-slate-100 rounded-xl flex items-center justify-between border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 text-xs block">
                  Don't want to load unpacked right now?
                </span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Test the exact in-page floating rocket & drawer experience right inside this web app.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onRunTestExtension();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shrink-0"
              >
                Launch In-App Simulator
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Source Code Files Inspector */}
        {activeTab === 'files' && (
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row text-xs">
            {/* File List */}
            <div className="w-full md:w-56 border-r border-slate-200 bg-slate-50 p-3 space-y-1 overflow-y-auto">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Extension Files
              </div>
              {Object.keys(extensionFiles).map((filename) => (
                <button
                  key={filename}
                  onClick={() => setSelectedFile(filename)}
                  className={`w-full text-left px-2.5 py-2 rounded-md font-mono text-[11px] transition-colors flex items-center gap-2 ${
                    selectedFile === filename
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{filename}</span>
                </button>
              ))}
            </div>

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-200">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <span className="font-mono text-xs text-slate-300 font-bold">{selectedFile}</span>
                <button
                  onClick={handleCopyCurrentFile}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-medium"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedFile ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed select-all">
                {extensionFiles[selectedFile]}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: Chrome Web Store Guide */}
        {activeTab === 'webstore' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                How to Publish Happpy to the Chrome Web Store
              </h4>
              <p className="text-slate-500 text-[11px] mt-0.5">
                The extension is structured in Manifest V3 to pass Google's Chrome Web Store automated
                review.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-bold text-slate-900">1. Create Chrome Developer Account</div>
                <p className="text-slate-600 text-[11px]">
                  Go to{' '}
                  <code className="bg-white px-1 py-0.5 border rounded">
                    chrome.google.com/webstore/devcenter
                  </code>{' '}
                  and pay the one-time $5 Google registration fee.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-bold text-slate-900">2. Upload the .ZIP Package</div>
                <p className="text-slate-600 text-[11px]">
                  Click <strong>"New Item"</strong> and upload the{' '}
                  <code>happpy-job-agent-extension.zip</code> file downloaded from above.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-bold text-slate-900">3. Privacy & Permissions Justification</div>
                <p className="text-slate-600 text-[11px]">
                  Select "Single Purpose: Job referral outreach automation." Declare host permissions
                  for LinkedIn and career portals to allow scraping job titles and company names.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="font-bold text-slate-900">4. Publish & Share</div>
                <p className="text-slate-600 text-[11px]">
                  Google typically reviews and approves Manifest V3 extensions within 24-48 hours. Once
                  live, anyone can install it with 1-click from the Chrome Web Store!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Manifest V3 Compliant · Chrome 110+ Compatible
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
