export type AppTab = 'hud-nav' | 'telemetry' | 'injector' | 'metrics' | 'audit-trail' | 'pitch-deck';

export type ThemeMode = 'dark' | 'daylight';

export interface TelemetryData {
  speed: number; // km/h
  accX: number;
  accY: number;
  accZ: number;
  gyrZ: number;
  netAccel: number;
  heading: number; // degrees
  covarianceRadius: number; // meters (e.g. 3.8m)
  driftPercent: number; // e.g. 0.72%
  ekfResidual: number; // meters e.g. 0.94m
  outageSeconds: number;
  isOutage: boolean;
  isSpoofed: boolean;
  isKillSwitched: boolean;
  nisValue: number;
  satellites: number;
  cno: number;
}

export interface AblationState {
  speedNet: boolean;
  nhc: boolean;
  mapMatching: boolean;
  spoofFilter: boolean;
}

export interface ReplayState {
  isPlaying: boolean;
  speed: 1 | 2 | 5;
  currentTime: number; // in seconds
  totalTime: number; // e.g. 272 seconds (04:32.00)
  frameNumber: number;
  mode: 'live' | 'replay';
}
