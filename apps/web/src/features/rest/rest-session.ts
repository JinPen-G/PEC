export const REST_MINUTES = [10, 30] as const;
export type RestMinutes = (typeof REST_MINUTES)[number];

export interface RestSession {
  minutes: RestMinutes;
  endsAt: number;
}

export function createRestSession(minutes: RestMinutes, now: number): RestSession {
  if (!REST_MINUTES.includes(minutes) || !Number.isFinite(now)) throw new Error('Invalid break duration');
  return { minutes, endsAt: now + minutes * 60_000 };
}

export function remainingRestSeconds(session: RestSession, now: number) {
  return Math.max(0, Math.min(session.minutes * 60, Math.ceil((session.endsAt - now) / 1000)));
}

export function formatRestTime(seconds: number) {
  const whole = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}
