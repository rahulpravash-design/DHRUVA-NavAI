import React, { useState } from 'react';
import { TelemetryData } from '../../types';

interface EngineTelemetryScreenProps {
  telemetry: TelemetryData;
  onOpenCalibration: () => void;
}

export const EngineTelemetryScreen: React.FC<EngineTelemetryScreenProps> = ({
  telemetry,
  onOpenCalibration
}) => {
  const [isNoiseInjected, setIsNoiseInjected] = useState(false);
  const [isEkfReset, setIsEkfReset] = useState(false);

  const handleInjectNoise = () => {
    setIsNoiseInjected(true);
    setTimeout(() => setIsNoiseInjected(false), 800);
  };

  const handleResetEkf = () => {
    setIsEkfReset(true);
    setTimeout(() => setIsEkfReset(false), 400);
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto pb-6 gap-3 select-none">
      {/* Top Status Tactical Badge & Real-Time Engine Tick */}
      <div className="flex items-center justify-between bg-[#181b25] px-3 sm:px-4 py-2.5 rounded-xl border border-[#31353f]/40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00eefc] shadow-[0_0_8px_rgba(0,238,252,0.9)] animate-pulse" />
          <div className="flex flex-col">
            <span className="font-label-caps text-[10px] sm:text-xs text-[#00eefc] uppercase tracking-widest">
              EKF KINEMATICS ENGINE
            </span>
            <span className="font-code-stream text-[10px] text-[#d8c3ac]">
              LOOP: 10.0ms (100Hz IMU Fused)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#262a34] px-2.5 py-1 rounded-lg border border-[#31353f]/50">
          <span className="font-label-caps text-[10px] text-[#ffcf91] uppercase">ES-EKF CONVERGED</span>
          <span
            className="material-symbols-outlined text-[14px] text-[#ffcf91]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified
          </span>
        </div>
      </div>

      {/* SECTION 1: ARCHITECTURE PIPELINE VISUALIZER (6-NODE DAG) */}
      <div className="flex flex-col bg-[#1c1f29] rounded-xl p-3 sm:p-4 gap-2 border border-[#31353f]/50 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#00eefc] text-[18px]">schema</span>
            <span className="font-label-caps text-[10px] text-[#dfe2ef] tracking-wider uppercase">
              FUSION PIPELINE TOPOLOGY
            </span>
          </div>
          <span className="font-label-caps text-[9px] text-[#00eefc] bg-[#31353f] px-2 py-0.5 rounded font-bold">
            6-NODE DAG
          </span>
        </div>

        {/* Interactive Node Flow Grid */}
        <div className="flex flex-col gap-1.5">
          {/* Layer 1: Raw Sensors & AI Speed Inference */}
          <div className="grid grid-cols-2 gap-2">
            {/* Node 01: 100Hz Raw IMU */}
            <div className="flex flex-col bg-[#262a34] p-2.5 rounded-lg relative overflow-hidden border border-[#31353f]/40">
              <div className="absolute top-0 right-0 w-7 h-7 bg-[#00eefc]/15 rounded-bl-lg flex items-center justify-center">
                <span className="font-label-caps text-[9px] text-[#00eefc] font-bold">01</span>
              </div>
              <div className="flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-[#00eefc] text-[15px]">vibration</span>
                <span className="font-label-caps text-[10px] text-[#00eefc] font-semibold uppercase">
                  100Hz Raw IMU
                </span>
              </div>
              <p className="font-code-stream text-[10px] text-[#d8c3ac] leading-tight">
                Tri-accel + 3D gyro hardware FIFO buffer
              </p>
              <div className="mt-2 flex items-center justify-between text-[#dfe2ef] pt-1 border-t border-[#31353f]/40">
                <span className="font-label-caps text-[9px] text-[#7df4ff]">dt: 9.88ms</span>
                <span className="font-label-caps text-[9px] text-[#ffcf91]">Jitter: 0.12ms</span>
              </div>
            </div>

            {/* Node 02: TFLite AI Speed Net */}
            <div className="flex flex-col bg-[#262a34] p-2.5 rounded-lg relative overflow-hidden border border-[#31353f]/40">
              <div className="absolute top-0 right-0 w-7 h-7 bg-[#ffaa00]/15 rounded-bl-lg flex items-center justify-center">
                <span className="font-label-caps text-[9px] text-[#ffcf91] font-bold">02</span>
              </div>
              <div className="flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-[#ffcf91] text-[15px]">neurology</span>
                <span className="font-label-caps text-[10px] text-[#ffcf91] font-semibold uppercase">
                  TFLite Speed Net
                </span>
              </div>
              <p className="font-code-stream text-[10px] text-[#d8c3ac] leading-tight">
                1D-CNN IMU window (1.5s window)
              </p>
              <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#31353f]/40">
                <span className="font-label-caps text-[9px] text-[#d8c3ac]">42k params</span>
                <span className="font-label-caps text-[9px] text-[#ffaa00] bg-[#ffaa00]/10 px-1 rounded font-bold">
                  1.8ms NPU
                </span>
              </div>
            </div>
          </div>

          {/* Arrow Down Fusion Divider */}
          <div className="flex items-center justify-center gap-2 py-0.5 text-[#d8c3ac]/60">
            <span className="material-symbols-outlined text-[16px] text-[#00eefc]/70">south</span>
            <span className="font-label-caps text-[9px] tracking-widest text-[#d8c3ac]/80 uppercase">
              Kinematic Fusion Coupling
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#ffcf91]/70">south</span>
          </div>

          {/* Layer 2: Core Fusion ES-EKF Card */}
          <div className="flex flex-col bg-[#31353f] p-2.5 rounded-lg shadow-[0_0_15px_rgba(0,238,252,0.08)] border border-[#00eefc]/20">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[#00eefc] text-[16px]">tune</span>
                <span className="font-label-caps text-[10px] text-[#00eefc] uppercase font-bold">
                  Error-State EKF (5-DOF Core)
                </span>
              </div>
              <span className="font-label-caps text-[9px] text-[#00363a] bg-[#00eefc] px-1.5 py-0.5 rounded font-bold">
                P-COV: 0.04m²
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1 my-1 text-center font-code-stream text-[10px]">
              <div className="bg-[#181b25] py-1 rounded text-[#dfe2ef]">E: 0.12m</div>
              <div className="bg-[#181b25] py-1 rounded text-[#dfe2ef]">N: 0.08m</div>
              <div className="bg-[#181b25] py-1 rounded text-[#ffcf91]">Vel: 14.2m/s</div>
              <div className="bg-[#181b25] py-1 rounded text-[#00eefc]">Yaw: 218.4°</div>
              <div className="bg-[#181b25] py-1 rounded text-[#d8c3ac]">b_g: 0.02°/s</div>
            </div>
          </div>

          {/* Arrow Down Constraint Input */}
          <div className="flex items-center justify-center gap-2 py-0.5 text-[#ffaa00]">
            <span className="material-symbols-outlined text-[16px]">south</span>
            <span className="font-label-caps text-[9px] tracking-wider uppercase font-semibold">
              Virtual Sensor Clamps Injected
            </span>
            <span className="material-symbols-outlined text-[16px]">south</span>
          </div>

          {/* Layer 3: NHC & HMM Map Matcher */}
          <div className="grid grid-cols-2 gap-2">
            {/* NHC Constraints */}
            <div className="flex flex-col bg-[#262a34] p-2.5 rounded-lg border border-[#31353f]/40">
              <div className="flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-[#ffcf91] text-[15px]">alt_route</span>
                <span className="font-label-caps text-[10px] text-[#ffcf91] font-bold uppercase">
                  NHC Clamp (v_lat=0)
                </span>
              </div>
              <p className="font-code-stream text-[10px] text-[#d8c3ac]">
                Non-Holonomic no-slip zero lateral/vertical bounds
              </p>
              <div className="mt-2 text-right pt-1 border-t border-[#31353f]/40">
                <span className="font-label-caps text-[9px] text-[#00eefc]">Slip: 0.003 m/s²</span>
              </div>
            </div>

            {/* HMM Map Matcher */}
            <div className="flex flex-col bg-[#262a34] p-2.5 rounded-lg border border-[#31353f]/40">
              <div className="flex items-center gap-1 mb-1">
                <span className="material-symbols-outlined text-[#00eefc] text-[15px]">map</span>
                <span className="font-label-caps text-[10px] text-[#00eefc] font-bold uppercase">
                  HMM Matcher
                </span>
              </div>
              <p className="font-code-stream text-[10px] text-[#d8c3ac]">
                Viterbi trellis trajectory snapping to topological link
              </p>
              <div className="mt-2 text-right pt-1 border-t border-[#31353f]/40">
                <span className="font-label-caps text-[9px] text-[#ffcf91]">Conf: 99.4%</span>
              </div>
            </div>
          </div>

          {/* Final Output Node Banner */}
          <div className="flex items-center justify-between bg-[#0a0e17] px-3 py-2 rounded-lg mt-1 border border-[#31353f]/50">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00eefc] text-[16px]">navigation</span>
              <span className="font-label-caps text-[10px] text-[#dfe2ef] uppercase">Output NavState:</span>
            </div>
            <span className="font-code-stream text-[11px] text-[#00eefc] font-bold">
              LAT: 12.971592°N | LON: 77.594563°E
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: REAL-TIME SENSOR OSCILLOSCOPE (DUAL TRACE) */}
      <div className="flex flex-col bg-[#1c1f29] rounded-xl p-3 sm:p-4 gap-2 border border-[#31353f]/50 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#00eefc] text-[18px]">show_chart</span>
            <span className="font-label-caps text-[10px] text-[#dfe2ef] tracking-wider uppercase">
              SENSOR OSCILLOSCOPE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-label-caps text-[9px] text-[#00eefc]">
              <span className="w-2 h-0.5 bg-[#00eefc] rounded" />
              Ax
            </span>
            <span className="inline-flex items-center gap-1 font-label-caps text-[9px] text-[#ffb952]">
              <span className="w-2 h-0.5 bg-[#ffb952] rounded" />
              Ay
            </span>
            <span className="inline-flex items-center gap-1 font-label-caps text-[9px] text-[#ffb2ba]">
              <span className="w-2 h-0.5 bg-[#ffb2ba] rounded" />
              Az (Grav-Comp)
            </span>
          </div>
        </div>

        {/* Accelerometer Oscilloscope Viewport */}
        <div className="flex flex-col bg-[#0a0e17] rounded-lg p-2.5 border border-[#31353f]/40">
          <div className="flex items-center justify-between text-[#d8c3ac] mb-1">
            <span className="font-label-caps text-[9px] text-[#d8c3ac]">TRI-AXIAL ACCEL [m/s²] (100Hz LIVE FIFO)</span>
            <span className="font-label-caps text-[9px] text-[#00eefc] font-bold">
              G-VECTOR NULLED: 9.806 m/s²
            </span>
          </div>

          {/* Live SVG Oscilloscope Trace */}
          <div className="w-full h-24 overflow-hidden relative flex items-center bg-[#181b25]/50 rounded">
            <div className="absolute inset-x-0 top-1/2 h-px bg-[#353943]" />
            <div className="absolute inset-x-0 top-1/4 h-px bg-[#181b25]" />
            <div className="absolute inset-x-0 top-3/4 h-px bg-[#181b25]" />

            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 80">
              {/* Ax trace (Cyan) */}
              <path
                d={
                  isNoiseInjected
                    ? 'M0,40 Q15,20 30,55 T60,25 T90,60 T120,20 T150,58 T180,22 T210,54 T240,25 T270,55 T300,40'
                    : 'M0,40 Q15,36 30,42 T60,39 T90,44 T120,38 T150,42 T180,35 T210,41 T240,39 T270,40 T300,41'
                }
                fill="none"
                stroke="#00eefc"
                strokeLinecap="round"
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
              {/* Ay trace (Amber) */}
              <path
                d={
                  isNoiseInjected
                    ? 'M0,40 Q20,65 40,15 T80,68 T120,12 T160,70 T200,16 T240,65 T280,18 T300,42'
                    : 'M0,40 Q20,48 40,32 T80,45 T120,30 T160,52 T200,34 T240,43 T280,38 T300,42'
                }
                fill="none"
                stroke="#ffb952"
                strokeLinecap="round"
                strokeWidth="1.5"
                className="transition-all duration-300"
              />
              {/* Az trace with gravity subtracted (Crimson / Tertiary) */}
              <path
                d="M0,40 Q25,41 50,39 T100,40 T150,38 T200,42 T250,39 T300,40"
                fill="none"
                stroke="#ffb2ba"
                strokeDasharray="3,2"
                strokeWidth="1.8"
              />
            </svg>

            <div className="absolute right-2 bottom-1 bg-[#262a34]/90 px-1.5 py-0.5 rounded border border-[#31353f]">
              <span className="font-telemetry-numeral text-[11px] text-[#dfe2ef]">
                |a_net|: {isNoiseInjected ? '1.42 m/s² [NOISE]' : `${telemetry.netAccel.toFixed(2)} m/s²`}
              </span>
            </div>
          </div>
        </div>

        {/* Gyro Integration vs EKF Yaw Drift */}
        <div className="flex flex-col bg-[#0a0e17] rounded-lg p-2.5 border border-[#31353f]/40">
          <div className="flex items-center justify-between text-[#d8c3ac] mb-1">
            <span className="font-label-caps text-[9px] text-[#d8c3ac]">
              GYRO-Z RAW INTEGRATION VS. EKF KALMAN YAW
            </span>
            <span className="font-label-caps text-[9px] text-[#ffaa00]">
              DRIFT BOUND: ±0.4°/min
            </span>
          </div>

          <div className="w-full h-20 overflow-hidden relative flex items-center bg-[#181b25]/50 rounded">
            <div className="absolute inset-x-0 top-1/2 h-px bg-[#353943]" />
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 60">
              {/* Uncorrected Dead Reckoning Drift */}
              <path
                d="M0,45 L40,43 L80,38 L120,34 L160,28 L200,22 L240,16 L280,11 L300,8"
                fill="none"
                opacity="0.6"
                stroke="#ffaa00"
                strokeDasharray="4,3"
                strokeWidth="1.5"
              />
              {/* EKF Compensated Drift */}
              <path
                d="M0,45 L40,44 L80,45 L120,43 L160,44 L200,45 L240,44 L280,45 L300,44"
                fill="none"
                stroke="#00eefc"
                strokeWidth="2"
              />
            </svg>

            {/* Legend Pill */}
            <div className="absolute left-2 top-2 flex items-center gap-2 bg-[#0a0e17]/80 px-2 py-0.5 rounded border border-[#31353f]/40">
              <div className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-[#ffaa00]" />
                <span className="font-label-caps text-[8px] text-[#d8c3ac]">Raw Gyro Drift (+3.2°)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-[#00eefc]" />
                <span className="font-label-caps text-[8px] text-[#00eefc]">EKF Bias Re-aligned</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: PHONE ALIGNMENT & MOUNT CALIBRATION (PCA GIZMO) */}
      <div className="flex flex-col bg-[#1c1f29] rounded-xl p-3 sm:p-4 gap-2 border border-[#31353f]/50 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ffcf91] text-[18px]">screen_rotation</span>
            <span className="font-label-caps text-[10px] text-[#dfe2ef] tracking-wider uppercase">
              PHONE MOUNT CALIBRATION
            </span>
          </div>
          <button
            onClick={onOpenCalibration}
            className="font-label-caps text-[9px] text-[#ffcf91] bg-[#ffaa00]/15 px-2 py-0.5 rounded font-bold hover:bg-[#ffaa00]/30 transition-all cursor-pointer"
          >
            PCA AUTO-LOCKED · OPEN GIZMO
          </button>
        </div>

        <div className="grid grid-cols-12 gap-2 items-center bg-[#262a34] p-3 rounded-lg border border-[#31353f]/40">
          {/* 3D Phone Orientation Wireframe Gizmo */}
          <div
            onClick={onOpenCalibration}
            className="col-span-5 flex flex-col items-center justify-center p-2 bg-[#0a0e17] rounded-lg h-28 relative cursor-pointer border border-[#31353f]/60 hover:border-[#00eefc]/50 transition-all"
            title="Click to calibrate mount"
          >
            <svg className="w-20 h-20" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="38" stroke="#31353f" strokeWidth="1.5" />
              <line stroke="#ffaa00" strokeLinecap="round" strokeWidth="2" x1="50" x2="50" y1="50" y2="14" />
              <polygon fill="#ffaa00" points="50,10 46,18 54,18" />
              <rect
                fill="#1c1f29"
                height="52"
                rx="4"
                stroke="#00eefc"
                strokeWidth="1.5"
                transform="rotate(18 50 50) skewX(-2)"
                width="30"
                x="35"
                y="24"
              />
              <circle cx="50" cy="50" fill="#00eefc" r="2.5" />
              <line stroke="#d3fbff" strokeDasharray="2,2" strokeWidth="1.5" x1="50" x2="62" y1="50" y2="22" />
            </svg>
            <span className="font-label-caps text-[8px] text-[#00eefc] mt-1">DASH MOUNT (LANDSCAPE)</span>
          </div>

          {/* Rotation Angles & PCA Metrics */}
          <div className="col-span-7 flex flex-col gap-1.5">
            <div className="flex items-center justify-between bg-[#181b25] px-2.5 py-1 rounded border border-[#31353f]/40">
              <span className="font-label-caps text-[9px] text-[#d8c3ac]">Pitch (Tilt Up)</span>
              <span className="font-telemetry-numeral text-xs text-[#ffcf91] font-bold">+18.4°</span>
            </div>
            <div className="flex items-center justify-between bg-[#181b25] px-2.5 py-1 rounded border border-[#31353f]/40">
              <span className="font-label-caps text-[9px] text-[#d8c3ac]">Roll (Lateral Cant)</span>
              <span className="font-telemetry-numeral text-xs text-[#00eefc] font-bold">-2.1°</span>
            </div>
            <div className="flex items-center justify-between bg-[#181b25] px-2.5 py-1 rounded border border-[#31353f]/40">
              <span className="font-label-caps text-[9px] text-[#d8c3ac]">PCA Eigenvalue λ₁/λ₂</span>
              <span className="font-code-stream text-[10px] text-[#dfe2ef] font-semibold">14.82 (High Conf)</span>
            </div>
            <p className="font-code-stream text-[9px] text-[#d8c3ac] leading-tight">
              Forward vehicle travel axis automatically aligned without user manual leveling.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: INNOVATION & GNSS INTEGRITY MONITOR (NIS) */}
      <div className="flex flex-col bg-[#1c1f29] rounded-xl p-3 sm:p-4 gap-2 border border-[#31353f]/50 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ffcacf] text-[18px]">security</span>
            <span className="font-label-caps text-[10px] text-[#dfe2ef] tracking-wider uppercase">
              INTEGRITY & SPOOF REJECTION
            </span>
          </div>
          <div className="flex items-center gap-1 bg-[#262a34] px-2 py-0.5 rounded border border-[#31353f]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb2ba] animate-ping" />
            <span className="font-label-caps text-[9px] text-[#ffcacf]">CHI-SQUARE MONITOR</span>
          </div>
        </div>

        {/* NIS Threshold vs Current NIS Chart */}
        <div className="flex flex-col bg-[#0a0e17] p-2.5 rounded-lg border border-[#31353f]/40">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="font-label-caps text-[9px] text-[#d8c3ac]">
                NORMALIZED INNOVATION SQUARED (NIS)
              </span>
              <span className="font-label-caps text-[8px] text-[#ffb4ab] font-bold bg-[#93000a]/40 px-1 py-0.5 rounded border border-[#93000a]/60">
                SPOOF DETECTED
              </span>
            </div>
            <span className="font-code-stream text-[9px] text-[#d8c3ac]">DOF: 2 (α = 0.05)</span>
          </div>

          <div className="w-full h-24 relative overflow-hidden flex items-center bg-[#181b25]/50 rounded">
            <div className="absolute inset-x-0 top-[35%] h-px bg-[#ffb4ab]/70 flex items-center justify-end pr-2">
              <span className="font-label-caps text-[8px] text-[#ffb4ab]">χ² THRESHOLD (5.99)</span>
            </div>
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 80">
              <path
                d="M0,65 L25,62 L50,68 L75,64 L100,60 L125,63 L140,58 L155,12 L170,10 L185,15 L195,64 L220,62 L250,66 L275,63 L300,65"
                fill="none"
                stroke="#ffb4ab"
                strokeWidth="1.8"
              />
              <rect fill="rgba(255, 51, 102, 0.12)" height="70" width="50" x="145" y="8" />
            </svg>
            <div className="absolute left-32 top-1 bg-[#31353f] px-1.5 py-0.5 rounded shadow border border-[#ffb4ab]/40">
              <span className="font-label-caps text-[8px] text-[#ffb4ab] font-bold">
                REJECTED FIX (NIS: 18.4)
              </span>
            </div>
          </div>
        </div>

        {/* Satellite Metrics Strip */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col bg-[#262a34] p-2.5 rounded-lg text-center border border-[#31353f]/40">
            <span className="font-label-caps text-[8px] text-[#d8c3ac] uppercase">Carrier C/N0 Mean</span>
            <span className="font-telemetry-numeral text-base text-[#00eefc]">41.8</span>
            <span className="font-label-caps text-[8px] text-[#d8c3ac]">dB-Hz (Nominal)</span>
          </div>

          <div className="flex flex-col bg-[#262a34] p-2.5 rounded-lg text-center border border-[#31353f]/40">
            <span className="font-label-caps text-[8px] text-[#d8c3ac] uppercase">Constellation Lock</span>
            <span className="font-telemetry-numeral text-base text-[#ffcf91]">24 SV</span>
            <span className="font-label-caps text-[8px] text-[#d8c3ac]">GPS + NavIC L5</span>
          </div>

          <div className="flex flex-col bg-[#262a34] p-2.5 rounded-lg text-center border border-[#31353f]/40">
            <span className="font-label-caps text-[8px] text-[#d8c3ac] uppercase">GDOP / HDOP</span>
            <span className="font-telemetry-numeral text-base text-[#dfe2ef]">1.2</span>
            <span className="font-label-caps text-[8px] text-[#00eefc]">Optimal Geometry</span>
          </div>
        </div>
      </div>

      {/* SECTION 5: TFLITE SPEED-NET PERFORMANCE BENCHMARKS */}
      <div className="flex flex-col bg-[#1c1f29] rounded-xl p-3 sm:p-4 gap-2 border border-[#31353f]/50 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ffcf91] text-[18px]">memory</span>
            <span className="font-label-caps text-[10px] text-[#dfe2ef] tracking-wider uppercase">
              TFLITE SPEED-NET SPECIFICATIONS
            </span>
          </div>
          <span className="font-label-caps text-[9px] text-[#ffcf91] bg-[#31353f] px-2 py-0.5 rounded font-bold">
            SNAPDRAGON NPU DELEGATE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col bg-[#262a34] p-2.5 rounded-lg border border-[#31353f]/40">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[8px] text-[#d8c3ac] uppercase">Architecture</span>
              <span className="font-label-caps text-[8px] text-[#00eefc] font-bold">1D ResNet-CNN</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-telemetry-numeral text-lg text-[#dfe2ef] font-bold">41,200</span>
              <span className="font-label-caps text-[9px] text-[#d8c3ac]">Weights</span>
            </div>
            <span className="font-code-stream text-[9px] text-[#d8c3ac]/80 mt-0.5">
              INT8 Quantized (164 KB footprint)
            </span>
          </div>

          <div className="flex flex-col bg-[#262a34] p-2.5 rounded-lg border border-[#31353f]/40">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[8px] text-[#d8c3ac] uppercase">Inference Latency</span>
              <span className="font-label-caps text-[8px] text-[#ffcf91] font-bold">Real-time</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-telemetry-numeral text-lg text-[#ffcf91] font-bold">1.8</span>
              <span className="font-label-caps text-[9px] text-[#d8c3ac]">ms / tick</span>
            </div>
            <span className="font-code-stream text-[9px] text-[#d8c3ac]/80 mt-0.5">
              150-sample IMU temporal receptive field
            </span>
          </div>

          <div className="flex flex-col bg-[#262a34] p-2.5 rounded-lg border border-[#31353f]/40">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[8px] text-[#d8c3ac] uppercase">Speed Estimation MAE</span>
              <span className="font-label-caps text-[8px] text-[#00eefc] font-bold">Benchmarked</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-telemetry-numeral text-lg text-[#00eefc] font-bold">0.38</span>
              <span className="font-label-caps text-[9px] text-[#d8c3ac]">m/s</span>
            </div>
            <span className="font-code-stream text-[9px] text-[#d8c3ac]/80 mt-0.5">
              Evaluated across 1,200km ground-truth
            </span>
          </div>

          <div className="flex flex-col bg-[#262a34] p-2.5 rounded-lg border border-[#31353f]/40">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[8px] text-[#d8c3ac] uppercase">Zero-Velocity Detection</span>
              <span className="font-label-caps text-[8px] text-[#ffcf91] font-bold">ZUPT</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-telemetry-numeral text-lg text-[#dfe2ef] font-bold">99.8%</span>
              <span className="font-label-caps text-[9px] text-[#d8c3ac]">F1-Score</span>
            </div>
            <span className="font-code-stream text-[9px] text-[#d8c3ac]/80 mt-0.5">
              Stops drift instantly at red signals
            </span>
          </div>
        </div>
      </div>

      {/* INTERACTIVE CONTROLS / SIMULATION BENCHMARK ACTIONS */}
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={handleInjectNoise}
          className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#31353f] font-label-caps text-xs uppercase font-bold tracking-wider ${
            isNoiseInjected
              ? 'bg-[#00eefc]/30 text-[#00eefc] shadow-[0_0_15px_rgba(0,238,252,0.4)]'
              : 'bg-[#31353f] text-[#00eefc] hover:bg-[#353943] active:bg-[#00eefc]/20'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">bolt</span>
          <span>{isNoiseInjected ? 'Noise Injected!' : 'Inject IMU Noise'}</span>
        </button>

        <button
          onClick={handleResetEkf}
          className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,170,0,0.3)] font-label-caps text-xs uppercase font-bold tracking-wider ${
            isEkfReset
              ? 'bg-[#ffb952] text-[#452b00] scale-95'
              : 'bg-[#ffcf91] text-[#452b00] hover:bg-[#ffb952] active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          <span>{isEkfReset ? 'Filters Flushed!' : 'Reset EKF State'}</span>
        </button>
      </div>
    </div>
  );
};
