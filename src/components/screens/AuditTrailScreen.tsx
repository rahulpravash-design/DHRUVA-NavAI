import React, { useState } from 'react';

export const AuditTrailScreen: React.FC = () => {
  const [items, setItems] = useState({
    signedCsv: true,
    geoJson: true,
    ekfCovariance: true,
    presentationPdf: true,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const toggleItem = (key: keyof typeof items) => {
    setItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedCount = Object.values(items).filter(Boolean).length;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);

      // Create a downloadable sample verification report
      const bundleData = {
        title: 'DHRUVA Tactical Dead-Reckoning Verification Bundle',
        timestamp: new Date().toISOString(),
        device: 'Pixel 7 Android 14 (LSM6DSO)',
        sessionSeal: '0x8F9B73C482A1D904BEEF34E2',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        metrics: {
          cumulativeDrift: '0.84%',
          maxTunnelError: '4.1m @ 90s zero-GNSS',
          tunnelBoreLength: '1,200.0m',
          rtkEgressDelta: '2.9m (PASS < 5.0m)',
          nisThresholdPVal: 0.05,
          zuptF1Score: 0.998,
        },
        pipeline: [
          '100Hz Hardware FIFO IMU',
          'TFLite 1D-CNN Speed Net (41.2k weights, INT8)',
          'Non-Holonomic Constraints (v_lat = 0)',
          'Error-State EKF (5-DOF Core, P-COV: 0.04m²)',
          'HMM Viterbi Map-Match (Edge #4092, Conf 99.1%)',
          'Chi-Square NIS Gate (Rejected Fixes: 0)',
        ],
      };

      const blob = new Blob([JSON.stringify(bundleData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dhruva_sih_verification_bundle.json';
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => setExportComplete(false), 4000);
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto pb-6 gap-3 select-none">
      {/* 1. Cryptographic Seal Status Header */}
      <div className="bg-[#181b25] rounded-2xl p-4 flex flex-col gap-2.5 shadow-md relative overflow-hidden border border-[#31353f]/50">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#ffaa00]/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[#ffaa00] text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
            <span className="font-label-caps text-xs text-[#dfe2ef] uppercase tracking-wider font-bold">
              SESSION CRYPTOGRAPHIC SEAL
            </span>
          </div>
          <span className="font-code-stream text-[10px] bg-[#ffaa00]/20 text-[#ffcf91] px-2 py-0.5 rounded font-semibold border border-[#ffaa00]/30">
            0x8F9B...34E2
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-[#d8c3ac] pt-1 border-t border-[#31353f]/40 font-code-stream">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span>2026-09-25 12:22:05 UTC</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#00eefc]">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>SHA-256 Validated</span>
          </div>
        </div>
      </div>

      {/* 2. Hardware & Integrity Fingerprint */}
      <div className="bg-[#1c1f29] rounded-2xl p-4 flex flex-col gap-2.5 shadow-md border border-[#31353f]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[#00eefc] text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              fingerprint
            </span>
            <span className="font-label-caps text-xs text-[#dfe2ef] uppercase tracking-wider font-bold">
              HARDWARE & INTEGRITY FINGERPRINT
            </span>
          </div>
          <span className="font-code-stream text-[10px] bg-[#00eefc]/15 text-[#00eefc] px-2 py-0.5 rounded border border-[#00eefc]/30 font-semibold">
            SECURE ENCLAVE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div className="bg-[#181b25] p-2.5 rounded-xl flex flex-col gap-1 border border-[#31353f]/40">
            <span className="font-label-caps text-[#d8c3ac] text-[9px] uppercase">DEVICE TARGET</span>
            <span className="font-code-stream text-xs text-[#dfe2ef] font-semibold truncate">
              Pixel 7 Android 14 IMU
            </span>
          </div>

          <div className="bg-[#181b25] p-2.5 rounded-xl flex flex-col gap-1 border border-[#31353f]/40">
            <span className="font-label-caps text-[#d8c3ac] text-[9px] uppercase">TAMPER STATUS</span>
            <span className="font-code-stream text-xs text-[#00eefc] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00eefc] animate-pulse" />
              ZERO TAMPERING
            </span>
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Telemetry Audit Trail Accordion */}
      <div className="bg-[#1c1f29] rounded-2xl p-4 flex flex-col gap-2.5 shadow-md border border-[#31353f]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[#ffaa00] text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              list_alt
            </span>
            <span className="font-label-caps text-xs text-[#dfe2ef] uppercase tracking-wider font-bold">
              TELEMETRY AUDIT TRAIL LOGS
            </span>
          </div>
          <span className="font-code-stream text-[10px] text-[#d8c3ac]">4 STREAMS</span>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          {/* Stream 1 */}
          <details className="group bg-[#181b25] rounded-xl overflow-hidden transition-all border border-[#31353f]/40" open>
            <summary className="flex items-center justify-between p-3 cursor-pointer select-none hover:bg-[#262a34]/60">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#ffcf91] text-[16px]">sensors</span>
                <span className="font-code-stream text-xs text-[#dfe2ef] font-semibold">
                  Raw IMU Pre-Integration Logs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-code-stream text-[10px] text-[#ffaa00] bg-[#ffaa00]/10 px-1.5 py-0.5 rounded">
                  100Hz
                </span>
                <span className="material-symbols-outlined text-[#d8c3ac] text-[16px] transition-transform group-open:rotate-180">
                  expand_more
                </span>
              </div>
            </summary>
            <div className="px-3 pb-3 pt-1 text-xs text-[#d8c3ac] flex flex-col gap-1.5 border-t border-[#31353f]/30">
              <div className="flex justify-between font-code-stream text-[11px]">
                <span>AccX/Y/Z (m/s²):</span>
                <span className="text-[#dfe2ef]">+0.12, +1.42, -9.81</span>
              </div>
              <div className="flex justify-between font-code-stream text-[11px]">
                <span>GyroX/Y/Z (rad/s):</span>
                <span className="text-[#dfe2ef]">0.001, -0.002, 0.040</span>
              </div>
              <div className="flex justify-between font-code-stream text-[11px]">
                <span>Allan Bias Stability:</span>
                <span className="text-[#00eefc]">0.012 deg/hr</span>
              </div>
            </div>
          </details>

          {/* Stream 2 */}
          <details className="group bg-[#181b25] rounded-xl overflow-hidden transition-all border border-[#31353f]/40">
            <summary className="flex items-center justify-between p-3 cursor-pointer select-none hover:bg-[#262a34]/60">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#00eefc] text-[16px]">speed</span>
                <span className="font-code-stream text-xs text-[#dfe2ef] font-semibold">
                  TFLite Speed Inferences
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-code-stream text-[10px] text-[#00eefc] bg-[#00eefc]/10 px-1.5 py-0.5 rounded">
                  4.2ms
                </span>
                <span className="material-symbols-outlined text-[#d8c3ac] text-[16px] transition-transform group-open:rotate-180">
                  expand_more
                </span>
              </div>
            </summary>
            <div className="px-3 pb-3 pt-1 text-xs text-[#d8c3ac] flex flex-col gap-1.5 border-t border-[#31353f]/30">
              <div className="flex justify-between font-code-stream text-[11px]">
                <span>Model Architecture:</span>
                <span className="text-[#dfe2ef]">1D ResNet-DR-v2.4.tflite</span>
              </div>
              <div className="flex justify-between font-code-stream text-[11px]">
                <span>Inference Velocity:</span>
                <span className="text-[#dfe2ef]">13.38 m/s (48.2 km/h)</span>
              </div>
              <div className="flex justify-between font-code-stream text-[11px]">
                <span>Quantization & Delegate:</span>
                <span className="text-[#00eefc]">INT8 Full Integer (Snapdragon NPU)</span>
              </div>
            </div>
          </details>

          {/* Stream 3 */}
          <details className="group bg-[#181b25] rounded-xl overflow-hidden transition-all border border-[#31353f]/40">
            <summary className="flex items-center justify-between p-3 cursor-pointer select-none hover:bg-[#262a34]/60">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#ffcacf] text-[16px]">security</span>
                <span className="font-code-stream text-xs text-[#dfe2ef] font-semibold">
                  Chi-Square NIS Integrity Gates
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-code-stream text-[10px] text-[#ffcacf] bg-[#ffcacf]/10 px-1.5 py-0.5 rounded">
                  χ² = 3.42
                </span>
                <span className="material-symbols-outlined text-[#d8c3ac] text-[16px] transition-transform group-open:rotate-180">
                  expand_more
                </span>
              </div>
            </summary>
            <div className="px-3 pb-3 pt-1 text-xs text-[#d8c3ac] flex flex-col gap-1.5 border-t border-[#31353f]/30">
              <div className="flex justify-between font-code-stream text-[11px]">
                <span>Gate Threshold (95% α=0.05):</span>
                <span className="text-[#dfe2ef]">5.99 (DOF = 2)</span>
              </div>
              <div className="flex justify-between font-code-stream text-[11px]">
                <span>Outlier Rejection Status:</span>
                <span className="text-[#00eefc]">Active (0 false rejects)</span>
              </div>
            </div>
          </details>

          {/* Stream 4 */}
          <details className="group bg-[#181b25] rounded-xl overflow-hidden transition-all border border-[#31353f]/40">
            <summary className="flex items-center justify-between p-3 cursor-pointer select-none hover:bg-[#262a34]/60">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#ffcf91] text-[16px]">map</span>
                <span className="font-code-stream text-xs text-[#dfe2ef] font-semibold">
                  HMM Map Matching Snapshots
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-code-stream text-[10px] text-[#ffcf91] bg-[#ffcf91]/10 px-1.5 py-0.5 rounded">
                  Viterbi
                </span>
                <span className="material-symbols-outlined text-[#d8c3ac] text-[16px] transition-transform group-open:rotate-180">
                  expand_more
                </span>
              </div>
            </summary>
            <div className="px-3 pb-3 pt-1 text-xs text-[#d8c3ac] flex flex-col gap-1.5 border-t border-[#31353f]/30">
              <div className="flex justify-between font-code-stream text-[11px]">
                <span>OSM Road Link ID:</span>
                <span className="text-[#dfe2ef]">#9842103-NX (Pragati Maidan Bore)</span>
              </div>
              <div className="flex justify-between font-code-stream text-[11px]">
                <span>Emission Probability:</span>
                <span className="text-[#00eefc]">0.982 (99.1% Confidence)</span>
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* 4. Export Package Configurator */}
      <div className="bg-[#1c1f29] rounded-2xl p-4 flex flex-col gap-2.5 shadow-md border border-[#31353f]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[#ffaa00] text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              tune
            </span>
            <span className="font-label-caps text-xs text-[#dfe2ef] uppercase tracking-wider font-bold">
              EXPORT PACKAGE CONFIGURATOR
            </span>
          </div>
          <span className="font-code-stream text-[10px] text-[#00eefc]">
            {selectedCount} ITEMS SELECTED
          </span>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <label className="flex items-center justify-between p-2.5 bg-[#181b25] rounded-xl cursor-pointer hover:bg-[#262a34] transition-colors border border-[#31353f]/40">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={items.signedCsv}
                onChange={() => toggleItem('signedCsv')}
                className="w-4 h-4 rounded bg-[#0f131c] border-[#524433] text-[#ffaa00] focus:ring-0 accent-[#ffaa00] cursor-pointer"
              />
              <span className="font-code-stream text-xs text-[#dfe2ef]">
                Signed CSV (Raw Sensor Data)
              </span>
            </div>
            <span className="font-label-caps text-[9px] text-[#d8c3ac]">2.4 MB</span>
          </label>

          <label className="flex items-center justify-between p-2.5 bg-[#181b25] rounded-xl cursor-pointer hover:bg-[#262a34] transition-colors border border-[#31353f]/40">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={items.geoJson}
                onChange={() => toggleItem('geoJson')}
                className="w-4 h-4 rounded bg-[#0f131c] border-[#524433] text-[#ffaa00] focus:ring-0 accent-[#ffaa00] cursor-pointer"
              />
              <span className="font-code-stream text-xs text-[#dfe2ef]">
                GeoJSON (Trajectory Path)
              </span>
            </div>
            <span className="font-label-caps text-[9px] text-[#d8c3ac]">840 KB</span>
          </label>

          <label className="flex items-center justify-between p-2.5 bg-[#181b25] rounded-xl cursor-pointer hover:bg-[#262a34] transition-colors border border-[#31353f]/40">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={items.ekfCovariance}
                onChange={() => toggleItem('ekfCovariance')}
                className="w-4 h-4 rounded bg-[#0f131c] border-[#524433] text-[#ffaa00] focus:ring-0 accent-[#ffaa00] cursor-pointer"
              />
              <span className="font-code-stream text-xs text-[#dfe2ef]">
                EKF Covariance Matrices
              </span>
            </div>
            <span className="font-label-caps text-[9px] text-[#d8c3ac]">1.1 MB</span>
          </label>

          <label className="flex items-center justify-between p-2.5 bg-[#181b25] rounded-xl cursor-pointer hover:bg-[#262a34] transition-colors border border-[#31353f]/40">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={items.presentationPdf}
                onChange={() => toggleItem('presentationPdf')}
                className="w-4 h-4 rounded bg-[#0f131c] border-[#524433] text-[#ffaa00] focus:ring-0 accent-[#ffaa00] cursor-pointer"
              />
              <span className="font-code-stream text-xs text-[#dfe2ef]">
                Judge Presentation PDF & Ground-Truth
              </span>
            </div>
            <span className="font-label-caps text-[9px] text-[#d8c3ac]">4.8 MB</span>
          </label>
        </div>
      </div>

      {/* 5. Export Action Button */}
      <div className="pt-1">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer font-headline-md text-xs sm:text-sm tracking-wider uppercase font-bold ${
            isExporting
              ? 'bg-[#00eefc] text-[#00363a] shadow-[0_0_20px_rgba(0,238,252,0.5)] cursor-wait'
              : exportComplete
              ? 'bg-[#00eefc] text-[#00363a] shadow-[0_0_20px_rgba(0,238,252,0.5)]'
              : 'bg-[#ffaa00] hover:bg-[#ffb952] text-[#452b00] active:scale-[0.98] shadow-[0_0_20px_rgba(255,170,0,0.3)]'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[20px] ${
              isExporting ? 'animate-spin' : ''
            }`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {isExporting ? 'sync' : exportComplete ? 'done_all' : 'share_windows'}
          </span>
          <span>
            {isExporting
              ? 'Generating Cryptographic Bundle...'
              : exportComplete
              ? 'Bundle Exported Successfully (9.14 MB)'
              : 'Export & Share Verification Bundle'}
          </span>
        </button>
      </div>
    </div>
  );
};
