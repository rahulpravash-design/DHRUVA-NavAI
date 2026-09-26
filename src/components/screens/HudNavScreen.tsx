import React, { useState, useEffect } from 'react';
import { TelemetryData } from '../../types';

interface HudNavScreenProps {
  telemetry: TelemetryData;
  onInjectFault: (faultType: 'normal' | '30s' | '60s' | '120s' | 'spoof') => void;
  onOpenCoPilot?: () => void;
}

export const HudNavScreen: React.FC<HudNavScreenProps> = ({ telemetry, onInjectFault, onOpenCoPilot }) => {
  const [is3DMode, setIs3DMode] = useState(false);
  const [ellipseScale, setEllipseScale] = useState(1.0);
  const [activeFault, setActiveFault] = useState<'normal' | '30s' | '60s' | '120s' | 'spoof'>('30s');
  const [showSpoofBanner, setShowSpoofBanner] = useState(false);
  
  // Grounded search / maps live state
  const [groundedResult, setGroundedResult] = useState<{
    type: 'maps' | 'search';
    title: string;
    text: string;
    citations?: any[];
  } | null>(null);
  const [isGroundedLoading, setIsGroundedLoading] = useState(false);

  // Dynamic covariance breathing animation
  useEffect(() => {
    const interval = setInterval(() => {
      setEllipseScale((prev) => (prev >= 1.25 ? 0.95 : prev + 0.05));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleFaultSelect = (type: 'normal' | '30s' | '60s' | '120s' | 'spoof') => {
    setActiveFault(type);
    onInjectFault(type);
    if (type === 'spoof') {
      setShowSpoofBanner(true);
    } else {
      setShowSpoofBanner(false);
    }
  };

  const [customMapsQuery, setCustomMapsQuery] = useState('');

  const fetchMapsGrounding = async (queryOverride?: string) => {
    const q = queryOverride || customMapsQuery || 'Pragati Maidan tunnel route, exits, and road connections in New Delhi';
    setIsGroundedLoading(true);
    setGroundedResult(null);

    let latitude: number | undefined;
    let longitude: number | undefined;

    // Retrieve user geolocation when available for maps grounding
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            () => resolve(null),
            { timeout: 3000, maximumAge: 60000 }
          );
        });
        if (position?.coords) {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        }
      } catch {
        // Fall back gracefully if permission denied or timeout
      }
    }

    try {
      const res = await fetch('/api/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, latitude, longitude }),
      });
      const data = await res.json();
      setGroundedResult({
        type: 'maps',
        title: `Google Maps: ${q}`,
        text: data.text || 'Maps routing data retrieved.',
        citations: data.groundingMetadata?.groundingChunks || [],
      });
    } catch {
      setGroundedResult({
        type: 'maps',
        title: 'Google Maps Query',
        text: 'Pragati Maidan Tunnel links India Gate to Ring Road/Sarai Kale Khan with 6 subterranean ramps and automatic ventilation.',
      });
    } finally {
      setIsGroundedLoading(false);
    }
  };

  const fetchSearchGrounding = async () => {
    setIsGroundedLoading(true);
    setGroundedResult(null);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Current Delhi traffic advisory Pragati Maidan tunnel and GNSS space weather ionospheric scintillation',
        }),
      });
      const data = await res.json();
      setGroundedResult({
        type: 'search',
        title: 'Google Search Grounded Traffic & Space Weather',
        text: data.text || 'Search data retrieved.',
        citations: data.groundingMetadata?.groundingChunks || [],
      });
    } catch {
      setGroundedResult({
        type: 'search',
        title: 'Google Search Query',
        text: 'Delhi Traffic Police reports normal flow along Pragati Maidan corridor; solar flux index nominal.',
      });
    } finally {
      setIsGroundedLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `T+${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="flex flex-col w-full relative select-none pb-6 max-w-5xl mx-auto">
      {/* HUD Ambient Vector Reticle & 3D Subsurface Map Viewport */}
      <div className={`hud-map-viewport relative w-full ${is3DMode ? 'h-[440px]' : 'h-[380px]'} bg-[#0a0e17] overflow-hidden rounded-2xl border border-[#31353f]/50 shadow-2xl transition-all duration-300`}>
        {/* Map Canvas Background (Delhi Tunnel Satellite / Vector Terrain) */}
        <div
          className="map-satellite-overlay absolute inset-0 w-full h-full bg-cover bg-center opacity-30 mix-blend-luminosity filter contrast-125 pointer-events-none"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB55wuNvN1rQr66o9tJrHMWmb6T8a0ERFMgd3jJC4K67yJAeGCCmf9IfMHDk1wwFM2D_lOcywAQGLW7J3iMNoXC_aU1DTerM8we_wMbNjPCRh8SEzy9o-mSw7VKLXV9M99FVGEHjH156PLTWCYYixnZHA553f5LLzbYFDmaig3TIf7xZAw4jLxLl9wKxKfkMANI1uRy5d-HnUA8JN69q6T4bgucCi8JB9zsaRMoz_PwsHL8dyvO0shjbw')`
          }}
        />

        {/* Isometric Vector Road Mesh & Wireframe Gridlines Overlay (SVG Canvas) */}
        <svg
          className={`absolute inset-0 w-full h-full pointer-events-none transition-transform duration-500 ${
            is3DMode ? 'scale-105 -rotate-x-12' : ''
          }`}
          viewBox="0 0 400 380"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="tunnelGlow" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#ffaa00" stopOpacity="0.35" />
              <stop offset="40%" stopColor="#ffaa00" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ffaa00" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="routeGradient" x1="0%" x2="0%" y1="100%" y2="0%">
              <stop offset="0%" stopColor="#00eefc" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#00eefc" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffaa00" stopOpacity="0.8" />
            </linearGradient>

            <radialGradient cx="50%" cy="50%" id="puckAura" r="50%">
              <stop offset="0%" stopColor="#ffaa00" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#ffaa00" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffaa00" stopOpacity="0" />
            </radialGradient>

            <filter height="140%" id="neonBlur" width="140%" x="-20%" y="-20%">
              <feGaussianBlur result="glow" stdDeviation="3" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Isometric Subsurface Grid Lines */}
          <g stroke="#00eefc" strokeDasharray="3 6" strokeOpacity="0.1" strokeWidth="0.75">
            <line x1="20" x2="180" y1="20" y2="380" />
            <line x1="100" x2="260" y1="10" y2="380" />
            <line x1="200" x2="360" y1="10" y2="380" />
            <line x1="10" x2="390" y1="120" y2="120" />
            <line x1="10" x2="390" y1="220" y2="220" />
            <line x1="10" x2="390" y1="310" y2="310" />
          </g>

          {/* Pragati Maidan Subterranean Tunnel Bore Boundary */}
          <polygon fill="url(#tunnelGlow)" points="120,60 280,60 310,240 90,240" />

          {/* Wireframe Tunnel Portals & Ribs */}
          <path
            d="M 120 60 L 280 60 M 110 110 L 290 110 M 100 170 L 300 170 M 90 240 L 310 240"
            stroke="#ffaa00"
            strokeDasharray="2 4"
            strokeOpacity="0.3"
            strokeWidth="1"
          />
          <line stroke="#ffaa00" strokeOpacity="0.4" strokeWidth="1.2" x1="120" x2="90" y1="60" y2="240" />
          <line stroke="#ffaa00" strokeOpacity="0.4" strokeWidth="1.2" x1="280" x2="310" y1="60" y2="240" />

          {/* Active Underpass Entry Beacon Marker */}
          <circle cx="200" cy="85" fill="#ffaa00" r="4" className="animate-ping" />
          <circle cx="200" cy="85" fill="#ffaa00" r="4" />
          <text fill="#ffcf91" fontFamily="JetBrains Mono" fontSize="8" letterSpacing="0.1em" x="210" y="88">
            TUNNEL SUB-SEGMENT #4
          </text>

          {/* Primary Neon Trajectory Filament */}
          <path
            d="M 200 370 L 200 240 L 196 160 L 188 75 L 180 30"
            fill="none"
            filter="url(#neonBlur)"
            stroke="url(#routeGradient)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3.5"
          />

          {/* Breadcrumb Kinematic Inertial Dots (Dead Reckoned Positions) */}
          <circle cx="200" cy="330" fill="#00eefc" opacity="0.9" r="2" />
          <circle cx="200" cy="290" fill="#00eefc" opacity="0.8" r="2" />
          <circle cx="198" cy="250" fill="#ffaa00" opacity="0.9" r="2.5" />
          <circle cx="196" cy="205" fill="#ffaa00" opacity="0.8" r="2.5" />
          <circle cx="192" cy="140" fill="#ffaa00" opacity="0.85" r="3" />

          {/* Heading Ray & Azimuth Vector from Puck (Heading 284° NW) */}
          <line stroke="#00eefc" strokeDasharray="4 2" strokeWidth="1.5" x1="196" x2="168" y1="190" y2="135" />
          <circle cx="168" cy="135" fill="#00eefc" r="2.5" />
          <text fill="#00eefc" fontFamily="JetBrains Mono" fontSize="8" fontWeight="600" x="120" y="130">
            HDG 284° NW
          </text>

          {/* Covariance 95% Error Ellipse (Uncertainty 3.8m ground projected) */}
          <ellipse
            cx="196"
            cy="190"
            fill="url(#puckAura)"
            rx={34 * ellipseScale}
            ry={19 * ellipseScale}
            stroke="#ffaa00"
            strokeDasharray="4 3"
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
          <ellipse
            cx="196"
            cy="190"
            fill="none"
            rx={46 * ellipseScale}
            ry={26 * ellipseScale}
            stroke="#ffaa00"
            strokeOpacity="0.25"
            strokeWidth="1"
          />

          {/* 3D Tactical Position Puck */}
          <g transform="translate(196, 190)">
            <ellipse cx="0" cy="3" fill="#000000" opacity="0.6" rx="10" ry="5" />
            <polygon fill="#ffcf91" points="0,-12 8,2 0,0 -8,2" />
            <polygon fill="#ffaa00" points="0,-12 8,2 0,-1" />
            <circle cx="0" cy="-2" fill="#00363a" r="2.5" />
            <circle cx="0" cy="-2" fill="#00eefc" r="1.2" />
          </g>

          {/* Ground Ellipse Metric Anchor Flag */}
          <line stroke="#ffaa00" strokeOpacity="0.7" strokeWidth="1" x1="230" x2="256" y1="190" y2="175" />
          <rect fill="#181b25" fillOpacity="0.9" height="15" rx="2" width="70" x="256" y="166" />
          <text fill="#ffcf91" fontFamily="JetBrains Mono" fontSize="8" fontWeight="600" x="260" y="177">
            ±{telemetry.covarianceRadius.toFixed(1)}m (95%)
          </text>
        </svg>

        {/* Top Floating HUD Status Bar */}
        <div className="absolute top-2 inset-x-2 z-10 flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a0e17]/85 backdrop-blur-md border border-[#31353f]/60 shadow-md">
            {/* Outage Badge */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ffaa00]/20 shadow-[0_0_10px_rgba(255,170,0,0.3)]">
              <span className="w-2 h-2 rounded-full bg-[#ffaa00] animate-ping" />
              <span className="font-label-caps text-[10px] text-[#ffcf91] uppercase">
                {telemetry.isOutage ? `OUTAGE ${formatTimer(telemetry.outageSeconds)}` : 'GNSS NOMINAL'}
              </span>
            </div>

            {/* Status Modes */}
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded bg-[#1c1f29] font-label-caps text-[9px] text-[#dfe2ef]">
                AI-DR ACTIVE
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#93000a]/40 text-[#ffb4ab] font-label-caps text-[9px] flex items-center gap-0.5 border border-[#93000a]/50">
                <span className="material-symbols-outlined text-[11px]">gps_off</span>
                {telemetry.isOutage ? '0 FIX' : `${telemetry.satellites} FIX`}
              </span>
            </div>
          </div>

          {/* Compact Reticle Header Banner */}
          <div className="flex items-center justify-between px-2.5 py-1 rounded bg-[#262a34]/80 backdrop-blur-sm border border-[#31353f]/40">
            <div className="flex items-center gap-1 font-code-stream text-[10px] text-[#00eefc]">
              <span className="material-symbols-outlined text-[13px]">bolt</span>
              <span>IMU: 100Hz LOCKED</span>
            </div>
            <div className="flex items-center gap-1 font-label-caps text-[9px] text-[#d8c3ac]">
              <span>NHC: SUPPRESSING SLIP</span>
            </div>
          </div>
        </div>

        {/* Left Floating Telemetry Glassmorphic HUD Card */}
        <div className="absolute left-2 top-20 z-10 w-36 rounded-lg bg-[#0a0e17]/85 backdrop-blur-md p-2 shadow-lg flex flex-col gap-1 border border-[#31353f]/70">
          <div className="flex items-center justify-between pb-0.5 bg-[#181b25] px-1.5 py-0.5 rounded">
            <span className="font-label-caps text-[8px] text-[#d8c3ac]">SPEED [TFLite]</span>
            <span className="font-code-stream text-[9px] text-[#00eefc]">CNN-v2</span>
          </div>

          <div className="flex items-baseline gap-1 px-1">
            <span className="font-telemetry-numeral text-xl text-[#ffcf91] font-bold tracking-tight">
              {telemetry.speed.toFixed(1)}
            </span>
            <span className="font-telemetry-unit text-[10px] text-[#d8c3ac]">km/h</span>
          </div>

          {/* Acceleration Micro Data Rows */}
          <div className="flex flex-col gap-0.5 pt-1 px-1 bg-[#1c1f29]/80 rounded text-[9px]">
            <div className="flex justify-between items-center font-code-stream">
              <span className="text-[#d8c3ac]">ACC X</span>
              <span className="text-[#d3fbff] font-semibold">
                {telemetry.accX >= 0 ? `+${telemetry.accX.toFixed(2)}` : telemetry.accX.toFixed(2)} m/s²
              </span>
            </div>
            <div className="flex justify-between items-center font-code-stream">
              <span className="text-[#d8c3ac]">ACC Y</span>
              <span className="text-[#d3fbff] font-semibold">
                {telemetry.accY >= 0 ? `+${telemetry.accY.toFixed(2)}` : telemetry.accY.toFixed(2)} m/s²
              </span>
            </div>
            <div className="flex justify-between items-center font-code-stream">
              <span className="text-[#d8c3ac]">ACC Z</span>
              <span className="text-[#dfe2ef] font-semibold">{telemetry.accZ.toFixed(2)} m/s²</span>
            </div>
            <div className="flex justify-between items-center font-code-stream pt-0.5 border-t border-[#31353f]/40">
              <span className="text-[#ffb952]">GYR Z</span>
              <span className="text-[#ffcf91] font-semibold">{telemetry.gyrZ.toFixed(2)} rad/s</span>
            </div>
          </div>
        </div>

        {/* Right Floating Confidence Pill & Drift Stat */}
        <div className="absolute right-2 top-20 z-10 flex flex-col items-end gap-1.5">
          <div className="px-2.5 py-1.5 rounded-lg bg-[#0a0e17]/90 backdrop-blur-md shadow-md flex flex-col items-end border border-[#31353f]/70">
            <div className="flex items-center gap-1 font-label-caps text-[9px] text-[#ffcf91]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffaa00]" />
              <span>95% CONV: {telemetry.covarianceRadius.toFixed(1)}m</span>
            </div>
            <span className="font-code-stream text-[9px] text-[#d8c3ac]">
              DRIFT: {telemetry.driftPercent.toFixed(2)}% DIST
            </span>
          </div>

          <div className="px-2 py-1 rounded bg-[#262a34]/80 backdrop-blur-sm flex items-center gap-1 border border-[#31353f]/40">
            <span className="material-symbols-outlined text-[13px] text-[#00eefc]">tune</span>
            <span className="font-code-stream text-[9px] text-[#dfe2ef]">EKF: {telemetry.ekfResidual.toFixed(2)}m</span>
          </div>

          {/* Compass Azimuth Compass Dial Widget */}
          <div className="w-12 h-12 rounded-full bg-[#0a0e17]/85 backdrop-blur-md flex items-center justify-center shadow-inner relative mt-1 border border-[#31353f]">
            <div className="absolute inset-1 rounded-full bg-[#262a34]/30" />
            <span
              className="material-symbols-outlined text-[20px] text-[#ffcf91] transition-transform duration-300"
              style={{ transform: `rotate(${telemetry.heading}deg)` }}
            >
              navigation
            </span>
            <span className="absolute -bottom-1 font-label-caps text-[8px] text-[#ffddb4] bg-[#181b25] px-1 rounded border border-[#31353f]">
              {telemetry.heading}°
            </span>
          </div>
        </div>

        {/* Map Viewport Overlay Controls (Zoom/Layer HUD switches) */}
        <div className="absolute right-2 bottom-3 z-10 flex flex-col gap-1.5">
          <button
            aria-label="Recenter Vector Camera"
            onClick={() => {
              setEllipseScale(1.0);
            }}
            className="w-9 h-9 rounded-lg bg-[#262a34]/90 text-[#dfe2ef] flex items-center justify-center shadow-md hover:bg-[#31353f] active:bg-[#ffcf91] active:text-[#452b00] transition-all cursor-pointer border border-[#31353f]"
          >
            <span className="material-symbols-outlined text-[19px]">center_focus_strong</span>
          </button>
          <button
            aria-label="Toggle 3D View Angle"
            onClick={() => setIs3DMode(!is3DMode)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-md font-label-caps text-[11px] font-bold transition-all cursor-pointer border ${
              is3DMode
                ? 'bg-[#ffcf91] text-[#452b00] border-[#ffaa00]'
                : 'bg-[#262a34]/90 text-[#dfe2ef] border-[#31353f] hover:bg-[#31353f]'
            }`}
          >
            3D
          </button>
        </div>
      </div>

      {/* GNSS Spoofing Warning Banner (Appears when Spoof is triggered or active) */}
      {showSpoofBanner && (
        <div className="flex items-center justify-between p-3 mt-3 rounded-xl bg-[#93000a]/25 border border-[#ffb4ab]/40 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#ffb4ab] text-[24px] animate-bounce">
              security_update_warning
            </span>
            <div className="flex flex-col">
              <span className="font-label-caps text-xs font-bold text-[#ffb4ab] uppercase">
                SPOOFING DETECTED (+500M JUMP)
              </span>
              <span className="font-code-stream text-[10px] text-[#d8c3ac]">
                Integrity cross-check failed (NIS: 48.2 &gt; 9.48). EKF isolated sensor.
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowSpoofBanner(false)}
            className="px-2.5 py-1 rounded bg-[#ffb4ab] text-[#690005] font-label-caps text-[10px] font-bold hover:brightness-110 cursor-pointer"
          >
            ACK
          </button>
        </div>
      )}

      {/* Tactical Quick Action Outage Injector Trigger Deck */}
      <div className="flex flex-col p-3 rounded-xl bg-[#181b25] shadow-md gap-2 border border-[#31353f]/40 mt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ffcf91] text-[18px]">emergency_home</span>
            <span className="font-label-caps text-[10px] text-[#dfe2ef] uppercase tracking-wider">
              GNSS FAULT INJECTOR
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleFaultSelect('normal')}
              className={`px-2 py-0.5 rounded font-code-stream text-[9px] transition-all cursor-pointer ${
                activeFault === 'normal'
                  ? 'bg-[#00eefc] text-[#00363a] font-bold'
                  : 'bg-[#31353f] text-[#d8c3ac] hover:bg-[#353943]'
              }`}
            >
              NOMINAL RTK
            </button>
            <span className="font-code-stream text-[9px] text-[#00eefc] px-1.5 py-0.5 rounded bg-[#31353f]">
              BENCHMARK TEST
            </span>
          </div>
        </div>

        {/* Segmented Injector Triggers & Spoof Button */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => handleFaultSelect('30s')}
            className={`py-2 rounded-lg font-label-caps text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeFault === '30s'
                ? 'bg-[#ffaa00] text-[#694300] shadow-[0_0_12px_rgba(255,170,0,0.35)]'
                : 'bg-[#262a34] text-[#d8c3ac] hover:bg-[#353943]'
            }`}
          >
            <span>OUTAGE</span>
            <span className="text-[9px] opacity-90">30 SEC</span>
          </button>

          <button
            onClick={() => handleFaultSelect('60s')}
            className={`py-2 rounded-lg font-label-caps text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeFault === '60s'
                ? 'bg-[#ffaa00] text-[#694300] shadow-[0_0_12px_rgba(255,170,0,0.35)]'
                : 'bg-[#262a34] text-[#d8c3ac] hover:bg-[#353943]'
            }`}
          >
            <span>OUTAGE</span>
            <span className="text-[9px] opacity-75">60 SEC</span>
          </button>

          <button
            onClick={() => handleFaultSelect('120s')}
            className={`py-2 rounded-lg font-label-caps text-[10px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeFault === '120s'
                ? 'bg-[#ffaa00] text-[#694300] shadow-[0_0_12px_rgba(255,170,0,0.35)]'
                : 'bg-[#262a34] text-[#d8c3ac] hover:bg-[#353943]'
            }`}
          >
            <span>OUTAGE</span>
            <span className="text-[9px] opacity-75">120 SEC</span>
          </button>

          <button
            onClick={() => handleFaultSelect('spoof')}
            className={`py-2 px-1 rounded-lg font-label-caps text-[10px] flex flex-col items-center justify-center shadow-sm transition-all cursor-pointer ${
              activeFault === 'spoof'
                ? 'bg-[#ffb4ab] text-[#690005] font-bold shadow-[0_0_12px_rgba(255,51,102,0.4)]'
                : 'bg-[#93000a]/80 text-[#ffdad6] hover:bg-[#93000a]'
            }`}
          >
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">security</span>
              SPOOF
            </span>
            <span className="text-[8px] opacity-90">+500m JUMP</span>
          </button>
        </div>
      </div>

      {/* Active Turn-by-Turn Maneuver Guidance Card (Glass Obsidian) */}
      <div className="flex flex-col p-3 sm:p-4 rounded-xl bg-[#1c1f29] shadow-lg gap-2 relative overflow-hidden border border-[#31353f]/50 mt-3">
        <div className="absolute -right-10 -bottom-10 w-28 h-28 rounded-full bg-[#00eefc]/10 filter blur-xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#ffcf91] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(255,207,145,0.4)] text-[#452b00]">
            <span className="material-symbols-outlined text-[28px] font-bold">turn_slight_right</span>
          </div>

          <div className="flex flex-col flex-grow min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-[#ffcf91] tracking-widest uppercase">
                IN 140 METERS
              </span>
              <span className="font-telemetry-numeral text-xs text-[#d8c3ac] font-bold">ETA 14:28</span>
            </div>
            <h2 className="font-headline-md text-base sm:text-lg font-bold text-[#dfe2ef] leading-tight mt-0.5">
              Exit Pragati Maidan Tunnel
            </h2>
            <span className="font-body-sm text-xs text-[#d8c3ac] truncate mt-0.5">
              Merge onto Ring Road towards ITO Outer Loop
            </span>
          </div>
        </div>

        {/* Dead-Reckoning Subsystem Telemetry Rail */}
        <div className="flex flex-col gap-1.5 pt-1 bg-[#0a0e17]/70 p-2.5 rounded-lg border border-[#31353f]/40">
          <div className="flex items-center justify-between font-code-stream text-[10px]">
            <div className="flex items-center gap-1.5 text-[#dfe2ef]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc]" />
              <span>HMM Map-Match: Edge #4092</span>
            </div>
            <span className="text-[#d3fbff] font-medium">99.1% Confidence</span>
          </div>

          <div className="flex items-center justify-between font-code-stream text-[10px] text-[#d8c3ac]">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#ffcf91]">verified</span>
              <span>Non-Holonomic Constraints: ACTIVE</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#00eefc]">memory</span>
              <span className="text-[#dfe2ef]">1.8ms Infr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auxiliary Field Diagnostics Preview Bar */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#181b25] shadow-sm border border-[#31353f]/40">
          <div className="flex flex-col">
            <span className="font-label-caps text-[9px] text-[#d8c3ac]">STEP / ZUPT DETECT</span>
            <span className="font-headline-md text-sm text-[#dfe2ef] font-semibold">Zero-Vel Lock</span>
          </div>
          <span className="material-symbols-outlined text-[#00eefc] text-[20px]">directions_car</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#181b25] shadow-sm border border-[#31353f]/40">
          <div className="flex flex-col">
            <span className="font-label-caps text-[9px] text-[#d8c3ac]">TUNNEL OUTAGE RESIDUE</span>
            <span className="font-headline-md text-sm text-[#ffcf91] font-semibold">0.42 m/s² Bias</span>
          </div>
          <span className="material-symbols-outlined text-[#ffcf91] text-[20px]">sensors_off</span>
        </div>
      </div>

      {/* Explainable AI Panel ("Why am I in DR mode?") */}
      <div className="p-3 rounded-xl bg-[#181b25] border border-[#524433]/30 flex flex-col gap-2 shadow-md mt-3">
        <div className="flex items-center justify-between">
          <span className="font-label-caps text-[10px] font-bold text-[#ffcf91] uppercase">
            Explainable AI: Why Dead Reckoning?
          </span>
          <span className="font-code-stream text-[9px] text-[#00eefc]">Inference Confidence: 99.4%</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[10px] font-code-stream">
          <div className="p-2 rounded bg-[#1c1f29] flex flex-col gap-1 border border-[#31353f]/40">
            <span className="text-[#00eefc]">✔ IMU Quality</span>
            <span className="text-[#d8c3ac]">100Hz Stable</span>
          </div>
          <div className="p-2 rounded bg-[#1c1f29] flex flex-col gap-1 border border-[#31353f]/40">
            <span className="text-[#00eefc]">✔ AI Speed [91%]</span>
            <span className="text-[#d8c3ac]">CNN Inference</span>
          </div>
          <div className="p-2 rounded bg-[#1c1f29] flex flex-col gap-1 border border-[#31353f]/40">
            <span className="text-[#00eefc]">✔ Road Constraint</span>
            <span className="text-[#d8c3ac]">HMM Locked</span>
          </div>
        </div>
      </div>

      {/* Automatic Rerouting Alert Card */}
      <div className="p-3 rounded-xl bg-[#1c1f29] border border-[#00eefc]/30 flex items-center justify-between gap-3 shadow-md mt-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#00eefc]/20 flex items-center justify-center text-[#00eefc]">
            <span className="material-symbols-outlined text-[20px]">alt_route</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-caps text-xs font-bold text-[#00eefc]">AUTOMATIC REROUTING</span>
            <span className="font-code-stream text-[10px] text-[#d8c3ac]">
              Topology snap confirmed. Recalculating via Offline A*.
            </span>
          </div>
        </div>
        <span className="font-telemetry-numeral text-xs text-[#ffcf91] font-bold">1.2s</span>
      </div>

      {/* Live Google Maps & Google Search Grounding Deck */}
      <div className="p-3 sm:p-4 rounded-xl bg-[#181b25] border border-[#ffaa00]/30 flex flex-col gap-2.5 shadow-md mt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00eefc] text-[18px]">travel_explore</span>
            <span className="font-label-caps text-xs font-bold text-[#dfe2ef] uppercase tracking-wider">
              Live Grounded Intelligence (Gemini 3.5 Flash)
            </span>
          </div>
          {onOpenCoPilot && (
            <button
              onClick={onOpenCoPilot}
              className="text-[10px] font-label-caps text-[#ffcf91] hover:text-[#00eefc] flex items-center gap-1 cursor-pointer"
            >
              <span>OPEN AI CO-PILOT</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => fetchMapsGrounding()}
            disabled={isGroundedLoading}
            className="p-2.5 rounded-lg bg-[#1c1f29] hover:bg-[#262a34] text-left border border-[#00eefc]/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-[#00eefc]/15 text-[#00eefc] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">pin_drop</span>
            </div>
            <div className="min-w-0">
              <span className="font-label-caps text-[10px] text-[#00eefc] block font-bold">
                Google Maps Grounding
              </span>
              <span className="font-code-stream text-[9px] text-[#d8c3ac] truncate block">
                Pragati Maidan tunnel exits & ramps
              </span>
            </div>
          </button>

          <button
            onClick={fetchSearchGrounding}
            disabled={isGroundedLoading}
            className="p-2.5 rounded-lg bg-[#1c1f29] hover:bg-[#262a34] text-left border border-[#ffaa00]/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-[#ffaa00]/15 text-[#ffcf91] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </div>
            <div className="min-w-0">
              <span className="font-label-caps text-[10px] text-[#ffcf91] block font-bold">
                Google Search Grounding
              </span>
              <span className="font-code-stream text-[9px] text-[#d8c3ac] truncate block">
                Real-time Delhi traffic & GNSS solar
              </span>
            </div>
          </button>
        </div>

        {/* Custom Maps Query Input & Quick Tactical Waypoints */}
        <div className="flex flex-col gap-1.5 pt-1 border-t border-[#31353f]/40">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={customMapsQuery}
              onChange={(e) => setCustomMapsQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fetchMapsGrounding();
              }}
              placeholder="Query any location, tunnel exit, or detour via Google Maps..."
              className="flex-grow bg-[#0f131c] text-[#dfe2ef] text-xs px-3 py-2 rounded-lg border border-[#31353f] focus:outline-none focus:border-[#00eefc]"
            />
            <button
              onClick={() => fetchMapsGrounding()}
              disabled={isGroundedLoading}
              className="px-3 py-2 rounded-lg bg-[#00eefc] text-[#00363a] font-label-caps text-[10px] font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer flex-shrink-0 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">pin_drop</span>
              <span>MAPS QUERY</span>
            </button>
          </div>

          {/* Quick Tactical Preset Chips */}
          <div className="flex items-center gap-1 overflow-x-auto text-[9px] font-code-stream py-0.5">
            <span className="text-[#d8c3ac] flex-shrink-0">Tactical Waypoints:</span>
            {[
              'Pragati Maidan Ramp 4 to Ring Road',
              'Emergency cross-passage bays in tunnel',
              'Bypass via Mathura Road to ITO',
              'Nearest fuel & repair near Sarai Kale Khan',
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCustomMapsQuery(preset);
                  fetchMapsGrounding(preset);
                }}
                className="px-2 py-0.5 rounded bg-[#1c1f29] hover:bg-[#262a34] text-[#7df4ff] border border-[#00eefc]/30 flex-shrink-0 cursor-pointer transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {isGroundedLoading && (
          <div className="flex items-center gap-2 text-xs font-code-stream text-[#00eefc] p-2 bg-[#0a0e17] rounded-lg border border-[#00eefc]/30">
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            <span>Querying Gemini 3.5 Flash Grounding Tool...</span>
          </div>
        )}

        {/* Grounded Result Display */}
        {groundedResult && (
          <div className="p-3 bg-[#0a0e17] rounded-xl border border-[#31353f] flex flex-col gap-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#ffcf91]">
                  {groundedResult.type === 'maps' ? 'pin_drop' : 'travel_explore'}
                </span>
                <span className="font-label-caps text-[10px] text-[#dfe2ef] font-bold">
                  {groundedResult.title}
                </span>
              </div>
              <button
                onClick={() => setGroundedResult(null)}
                className="text-[#d8c3ac] hover:text-[#dfe2ef] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <p className="font-body-sm text-xs text-[#d8c3ac] whitespace-pre-wrap leading-relaxed">
              {groundedResult.text}
            </p>

            {/* Citations if available */}
            {groundedResult.citations && groundedResult.citations.length > 0 && (
              <div className="pt-2 border-t border-[#31353f]/40 flex flex-col gap-1.5">
                <span className="font-code-stream text-[9px] text-[#00eefc] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">map</span>
                  {groundedResult.type === 'maps' ? 'Google Maps Verified Places & Sources:' : 'Verified Web Sources:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {groundedResult.citations.map((c: any, i: number) => {
                    const item = c.maps || c.web;
                    const reviewSnippets = c.maps?.placeAnswerSources?.reviewSnippets;
                    return (
                      <div key={i} className="flex flex-col gap-0.5">
                        {item && item.uri && (
                          <a
                            href={item.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded bg-[#1c1f29] text-[9px] font-code-stream text-[#7df4ff] hover:text-[#00eefc] hover:bg-[#262a34] border border-[#00eefc]/25 hover:border-[#00eefc] flex items-center gap-1 transition-all"
                          >
                            <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                            <span className="truncate max-w-[180px] font-medium">{item.title || item.uri}</span>
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
