import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  Expand,
  ExternalLink,
  FolderOpen,
  Maximize2,
  Minimize2,
  Pause,
  RotateCcw,
  Shrink,
  X,
} from 'lucide-react';
import { Button, Modal } from '@preview/ui/admin';
import { MediaPlayer, NowPlaying } from '@preview/ui/rest-player';
import { usePlatformTheme } from '@/features/theme/platform-theme';
import { useRest } from './rest-context';
import { useRestText } from './rest-locale';
import { formatRestTime } from './rest-session';
import {
  REST_ARTWORK_FALLBACK as fallbackArtwork,
  REST_TRACK,
  REST_TRACK_ALBUM,
  REST_TRACK_ALBUM_URL,
  REST_TRACK_VERSION,
} from './rest-track';
import './rest-player.css';

export default function RestExperience() {
  const { snapshot, player, entry } = useRest();
  const text = useRestText();
  const { resolvedMode } = usePlatformTheme();
  const audioInput = useRef<HTMLInputElement>(null);
  const [failedArtwork, setFailedArtwork] = useState('');
  const [fullScreen, setFullScreen] = useState(false);
  const [screenError, setScreenError] = useState(false);
  const ownsFullScreen = useRef(false);
  const focusRequest = useRef<number | undefined>(undefined);
  const artwork = failedArtwork === snapshot.track.artwork ? fallbackArtwork : snapshot.track.artwork;
  const running = snapshot.phase === 'running';
  const finished = snapshot.phase === 'finished';
  const preparing = snapshot.phase === 'preparing';
  const labels = {
    player: text('player'),
    play: text('play'),
    pause: text('pause'),
    previous: text('previous'),
    next: text('next'),
    position: text('position'),
    volume: text('volume'),
    mute: text('mute'),
    unmute: text('unmute'),
    loading: text('loading'),
    error: text('error'),
    of: text('of'),
    expand: text('expand'),
    collapse: text('minimize'),
    by: '·',
    playing: text('playing'),
    paused: text('paused'),
  };
  const playerProps = {
    track: {
      title: snapshot.track.title,
      artist: snapshot.track.artist || text('localAudio'),
      artwork,
      artworkAlt: snapshot.track.title,
    },
    playing: running && ['playing', 'buffering'].includes(snapshot.status),
    currentTime: snapshot.currentTime,
    duration: snapshot.duration,
    disabled: !running,
    status:
      snapshot.status === 'error'
        ? ('error' as const)
        : snapshot.status === 'loading'
          ? ('loading' as const)
          : ('ready' as const),
    labels,
    onPlayingChange: (playing: boolean) => (playing ? player.play() : player.pause()),
    onSeek: player.seek,
    onPrevious: () => {
      player.seek(0);
    },
    onNext: () => {
      player.seek(0);
      player.play();
    },
  };
  const leaveFullScreen = () => {
    if (ownsFullScreen.current && document.fullscreenElement)
      void document.exitFullscreen?.().catch(() => {});
    ownsFullScreen.current = false;
  };
  const minimize = () => {
    leaveFullScreen();
    player.minimize();
  };
  const close = () => {
    leaveFullScreen();
    player.close();
    if (!snapshot.expanded) returnFocus();
  };
  const returnFocus = () => {
    if (focusRequest.current !== undefined) cancelAnimationFrame(focusRequest.current);
    focusRequest.current = requestAnimationFrame(() => entry.current?.focus({ preventScroll: true }));
  };
  useEffect(() => {
    const changed = () => {
      setFullScreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', changed);
    return () => {
      document.removeEventListener('fullscreenchange', changed);
      if (focusRequest.current !== undefined) cancelAnimationFrame(focusRequest.current);
      leaveFullScreen();
    };
  }, []);
  const toggleFullScreen = async () => {
    setScreenError(false);
    if (document.fullscreenElement) {
      leaveFullScreen();
      return;
    }
    try {
      if (!document.documentElement.requestFullscreen) throw new Error('Full screen unavailable');
      ownsFullScreen.current = true;
      await document.documentElement.requestFullscreen();
      if (!ownsFullScreen.current && document.fullscreenElement) await document.exitFullscreen();
    } catch {
      ownsFullScreen.current = false;
      setScreenError(true);
    }
  };
  const status =
    snapshot.error === 'file'
      ? text('fileError')
      : finished
        ? text('ended')
        : preparing
          ? text('fileNeeded')
          : snapshot.status === 'error'
            ? text('error')
            : snapshot.status === 'blocked'
              ? text('blocked')
              : snapshot.status === 'loading'
                ? text('loading')
                : snapshot.status === 'buffering'
                  ? text('buffering')
                  : '';
  const timer = (
    <div className="preview-rest-timer">
      <span>{text(finished ? 'finished' : preparing ? 'preparing' : 'resting')}</span>
      <time role="timer" aria-label={text('remaining')} aria-live="off" dateTime={`PT${snapshot.remaining}S`}>
        {formatRestTime(snapshot.remaining)}
      </time>
    </div>
  );
  const artworkError = (event: SyntheticEvent) => {
    if (event.target instanceof HTMLImageElement) setFailedArtwork(snapshot.track.artwork);
  };
  const notice = (
    <div className="preview-rest-notice" role="status">
      {status && <span>{status}</span>}
      {running && snapshot.status === 'error' && (
        <Button size="small" icon={<RotateCcw size={14} aria-hidden="true" />} onClick={player.retry}>
          {text('retry')}
        </Button>
      )}
      {running && snapshot.status === 'loading' && (
        <Button size="small" icon={<Pause size={14} aria-hidden="true" />} onClick={player.pause}>
          {text('pause')}
        </Button>
      )}
      {finished && (
        <Button size="small" onClick={close}>
          {text('back')}
        </Button>
      )}
    </div>
  );
  return (
    <>
      <input
        ref={audioInput}
        type="file"
        accept="audio/*,.mp3,.m4a,.wav,.ogg,.flac,.aac"
        hidden
        aria-label={text('chooseAudio')}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) player.selectAudio(file);
          event.currentTarget.value = '';
        }}
      />
      <Modal
        open={snapshot.phase !== 'idle' && snapshot.expanded}
        title={text('player')}
        closable={false}
        footer={null}
        width="100vw"
        destroyOnHidden
        maskClosable={false}
        onCancel={minimize}
        afterClose={returnFocus}
        className="preview-rest-dialog"
        zIndex={1400}
        styles={{
          body: { padding: 0 },
          mask: {
            background: 'color-mix(in srgb, var(--background) 62%, transparent)',
            backdropFilter: 'blur(18px) saturate(.8)',
          },
        }}
      >
        <div
          className="preview-rest-full"
          data-theme={resolvedMode === 'dark' ? 'dark' : 'light'}
          data-sound-silent
          onErrorCapture={artworkError}
        >
          <div className="preview-rest-center">
            <div className="preview-rest-player-area">
              <header className="preview-rest-toolbar">
                {timer}
                <div className="preview-rest-actions">
                  <Button
                    type="text"
                    icon={
                      fullScreen ? (
                        <Shrink size={17} aria-hidden="true" />
                      ) : (
                        <Expand size={17} aria-hidden="true" />
                      )
                    }
                    aria-label={text(fullScreen ? 'exitFullScreen' : 'fullScreen')}
                    onClick={() => void toggleFullScreen()}
                  />
                  <Button
                    type="text"
                    icon={<Minimize2 size={17} aria-hidden="true" />}
                    aria-label={text('minimize')}
                    onClick={minimize}
                  />
                  <Button
                    type="text"
                    icon={<X size={18} aria-hidden="true" />}
                    aria-label={text('close')}
                    onClick={close}
                  />
                </div>
              </header>
              <MediaPlayer {...playerProps} volume={snapshot.volume} onVolumeChange={player.setVolume} />
              <footer className="preview-rest-footer">
                <p>{snapshot.track.file ? text('filePrivate') : REST_TRACK_VERSION}</p>
                <div className="preview-rest-source-row">
                  {snapshot.track.file ? (
                    <span>{text('localAudio')}</span>
                  ) : (
                    <a href={REST_TRACK_ALBUM_URL} target="_blank" rel="noopener noreferrer">
                      {REST_TRACK_ALBUM}
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  )}
                  <span>{text(snapshot.minutes === 30 ? 'loop' : 'stopAtEnd')}</span>
                </div>
                {notice}
                {screenError && <p role="status">{text('fullScreenError')}</p>}
                {!finished && (
                  <div className="preview-rest-source-actions">
                    <Button
                      type={preparing ? 'primary' : 'text'}
                      icon={<FolderOpen size={15} aria-hidden="true" />}
                      onClick={() => audioInput.current?.click()}
                    >
                      {text(snapshot.track.file || snapshot.track.url ? 'changeAudio' : 'chooseAudio')}
                    </Button>
                    {snapshot.track.file && REST_TRACK.url && (
                      <Button type="text" onClick={player.useDefault}>
                        {text('playDefault')}
                      </Button>
                    )}
                  </div>
                )}
              </footer>
            </div>
          </div>
        </div>
      </Modal>
      {snapshot.phase !== 'idle' &&
        !snapshot.expanded &&
        createPortal(
          <aside
            className="preview-rest-mini"
            aria-label={text('player')}
            data-theme={resolvedMode === 'dark' ? 'dark' : 'light'}
            data-sound-silent
            onErrorCapture={artworkError}
          >
            <header className="preview-rest-mini-toolbar">
              {timer}
              <div className="preview-rest-actions">
                <Button
                  type="text"
                  size="small"
                  icon={<Maximize2 size={15} aria-hidden="true" />}
                  aria-label={text('expand')}
                  onClick={player.expand}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<X size={16} aria-hidden="true" />}
                  aria-label={text('close')}
                  onClick={close}
                />
              </div>
            </header>
            <NowPlaying
              {...playerProps}
              className="preview-rest-now-playing"
              expanded={false}
              onExpandedChange={player.expand}
            />
            {status && (
              <div className="preview-rest-mini-notice">
                {notice}
                {preparing && (
                  <Button size="small" onClick={player.expand}>
                    {text('chooseAudio')}
                  </Button>
                )}
              </div>
            )}
          </aside>,
          document.body,
        )}
    </>
  );
}
