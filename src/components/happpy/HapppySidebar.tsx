import React from 'react';
import {
  LayoutGrid,
  Sliders,
  Calendar,
  Briefcase,
  User,
  HelpCircle,
  ArrowUpCircle,
  LogOut,
  Pencil,
  Gift
} from 'lucide-react';
import { UserProfileConfig } from '../../types/referral';

export type HapppyTab = 'dashboard' | 'configure' | 'activity' | 'jobs' | 'profile' | 'help';

interface HapppySidebarProps {
  currentTab: HapppyTab;
  onSelectTab: (tab: HapppyTab) => void;
  profile: UserProfileConfig;
}

export const HapppySidebar: React.FC<HapppySidebarProps> = ({
  currentTab,
  onSelectTab,
  profile
}) => {
  const navItems: { id: HapppyTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'configure', label: 'Configure', icon: Sliders },
    { id: 'activity', label: 'My Activity', icon: Calendar },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'help', label: 'Help', icon: HelpCircle }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none text-slate-800">
      {/* Top Section */}
      <div>
        {/* Brand */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-slate-900 flex items-center justify-center font-black text-xs rotate-45 rounded-xs">
              <span className="-rotate-45">H</span>
            </div>
            <span className="font-black text-lg tracking-wider text-slate-900">HAPPPY</span>
          </div>
          <div className="mt-2 inline-block px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold rounded">
            Plan Expired · Renew
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
              {profile.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">{profile.name}</div>
              <div className="text-[11px] text-slate-500 leading-tight">{profile.currentRole}</div>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('profile')}
            className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center hover:bg-emerald-200 transition-colors"
            title="Edit Profile"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => alert('Upgrade to Unlimited Plan for automated bulk referral sending.')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            <ArrowUpCircle className="w-4 h-4 text-slate-400" />
            <span>Upgrade Plan</span>
          </button>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-3 border-t border-slate-100">
        {/* Refer Friend Box */}
        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-center gap-2.5 text-xs">
          <Gift className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <div className="font-bold text-slate-900">Earn ₹500</div>
            <div className="text-[11px] text-slate-600">Refer your friends</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => alert('Logged in as Aryan Sharma')}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>

        <div className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer pt-1">
          ✕ Enjoying HAPPPY? Leave a review
        </div>
      </div>
    </aside>
  );
};
