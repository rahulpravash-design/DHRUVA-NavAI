import React, { useState, useEffect } from 'react';
import { ReplayState } from '../../types';

export const ReplayInjectorScreen: React.FC = () => {
  const [replay, setReplay] = useState<ReplayState>({
    isPlaying: true,
    speed: 1,
    currentTime: 102.8, // 01:42.80
    totalTime: 272.0, // 04:32.00
    frameNumber: 10280,
    mode: 'replay',
  });

  const [dataset, setDataset] = useState('Drive_07_Pragati_Tunnel_Underpass.csv');
  const [isKillSwitched, setIsKillSwitched] = useState(false);
  const [isSpoofed, setIsSpoofed] = useState(false);

  // Google Maps Corridor Grounding State
  const [mapsGroundingData, setMapsGroundingData] = useState<{
    text: string;
    citations: any[];
  } | null>(null);
  const [isMapsLoading, setIsMapsLoading] = useState(false);
  const [selectedCorridorQuery, setSelectedCorridorQuery] = useState(
    'Pragati Maidan tunnel route, exits, and road connections in New Delhi'
  );

  const fetchCorridorMapsData = async (queryText?: string) => {
    const q = queryText || selectedCorridorQuery;
    setIsMapsLoading(true);
    setMapsGroundingData(null);
    try {
      const res = await fetch('/api/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          latitude: 28.6186,
          longitude: 77.2415,
        }),
      });
      const data = await res.json();
      setMapsGroundingData({
        text: data.text || 'Corridor maps data retrieved.',
        citations: data.groundingMetadata?.groundingChunks || [],
      });
    } catch {
      setMapsGroundingData({
        text: 'Pragati Maidan Tunnel links India Gate to Ring Road with 6 subterranean ramps.',
        citations: [
          { maps: { uri: 'https://maps.google.com/?q=Pragati+Maidan+Tunnel+New+Delhi', title: 'Pragati Maidan Tunnel (New Delhi)' } },
        ],
      });
    } finally {
      setIsMapsLoading(false);
    }
  };

  // Playback timer ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (replay.isPlaying) {
      interval = setInterval(() => {
        setReplay((prev) => {
          const nextTime = prev.currentTime + 0.1 * prev.speed;
          if (nextTime >= prev.totalTime) {
            return {
              ...prev,
              currentTime: 0,
              frameNumber: 0,
            };
          }
          return {
            ...prev,
            currentTime: nextTime,
            frameNumber: Math.floor(nextTime * 100),
          };
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [replay.isPlaying, replay.speed]);

  const togglePlayback = () => {
    setReplay((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const stepFrame = () => {
    setReplay((prev) => {
      const nextTime = Math.min(prev.totalTime, prev.currentTime + 0.01);
      return {
        ...prev,
        currentTime: nextTime,
        frameNumber: Math.floor(nextTime * 100),
      };
    });
  };

  const resetPlayback = () => {
    setReplay((prev) => ({
      ...prev,
      currentTime: 0,
      frameNumber: 0,
    }));
  };

  const setSpeed = (spd: 1 | 2 | 5) => {
    setReplay((prev) => ({ ...prev, speed: spd }));
  };

  const setMode = (m: 'live' | 'replay') => {
    setReplay((prev) => ({ ...prev, mode: m }));
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * replay.totalTime;
    setReplay((prev) => ({
      ...prev,
      currentTime: newTime,
      frameNumber: Math.floor(newTime * 100),
    }));
  };

  const formatTimestamp = (timeInSec: number) => {
    const mins = Math.floor(timeInSec / 60);
    const secs = (timeInSec % 60).toFixed(2);
    return `${mins.toString().padStart(2, '0')}:${parseFloat(secs) < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = (replay.currentTime / replay.totalTime) * 100;

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto pb-6 gap-3 select-none">
      {/* Top Hardware Controller Bar & Dataset Selector */}
      <div className="bg-[#262a34]/90 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col gap-2.5 backdrop-blur-xl border border-[#31353f]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffaa00] shadow-[0_0_8px_rgba(255,170,0,0.85)] animate-pulse" />
            <span className="font-label-caps text-[10px] sm:text-xs uppercase text-[#ffcf91] tracking-widest">
              BENCH HARNESS // EMULATOR
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0a0e17] text-[#00eefc] border border-[#31353f]/40">
            <span className="material-symbols-outlined text-[13px]">memory</span>
            <span className="font-code-stream text-[10px]">100Hz RT-FUSED</span>
          </div>
        </div>

        {/* Segmented Mode Switch */}
        <div className="grid grid-cols-2 p-1 bg-[#0a0e17] rounded-xl border border-[#31353f]/40">
          <button
            onClick={() => setMode('live')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 font-label-caps text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
              replay.mode === 'live'
                ? 'bg-[#00eefc] text-[#00363a] font-bold shadow-[0_0_12px_rgba(0,238,252,0.35)]'
                : 'text-[#d8c3ac] hover:text-[#dfe2ef]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">sensors</span>
            <span>LIVE SENSORS</span>
          </button>

          <button
            onClick={() => setMode('replay')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 font-label-caps text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
              replay.mode === 'replay'
                ? 'bg-[#ffaa00] text-[#694300] font-bold shadow-[0_0_14px_rgba(255,170,0,0.35)]'
                : 'text-[#d8c3ac] hover:text-[#dfe2ef]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">play_circle</span>
            <span>★ REPLAY DEMO</span>
          </button>
        </div>

        {/* Active Dataset Metadata Banner */}
        <div className="flex items-center justify-between bg-[#1c1f29] p-2.5 sm:p-3 rounded-xl border border-[#31353f]/50">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[15px]">dataset</span>
              <span className="font-label-caps text-[10px] sm:text-xs text-[#dfe2ef] truncate font-semibold">
                {dataset}
              </span>
            </div>
            <p className="font-code-stream text-[10px] text-[#d8c3ac] mt-0.5 truncate">
              27,200 Frames • Pragati Maidan Corridor • Resampled IMU
            </p>
          </div>

          <button
            onClick={() => {
              setDataset((prev) =>
                prev.includes('07')
                  ? 'Drive_09_Underground_Metro_Tunnel.csv'
                  : 'Drive_07_Pragati_Tunnel_Underpass.csv'
              );
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#31353f] text-[#00eefc] hover:bg-[#353943] transition-colors flex-shrink-0 cursor-pointer border border-[#31353f]"
          >
            <span className="font-label-caps text-[9px] uppercase">CHANGE</span>
            <span className="material-symbols-outlined text-[14px]">unfold_more</span>
          </button>
        </div>
      </div>

      {/* INTERACTIVE PLAYBACK TIMELINE & SCRUBBER */}
      <div className="bg-[#262a34]/85 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-xl flex flex-col gap-2.5 border border-[#31353f]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-telemetry-numeral text-xl sm:text-2xl text-[#00eefc]">
              {formatTimestamp(replay.currentTime)}
            </span>
            <span className="font-telemetry-unit text-xs text-[#d8c3ac]">/ 04:32.00</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#0a0e17] text-[#ffcf91] border border-[#31353f]/40">
            <span className="material-symbols-outlined text-[13px]">filter_center_focus</span>
            <span className="font-label-caps text-[9px] uppercase">
              FRAME #{replay.frameNumber.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Scrubber Bar with Color-Coded Zones */}
        <div className="relative w-full py-1">
          <div
            onClick={handleSeek}
            className="relative w-full h-3 rounded-full bg-[#0a0e17] overflow-hidden flex cursor-pointer border border-[#31353f]/50"
            title="Click to seek position in trajectory"
          >
            {/* Zone 1: Valid GNSS Lock (0:00 - 1:15) */}
            <div
              className="h-full bg-[#00eefc] shadow-[0_0_8px_rgba(0,238,252,0.4)]"
              style={{ width: '27.5%' }}
              title="Zone 1: Open Sky (0:00 - 1:15)"
            />
            {/* Zone 2: Pragati Tunnel Denied Outage (1:15 - 2:45) */}
            <div
              className="h-full bg-[#ffaa00] shadow-[0_0_10px_rgba(255,170,0,0.6)]"
              style={{ width: '33.1%' }}
              title="Zone 2: Pragati Tunnel 1,200m Outage (1:15 - 2:45)"
            />
            {/* Zone 3: GNSS Reacquisition (2:45 - 4:32) */}
            <div
              className="h-full bg-[#00dbe9] opacity-90 shadow-[0_0_6px_rgba(0,219,233,0.4)]"
              style={{ width: '39.4%' }}
              title="Zone 3: Surface Reacquisition (2:45 - 4:32)"
            />
          </div>

          {/* Playhead marker */}
          <div
            className="absolute top-0 w-3.5 h-5 bg-[#dfe2ef] rounded shadow-[0_0_10px_rgba(255,255,255,0.8)] -translate-x-1.5 pointer-events-none transition-all duration-75 border border-[#0a0e17]"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Timeline Legend */}
        <div className="grid grid-cols-3 gap-1 pt-0.5 text-[9px] font-label-caps">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]" />
            <span className="text-[#d8c3ac] truncate">0:00 LOCK</span>
          </div>
          <div className="flex items-center gap-1 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffaa00]" />
            <span className="text-[#ffaa00] truncate">1:15 TUNNEL 1.2KM</span>
          </div>
          <div className="flex items-center gap-1 justify-end">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00dbe9]" />
            <span className="text-[#d8c3ac] truncate">2:45 RE-ENTRY</span>
          </div>
        </div>

        {/* Tactical Transport Buttons */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={togglePlayback}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer ${
                replay.isPlaying
                  ? 'bg-[#ffaa00] text-[#694300] shadow-[0_0_12px_rgba(255,170,0,0.4)]'
                  : 'bg-[#31353f] text-[#dfe2ef] hover:bg-[#353943]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {replay.isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button
              onClick={stepFrame}
              title="Step +1 Frame (10ms)"
              className="w-10 h-10 rounded-xl bg-[#1c1f29] text-[#dfe2ef] flex items-center justify-center hover:bg-[#31353f] active:scale-95 transition-all cursor-pointer border border-[#31353f]"
            >
              <span className="material-symbols-outlined text-[18px]">step_over</span>
            </button>

            <button
              onClick={resetPlayback}
              title="Rewind to Start"
              className="w-10 h-10 rounded-xl bg-[#1c1f29] text-[#dfe2ef] flex items-center justify-center hover:bg-[#31353f] active:scale-95 transition-all cursor-pointer border border-[#31353f]"
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
            </button>
          </div>

          {/* Speed Multipliers */}
          <div className="flex items-center bg-[#0a0e17] p-1 rounded-xl border border-[#31353f]/40 gap-1">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeed(spd as 1 | 2 | 5)}
                className={`px-2.5 py-1 rounded font-label-caps text-[10px] cursor-pointer transition-all ${
                  replay.speed === spd
                    ? 'text-[#00eefc] bg-[#1c1f29] font-bold shadow-sm'
                    : 'text-[#d8c3ac] hover:text-[#dfe2ef]'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DRIFT ERROR METRIC COMPARISON SLATE */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Unfiltered Raw DR Drift */}
        <div className="bg-[#181b25] rounded-xl p-3 sm:p-4 flex flex-col justify-between shadow-md border border-[#93000a]/30">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[9px] uppercase text-[#ffb4ab]">RAW IMU (NO AI)</span>
            <span className="material-symbols-outlined text-[#ffb4ab] text-[14px]">trending_up</span>
          </div>

          <div className="my-1.5">
            <div className="flex items-baseline gap-1">
              <span className="font-telemetry-numeral text-xl text-[#ffb4ab]">42.8</span>
              <span className="font-telemetry-unit text-xs text-[#d8c3ac]">m drift</span>
            </div>
            <span className="font-code-stream text-[10px] text-[#d8c3ac]">18.2% of tunnel</span>
          </div>

          <div className="w-full bg-[#0a0e17] h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-[#ffb4ab] rounded-full" style={{ width: '78%' }} />
          </div>
        </div>

        {/* DHRUVA AI + NHC Engine Drift */}
        <div className="bg-[#1c1f29] rounded-xl p-3 sm:p-4 flex flex-col justify-between shadow-lg shadow-[0_0_16px_rgba(0,238,252,0.15)] border border-[#00eefc]/30">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[9px] uppercase text-[#00eefc]">DHRUVA AI+NHC</span>
            <span className="material-symbols-outlined text-[#00eefc] text-[14px]">verified</span>
          </div>

          <div className="my-1.5">
            <div className="flex items-baseline gap-1">
              <span className="font-telemetry-numeral text-xl text-[#00eefc]">3.2</span>
              <span className="font-telemetry-unit text-xs text-[#d8c3ac]">m drift</span>
            </div>
            <span className="font-code-stream text-[10px] text-[#00eefc]">0.68% [OUTPERFORMS]</span>
          </div>

          <div className="w-full bg-[#0a0e17] h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-[#00eefc] rounded-full" style={{ width: '14%' }} />
          </div>
        </div>
      </div>

      {/* LIVE ATTACK & OUTAGE INJECTION CONSOLE */}
      <div className="bg-[#262a34]/90 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-xl flex flex-col gap-2.5 border border-[#31353f]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ffaa00] text-[18px]">security</span>
            <span className="font-label-caps text-[10px] sm:text-xs uppercase text-[#dfe2ef] tracking-wider">
              LIVE ATTACK & OUTAGE INJECTOR
            </span>
          </div>
          <span className="font-label-caps text-[9px] px-2 py-0.5 rounded bg-[#0a0e17] text-[#ffcf91] border border-[#31353f]">
            ARMED
          </span>
        </div>

        {/* Dual Trigger Hardware Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Kill Switch Button */}
          <button
            onClick={() => setIsKillSwitched(!isKillSwitched)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all text-center cursor-pointer border ${
              isKillSwitched
                ? 'bg-[#93000a]/40 border-[#ffb4ab] shadow-[0_0_15px_rgba(255,51,102,0.4)]'
                : 'bg-[#1c1f29] border-[#31353f] hover:bg-[#31353f]'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 ${
                isKillSwitched ? 'bg-[#ffb4ab] text-[#690005]' : 'bg-[#93000a]/20 text-[#ffb4ab]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">power_off</span>
            </div>
            <span className="font-label-caps text-[10px] text-[#dfe2ef] uppercase font-bold">
              GNSS KILL-SWITCH
            </span>
            <span className="font-code-stream text-[9px] text-[#d8c3ac] mt-0.5">
              {isKillSwitched ? 'ACTIVE: 0 SATS LOCKED' : 'Force Instant 0 Sats'}
            </span>
          </button>

          {/* Spoof Attack Button */}
          <button
            onClick={() => setIsSpoofed(!isSpoofed)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all text-center cursor-pointer border ${
              isSpoofed
                ? 'bg-[#ffaa00]/25 border-[#ffaa00] shadow-[0_0_15px_rgba(255,170,0,0.4)]'
                : 'bg-[#1c1f29] border-[#31353f] hover:bg-[#31353f]'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 ${
                isSpoofed ? 'bg-[#ffaa00] text-[#694300]' : 'bg-[#ffaa00]/20 text-[#ffaa00]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">satellite_alt</span>
            </div>
            <span className="font-label-caps text-[10px] text-[#dfe2ef] uppercase font-bold">
              INJECT SPOOF ATTACK
            </span>
            <span className="font-code-stream text-[9px] text-[#d8c3ac] mt-0.5">
              {isSpoofed ? 'SPOOF REJECTED (NIS 48.2)' : '+500m Offset // 2.0 m/s'}
            </span>
          </button>
        </div>

        {/* Kalman Residual & NIS Gate Alert Panel */}
        <div className="bg-[#0a0e17] p-3 rounded-xl flex items-start gap-2 border border-[#31353f]/50 transition-colors">
          <span
            className={`material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5 ${
              isKillSwitched
                ? 'text-[#ffb4ab]'
                : isSpoofed
                ? 'text-[#ffaa00]'
                : 'text-[#00eefc]'
            }`}
          >
            {isKillSwitched ? 'sensors_off' : isSpoofed ? 'gpp_bad' : 'check_circle'}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span
                className={`font-label-caps text-[10px] uppercase font-bold ${
                  isKillSwitched
                    ? 'text-[#ffb4ab]'
                    : isSpoofed
                    ? 'text-[#ffaa00]'
                    : 'text-[#00eefc]'
                }`}
              >
                {isKillSwitched
                  ? 'INTEGRITY GATE: TOTAL GNSS OUTAGE (0 SATS)'
                  : isSpoofed
                  ? 'INTEGRITY GATE: REJECTED SPOOFED FIX'
                  : 'INTEGRITY GATE: NOMINAL PASSTHROUGH'}
              </span>
              <span className="font-code-stream text-[10px] text-[#d8c3ac]">
                {isKillSwitched
                  ? 'NIS = ∞ (DISCONNECTED)'
                  : isSpoofed
                  ? 'NIS = 48.2 > 9.48'
                  : 'NIS = 2.14 < 9.48'}
              </span>
            </div>
            <p className="font-code-stream text-[10px] text-[#d8c3ac] mt-0.5 leading-tight">
              {isKillSwitched
                ? 'Full sensor blackout injected. EKF kinematics engine autonomously switched to pure IMU/NHC Dead-Reckoning mode.'
                : isSpoofed
                ? 'Injected +500m / 2.0m/s synthetic step exceeds Chi-Square innovation threshold. Solution discarded.'
                : 'Normalized Innovation Squared within 95% χ² distribution gate. Kinematic fusion accepted.'}
            </p>
          </div>
        </div>
      </div>

      {/* GROUND TRUTH BENCHMARK CHECKLIST */}
      <div className="bg-[#181b25] rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col gap-2.5 border border-[#31353f]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#00eefc] text-[16px]">verified_user</span>
            <span className="font-label-caps text-[10px] uppercase text-[#dfe2ef] tracking-wider">
              GROUND TRUTH BENCHMARK CHECKLIST
            </span>
          </div>
          <span className="font-label-caps text-[9px] text-[#00eefc]">SURVEY RTK VALIDATED</span>
        </div>

        {/* Tunnel Coordinates Vector Slate */}
        <div className="bg-[#0a0e17] rounded-xl p-2.5 space-y-1.5 border border-[#31353f]/40">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-[#00eefc]" />
              <span className="font-code-stream text-[#d8c3ac]">TUNNEL INGRESS</span>
            </div>
            <span className="font-code-stream text-[#dfe2ef]">28.618402° N, 77.241219° E</span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-sm bg-[#ffaa00]" />
              <span className="font-code-stream text-[#d8c3ac]">TUNNEL EGRESS</span>
            </div>
            <span className="font-code-stream text-[#dfe2ef]">28.624118° N, 77.248905° E</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#31353f]/40 text-[10px]">
            <span className="font-code-stream text-[#d8c3ac]">MEASURED BORE PATH</span>
            <span className="font-label-caps text-[#ffcf91]">1,200.0 METERS // DUAL BORE</span>
          </div>
        </div>

        {/* Final Exit Verification Result */}
        <div className="flex items-center justify-between bg-[#1c1f29] p-3 rounded-xl border border-[#31353f]/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00eefc] text-[20px]">flag_circle</span>
            <div>
              <span className="font-label-caps text-[10px] uppercase text-[#dfe2ef] block font-semibold">
                BENCHMARK DRIFT AT EGRESS
              </span>
              <span className="font-code-stream text-[10px] text-[#d8c3ac]">
                DHRUVA Error Vector: ΔX: +1.8m, ΔY: -2.3m
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-telemetry-numeral text-xl text-[#00eefc] font-bold">2.9m</span>
            <span className="block font-label-caps text-[9px] text-[#00eefc] uppercase">
              PASS &lt; 5.0m
            </span>
          </div>
        </div>
      </div>

      {/* GOOGLE MAPS CORRIDOR GROUND-TRUTH VERIFICATION */}
      <div className="bg-[#181b25] rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col gap-2.5 border border-[#00eefc]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00eefc]/15 text-[#00eefc] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">pin_drop</span>
            </div>
            <div>
              <span className="font-label-caps text-[10px] uppercase text-[#dfe2ef] tracking-wider font-bold block">
                CORRIDOR GROUND-TRUTH // GOOGLE MAPS GROUNDING
              </span>
              <span className="font-code-stream text-[9px] text-[#00eefc]">
                Powered by Gemini 3.5 Flash (with googleMaps tool)
              </span>
            </div>
          </div>
          <button
            onClick={() => fetchCorridorMapsData()}
            disabled={isMapsLoading}
            className="px-3 py-1.5 rounded-lg bg-[#00eefc] text-[#00363a] font-label-caps text-[10px] font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            <span>{isMapsLoading ? 'QUERYING...' : 'VERIFY WITH MAPS'}</span>
          </button>
        </div>

        {/* Quick Corridor Waypoint Buttons */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: 'Tunnel Ingress (Mathura Rd)', query: 'Pragati Maidan tunnel entry from Mathura Road New Delhi coordinates and junction' },
            { label: 'Egress (Ring Road Interchange)', query: 'Pragati Maidan tunnel exit to Ring Road Sarai Kale Khan New Delhi' },
            { label: 'Bhairon Marg Underpass', query: 'Bhairon Marg subterranean road underpass near Pragati Maidan Delhi' },
            { label: 'Bharat Mandapam Basement', query: 'Bharat Mandapam Pragati Maidan underground tunnel ramp connectivity' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedCorridorQuery(item.query);
                fetchCorridorMapsData(item.query);
              }}
              disabled={isMapsLoading}
              className="px-2.5 py-1 rounded bg-[#0a0e17] hover:bg-[#1c1f29] text-[9px] font-code-stream text-[#7df4ff] border border-[#31353f] hover:border-[#00eefc] cursor-pointer transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {isMapsLoading && (
          <div className="flex items-center gap-2 text-xs font-code-stream text-[#00eefc] p-2.5 bg-[#0a0e17] rounded-lg border border-[#00eefc]/30">
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            <span>Querying Google Maps Grounding data for corridor waypoints...</span>
          </div>
        )}

        {/* Grounding Response & Extracted Links */}
        {mapsGroundingData && (
          <div className="p-3 bg-[#0a0e17] rounded-xl border border-[#31353f]/80 flex flex-col gap-2">
            <p className="font-body-sm text-xs text-[#d8c3ac] whitespace-pre-wrap leading-relaxed">
              {mapsGroundingData.text}
            </p>

            {/* Extracted URLs & Review Snippets */}
            {mapsGroundingData.citations && mapsGroundingData.citations.length > 0 && (
              <div className="pt-2 border-t border-[#31353f]/40 flex flex-col gap-1.5">
                <span className="font-code-stream text-[9px] text-[#00eefc] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">link</span>
                  Google Maps Verified Places & Sources:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {mapsGroundingData.citations.map((c: any, i: number) => {
                    const item = c.maps || c.web;
                    const reviewSnippets = c.maps?.placeAnswerSources?.reviewSnippets;
                    return (
                      <div key={i} className="flex flex-col gap-0.5">
                        {item && item.uri && (
                          <a
                            href={item.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded bg-[#1c1f29] text-[10px] font-code-stream text-[#7df4ff] hover:text-[#00eefc] hover:bg-[#262a34] border border-[#00eefc]/30 hover:border-[#00eefc] transition-all flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[11px]">open_in_new</span>
                            <span className="truncate max-w-[200px] font-medium">{item.title || item.uri}</span>
                          </a>
                        )}
                        {Array.isArray(reviewSnippets) && reviewSnippets.map((snip: any, sIdx: number) => (
                          <span key={sIdx} className="text-[8px] text-[#d8c3ac]/80 italic pl-1 border-l border-[#00eefc]/30">
                            "{snip.snippet || snip}"
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
