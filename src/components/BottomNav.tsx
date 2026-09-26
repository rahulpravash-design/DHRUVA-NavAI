import React from 'react';
import { AppTab } from '../types';

interface BottomNavProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'hud-nav' as AppTab, label: 'HUD Nav', icon: 'explore' },
    { id: 'telemetry' as AppTab, label: 'Telemetry', icon: 'monitoring' },
    { id: 'injector' as AppTab, label: 'Injector', icon: 'warning_amber' },
    { id: 'metrics' as AppTab, label: 'Metrics', icon: 'ssid_chart' },
    { id: 'audit-trail' as AppTab, label: 'Audit Trail', icon: 'verified' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-[#0a0e17]/90 backdrop-blur-xl border-t border-[#31353f]/40 shadow-[0_-1px_12px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center h-16 sm:h-20 px-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 min-w-[58px] min-h-[44px] transition-all cursor-pointer relative ${
                isActive ? 'text-[#ffaa00] font-semibold scale-105' : 'text-[#d8c3ac]/70 hover:text-[#dfe2ef]'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 w-6 h-0.5 bg-[#ffaa00] rounded-full shadow-[0_0_8px_rgba(255,170,0,0.8)]" />
              )}
              <span
                className={`material-symbols-outlined text-[21px] ${
                  isActive ? 'text-[#ffaa00]' : 'text-inherit'
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {tab.icon}
              </span>
              <span className="font-label-caps text-[9px] sm:text-[10px] tracking-wider uppercase">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
