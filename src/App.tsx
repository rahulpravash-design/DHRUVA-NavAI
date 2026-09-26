/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppTab, TelemetryData } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MountCalibrationModal } from './components/MountCalibrationModal';
import { TacticalCoPilotModal } from './components/TacticalCoPilotModal';
import { FirebaseAuthModal } from './components/FirebaseAuthModal';
import { HudNavScreen } from './components/screens/HudNavScreen';
import { EngineTelemetryScreen } from './components/screens/EngineTelemetryScreen';
import { ReplayInjectorScreen } from './components/screens/ReplayInjectorScreen';
import { FieldMetricsScreen } from './components/screens/FieldMetricsScreen';
import { AuditTrailScreen } from './components/screens/AuditTrailScreen';
import { PitchDeckScreen } from './components/screens/PitchDeckScreen';
import { useTheme } from './ThemeContext';

export default function App() {
  const { theme } = useTheme();
  const isDaylight = theme === 'daylight';
  const [currentTab, setCurrentTab] = useState<AppTab>('hud-nav');
  const [isMountModalOpen, setIsMountModalOpen] = useState(false);
  const [isCoPilotOpen, setIsCoPilotOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDeadReckoning, setIsDeadReckoning] = useState(true);

  // Live telemetry state with gentle high-frequency variance mimicking real 100Hz IMU FIFO
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    speed: 48.2,
    accX: 0.12,
    accY: 1.42,
    accZ: -9.81,
    gyrZ: 0.04,
    netAccel: 0.18,
    heading: 284,
    covarianceRadius: 3.8,
    driftPercent: 0.72,
    ekfResidual: 0.94,
    outageSeconds: 38,
    isOutage: true,
    isSpoofed: false,
    isKillSwitched: false,
    nisValue: 2.14,
    satellites: 28,
    cno: 42.0,
  });

  // Telemetry stream simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        // Minor natural sensor noise
        const speedDelta = (Math.random() - 0.5) * 0.4;
        const newSpeed = Math.max(0, Math.min(80, prev.speed + speedDelta));
        const accX = 0.12 + (Math.random() - 0.5) * 0.04;
        const accY = 1.42 + (Math.random() - 0.5) * 0.06;
        const accZ = -9.81 + (Math.random() - 0.5) * 0.03;
        const gyrZ = 0.04 + (Math.random() - 0.5) * 0.01;
        const netAccel = Math.sqrt(accX * accX + accY * accY + (accZ + 9.81) * (accZ + 9.81));

        return {
          ...prev,
          speed: newSpeed,
          accX,
          accY,
          accZ,
          gyrZ,
          netAccel,
          outageSeconds: prev.isOutage ? prev.outageSeconds + 1 : 0,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleInjectFault = (type: 'normal' | '30s' | '60s' | '120s' | 'spoof') => {
    if (type === 'normal') {
      setIsDeadReckoning(false);
      setTelemetry((prev) => ({
        ...prev,
        isOutage: false,
        isSpoofed: false,
        outageSeconds: 0,
        covarianceRadius: 1.2,
        driftPercent: 0.12,
        satellites: 28,
      }));
    } else if (type === 'spoof') {
      setIsDeadReckoning(true);
      setTelemetry((prev) => ({
        ...prev,
        isOutage: true,
        isSpoofed: true,
        covarianceRadius: 7.4,
        driftPercent: 1.42,
        satellites: 0,
      }));
    } else {
      setIsDeadReckoning(true);
      const secs = type === '30s' ? 30 : type === '60s' ? 60 : 120;
      setTelemetry((prev) => ({
        ...prev,
        isOutage: true,
        isSpoofed: false,
        outageSeconds: secs,
        covarianceRadius: type === '30s' ? 3.8 : type === '60s' ? 4.9 : 6.8,
        driftPercent: type === '30s' ? 0.72 : type === '60s' ? 0.94 : 1.24,
        satellites: 0,
      }));
    }
  };

  const toggleDrMode = () => {
    setIsDeadReckoning((prev) => {
      const next = !prev;
      setTelemetry((t) => ({
        ...t,
        isOutage: next,
        covarianceRadius: next ? 3.8 : 1.2,
        satellites: next ? 0 : 28,
      }));
      return next;
    });
  };

  return (
    <div className={`min-h-screen flex flex-col font-body-md antialiased overflow-x-hidden transition-colors duration-200 ${isDaylight ? 'bg-[#f1f5f9] text-[#0f172a]' : 'bg-[#0f131c] text-[#dfe2ef]'}`}>
      {/* Tactical Top Bar Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenCalibration={() => setIsMountModalOpen(true)}
        onOpenCoPilot={() => setIsCoPilotOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isDeadReckoning={isDeadReckoning}
        onToggleDrMode={toggleDrMode}
      />

      {/* Main Content Viewport */}
      <main className="flex-grow pt-24 pb-24 px-3 sm:px-6 w-full max-w-7xl mx-auto">
        {currentTab === 'hud-nav' && (
          <HudNavScreen
            telemetry={telemetry}
            onInjectFault={handleInjectFault}
            onOpenCoPilot={() => setIsCoPilotOpen(true)}
          />
        )}

        {currentTab === 'telemetry' && (
          <EngineTelemetryScreen
            telemetry={telemetry}
            onOpenCalibration={() => setIsMountModalOpen(true)}
          />
        )}

        {currentTab === 'injector' && <ReplayInjectorScreen />}

        {currentTab === 'metrics' && <FieldMetricsScreen />}

        {currentTab === 'audit-trail' && <AuditTrailScreen />}

        {currentTab === 'pitch-deck' && (
          <PitchDeckScreen onBackToNav={() => setCurrentTab('hud-nav')} />
        )}
      </main>

      {/* Fixed Bottom Tactical Tab Bar */}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* 3D Mount & Cupholder Calibration Modal */}
      <MountCalibrationModal
        isOpen={isMountModalOpen}
        onClose={() => setIsMountModalOpen(false)}
      />

      {/* Gemini AI Co-Pilot Modal (Chat, Transcription, Maps & Search Grounding) */}
      <TacticalCoPilotModal
        isOpen={isCoPilotOpen}
        onClose={() => setIsCoPilotOpen(false)}
        telemetrySnapshot={{
          speed: telemetry.speed,
          drift: telemetry.driftPercent,
          isOutage: telemetry.isOutage,
          covarianceRadius: telemetry.covarianceRadius,
        }}
      />

      {/* Firebase Authentication & Cloud Mission Vault Modal */}
      <FirebaseAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        telemetry={telemetry}
      />
    </div>
  );
}
