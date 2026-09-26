import React, { useState, useEffect } from 'react';

interface MountCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MountCalibrationModal: React.FC<MountCalibrationModalProps> = ({ isOpen, onClose }) => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pitch, setPitch] = useState(18.4);
  const [roll, setRoll] = useState(-2.1);
  const [pcaScore, setPcaScore] = useState(14.82);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCalibrating) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsCalibrating(false);
            setPitch(18.2);
            setRoll(-1.9);
            setPcaScore(15.14);
            return 100;
          }
          return prev + 5;
        });
      }, 150);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isCalibrating]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#0f131c]/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="flex flex-col bg-[#1c1f29] border border-[#524433] rounded-2xl p-4 sm:p-6 w-full max-w-lg shadow-[0_0_30px_rgba(255,170,0,0.25)] gap-4 relative overflow-hidden">
        {/* Modal Glow Accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#ffaa00]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffcf91] text-[22px]">view_in_ar</span>
            <span className="font-headline-md text-base sm:text-lg text-[#dfe2ef] font-bold uppercase tracking-tight">
              Mount & Cupholder Calibration
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#262a34] flex items-center justify-center text-[#d8c3ac] hover:text-[#ffcf91] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* 3D Tilt Vector Visualization Box */}
        <div className="flex flex-col bg-[#0a0e17] rounded-xl p-3 gap-2 border border-[#31353f]/60">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[10px] text-[#00eefc] uppercase">
              3D TILT VECTOR VISUALIZATION
            </span>
            <span
              className={`font-label-caps text-[9px] px-2 py-0.5 rounded font-bold ${
                isCalibrating
                  ? 'bg-[#ffaa00]/20 text-[#ffaa00] animate-pulse'
                  : 'bg-[#ffcf91]/15 text-[#ffcf91]'
              }`}
            >
              {isCalibrating ? `SWEEPING... ${progress}%` : 'ACTIVE SWEEP'}
            </span>
          </div>

          <div className="h-36 flex items-center justify-center relative bg-[#181b25]/70 rounded-lg overflow-hidden border border-[#31353f]/40">
            {/* Background Reticle Grid */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-full h-px bg-[#00eefc]" />
              <div className="h-full w-px bg-[#00eefc] absolute" />
            </div>

            <svg className="w-28 h-28" viewBox="0 0 100 100">
              {/* Outer compass reference circle */}
              <circle cx="50" cy="50" fill="none" r="40" stroke="#31353f" strokeWidth="1.5" />
              <circle cx="50" cy="50" fill="none" r="28" stroke="#31353f" strokeDasharray="3 3" strokeWidth="1" />

              {/* Forward Travel Axis Indicator */}
              <line
                stroke="#ffaa00"
                strokeLinecap="round"
                strokeWidth="2.5"
                x1="50"
                x2="50"
                y1="50"
                y2="14"
              />
              <polygon fill="#ffaa00" points="50,10 46,18 54,18" />

              {/* Rotated Smartphone Body wireframe */}
              <g transform={`rotate(${pitch * 0.8} 50 50)`}>
                <rect
                  fill="#1c1f29"
                  height="52"
                  rx="6"
                  stroke="#00eefc"
                  strokeWidth="1.8"
                  transform={`skewX(${roll})`}
                  width="32"
                  x="34"
                  y="24"
                />
                {/* Phone screen center beacon */}
                <circle cx="50" cy="50" fill="#00eefc" r="3" className="animate-pulse" />
                <line
                  stroke="#00eefc"
                  strokeDasharray="2 2"
                  strokeWidth="1.5"
                  x1="50"
                  x2="50"
                  y1="50"
                  y2="28"
                />
              </g>
            </svg>

            <div className="absolute bottom-2 right-2 bg-[#0a0e17]/80 px-2 py-0.5 rounded border border-[#31353f] font-telemetry-numeral text-[11px] text-[#00eefc]">
              Pitch: {pitch > 0 ? `+${pitch.toFixed(1)}°` : `${pitch.toFixed(1)}°`} | Roll: {roll > 0 ? `+${roll.toFixed(1)}°` : `${roll.toFixed(1)}°`}
            </div>
          </div>
        </div>

        {/* Mount Classification & PCA Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col bg-[#262a34] p-3 rounded-lg border border-[#31353f]">
            <span className="font-label-caps text-[9px] text-[#d8c3ac] uppercase">Mount Classification</span>
            <span className="font-headline-md text-sm text-[#ffcf91] font-bold mt-1">
              RIGID DASH MOUNT
            </span>
            <span className="font-code-stream text-[10px] text-[#00eefc] mt-1">
              High-frequency jitter: LOW
            </span>
          </div>

          <div className="flex flex-col bg-[#262a34] p-3 rounded-lg border border-[#31353f]">
            <span className="font-label-caps text-[9px] text-[#d8c3ac] uppercase">PCA Eigenvalue Score</span>
            <span className="font-telemetry-numeral text-base text-[#dfe2ef] font-bold mt-1">
              {pcaScore.toFixed(2)} λ₁/λ₂
            </span>
            <span className="font-code-stream text-[10px] text-[#ffcf91] mt-1">
              Rigidity Conf: 99.1%
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            if (!isCalibrating) {
              setIsCalibrating(true);
            }
          }}
          disabled={isCalibrating}
          className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-label-caps font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(255,170,0,0.3)] ${
            isCalibrating
              ? 'bg-[#ffaa00]/60 text-[#452b00] cursor-not-allowed'
              : 'bg-[#ffaa00] hover:bg-[#ffb952] text-[#452b00] active:scale-[0.99]'
          }`}
        >
          <span className={`material-symbols-outlined text-[18px] ${isCalibrating ? 'animate-spin' : ''}`}>
            {isCalibrating ? 'refresh' : 'radar'}
          </span>
          {isCalibrating ? `Calibrating Dynamic Kinematics (${progress}%)` : 'Run 10s Calibration Sweep'}
        </button>
      </div>
    </div>
  );
};
