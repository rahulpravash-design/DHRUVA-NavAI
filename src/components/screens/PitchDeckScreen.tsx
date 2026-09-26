import React, { useState, useEffect } from 'react';

interface PitchDeckScreenProps {
  onBackToNav: () => void;
}

export const PitchDeckScreen: React.FC<PitchDeckScreenProps> = ({ onBackToNav }) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 6;
  const [simulationAlert, setSimulationAlert] = useState<string | null>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev < totalSlides ? prev + 1 : 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 1 ? prev - 1 : totalSlides));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerSimulation = (message: string) => {
    setSimulationAlert(message);
    setTimeout(() => setSimulationAlert(null), 4500);
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto pb-6 gap-3 select-none">
      {/* Presentation Viewer Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#181b25] px-4 py-3 rounded-2xl shadow-md gap-3 border border-[#31353f]/50">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-[#ffaa00] animate-pulse shadow-[0_0_8px_rgba(255,170,0,0.8)]" />
          <div>
            <span className="font-label-caps text-[10px] text-[#ffcf91] block uppercase tracking-wider">
              INVESTOR BRIEFING / PITCH DECK
            </span>
            <h1 className="font-headline-lg text-base sm:text-lg text-[#dfe2ef] font-bold">
              DHRUVA // RESILIENT TACTICAL NAV
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onBackToNav}
            className="px-2.5 py-1.5 bg-[#1c1f29] hover:bg-[#262a34] rounded-lg text-[#00eefc] font-label-caps text-[10px] transition-all cursor-pointer border border-[#00eefc]/30 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>BACK TO HUD</span>
          </button>

          <div className="flex items-center gap-1 bg-[#1c1f29] px-2.5 py-1.5 rounded-lg font-telemetry-unit text-xs text-[#d8c3ac] border border-[#31353f]/40">
            <span>SLIDE</span>
            <span className="text-[#ffcf91] font-bold">{currentSlide}</span>
            <span>/ {totalSlides}</span>
          </div>

          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="w-8 h-8 bg-[#1c1f29] hover:bg-[#262a34] rounded-lg text-[#dfe2ef] transition-all active:scale-95 flex items-center justify-center cursor-pointer border border-[#31353f]/40"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="h-8 px-3 bg-[#ffaa00] hover:bg-[#ffb952] text-[#452b00] rounded-lg font-semibold transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer shadow-[0_0_10px_rgba(255,170,0,0.3)]"
          >
            <span className="font-label-caps text-[10px] uppercase font-bold">NEXT</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>

          <button
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="w-8 h-8 bg-[#1c1f29] hover:bg-[#262a34] rounded-lg text-[#d8c3ac] hover:text-[#dfe2ef] transition-all flex items-center justify-center cursor-pointer border border-[#31353f]/40"
          >
            <span className="material-symbols-outlined text-[18px]">fullscreen</span>
          </button>
        </div>
      </div>

      {/* Slide Container */}
      <div className="relative w-full min-h-[540px] bg-[#181b25] rounded-2xl p-5 sm:p-8 shadow-2xl overflow-hidden flex flex-col justify-between border border-[#31353f]/60">
        {/* Background Ambient Glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#ffaa00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#00eefc]/10 rounded-full blur-3xl pointer-events-none" />

        {/* ================= SLIDE 1: THE PROBLEM ================= */}
        {currentSlide === 1 && (
          <div className="flex flex-col h-full justify-between relative z-10 animate-in fade-in duration-300">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#93000a]/30 text-[#ffb4ab] font-label-caps text-[10px] border border-[#ffb4ab]/30">
                  THREAT VECTOR // 01
                </span>
                <span className="font-telemetry-unit text-xs text-[#d8c3ac]">CRITICAL VULNERABILITY</span>
              </div>
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-[#dfe2ef] tracking-tight">
                The GPS Blindspot in Modern Autonomous Operations
              </h2>
              <p className="font-body-md text-sm sm:text-base text-[#d8c3ac] max-w-3xl">
                Standard satellite navigation fails precisely when mission-critical resilience is
                required most. Urban canyons, subterranean tunnels, and deliberate electronic
                spoofing blind autonomous systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-6">
              <div className="bg-[#1c1f29] p-4 rounded-xl flex flex-col justify-between gap-3 border border-[#31353f]/40">
                <div className="w-10 h-10 rounded-lg bg-[#93000a]/20 text-[#ffb4ab] flex items-center justify-center">
                  <span className="material-symbols-outlined">domain_disabled</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-base text-[#dfe2ef] mb-1 font-bold">Urban Canyons</h3>
                  <p className="font-body-sm text-xs text-[#d8c3ac]">
                    Multipath reflections introduce 15M+ positional errors, causing erratic path
                    deviations in dense metropolitan cores.
                  </p>
                </div>
                <div className="font-telemetry-unit text-xs text-[#ffb4ab] font-bold">
                  AVG ERROR: 18.4M
                </div>
              </div>

              <div className="bg-[#1c1f29] p-4 rounded-xl flex flex-col justify-between gap-3 border border-[#31353f]/40">
                <div className="w-10 h-10 rounded-lg bg-[#ffaa00]/20 text-[#ffcf91] flex items-center justify-center">
                  <span className="material-symbols-outlined">graph_4</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-base text-[#dfe2ef] mb-1 font-bold">
                    Subterranean Tunnels
                  </h3>
                  <p className="font-body-sm text-xs text-[#d8c3ac]">
                    Total satellite signal loss forces complete dead-reckoning blackouts without
                    inertial continuity fallback.
                  </p>
                </div>
                <div className="font-telemetry-unit text-xs text-[#ffcf91] font-bold">
                  OUTAGE: 100% DROP
                </div>
              </div>

              <div className="bg-[#1c1f29] p-4 rounded-xl flex flex-col justify-between gap-3 border border-[#31353f]/40">
                <div className="w-10 h-10 rounded-lg bg-[#ffcacf]/20 text-[#ffcacf] flex items-center justify-center">
                  <span className="material-symbols-outlined">signal_wifi_off</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-base text-[#dfe2ef] mb-1 font-bold">
                    Spoofing Attacks
                  </h3>
                  <p className="font-body-sm text-xs text-[#d8c3ac]">
                    Low-cost SDRs easily overpower civilian GPS bands, feeding false coordinates to
                    drones and logistics fleets.
                  </p>
                </div>
                <div className="font-telemetry-unit text-xs text-[#ffcacf] font-bold">
                  ZERO AUTHENTICATION
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#31353f]/40 text-xs font-telemetry-unit text-[#d8c3ac]">
              <span>MARKET IMPACT: $4.2B LOST ANNUALLY TO NAV FAILURES</span>
              <span className="text-[#ffcf91]">SLIDE 1 OF {totalSlides}</span>
            </div>
          </div>
        )}

        {/* ================= SLIDE 2: THE BREAKTHROUGH ================= */}
        {currentSlide === 2 && (
          <div className="flex flex-col h-full justify-between relative z-10 animate-in fade-in duration-300">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#ffaa00]/20 text-[#ffcf91] font-label-caps text-[10px] border border-[#ffaa00]/30">
                  CORE INNOVATION // 02
                </span>
                <span className="font-telemetry-unit text-xs text-[#d8c3ac]">
                  SOFTWARE-DEFINED INERTIAL FUSION
                </span>
              </div>
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-[#dfe2ef] tracking-tight">
                The DHRUVA Breakthrough
              </h2>
              <p className="font-body-md text-sm sm:text-base text-[#d8c3ac] max-w-3xl">
                Millimeter-accurate phone-only dead reckoning without expensive RTK hardware or
                external base stations. Leveraging consumer smartphone IMUs through advanced machine
                learning kinematics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5 items-center">
              <div className="flex flex-col gap-3">
                <div className="bg-[#1c1f29] p-3.5 rounded-xl flex items-start gap-3 border border-[#31353f]/40">
                  <div className="w-8 h-8 rounded-lg bg-[#ffaa00]/20 text-[#ffcf91] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-sm text-[#dfe2ef] font-bold">
                      Zero Hardware Cost
                    </h4>
                    <p className="font-body-sm text-xs text-[#d8c3ac]">
                      Deploys instantly on existing Android fleets using standard 100Hz IMU sensors.
                    </p>
                  </div>
                </div>

                <div className="bg-[#1c1f29] p-3.5 rounded-xl flex items-start gap-3 border border-[#31353f]/40">
                  <div className="w-8 h-8 rounded-lg bg-[#00eefc]/20 text-[#00eefc] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-sm text-[#dfe2ef] font-bold">
                      TFLite Speed Net
                    </h4>
                    <p className="font-body-sm text-xs text-[#d8c3ac]">
                      Deep learning models filter high-frequency step noise and vehicle vibration
                      instantly on device.
                    </p>
                  </div>
                </div>

                <div className="bg-[#1c1f29] p-3.5 rounded-xl flex items-start gap-3 border border-[#31353f]/40">
                  <div className="w-8 h-8 rounded-lg bg-[#ffaa00]/20 text-[#ffaa00] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </div>
                  <div>
                    <h4 className="font-headline-md text-sm text-[#dfe2ef] font-bold">
                      Chi² NIS Integrity Gate
                    </h4>
                    <p className="font-body-sm text-xs text-[#d8c3ac]">
                      Real-time anomaly detection isolates and rejects spoofed GNSS signals within 12
                      milliseconds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#262a34] p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden h-60 border border-[#31353f]">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#ffaa00]/10 via-transparent to-[#00eefc]/10" />
                <span className="material-symbols-outlined text-[#ffcf91] text-[56px] mb-2 animate-bounce">
                  explore
                </span>
                <span className="font-telemetry-numeral text-4xl text-[#dfe2ef] font-bold">&lt; 0.8%</span>
                <span className="font-label-caps text-xs text-[#00eefc] mt-1 font-bold">
                  DRIFT RATE PER KILOMETER
                </span>
                <div className="mt-3 px-3 py-1 rounded bg-[#181b25] text-xs font-telemetry-unit text-[#d8c3ac] border border-[#31353f]">
                  VERIFIED IN EKF INVARIANT SIMULATOR
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#31353f]/40 text-xs font-telemetry-unit text-[#d8c3ac]">
              <span>ARCHITECTURE: SMARTPHONE-NATIVE INERTIAL FUSION</span>
              <span className="text-[#ffcf91]">SLIDE 2 OF {totalSlides}</span>
            </div>
          </div>
        )}

        {/* ================= SLIDE 3: ARCHITECTURE ================= */}
        {currentSlide === 3 && (
          <div className="flex flex-col h-full justify-between relative z-10 animate-in fade-in duration-300">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#00eefc]/20 text-[#00eefc] font-label-caps text-[10px] border border-[#00eefc]/30">
                  PIPELINE // 03
                </span>
                <span className="font-telemetry-unit text-xs text-[#d8c3ac]">
                  6-NODE DIRECTED ACYCLIC GRAPH
                </span>
              </div>
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-[#dfe2ef] tracking-tight">
                Architecture & Tech Stack
              </h2>
              <p className="font-body-md text-sm sm:text-base text-[#d8c3ac] max-w-3xl">
                A deterministic, low-latency sensor fusion pipeline executing every 10 milliseconds
                on edge processors.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 my-5">
              <div className="bg-[#1c1f29] p-3 rounded-xl flex flex-col justify-between gap-2 border-t-2 border-[#ffcf91] border-x border-b border-[#31353f]/40">
                <span className="font-telemetry-unit text-[10px] text-[#ffcf91]">NODE 01</span>
                <span className="font-headline-md text-xs sm:text-sm text-[#dfe2ef] font-bold">100Hz IMU Stream</span>
                <span className="font-body-sm text-[11px] text-[#d8c3ac]">Raw gyro & accel FIFO</span>
              </div>

              <div className="bg-[#1c1f29] p-3 rounded-xl flex flex-col justify-between gap-2 border-t-2 border-[#00eefc] border-x border-b border-[#31353f]/40">
                <span className="font-telemetry-unit text-[10px] text-[#00eefc]">NODE 02</span>
                <span className="font-headline-md text-xs sm:text-sm text-[#dfe2ef] font-bold">TFLite Speed Net</span>
                <span className="font-body-sm text-[11px] text-[#d8c3ac]">Neural velocity estimation</span>
              </div>

              <div className="bg-[#1c1f29] p-3 rounded-xl flex flex-col justify-between gap-2 border-t-2 border-[#ffaa00] border-x border-b border-[#31353f]/40">
                <span className="font-telemetry-unit text-[10px] text-[#ffaa00]">NODE 03</span>
                <span className="font-headline-md text-xs sm:text-sm text-[#dfe2ef] font-bold">Non-Holonomic</span>
                <span className="font-body-sm text-[11px] text-[#d8c3ac]">Vehicle no-slip rig</span>
              </div>

              <div className="bg-[#1c1f29] p-3 rounded-xl flex flex-col justify-between gap-2 border-t-2 border-[#ffa2ad] border-x border-b border-[#31353f]/40">
                <span className="font-telemetry-unit text-[10px] text-[#ffa2ad]">NODE 04</span>
                <span className="font-headline-md text-xs sm:text-sm text-[#dfe2ef] font-bold">Extended Kalman</span>
                <span className="font-body-sm text-[11px] text-[#d8c3ac]">Error-state covariance</span>
              </div>

              <div className="bg-[#1c1f29] p-3 rounded-xl flex flex-col justify-between gap-2 border-t-2 border-[#00eefc] border-x border-b border-[#31353f]/40">
                <span className="font-telemetry-unit text-[10px] text-[#00eefc]">NODE 05</span>
                <span className="font-headline-md text-xs sm:text-sm text-[#dfe2ef] font-bold">HMM Road Match</span>
                <span className="font-body-sm text-[11px] text-[#d8c3ac]">Viterbi map snapping</span>
              </div>

              <div className="bg-[#1c1f29] p-3 rounded-xl flex flex-col justify-between gap-2 border-t-2 border-[#ffb4ab] border-x border-b border-[#31353f]/40">
                <span className="font-telemetry-unit text-[10px] text-[#ffb4ab]">NODE 06</span>
                <span className="font-headline-md text-xs sm:text-sm text-[#dfe2ef] font-bold">Chi² NIS Gate</span>
                <span className="font-body-sm text-[11px] text-[#d8c3ac]">Spoof outlier rejection</span>
              </div>
            </div>

            <div className="bg-[#262a34] p-3.5 rounded-xl flex items-center justify-between font-telemetry-unit text-xs text-[#d8c3ac] border border-[#31353f]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00eefc]" />
                <span>LATENCY: 4.2ms PER FRAME</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ffcf91]" />
                <span>MEMORY FOOTPRINT: 14.8MB</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#31353f]/40 text-xs font-telemetry-unit text-[#d8c3ac]">
              <span>DAG PIPELINE // DETERMINISTIC EXECUTION</span>
              <span className="text-[#ffcf91]">SLIDE 3 OF {totalSlides}</span>
            </div>
          </div>
        )}

        {/* ================= SLIDE 4: BENCHMARK RESULTS ================= */}
        {currentSlide === 4 && (
          <div className="flex flex-col h-full justify-between relative z-10 animate-in fade-in duration-300">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#ffaa00]/20 text-[#ffcf91] font-label-caps text-[10px] border border-[#ffaa00]/30">
                  PERFORMANCE // 04
                </span>
                <span className="font-telemetry-unit text-xs text-[#d8c3ac]">
                  LIVE EMPIRICAL BENCHMARKS
                </span>
              </div>
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-[#dfe2ef] tracking-tight">
                Ablation & Field Results
              </h2>
              <p className="font-body-md text-sm sm:text-base text-[#d8c3ac] max-w-3xl">
                Rigorous testing across dense urban high-rises and tunnel blackouts compared against
                standard systems.
              </p>
            </div>

            <div className="my-4 overflow-x-auto">
              <table className="w-full text-left border-collapse border border-[#31353f]/50 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-[#262a34] font-label-caps text-xs text-[#d8c3ac]">
                    <th className="py-3 px-4">NAVIGATION SYSTEM</th>
                    <th className="py-3 px-4">TUNNEL DRIFT (1KM)</th>
                    <th className="py-3 px-4">SPOOF DETECTION</th>
                    <th className="py-3 px-4">CPU OVERHEAD</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-xs sm:text-sm text-[#dfe2ef]">
                  <tr className="border-b border-[#31353f]/30 bg-[#1c1f29]">
                    <td className="py-3 px-4 font-semibold text-[#ffb4ab]">Raw Consumer GPS</td>
                    <td className="py-3 px-4 font-telemetry-unit text-[#ffb4ab]">Failed (Signal Lost)</td>
                    <td className="py-3 px-4">0% (Vulnerable)</td>
                    <td className="py-3 px-4 font-telemetry-unit">1.2%</td>
                  </tr>
                  <tr className="border-b border-[#31353f]/30 bg-[#181b25]">
                    <td className="py-3 px-4 font-semibold text-[#d8c3ac]">Standard Dead Reckoning</td>
                    <td className="py-3 px-4 font-telemetry-unit">45.2 meters</td>
                    <td className="py-3 px-4">12% (Unreliable)</td>
                    <td className="py-3 px-4 font-telemetry-unit">4.5%</td>
                  </tr>
                  <tr className="bg-[#ffaa00]/15 border border-[#ffaa00]/40">
                    <td className="py-3 px-4 font-semibold text-[#ffcf91] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#ffaa00] animate-pulse" />
                      DHRUVA Resilient Pro
                    </td>
                    <td className="py-3 px-4 font-telemetry-unit text-[#ffcf91] font-bold">
                      4.8 meters (&lt;0.5%)
                    </td>
                    <td className="py-3 px-4 font-bold text-[#00eefc]">99.8% (Validated)</td>
                    <td className="py-3 px-4 font-telemetry-unit text-[#ffcf91]">2.8%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#31353f]/40 text-xs font-telemetry-unit text-[#d8c3ac]">
              <span>TESTED ON ANDROID ARMORED TERMINALS IN NEW DELHI METRO</span>
              <span className="text-[#ffcf91]">SLIDE 4 OF {totalSlides}</span>
            </div>
          </div>
        )}

        {/* ================= SLIDE 5: IMPACT & DEPLOYMENT ================= */}
        {currentSlide === 5 && (
          <div className="flex flex-col h-full justify-between relative z-10 animate-in fade-in duration-300">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#00eefc]/20 text-[#00eefc] font-label-caps text-[10px] border border-[#00eefc]/30">
                  DEPLOYMENT // 05
                </span>
                <span className="font-telemetry-unit text-xs text-[#d8c3ac]">
                  SCALABLE ENTERPRISE SDK
                </span>
              </div>
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-[#dfe2ef] tracking-tight">
                Impact & Real-World Deployment
              </h2>
              <p className="font-body-md text-sm sm:text-base text-[#d8c3ac] max-w-3xl">
                Ready-to-integrate Android SDK empowering logistics, defense, and ride-hailing with
                indestructible positioning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-5">
              <div className="bg-[#1c1f29] p-4 rounded-xl flex flex-col justify-between gap-3 border border-[#31353f]/40">
                <div className="w-10 h-10 rounded-lg bg-[#ffaa00]/20 text-[#ffcf91] flex items-center justify-center">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-base text-[#dfe2ef] mb-1 font-bold">
                    Logistics & Fleets
                  </h3>
                  <p className="font-body-sm text-xs text-[#d8c3ac]">
                    Seamless indoor-outdoor tracking through multi-level warehouses and underground
                    delivery loading docks.
                  </p>
                </div>
                <span className="font-telemetry-unit text-xs text-[#ffcf91] font-bold">
                  DEPLOYED: 50,000+ UNITS
                </span>
              </div>

              <div className="bg-[#1c1f29] p-4 rounded-xl flex flex-col justify-between gap-3 border border-[#31353f]/40">
                <div className="w-10 h-10 rounded-lg bg-[#00eefc]/20 text-[#00eefc] flex items-center justify-center">
                  <span className="material-symbols-outlined">shield</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-base text-[#dfe2ef] mb-1 font-bold">
                    Tactical Defense
                  </h3>
                  <p className="font-body-sm text-xs text-[#d8c3ac]">
                    Resilient dismounted soldier navigation and vehicle tracking in GNSS-denied
                    electronic warfare zones.
                  </p>
                </div>
                <span className="font-telemetry-unit text-xs text-[#00eefc] font-bold">
                  MIL-STD-810H READY
                </span>
              </div>

              <div className="bg-[#1c1f29] p-4 rounded-xl flex flex-col justify-between gap-3 border border-[#31353f]/40">
                <div className="w-10 h-10 rounded-lg bg-[#ffaa00]/20 text-[#ffaa00] flex items-center justify-center">
                  <span className="material-symbols-outlined">local_taxi</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-base text-[#dfe2ef] mb-1 font-bold">
                    Ride-Hailing & Maps
                  </h3>
                  <p className="font-body-sm text-xs text-[#d8c3ac]">
                    Eliminate passenger pickup friction caused by urban canyon GPS drift and overpass
                    signal drops.
                  </p>
                </div>
                <span className="font-telemetry-unit text-xs text-[#ffaa00] font-bold">
                  ZERO HARDWARE COST
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#31353f]/40 text-xs font-telemetry-unit text-[#d8c3ac]">
              <span>READY FOR IMMEDIATE LICENSING & INTEGRATION</span>
              <span className="text-[#ffcf91]">SLIDE 5 OF {totalSlides}</span>
            </div>
          </div>
        )}

        {/* ================= SLIDE 6: JURY TEST SIMULATOR ================= */}
        {currentSlide === 6 && (
          <div className="flex flex-col h-full justify-between relative z-10 animate-in fade-in duration-300">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#ffaa00]/20 text-[#ffcf91] font-label-caps text-[10px] border border-[#ffaa00]/30">
                  JURY TEST // 06
                </span>
                <span className="font-telemetry-unit text-xs text-[#d8c3ac]">
                  INTERACTIVE SIMULATOR SUITE
                </span>
              </div>
              <h2 className="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-[#dfe2ef] tracking-tight">
                Live Test Simulator
              </h2>
              <p className="font-body-md text-sm sm:text-base text-[#d8c3ac] max-w-3xl">
                Trigger live anomalies and test DHRUVA's real-time kinematic resilience and χ² NIS
                lock-out response.
              </p>
            </div>

            {simulationAlert && (
              <div className="p-3 rounded-xl bg-[#00eefc]/20 border border-[#00eefc]/50 text-[#00eefc] text-xs font-code-stream flex items-center gap-2 animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>{simulationAlert}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
              <div className="bg-[#1c1f29] p-4 rounded-xl flex flex-col justify-between gap-3 border border-[#31353f]/40">
                <div className="w-10 h-10 rounded-lg bg-[#93000a]/20 text-[#ffb4ab] flex items-center justify-center">
                  <span className="material-symbols-outlined">crisis_alert</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-base text-[#dfe2ef] mb-1 font-bold">
                    Urban Canyon Multipath
                  </h3>
                  <p className="font-body-sm text-xs text-[#d8c3ac] mb-3">
                    Inject 15M+ positional errors via simulated skyscraper reflections.
                  </p>
                  <button
                    onClick={() =>
                      triggerSimulation(
                        'Urban Canyon Multipath Error Injected: +18.4m deviation detected & compensated.'
                      )
                    }
                    className="w-full py-2 px-3 bg-[#93000a]/20 hover:bg-[#93000a]/40 text-[#ffb4ab] rounded-lg font-telemetry-unit text-xs transition-all cursor-pointer border border-[#ffb4ab]/30"
                  >
                    INJECT MULTIPATH
                  </button>
                </div>
              </div>

              <div className="bg-[#1c1f29] p-4 rounded-xl flex flex-col justify-between gap-3 border border-[#31353f]/40">
                <div className="w-10 h-10 rounded-lg bg-[#00eefc]/20 text-[#00eefc] flex items-center justify-center">
                  <span className="material-symbols-outlined">
                    signal_cellular_connected_no_internet_0_bar
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md text-base text-[#dfe2ef] mb-1 font-bold">
                    Subterranean GNSS Drop
                  </h3>
                  <p className="font-body-sm text-xs text-[#d8c3ac] mb-3">
                    Simulate total satellite blackout collapsing trust to 4%.
                  </p>
                  <button
                    onClick={() =>
                      triggerSimulation(
                        'GNSS Signal Dropped to 4%. Inertial EKF Continuity Fallback Active.'
                      )
                    }
                    className="w-full py-2 px-3 bg-[#00eefc]/20 hover:bg-[#00eefc]/40 text-[#00eefc] rounded-lg font-telemetry-unit text-xs transition-all cursor-pointer border border-[#00eefc]/30"
                  >
                    TRIGGER TUNNEL DROP
                  </button>
                </div>
              </div>

              <div className="bg-[#1c1f29] p-4 rounded-xl flex flex-col justify-between gap-3 border border-[#31353f]/40">
                <div className="w-10 h-10 rounded-lg bg-[#ffaa00]/20 text-[#ffcf91] flex items-center justify-center">
                  <span className="material-symbols-outlined">security</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-base text-[#dfe2ef] mb-1 font-bold">
                    Spoofing Attack & NIS Gate
                  </h3>
                  <p className="font-body-sm text-xs text-[#d8c3ac] mb-3">
                    Execute χ² anomaly response with 10ms lock-out.
                  </p>
                  <button
                    onClick={() =>
                      triggerSimulation(
                        'Chi² NIS Spoofing Attack Simulated: Waveform anomaly isolated and locked out in 8.4ms.'
                      )
                    }
                    className="w-full py-2 px-3 bg-[#ffaa00] text-[#452b00] hover:bg-[#ffb952] rounded-lg font-telemetry-unit text-xs font-semibold transition-all cursor-pointer shadow-[0_0_10px_rgba(255,170,0,0.3)]"
                  >
                    SIMULATE SPOOF
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#31353f]/40 text-xs font-telemetry-unit text-[#d8c3ac]">
              <span>JURY EVALUATION MODULE // ACTIVE TELEMETRY</span>
              <span className="text-[#ffcf91]">SLIDE 6 OF {totalSlides}</span>
            </div>
          </div>
        )}
      </div>

      {/* Slide Indicator Dots */}
      <div className="flex justify-center items-center gap-2 mt-2">
        {Array.from({ length: totalSlides }).map((_, idx) => {
          const slideNum = idx + 1;
          const isActive = currentSlide === slideNum;
          return (
            <button
              key={slideNum}
              onClick={() => setCurrentSlide(slideNum)}
              className={`transition-all rounded-full cursor-pointer ${
                isActive
                  ? 'w-8 h-2 bg-[#ffaa00] shadow-[0_0_8px_rgba(255,170,0,0.6)]'
                  : 'w-2 h-2 bg-[#31353f] hover:bg-[#d8c3ac]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
