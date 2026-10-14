import React from 'react';
import {
  LayoutDashboard,
  Search,
  FileText,
  Briefcase,
  Users,
  Send,
  Terminal,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export type NavView =
  | 'dashboard'
  | 'discovery'
  | 'resume_studio'
  | 'applications'
  | 'crm'
  | 'outreach'
  | 'automation'
  | 'settings';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  pendingApprovalsCount: number;
  failedTasksCount: number;
  shortlistedJobsCount: number;
  onOpenMilestoneDemo: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  pendingApprovalsCount,
  failedTasksCount,
  shortlistedJobsCount,
  onOpenMilestoneDemo
}) => {
  const navItems: {
    id: NavView;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'discovery',
      label: 'Job Discovery',
      icon: Search,
      badge: shortlistedJobsCount > 0 ? shortlistedJobsCount : undefined,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    { id: 'resume_studio', label: 'Resume Studio', icon: FileText },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'crm', label: 'Recruiter CRM', icon: Users },
    {
      id: 'outreach',
      label: 'Outreach & Follow-ups',
      icon: Send,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-semibold'
    },
    {
      id: 'automation',
      label: 'Automation Runs',
      icon: Terminal,
      badge: failedTasksCount > 0 ? failedTasksCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-700'
    },
    { id: 'settings', label: 'Settings & Integrations', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            AI
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight leading-none">
              Personal AI Job Agent
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Auditable & Controlled
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Milestone Demo Button */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={onOpenMilestoneDemo}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700/80 text-blue-300 border border-slate-700 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Appendix B Demo Guide</span>
        </button>

        {/* User Identity Footer */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="truncate">
            <span className="block font-medium text-slate-200 truncate">Aryan Sharma</span>
            <span className="block text-slate-500 truncate text-[10px]">aryansharma009009@gmail.com</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="System Online & Healthy" />
        </div>
      </div>
    </aside>
  );
};
