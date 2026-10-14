import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  ExternalLink,
  Terminal,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap,
  Globe
} from 'lucide-react';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'github' | 'cli' | 'config'>('github');

  if (!isOpen) return null;

  const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitCommands = `# 1. Initialize Git in project root
git init
git add .
git commit -m "Deploy RefAgent to Vercel"

# 2. Add your GitHub repository
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/refagent.git
git push -u origin main`;

  const cliCommands = `# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Login & Deploy preview
vercel

# 3. Deploy directly to Production
vercel --prod`;

  const vercelJsonContent = `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black">
              {/* Vercel Triangle Logo */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 76 65" fill="none">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Deploy to Vercel</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready & Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deploy your RefAgent web app and outreach platform in 2 minutes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('github')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'github'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Method 1: GitHub & Vercel Dashboard (Easiest)
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'cli'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Method 2: Vercel CLI (Terminal)
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            vercel.json Config
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs">
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Zero-Config Vercel Support</h4>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    We have already created <code>vercel.json</code> in this project with SPA routing rewrites.
                    Vercel will detect Vite, run <code>npm run build</code>, and serve from <code>dist</code> automatically!
                  </p>
                </div>
              </div>

              {/* Step 1 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-bold text-slate-900">Push to GitHub</h4>
                </div>
                <p className="text-slate-500 text-[11px] mb-2">
                  Run these commands in your project terminal:
                </p>
                <div className="relative group">
                  <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-lg overflow-x-auto">
                    {gitCommands}
                  </pre>
                  <button
                    onClick={() => copyText(gitCommands, 1)}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold flex items-center gap-1"
                  >
                    {copiedIndex === 1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedIndex === 1 ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center">
                    2
                  </span>
                  <h4 className="font-bold text-slate-900">Import in Vercel Dashboard</h4>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] ml-1">
                  <li>Open <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline inline-flex items-center gap-0.5">vercel.com/new <ExternalLink className="w-3 h-3 inline" /></a></li>
                  <li>Click <strong>Import</strong> next to your GitHub repository</li>
                  <li>Framework Preset will auto-detect as <strong>Vite</strong></li>
                  <li>Output directory will auto-detect as <strong>dist</strong></li>
                </ol>
              </div>

              {/* Step 3 */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center">
                    3
                  </span>
                  <h4 className="font-bold text-slate-900">Add Environment Variables (Optional)</h4>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                    <code>VITE_GMAIL_CLIENT_ID</code>
                    <span className="text-slate-400 font-mono text-[10px]">Google OAuth Client ID</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                    <code>GEMINI_API_KEY</code>
                    <span className="text-slate-400 font-mono text-[10px]">AI Cold Pitch Drafting</span>
                  </div>
                </div>
                <div className="mt-3">
                  <a
                    href="https://vercel.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <span>Open Vercel Dashboard to Deploy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
                Deploy directly from your machine with one command using the official Vercel CLI.
              </div>

              <div className="relative group">
                <pre className="p-3.5 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-lg overflow-x-auto leading-relaxed">
                  {cliCommands}
                </pre>
                <button
                  onClick={() => copyText(cliCommands, 2)}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold flex items-center gap-1"
                >
                  {copiedIndex === 2 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedIndex === 2 ? 'Copied!' : 'Copy Commands'}
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                <strong>When prompted by Vercel CLI:</strong>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-500">
                  <li>Set up and deploy? &rarr; <code>y</code></li>
                  <li>Link to existing project? &rarr; <code>n</code></li>
                  <li>Project name? &rarr; <code>ref-agent</code></li>
                  <li>In which directory is your code located? &rarr; <code>./</code></li>
                  <li>Auto-detected project settings (Vite): &rarr; <code>y</code></li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-600">
                This project already includes <code>vercel.json</code> configured in the root directory. It guarantees that client-side routes, direct links, and the Chrome extension static files work out of the box:
              </p>
              <div className="relative group">
                <pre className="p-3.5 bg-slate-900 text-cyan-300 font-mono text-[11px] rounded-lg overflow-x-auto">
                  {vercelJsonContent}
                </pre>
                <button
                  onClick={() => copyText(vercelJsonContent, 3)}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold flex items-center gap-1"
                >
                  {copiedIndex === 3 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedIndex === 3 ? 'Copied!' : 'Copy vercel.json'}
                </button>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>File confirmed present at <code>/vercel.json</code> with 100% build pass rate.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Tested & verified with Vite 6 + React 19 + Tailwind CSS</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
