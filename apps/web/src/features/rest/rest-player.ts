import {
  createRestSession,
  remainingRestSeconds,
  REST_MINUTES,
  type RestMinutes,
  type RestSession,
} from './rest-session';

export interface RestTrack {
  title: string;
  artist: string;
  artwork: string;
  url?: string;
  file?: File;
}
export interface RestSnapshot {
  phase: 'idle' | 'preparing' | 'running' | 'finished';
  status: 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'buffering' | 'blocked' | 'error' | 'ended';
  minutes: RestMinutes;
  remaining: number;
  expanded: boolean;
  track: RestTrack;
  currentTime: number;
  duration: number;
  volume: number;
  error: 'audio' | 'file' | null;
}
interface RestPlayerOptions {
  track: RestTrack;
  audio?: () => HTMLAudioElement;
  now?: () => number;
  createUrl?: (file: Blob) => string;
  revokeUrl?: (url: string) => void;
}
const bounded = (value: number, maximum: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(maximum, value)) : 0;

/** One real audio instance per break. Media events own playback facts; the wall-clock deadline owns completion. */
export function createRestPlayer(options: RestPlayerOptions) {
  const now = options.now ?? Date.now;
  const makeUrl = options.createUrl ?? ((file: Blob) => URL.createObjectURL(file));
  const revokeUrl = options.revokeUrl ?? ((url: string) => URL.revokeObjectURL(url));
  const listeners = new Set<() => void>();
  let snapshot: RestSnapshot = {
    phase: 'idle',
    status: 'idle',
    minutes: 10,
    remaining: 600,
    expanded: true,
    track: options.track,
    currentTime: 0,
    duration: 0,
    volume: 0.4,
    error: null,
  };
  let session: RestSession | null = null;
  let audio: HTMLAudioElement | null = null;
  let disposeAudio: (() => void) | undefined;
  let audioUrl: string | undefined;
  let interval: ReturnType<typeof setInterval> | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  let request = 0;
  let wantsPlayback = false;
  const update = (patch: Partial<RestSnapshot>) => {
    const next = { ...snapshot, ...patch };
    if ((Object.keys(patch) as (keyof RestSnapshot)[]).every((key) => next[key] === snapshot[key])) return;
    snapshot = next;
    listeners.forEach((listener) => listener());
  };
  const stopClock = () => {
    clearInterval(interval);
    clearTimeout(deadline);
    interval = undefined;
    deadline = undefined;
  };
  const releaseAudio = () => {
    request++;
    wantsPlayback = false;
    disposeAudio?.();
    disposeAudio = undefined;
    audio = null;
    if (audioUrl) revokeUrl(audioUrl);
    audioUrl = undefined;
  };
  const finish = () => {
    stopClock();
    releaseAudio();
    update({ phase: 'finished', remaining: 0, status: 'ended', error: null });
  };
  const checkDeadline = () => {
    if (!session || snapshot.phase !== 'running') return false;
    if (now() >= session.endsAt) {
      finish();
      return false;
    }
    update({ remaining: remainingRestSeconds(session, now()) });
    return true;
  };
  const play = () => {
    if (!checkDeadline() || !audio) return;
    const currentAudio = audio;
    const currentRequest = ++request;
    wantsPlayback = true;
    update({ status: currentAudio.readyState < 2 ? 'loading' : 'ready', error: null });
    try {
      void currentAudio
        .play()
        .then(() => {
          if (audio !== currentAudio || currentRequest !== request) return;
          if (!wantsPlayback || !checkDeadline()) currentAudio.pause();
        })
        .catch((error: unknown) => {
          if (audio !== currentAudio || currentRequest !== request || !wantsPlayback) return;
          if (!checkDeadline()) return;
          const name = typeof error === 'object' && error !== null && 'name' in error ? error.name : '';
          update({
            status: name === 'NotAllowedError' ? 'blocked' : name === 'AbortError' ? 'paused' : 'error',
            error: name === 'NotAllowedError' || name === 'AbortError' ? null : 'audio',
          });
        });
    } catch {
      if (audio === currentAudio && currentRequest === request) update({ status: 'error', error: 'audio' });
    }
  };
  const pause = () => {
    wantsPlayback = false;
    request++;
    audio?.pause();
    if (checkDeadline()) update({ status: 'paused' });
  };
  const attachAudio = () => {
    releaseAudio();
    const track = snapshot.track;
    if (!track.url && !track.file) return;
    const currentAudio = (options.audio ?? (() => new Audio()))();
    audio = currentAudio;
    currentAudio.preload = 'metadata';
    currentAudio.volume = snapshot.volume;
    const active = () => audio === currentAudio && checkDeadline();
    const position = () => {
      if (!active()) return;
      const duration = bounded(currentAudio.duration, 86_400);
      update({ duration, currentTime: bounded(currentAudio.currentTime, duration) });
    };
    const ready = () => {
      if (!active()) return;
      position();
      if (snapshot.status === 'loading') update({ status: wantsPlayback ? 'ready' : 'paused' });
    };
    const playing = () => {
      if (!active()) return;
      if (!wantsPlayback) {
        currentAudio.pause();
        return;
      }
      update({ status: 'playing', error: null });
    };
    const paused = () => {
      if (active() && snapshot.status !== 'error' && snapshot.status !== 'blocked')
        update({ status: 'paused' });
    };
    const waiting = () => {
      if (active() && wantsPlayback && snapshot.status !== 'error') update({ status: 'buffering' });
    };
    const ended = () => {
      if (!active()) return;
      position();
      if (session?.minutes === 30 && wantsPlayback) {
        currentAudio.currentTime = 0;
        play();
      } else update({ status: 'ended' });
    };
    const failed = () => {
      if (active()) {
        request++;
        wantsPlayback = false;
        update({ status: 'error', error: 'audio' });
      }
    };
    const volume = () => {
      if (audio === currentAudio) update({ volume: currentAudio.muted ? 0 : currentAudio.volume });
    };
    const handlers = {
      loadedmetadata: ready,
      canplay: ready,
      durationchange: position,
      timeupdate: position,
      playing,
      pause: paused,
      waiting,
      stalled: waiting,
      ended,
      error: failed,
      volumechange: volume,
    };
    for (const [event, handler] of Object.entries(handlers)) currentAudio.addEventListener(event, handler);
    disposeAudio = () => {
      for (const [event, handler] of Object.entries(handlers))
        currentAudio.removeEventListener(event, handler);
      currentAudio.pause();
      currentAudio.removeAttribute('src');
      currentAudio.load();
    };
    try {
      if (track.file) audioUrl = makeUrl(track.file);
      currentAudio.src = audioUrl ?? track.url!;
      currentAudio.load();
      play();
    } catch {
      releaseAudio();
      update({ status: 'error', error: 'audio' });
    }
  };
  const startClock = () => {
    stopClock();
    session = createRestSession(snapshot.minutes, now());
    update({ phase: 'running', remaining: snapshot.minutes * 60, error: null });
    interval = setInterval(checkDeadline, 1000);
    deadline = setTimeout(checkDeadline, snapshot.minutes * 60_000);
  };
  const start = (minutes: RestMinutes) => {
    if (!REST_MINUTES.includes(minutes)) throw new Error('Invalid break duration');
    releaseAudio();
    stopClock();
    session = null;
    update({
      minutes,
      remaining: minutes * 60,
      expanded: true,
      currentTime: 0,
      duration: 0,
      status: 'idle',
      error: null,
      phase: 'preparing',
    });
    if (snapshot.track.url || snapshot.track.file) {
      startClock();
      attachAudio();
    }
  };
  const close = () => {
    stopClock();
    releaseAudio();
    session = null;
    update({ phase: 'idle', currentTime: 0, duration: 0, status: 'idle', error: null });
  };
  return {
    snapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    start,
    close,
    play,
    pause,
    checkDeadline,
    minimize: () => update({ expanded: false }),
    expand: () => update({ expanded: true }),
    selectAudio(file: File) {
      if (!file.size || file.size > 200 * 1024 * 1024 || !/\.(mp3|m4a|wav|ogg|flac|aac)$/i.test(file.name)) {
        update({ error: 'file' });
        return;
      }
      const title = file.name.replace(/\.[^.]+$/, '');
      releaseAudio();
      update({
        track: {
          title,
          artist: '',
          artwork: snapshot.track.artwork,
          file,
        },
        error: null,
        currentTime: 0,
        duration: 0,
      });
      if (snapshot.phase === 'preparing') startClock();
      if (snapshot.phase === 'running' && checkDeadline()) attachAudio();
    },
    seek(seconds: number) {
      if (
        !checkDeadline() ||
        !audio ||
        !Number.isFinite(audio.duration) ||
        audio.duration <= 0 ||
        !Number.isFinite(seconds)
      )
        return;
      try {
        audio.currentTime = bounded(seconds, audio.duration);
        update({ currentTime: audio.currentTime });
      } catch {
        update({ status: 'error', error: 'audio' });
      }
    },
    setVolume(value: number) {
      const volume = bounded(value, 1);
      update({ volume });
      if (audio) {
        audio.muted = false;
        audio.volume = volume;
      }
    },
    retry() {
      if (checkDeadline()) attachAudio();
    },
    useDefault() {
      releaseAudio();
      update({ track: options.track, currentTime: 0, duration: 0, error: null, status: 'idle' });
      if (snapshot.phase === 'running' && checkDeadline()) attachAudio();
    },
    dispose() {
      close();
      update({ track: options.track });
      listeners.clear();
    },
  };
}
export type RestPlayer = ReturnType<typeof createRestPlayer>;
