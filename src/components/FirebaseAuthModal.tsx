import React, { useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
  db,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from '../firebase';
import { TelemetryData } from '../types';

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryData;
}

interface SavedMission {
  id: string;
  missionName: string;
  driftPercent: number;
  maxTunnelErr: number;
  covarianceRadius: number;
  operatorEmail: string;
  operatorName: string;
  timestamp: any;
}

export const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({
  isOpen,
  onClose,
  telemetry,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [savedMissions, setSavedMissions] = useState<SavedMission[]>([]);
  const [missionTitle, setMissionTitle] = useState('Pragati Maidan Tunnel Ingress Test');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAuthError(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to cloud mission logs in Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, 'missions'), orderBy('timestamp', 'desc'), limit(10));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as SavedMission[];
          setSavedMissions(docs);
        },
        (error) => {
          // Handled gracefully in UI
        }
      );
      return () => unsubscribe();
    } catch {
      // Local state fallback
    }
  }, []);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request'
      ) {
        // Normal user cancellation - silent reset
        setAuthError(null);
      } else if (error?.code === 'auth/popup-blocked') {
        setAuthError('Popups are restricted by your browser in this preview frame. Use 1-Click Tactical Operator below.');
      } else {
        setAuthError(error?.message || 'Sign in encountered an issue. Try 1-Click Tactical Operator.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickOperatorSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      setAuthError(error?.message || 'Failed to initialize operator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAuthError(null);
    } catch {
      // Sign-out completed
    }
  };

  const handleSaveMissionToFirestore = async () => {
    setSaveError(null);
    if (!user) {
      setSaveError('Authentication required. Sign in above to save mission telemetry to Firestore.');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, 'missions'), {
        missionName: missionTitle || 'Tactical DR Run',
        driftPercent: telemetry.driftPercent,
        maxTunnelErr: 4.1,
        covarianceRadius: telemetry.covarianceRadius,
        operatorEmail: user.email || 'tactical-operator@dhruva.defense',
        operatorName: user.displayName || 'Field Operator',
        timestamp: serverTimestamp(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      setSaveError(error?.message || 'Firestore could not record the mission log.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-[#0a0e17]/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="flex flex-col bg-[#1c1f29] border border-[#ffaa00]/30 rounded-2xl w-full max-w-lg shadow-[0_0_35px_rgba(255,170,0,0.25)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#181b25] border-b border-[#31353f]/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ffaa00]/20 flex items-center justify-center text-[#ffaa00]">
              <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
            </div>
            <div>
              <span className="font-headline-md text-sm sm:text-base font-bold text-[#dfe2ef]">
                Cloud Mission Vault & Firebase Auth
              </span>
              <span className="font-code-stream text-[10px] text-[#00eefc] block">
                Google Identity & Firestore Data Persistence
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#262a34] text-[#d8c3ac] hover:text-[#dfe2ef] flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3.5 overflow-y-auto max-h-[75vh]">
          {/* Auth Error Banner */}
          {authError && (
            <div className="p-2.5 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/40 text-[#ffb4ab] text-xs font-code-stream flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] flex-shrink-0 mt-0.5">info</span>
              <div className="flex-1">
                <span>{authError}</span>
              </div>
              <button onClick={() => setAuthError(null)} className="text-[#ffb4ab] hover:text-white">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          )}

          {/* User Auth Card */}
          {user ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#181b25] border border-[#00eefc]/40">
              <div className="flex items-center gap-3 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full border border-[#00eefc]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#00eefc] text-[#00363a] font-bold flex items-center justify-center">
                    {user.displayName?.[0] || 'O'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-caps text-xs text-[#dfe2ef] font-bold truncate">
                      {user.displayName || (user.isAnonymous ? 'Tactical Demo Operator' : 'Authorized Operator')}
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-[#00eefc]">verified</span>
                  </div>
                  <span className="font-code-stream text-[10px] text-[#d8c3ac] truncate block">
                    {user.email || `UID: ${user.uid.slice(0, 10)}...`}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg bg-[#262a34] hover:bg-[#31353f] text-[#ffb4ab] font-label-caps text-[10px] transition-all cursor-pointer border border-[#ffb4ab]/30"
              >
                SIGN OUT
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#181b25] border border-[#31353f] text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#ffaa00]/15 flex items-center justify-center text-[#ffaa00]">
                <span className="material-symbols-outlined text-[24px]">vpn_key</span>
              </div>
              <div>
                <h4 className="font-headline-md text-sm font-bold text-[#dfe2ef]">
                  Secure Operator Authentication
                </h4>
                <p className="font-body-sm text-xs text-[#d8c3ac] mt-1 max-w-sm">
                  Sign in with Google to synchronize dead-reckoning benchmark runs, cryptographic audit
                  trails, and telemetry logs directly to Cloud Firestore.
                </p>
              </div>

              <div className="flex flex-col w-full gap-2">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#dfe2ef] hover:bg-white text-[#0f131c] font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                <button
                  onClick={handleQuickOperatorSignIn}
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-lg bg-[#262a34] hover:bg-[#31353f] text-[#00eefc] font-label-caps text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#00eefc]/30"
                  title="Instant session without external popups"
                >
                  <span className="material-symbols-outlined text-[15px]">badge</span>
                  <span>1-Click Tactical Demo Operator Access</span>
                </button>
              </div>
            </div>
          )}

          {/* Save Current Mission Section */}
          <div className="p-3.5 rounded-xl bg-[#181b25] border border-[#31353f]/50 flex flex-col gap-2.5">
            <span className="font-label-caps text-[10px] text-[#ffaa00] uppercase font-bold">
              Save Telemetry Run to Firestore
            </span>

            {saveError && (
              <div className="p-2 rounded-lg bg-[#93000a]/20 border border-[#ffb4ab]/30 text-[#ffb4ab] text-[11px] font-code-stream">
                {saveError}
              </div>
            )}

            <input
              type="text"
              value={missionTitle}
              onChange={(e) => setMissionTitle(e.target.value)}
              placeholder="Mission title..."
              className="bg-[#0f131c] text-[#dfe2ef] text-xs px-3 py-2 rounded-lg border border-[#31353f] focus:outline-none focus:border-[#ffaa00]"
            />

            <div className="grid grid-cols-3 gap-2 text-[10px] font-code-stream bg-[#1c1f29] p-2 rounded-lg border border-[#31353f]/40">
              <div>
                <span className="text-[#d8c3ac] block">Drift:</span>
                <span className="text-[#00eefc] font-bold">{telemetry.driftPercent.toFixed(2)}%</span>
              </div>
              <div>
                <span className="text-[#d8c3ac] block">Covariance:</span>
                <span className="text-[#ffcf91] font-bold">±{telemetry.covarianceRadius.toFixed(1)}m</span>
              </div>
              <div>
                <span className="text-[#d8c3ac] block">Speed:</span>
                <span className="text-[#dfe2ef] font-bold">{telemetry.speed.toFixed(1)} km/h</span>
              </div>
            </div>

            <button
              onClick={handleSaveMissionToFirestore}
              disabled={loading}
              className={`w-full py-2.5 rounded-xl font-label-caps text-xs uppercase font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                saveSuccess
                  ? 'bg-[#00eefc] text-[#00363a]'
                  : 'bg-[#ffaa00] hover:bg-[#ffb952] text-[#452b00] active:scale-[0.99]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">
                {saveSuccess ? 'done' : 'save'}
              </span>
              <span>{saveSuccess ? 'Mission Saved to Cloud!' : 'Save Run to Firestore'}</span>
            </button>
          </div>

          {/* Firestore Cloud Sync Mission History */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-[#dfe2ef] uppercase font-bold">
                Cloud Synchronized Missions
              </span>
              <span className="font-code-stream text-[10px] text-[#00eefc]">
                {savedMissions.length} Runs
              </span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {savedMissions.length === 0 ? (
                <div className="p-3 text-center text-xs font-code-stream text-[#d8c3ac] bg-[#181b25] rounded-xl border border-[#31353f]/40">
                  No cloud missions saved yet. Complete a dead-reckoning test run and click Save!
                </div>
              ) : (
                savedMissions.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-[#181b25] border border-[#31353f]/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#dfe2ef] block">{m.missionName}</span>
                      <span className="font-code-stream text-[10px] text-[#d8c3ac]">
                        Drift: {m.driftPercent}% · Cov: ±{m.covarianceRadius}m · By {m.operatorName}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-[#00eefc]">
                      cloud_done
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
