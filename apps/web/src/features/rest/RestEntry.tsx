import { useContext, useRef, useState } from 'react';
import { Coffee, Timer } from 'lucide-react';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@preview/ui/admin';
import { RestContext, useRest } from './rest-context';
import { formatRestTime, REST_MINUTES } from './rest-session';
import { useRestText } from './rest-locale';
import './rest-player.css';

function Entry({ surface }: { surface?: 'site' }) {
  const { player, snapshot, entry } = useRest();
  const text = useRestText();
  const [open, setOpen] = useState(false);
  const starting = useRef(false);
  if (snapshot.phase !== 'idle')
    return (
      <Button
        ref={entry}
        type="text"
        className={`preview-rest-entry${surface === 'site' ? ' preview-rest-site-entry' : ''}`}
        icon={<Coffee size={17} aria-hidden="true" />}
        aria-label={text('expand')}
        aria-expanded={snapshot.expanded}
        onClick={player.expand}
        data-sound-silent
      >
        <span>{snapshot.phase === 'finished' ? text('finished') : formatRestTime(snapshot.remaining)}</span>
      </Button>
    );
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        starting.current = false;
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          ref={entry}
          type="text"
          className={`preview-rest-entry${surface === 'site' ? ' preview-rest-site-entry' : ''}`}
          icon={<Coffee size={17} aria-hidden="true" />}
          aria-label={text('choose')}
          data-sound-silent
        >
          <span className="preview-rest-entry-label">{text('rest')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="preview-rest-chooser"
        aria-label={text('choose')}
        onCloseAutoFocus={(event) => {
          if (starting.current) event.preventDefault();
        }}
      >
        <h2>{text('takeBreak')}</h2>
        <p>{text('relax')}</p>
        <div className="preview-rest-durations">
          {REST_MINUTES.map((minutes) => (
            <Button
              key={minutes}
              icon={<Timer size={16} aria-hidden="true" />}
              onClick={() => {
                starting.current = true;
                setOpen(false);
                player.start(minutes);
              }}
              data-sound-silent
            >
              {text(minutes === 10 ? 'short' : 'long')}
            </Button>
          ))}
        </div>
        <span>Taylor Swift · All Too Well</span>
        <span>{text('editionNote')}</span>
      </PopoverContent>
    </Popover>
  );
}

export function RestEntry({ surface }: { surface?: 'site' }) {
  const context = useContext(RestContext);
  return context ? <Entry surface={surface} /> : null;
}
