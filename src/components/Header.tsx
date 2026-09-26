import React, { useState, useEffect } from 'react';
import { AppTab } from '../types';
import { auth, onAuthStateChanged, User } from '../firebase';
import { useTheme } from '../ThemeContext';

interface HeaderProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenCalibration: () => void;
  onOpenCoPilot: () => void;
  onOpenAuth: () => void;
  isDeadReckoning: boolean;
  onToggleDrMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenCalibration,
  onOpenCoPilot,
  onOpenAuth,
  isDeadReckoning,
  onToggleDrMode,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDaylight = theme === 'daylight';
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Battery Level & Charging State
  const [batteryLevel, setBatteryLevel] = useState<number | null>(85);
  const [isCharging, setIsCharging] = useState<boolean>(false);

  useEffect(() => {
    let batteryInstance: any = null;

    const handleLevelChange = () => {
      if (batteryInstance) setBatteryLevel(Math.round(batteryInstance.level * 100));
    };

    const handleChargingChange = () => {
      if (batteryInstance) setIsCharging(batteryInstance.charging);
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          batteryInstance = battery;
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);

          battery.addEventListener('levelchange', handleLevelChange);
          battery.addEventListener('chargingchange', handleChargingChange);
        })
        .catch(() => {
          setBatteryLevel(85);
        });
    }

    return () => {
      if (batteryInstance) {
        batteryInstance.removeEventListener('levelchange', handleLevelChange);
        batteryInstance.removeEventListener('chargingchange', handleChargingChange);
      }
    };
  }, []);

  const getBatteryColorClasses = () => {
    if (batteryLevel === null) return 'text-[#d8c3ac] border-[#31353f] bg-[#1c1f29]';
    if (batteryLevel >= 50) {
      return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
    }
    if (batteryLevel >= 20) {
      return 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_8px_rgba(245,158,11,0.15)]';
    }
    return 'text-rose-400 border-rose-500/40 bg-rose-500/15 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.3)]';
  };

  const getBatteryIcon = () => {
    if (isCharging) return 'battery_charging_full';
    if (batteryLevel === null) return 'battery_unknown';
    if (batteryLevel >= 90) return 'battery_full';
    if (batteryLevel >= 60) return 'battery_5_bar';
    if (batteryLevel >= 35) return 'battery_3_bar';
    if (batteryLevel >= 20) return 'battery_2_bar';
    return 'battery_alert';
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  const getTabTitle = () => {
    switch (currentTab) {
      case 'hud-nav':
        return 'Hud Nav';
      case 'telemetry':
        return 'Engine Telemetry';
      case 'injector':
        return 'Replay & Outage';
      case 'metrics':
        return 'Field Metrics';
      case 'audit-trail':
        return 'Audit Trail';
      case 'pitch-deck':
        return 'Pitch Deck';
      default:
        return 'Dhruva Tactical';
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#0a0e17]/85 backdrop-blur-xl border-b border-[#31353f]/40 shadow-[0_1px_8px_rgba(0,0,0,0.4)] pt-safe">
      <div className="h-20 px-3 md:px-6 flex flex-col justify-center max-w-7xl mx-auto">
        {/* Top Status Sub-Row */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00eefc] shadow-[0_0_8px_rgba(0,238,252,0.8)] animate-[pulse-beacon_2s_infinite]" />
            <span className="font-label-caps text-[10px] sm:text-[11px] uppercase text-[#00eefc] tracking-widest">
              DHRUVA TACTICAL
            </span>
            <span className="font-code-stream text-[11px] text-[#d8c3ac]/60">|</span>
            <span className="font-label-caps text-[10px] text-[#d8c3ac] uppercase">100Hz IMU</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 font-label-caps text-[10px] text-[#00eefc]">
              <span className="material-symbols-outlined text-[13px]">cell_tower</span>
              <span className="hidden xs:inline">42 dB-Hz</span>
            </div>
            <div className="flex items-center gap-1 font-label-caps text-[10px] text-[#ffcf91]">
              <span className="material-symbols-outlined text-[13px]">satellite_alt</span>
              <span>28 NavIC/GPS</span>
            </div>

            {/* Battery Percentage Indicator (Green / Yellow / Red based on power level) */}
            <div
              title={`Device Power: ${batteryLevel !== null ? `${batteryLevel}%` : 'N/A'}${isCharging ? ' (Charging)' : ''}`}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all ${getBatteryColorClasses()}`}
            >
              <span className="material-symbols-outlined text-[13px] leading-none">
                {getBatteryIcon()}
              </span>
              <span className="font-code-stream text-[10px] font-bold tracking-tight">
                {batteryLevel !== null ? `${batteryLevel}%` : '--%'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Header Title & Primary Action Controls */}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="font-headline-md text-lg sm:text-2xl font-bold tracking-tight uppercase text-[#dfe2ef] truncate">
              {getTabTitle()}
            </h1>

            <button
              onClick={onToggleDrMode}
              title="Click to toggle DR vs GNSS Mode"
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                isDeadReckoning
                  ? 'bg-[#262a34]/90 border border-[#ffaa00]/40 shadow-[0_0_12px_rgba(255,170,0,0.25)]'
                  : 'bg-[#181b25] border border-[#00eefc]/40 shadow-[0_0_12px_rgba(0,238,252,0.25)]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isDeadReckoning
                    ? 'bg-[#ffaa00] shadow-[0_0_6px_rgba(255,170,0,0.9)] animate-pulse'
                    : 'bg-[#00eefc] shadow-[0_0_6px_rgba(0,238,252,0.9)]'
                }`}
              />
              <span
                className={`font-label-caps text-[9px] uppercase tracking-wider font-semibold ${
                  isDeadReckoning ? 'text-[#ffcf91]' : 'text-[#00eefc]'
                }`}
              >
                {isDeadReckoning ? 'DEAD RECKONING' : 'GNSS RTK LOCK'}
              </span>
            </button>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Global Theme Toggle: Tactical Dark vs High-Contrast Daylight Mode */}
            <button
              onClick={toggleTheme}
              className={`px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-label-caps text-[10px] font-bold transition-all cursor-pointer border ${
                isDaylight
                  ? 'bg-amber-500/10 text-[#b45309] border-[#b45309]/40 hover:bg-amber-500/20 shadow-sm'
                  : 'bg-[#1c1f29] hover:bg-[#262a34] text-[#ffcf91] border-[#ffcf91]/30 shadow-[0_0_10px_rgba(255,207,145,0.15)]'
              }`}
              aria-label={isDaylight ? 'Switch to Dark Tactical Mode' : 'Switch to High-Contrast Daylight Mode'}
              title={
                isDaylight
                  ? 'Daylight Mode Active (High-Contrast Outdoor Visibility) — Click for Dark Tactical HUD'
                  : 'Switch to High-Contrast Daylight Mode for Outdoor Sunlight Visibility'
              }
            >
              <span
                className={`material-symbols-outlined text-[16px] transition-transform ${
                  isDaylight ? 'text-[#d97706] scale-110' : 'text-[#ffaa00]'
                }`}
              >
                {isDaylight ? 'wb_sunny' : 'dark_mode'}
              </span>
              <span className="hidden md:inline font-semibold tracking-wider">
                {isDaylight ? 'DAYLIGHT' : 'NIGHT HUD'}
              </span>
            </button>

            {/* AI Co-Pilot Button (Gemini Chat + Audio Transcribe + Maps + Search) */}
            <button
              onClick={onOpenCoPilot}
              className="px-2.5 py-1 rounded-lg flex items-center gap-1 bg-[#1c1f29] hover:bg-[#262a34] text-[#00eefc] border border-[#00eefc]/40 shadow-[0_0_10px_rgba(0,238,252,0.2)] font-label-caps text-[10px] font-bold transition-all cursor-pointer"
              title="Launch Gemini Tactical AI Co-Pilot"
            >
              <span className="material-symbols-outlined text-[15px] animate-pulse">smart_toy</span>
              <span className="hidden sm:inline">AI CO-PILOT</span>
            </button>

            {/* Pitch Deck Switcher Button */}
            <button
              onClick={() => onTabChange(currentTab === 'pitch-deck' ? 'hud-nav' : 'pitch-deck')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-label-caps text-[10px] font-bold transition-all cursor-pointer ${
                currentTab === 'pitch-deck'
                  ? 'bg-[#ffaa00] text-[#452b00] shadow-[0_0_10px_rgba(255,170,0,0.4)]'
                  : 'bg-[#1c1f29] text-[#ffcf91] hover:bg-[#262a34] border border-[#ffcf91]/20'
              }`}
              title="Toggle Presentation / Pitch Deck"
            >
              <span className="material-symbols-outlined text-[15px]">slideshow</span>
              <span className="hidden sm:inline">DECK</span>
            </button>

            {/* Mount Calibration Trigger */}
            <button
              onClick={onOpenCalibration}
              aria-label="Mount Calibration & Diagnostics"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-[#d8c3ac] hover:text-[#00eefc] hover:bg-[#262a34] transition-colors border border-transparent hover:border-[#00eefc]/30 cursor-pointer"
              title="Mount & Cupholder Calibration"
            >
              <span className="material-symbols-outlined text-[18px]">sensors</span>
            </button>

            {/* Firebase Auth & Cloud Mission Vault Avatar Button */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 cursor-pointer rounded-full p-0.5 border border-[#ffcf91]/40 hover:border-[#00eefc] transition-all"
              title={currentUser ? `Signed in as ${currentUser.displayName || currentUser.email}` : 'Sign in with Google (Firebase)'}
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#00eefc]"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ffcf91] flex items-center justify-center shadow-[0_0_10px_rgba(255,207,145,0.3)]">
                  <span className="material-symbols-outlined text-[#452b00] text-[18px]">person</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
