import { describe, expect, it } from 'vitest';
import { createRestSession, formatRestTime, remainingRestSeconds, type RestMinutes } from './rest-session';

describe('break wall-clock deadline', () => {
  it('accepts only the two supported durations', () => {
    expect(createRestSession(10, 1_000).endsAt).toBe(601_000);
    expect(createRestSession(30, 1_000).endsAt).toBe(1_801_000);
    expect(() => createRestSession(5 as RestMinutes, 1_000)).toThrow();
    expect(() => createRestSession(10, NaN)).toThrow();
  });

  it('ceil rounds the remaining time and clamps both ends', () => {
    const session = createRestSession(10, 1_000);
    expect(remainingRestSeconds(session, 1_001)).toBe(600);
    expect(remainingRestSeconds(session, 600_999)).toBe(1);
    expect(remainingRestSeconds(session, 601_000)).toBe(0);
    expect(remainingRestSeconds(session, 900_000)).toBe(0);
    expect(remainingRestSeconds(session, 0)).toBe(600);
  });

  it('formats finite, nonnegative minutes and seconds', () => {
    expect(formatRestTime(1800)).toBe('30:00');
    expect(formatRestTime(61.9)).toBe('1:01');
    expect(formatRestTime(-1)).toBe('0:00');
    expect(formatRestTime(Infinity)).toBe('0:00');
  });
});
