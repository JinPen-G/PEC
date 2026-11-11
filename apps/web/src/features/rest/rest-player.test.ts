import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRestPlayer, type RestPlayer, type RestTrack } from './rest-player';

class TestAudio extends EventTarget {
  src = '';
  preload = '';
  readyState = 4;
  duration = 613;
  currentTime = 0;
  volume = 1;
  muted = false;
  paused = true;
  play = vi.fn((): Promise<void> => {
    this.paused = false;
    this.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  });
  pause = vi.fn(() => {
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  });
  load = vi.fn(() => {
    if (this.src) this.dispatchEvent(new Event('loadedmetadata'));
  });
  removeAttribute(name: string) {
    if (name === 'src') this.src = '';
  }
}

const track: RestTrack = {
  title: 'All Too Well',
  artist: 'Taylor Swift',
  artwork: '/cover.jpg',
  url: '/user-provided.mp3',
};
let player: RestPlayer;
let audioInstances: TestAudio[];
let revokeUrl = vi.fn<(url: string) => void>();
let currentTime: number;
let blobNumber: number;

function setup(source: RestTrack = track, factory?: () => TestAudio) {
  player = createRestPlayer({
    track: source,
    now: () => currentTime,
    audio: () => {
      const audio = factory?.() ?? new TestAudio();
      audioInstances.push(audio);
      return audio as unknown as HTMLAudioElement;
    },
    createUrl: () => `blob:rest-${++blobNumber}`,
    revokeUrl,
  });
  return player;
}

beforeEach(() => {
  vi.useFakeTimers();
  currentTime = 100_000;
  audioInstances = [];
  blobNumber = 0;
  revokeUrl = vi.fn<(url: string) => void>();
});

afterEach(() => {
  player?.dispose();
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});

describe('independent break playback', () => {
  it('waits for a local file rather than counting down or pretending to play', () => {
    setup({ title: track.title, artist: track.artist, artwork: track.artwork }).start(10);
    currentTime += 120_000;
    vi.advanceTimersByTime(120_000);
    expect(player.snapshot()).toMatchObject({ phase: 'preparing', remaining: 600, status: 'idle' });
    expect(audioInstances).toHaveLength(0);
    player.selectAudio(new File(['recording'], 'All Too Well.mp3', { type: 'audio/mpeg' }));
    expect(player.snapshot()).toMatchObject({
      phase: 'running',
      remaining: 600,
      status: 'playing',
      track: { title: 'All Too Well', artist: '' },
    });
    expect(audioInstances).toHaveLength(1);
  });

  it('stops a ten-minute break exactly at the deadline even for a longer song', () => {
    setup().start(10);
    const audio = audioInstances[0];
    currentTime += 599_001;
    player.checkDeadline();
    expect(player.snapshot().remaining).toBe(1);
    currentTime += 999;
    player.checkDeadline();
    expect(player.snapshot()).toMatchObject({ phase: 'finished', remaining: 0, status: 'ended' });
    expect(audio.paused).toBe(true);
    expect(audio.src).toBe('');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not extend the deadline when music is paused or seeked', () => {
    setup().start(10);
    player.pause();
    player.seek(300);
    expect(audioInstances[0].currentTime).toBe(300);
    currentTime += 120_000;
    vi.advanceTimersByTime(1_000);
    expect(player.snapshot()).toMatchObject({ remaining: 480, status: 'paused' });
    player.play();
    currentTime += 480_000;
    player.checkDeadline();
    expect(player.snapshot().phase).toBe('finished');
  });

  it('preserves the audio instance, position and volume across minimize and restore', () => {
    setup().start(30);
    player.seek(123);
    player.setVolume(0.25);
    player.minimize();
    expect(player.snapshot()).toMatchObject({
      expanded: false,
      currentTime: 123,
      volume: 0.25,
      status: 'playing',
    });
    player.expand();
    expect(player.snapshot().expanded).toBe(true);
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].play).toHaveBeenCalledTimes(1);
    expect(audioInstances[0].pause).not.toHaveBeenCalled();
  });

  it('repeats in thirty-minute mode, but never after its deadline', () => {
    setup().start(30);
    const audio = audioInstances[0];
    audio.currentTime = 613;
    currentTime += 613_000;
    audio.dispatchEvent(new Event('ended'));
    expect(audio.currentTime).toBe(0);
    expect(audio.play).toHaveBeenCalledTimes(2);
    expect(player.snapshot().remaining).toBe(1187);
    currentTime += 1_187_000;
    audio.dispatchEvent(new Event('ended'));
    expect(audio.play).toHaveBeenCalledTimes(2);
    expect(player.snapshot()).toMatchObject({ phase: 'finished', remaining: 0 });
  });

  it('does not repeat a short source in ten-minute mode or after a user pause', () => {
    setup().start(10);
    audioInstances[0].dispatchEvent(new Event('ended'));
    expect(player.snapshot()).toMatchObject({ phase: 'running', status: 'ended' });
    expect(audioInstances[0].play).toHaveBeenCalledTimes(1);
    player.start(30);
    player.pause();
    audioInstances[1].dispatchEvent(new Event('ended'));
    expect(audioInstances[1].play).toHaveBeenCalledTimes(1);
  });

  it('expires after sleep or tab suspension without replaying missed ticks', () => {
    setup().start(30);
    currentTime += 3_600_000;
    player.checkDeadline();
    player.play();
    expect(player.snapshot()).toMatchObject({ phase: 'finished', remaining: 0 });
    expect(audioInstances[0].play).toHaveBeenCalledTimes(1);
  });

  it('distinguishes browser autoplay denial and permits an explicit retry', async () => {
    const audio = new TestAudio();
    audio.play.mockRejectedValueOnce(new DOMException('Gesture required', 'NotAllowedError'));
    setup(track, () => audio).start(10);
    await Promise.resolve();
    await Promise.resolve();
    expect(player.snapshot()).toMatchObject({ status: 'blocked', error: null, phase: 'running' });
    player.play();
    expect(player.snapshot().status).toBe('playing');
  });

  it('ignores a delayed play rejection after pause, source replacement or close', async () => {
    let rejectPlay: (reason?: unknown) => void = () => {};
    const audio = new TestAudio();
    audio.play.mockImplementationOnce(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectPlay = reject;
        }),
    );
    setup(track, () => audio).start(10);
    player.pause();
    rejectPlay(new Error('Late rejection'));
    await Promise.resolve();
    await Promise.resolve();
    expect(player.snapshot()).toMatchObject({ status: 'paused', error: null });
    player.close();
    audio.dispatchEvent(new Event('playing'));
    audio.dispatchEvent(new Event('error'));
    expect(player.snapshot()).toMatchObject({ phase: 'idle', status: 'idle', error: null });
  });

  it('releases a replaced source without restarting the remaining break time', () => {
    setup().start(30);
    player.selectAudio(new File(['first'], 'first.mp3'));
    const first = audioInstances[1];
    currentTime += 60_000;
    player.selectAudio(new File(['second'], 'second.wav'));
    expect(first.src).toBe('');
    expect(first.paused).toBe(true);
    expect(revokeUrl).toHaveBeenCalledWith('blob:rest-1');
    expect(player.snapshot()).toMatchObject({
      remaining: 1740,
      track: { title: 'second', artist: '' },
      status: 'playing',
    });
    first.dispatchEvent(new Event('error'));
    expect(player.snapshot().error).toBeNull();
  });

  it('reports invalid files without interrupting existing playback', () => {
    setup().start(10);
    player.selectAudio(new File(['invalid'], 'payload.html', { type: 'text/html' }));
    expect(player.snapshot()).toMatchObject({ status: 'playing', error: 'file', track });
    player.selectAudio(new File([], 'empty.mp3', { type: 'audio/mpeg' }));
    expect(player.snapshot().error).toBe('file');
    expect(audioInstances).toHaveLength(1);
  });

  it('clamps seek and volume and ignores invalid seek values', () => {
    setup().start(10);
    player.seek(1000);
    expect(audioInstances[0].currentTime).toBe(613);
    player.seek(NaN);
    expect(audioInstances[0].currentTime).toBe(613);
    player.seek(-1);
    player.setVolume(2);
    expect(audioInstances[0].currentTime).toBe(0);
    expect(audioInstances[0].volume).toBe(1);
    player.setVolume(-1);
    expect(audioInstances[0].volume).toBe(0);
  });

  it('releases media, clocks and subscriptions when the host is disposed', () => {
    setup().start(30);
    player.selectAudio(new File(['local'], 'local.mp3'));
    const listener = vi.fn();
    player.subscribe(listener);
    player.dispose();
    expect(player.snapshot()).toMatchObject({ phase: 'idle', track });
    expect(revokeUrl).toHaveBeenCalledWith('blob:rest-1');
    expect(audioInstances.every((audio) => audio.paused && !audio.src)).toBe(true);
    listener.mockClear();
    player.expand();
    expect(listener).not.toHaveBeenCalled();
  });

  it('restores the default song after a local file without resetting the deadline or volume', () => {
    setup().start(30);
    player.selectAudio(new File(['local'], 'user.mp3'));
    player.setVolume(0.15);
    currentTime += 60_000;
    player.useDefault();
    expect(revokeUrl).toHaveBeenCalledWith('blob:rest-1');
    expect(player.snapshot()).toMatchObject({ track, status: 'playing', remaining: 1740, volume: 0.15 });
    expect(audioInstances.at(-1)?.src).toBe(track.url);
  });
});
