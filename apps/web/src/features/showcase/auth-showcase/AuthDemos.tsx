/** Demo compositions from observed UIARC login examples. Fixed MIT primitives
 * keep their motion; confirmation, charts and timers only use synthetic state. */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Circle,
  CircleDashed,
  CircleDot,
  CircleDotDashed,
  CircleCheck,
  CircleX,
  FolderClosed,
  Trash2,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Minus,
  OctagonAlert,
  User,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';
import {
  SiteMorphSelect as MorphSelect,
  SiteConfirmMorph as ConfirmMorph,
  type ConfirmMorphMode,
  SiteLineChart as LineChart,
  type LineChartDatum,
  SiteAnimatedCounter as AnimatedCounter,
  SiteIconMorph as IconMorph,
  type IconMorphName,
  SiteCountdown as Countdown,
  SiteColorPicker as ColorPicker,
  SiteSegmentedControl as SegmentedControl,
  SiteButton as Button,
} from '@preview/ui';

function useDemoCopy() {
  const [result, setResult] = useState<'idle' | 'copied' | 'failed'>('idle');
  const state = useRef({ alive: true, generation: 0, timer: 0 });
  useEffect(() => {
    const current = state.current;
    current.alive = true;
    return () => {
      current.alive = false;
      current.generation++;
      window.clearTimeout(current.timer);
    };
  }, []);
  const copy = async (value: string) => {
    const current = state.current,
      generation = ++current.generation;
    window.clearTimeout(current.timer);
    let next: 'copied' | 'failed' = 'copied';
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      next = 'failed';
    }
    if (!current.alive || generation !== current.generation) return;
    setResult(next);
    current.timer = window.setTimeout(() => {
      if (current.alive && generation === current.generation) setResult('idle');
    }, 1600);
  };
  return { result, copy };
}

function SelectDemo() {
  const [events, setEvents] = useState(['Emma Collins opened this issue']);
  const log = (field: string) => (_value: string, option: { label: string }) =>
    setEvents((previous) => [`You set ${field} to ${option.label}`, ...previous].slice(0, 3));
  const mark = (Icon: typeof Circle) => <Icon size={16} strokeWidth={1.75} />;
  const statuses = [
    {
      label: 'Open',
      options: [
        { value: 'backlog', label: 'Backlog', icon: mark(CircleDashed) },
        { value: 'todo', label: 'Todo', icon: mark(Circle) },
        { value: 'in-progress', label: 'In progress', icon: mark(CircleDotDashed) },
        { value: 'in-review', label: 'In review', icon: mark(CircleDot) },
      ],
    },
    {
      label: 'Closed',
      options: [
        { value: 'done', label: 'Done', icon: mark(CircleCheck) },
        { value: 'canceled', label: 'Canceled', icon: mark(CircleX) },
      ],
    },
  ];
  const names = [
    'Emma Collins',
    'Jasmine Brooks',
    'Marcus Johnson',
    'Olivia Bennett',
    'Daniel Kim',
    'Mateo Alvarez',
    'Hannah Walsh',
    'Jordan Reyes',
  ];
  return (
    <div className="morph-select_stage__gmb39">
      <article className="morph-select_card__GG2_A">
        <header className="morph-select_header__EY2Hf">
          <h3 className="morph-select_title__quSvi">Checkout button stalls on Safari 17</h3>
          <p className="morph-select_body__GLxkC">
            Tapping Pay leaves the spinner running after the card is approved. Reproduced on iOS and macOS.
          </p>
        </header>
        <dl className="morph-select_properties__SyflY">
          <div className="morph-select_row__I8MaC">
            <dt>Status</dt>
            <dd>
              <MorphSelect
                label="Status"
                hideLabel
                items={statuses}
                defaultValue="in-progress"
                align="end"
                panelWidth={232}
                onValueChange={log('status')}
              />
            </dd>
          </div>
          <div className="morph-select_row__I8MaC">
            <dt>Assignee</dt>
            <dd>
              <MorphSelect
                label="Assignee"
                hideLabel
                items={[
                  { value: 'unassigned', label: 'Unassigned', icon: mark(User) },
                  ...names.map((name) => ({
                    value: name,
                    label: name,
                    icon:
                      name === 'Marcus Johnson' ? (
                        <img src="/auth-assets/marcus-johnson.svg" alt="" width={20} height={20} />
                      ) : (
                        mark(User)
                      ),
                  })),
                ]}
                defaultValue="Marcus Johnson"
                align="end"
                panelWidth={264}
                searchPlaceholder="Find a teammate"
                onValueChange={log('assignee')}
              />
            </dd>
          </div>
          <div className="morph-select_row__I8MaC">
            <dt>Priority</dt>
            <dd>
              <MorphSelect
                label="Priority"
                hideLabel
                items={[
                  { value: 'none', label: 'No priority', icon: mark(Minus) },
                  { value: 'urgent', label: 'Urgent', icon: mark(OctagonAlert) },
                  { value: 'high', label: 'High', icon: mark(SignalHigh) },
                  { value: 'medium', label: 'Medium', icon: mark(SignalMedium) },
                  { value: 'low', label: 'Low', icon: mark(SignalLow) },
                ]}
                defaultValue="high"
                align="end"
                panelWidth={208}
                onValueChange={log('priority')}
              />
            </dd>
          </div>
        </dl>
        <ol className="morph-select_log__CiQgo" aria-label="Activity" aria-live="polite">
          {events.map((event, index) => (
            <motion.li
              key={`${event}/${index}`}
              className="morph-select_entry__3lui0"
              initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            >
              {event}
            </motion.li>
          ))}
        </ol>
      </article>
    </div>
  );
}
function ConfirmDemo() {
  const [exists, setExists] = useState(true),
    [mode, setMode] = useState<ConfirmMorphMode>('press'),
    [outcome, setOutcome] = useState('succeed');
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const confirm = async () => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    if (outcome === 'fail') throw new Error('Simulated failure');
    if (alive.current) setExists(false);
  };
  return (
    <div className="confirm-morph_demo__hRt_s">
      <div className="confirm-morph_stage__fWddx">
        <div className="confirm-morph_row__qSgX_">
          <div className="confirm-morph_slot__CBMFR">
            <span className={exists ? 'confirm-morph_project__CYV3W' : 'confirm-morph_empty__vhax1'}>
              {exists ? (
                <>
                  <FolderClosed size={16} />
                  <span>Northwind redesign</span>
                </>
              ) : (
                'No projects'
              )}
            </span>
          </div>
          <ConfirmMorph
            label="Delete project"
            icon={<Trash2 strokeWidth={1.75} />}
            prompt="Delete project?"
            confirmMode={mode}
            onConfirm={confirm}
            onUndo={() => setExists(true)}
            doneLabel="Deleted"
            errorLabel="Couldn’t delete"
          />
        </div>
      </div>
      <div className="confirm-morph_controls__c7Xkg">
        <SegmentedControl
          label="Confirm with"
          options={[
            { value: 'press', label: 'Click' },
            { value: 'hold', label: 'Hold' },
            { value: 'countdown', label: 'Countdown' },
          ]}
          value={mode}
          onValueChange={(value) => setMode(value as ConfirmMorphMode)}
        />
        <SegmentedControl
          label="Delete outcome"
          options={[
            { value: 'succeed', label: 'Succeeds' },
            { value: 'fail', label: 'Fails' },
          ]}
          value={outcome}
          onValueChange={setOutcome}
        />
      </div>
    </div>
  );
}
const point = (offset: number, previous: boolean) => {
  const day = new Date(Date.UTC(2026, 8, 21) - 86400000 * offset);
  const weekend = [0, 6].includes(day.getUTCDay()) ? 0.62 : 1;
  return Math.round(
    (previous ? 212 - 0.35 * offset : 248 - 0.7 * offset) *
      weekend *
      (previous || offset !== 12 ? (previous || offset !== 11 ? 1 : 1.45) : 2.1) *
      (1 + 0.16 * ((43758.5453 * Math.sin(12.9898 * (offset + 400 * Number(previous)))) % 1)),
  );
};
function chartData(length: number): LineChartDatum[] {
  return Array.from({ length }, (_, index) => {
    const offset = length - 1 - index,
      day = new Date(Date.UTC(2026, 8, 21) - 86400000 * offset);
    return {
      key: day.toISOString(),
      label: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      axisLabel:
        length <= 7 || day.getUTCDay() === 1
          ? day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
          : undefined,
      values: { current: point(offset, false), previous: point(offset, true) },
    };
  });
}
function ChartDemo() {
  const [range, setRange] = useState('30'),
    [active, setActive] = useState<LineChartDatum | null>(null);
  const data = chartData(Number(range)),
    total = data.reduce((sum, item) => sum + (item.values.current ?? 0), 0),
    previous = data.reduce((sum, item) => sum + (item.values.previous ?? 0), 0);
  return (
    <section className="line-chart_card__H2N3v">
      <div className="line-chart_top__P5lwX">
        <h3 className="line-chart_title__QUpqA">Trial signups</h3>
        <SegmentedControl
          label="Range"
          options={[
            { value: '7', label: '7 days' },
            { value: '30', label: '30 days' },
            { value: '90', label: '90 days' },
          ]}
          value={range}
          onValueChange={(value) => {
            setRange(value);
            setActive(null);
          }}
        />
      </div>
      <div className="line-chart_readout__zD5s2">
        <AnimatedCounter value={active?.values.current ?? total} label="Total signups" />
        <p className="line-chart_note__IoBSK">
          {active
            ? `${active.values.previous} in the previous period`
            : `+${(((total - previous) / previous) * 100).toFixed(1)}% vs previous ${data.length} days`}
        </p>
      </div>
      <LineChart
        data={data}
        series={[
          { key: 'current', label: 'This period' },
          { key: 'previous', label: 'Previous period', dashed: true },
        ]}
        label="Trial signups"
        onActiveChange={(_index, datum) => setActive(datum)}
      />
    </section>
  );
}
const icons: { name: IconMorphName; off: string; on: string }[] = [
  { name: 'menu', off: 'Menu', on: 'Menu open' },
  { name: 'play', off: 'Paused', on: 'Playing' },
  { name: 'plus', off: 'Add to list', on: 'Added' },
  { name: 'copy', off: 'Copy command', on: 'Copied' },
  { name: 'theme', off: 'Light', on: 'Dark' },
  { name: 'chevron', off: 'Show details', on: 'Hide details' },
  { name: 'bell', off: 'Alerts off', on: 'Alerts on' },
  { name: 'heart', off: '128 likes', on: '129 likes' },
];
function IconsDemo() {
  const [state, setState] = useState<Record<string, boolean>>({ bell: true });
  const clipboard = useDemoCopy();
  return (
    <div className="icon-morph_demo__QOjNi">
      <div className="icon-morph_grid__pzg70">
        {icons.map((icon) => (
          <button
            type="button"
            key={icon.name}
            className="icon-morph_tile__JAgoS"
            data-name={icon.name}
            data-on={
              (icon.name === 'copy' ? clipboard.result === 'copied' : state[icon.name]) ? '' : undefined
            }
            aria-pressed={icon.name === 'copy' ? undefined : !!state[icon.name]}
            aria-label={icon.name === 'copy' ? icon.off : state[icon.name] ? icon.on : icon.off}
            onClick={() =>
              icon.name === 'copy'
                ? void clipboard.copy('npx arc add icon-morph')
                : setState((previous) => ({ ...previous, [icon.name]: !previous[icon.name] }))
            }
          >
            <IconMorph
              name={icon.name}
              state={icon.name === 'copy' ? clipboard.result === 'copied' : state[icon.name]}
              size={28}
            />
            <span className="icon-morph_label__kvK6j">
              {icon.name === 'copy'
                ? clipboard.result === 'copied'
                  ? 'Copied'
                  : clipboard.result === 'failed'
                    ? 'Copy failed'
                    : icon.off
                : state[icon.name]
                  ? icon.on
                  : icon.off}
            </span>
          </button>
        ))}
      </div>
      <p role="status" className="icon-morph_srOnly__Yo7Ox">
        {clipboard.result === 'copied'
          ? 'Copied install command'
          : clipboard.result === 'failed'
            ? 'Clipboard is unavailable here'
            : ''}
      </p>
    </div>
  );
}
function CountdownDemo() {
  const [target, setTarget] = useState(() => Date.now() + 5 * 86400000),
    [short, setShort] = useState(false);
  return (
    <section className="countdown_card__FoN1G">
      <header>
        <h3>Fieldwork 2.0 keynote</h3>
        <p>10:00 AM PT · Streamed online</p>
      </header>
      <div className="countdown_hero__HSdPp">
        <Countdown target={target} label="Keynote starts in" completeLabel="Live now" />
      </div>
      <ul className="countdown_sessions__1hxf_">
        {['Keynote', 'Design systems deep dive', 'Live Q&A with the team'].map((title, index) => (
          <li key={title} className="countdown_session__23BoT">
            <span>{title}</span>
            <Countdown
              variant="compact"
              target={target + [0, 5400000, 11700000][index]}
              label={`${title} starts in`}
            />
          </li>
        ))}
      </ul>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setTarget(Date.now() + (short ? 5 * 86400000 : 10500));
          setShort(!short);
        }}
      >
        {short ? 'Reset' : 'Skip to final 10 seconds'}
      </Button>
    </section>
  );
}
function ColorDemo() {
  return (
    <div className="color-picker_demo__daC0s">
      <ColorPicker
        label="Accent"
        defaultValue="#2F6BFF"
        defaultSwatches={[
          { id: 'blue', color: '#2F6BFF' },
          { id: 'violet', color: '#7747ff' },
          { id: 'green', color: '#0db879' },
          { id: 'rose', color: '#ed4e9d' },
        ]}
      />
    </div>
  );
}
const phrases = ['Encrypted end to end', 'Synced in 40 ms', 'Deployed to 12 regions', 'Backed up every hour'];
/** Text and stopwatch are reconstructed from observed behavior; these two
 * implementations are not represented as the unprovided original TSX source. */
function Scramble({
  text,
  revision,
  glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  order = 'start',
}: {
  text: string;
  revision: number;
  glyphs?: string;
  order?: string;
}) {
  const reduced = useReducedMotion(),
    [shown, setShown] = useState(text);
  useEffect(() => {
    if (reduced) return;
    const started = performance.now();
    let frame = 0;
    const tick = () => {
      const progress = Math.min(1, (performance.now() - started) / 900);
      setShown(
        [...text]
          .map((character, index) => {
            const threshold =
              order === 'center'
                ? Math.abs(index - text.length / 2) / (text.length / 2)
                : order === 'random'
                  ? ((index * 7) % text.length) / text.length
                  : index / text.length;
            return /\s/.test(character) || progress > 0.3 + threshold * 0.7
              ? character
              : glyphs[(index + Math.floor(progress * 100)) % glyphs.length];
          })
          .join(''),
      );
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, revision, reduced, glyphs, order]);
  return (
    <span aria-label={text}>
      <span aria-hidden="true">{reduced ? text : shown}</span>
    </span>
  );
}
function ScrambleDemo() {
  const clipboard = useDemoCopy();
  const [phrase, setPhrase] = useState(0),
    [revision, setRevision] = useState(0),
    [glyphs, setGlyphs] = useState('Letters'),
    [order, setOrder] = useState('start'),
    [billing, setBilling] = useState('monthly'),
    [code, setCode] = useState('KX7-42Q-M9T');
  const pools: Record<string, string> = {
    Letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    Symbols: '!#$%&*+-/<=>?@[]^_{|}~',
    Binary: '01',
    Blocks: '░▒▓█▖▗▘▙▚▛▜▝▞▟',
  };
  return (
    <div className="text-scramble_demo__gTgnq">
      <section className="showcase-scramble-stage">
        <h3>
          <Scramble text={phrases[phrase]} revision={revision} glyphs={pools[glyphs]} order={order} />
        </h3>
        <div className="showcase-demo-controls">
          <SegmentedControl
            label="Glyph set"
            options={['Letters', 'Symbols', 'Binary', 'Blocks'].map((value) => ({ value, label: value }))}
            value={glyphs}
            onValueChange={setGlyphs}
          />
          <SegmentedControl
            label="Landing order"
            options={['start', 'center', 'random'].map((value) => ({
              value,
              label: value[0].toUpperCase() + value.slice(1),
            }))}
            value={order}
            onValueChange={setOrder}
          />
        </div>
        <div className="showcase-demo-controls">
          <Button variant="secondary" onClick={() => setPhrase((phrase + 1) % phrases.length)}>
            Next phrase
          </Button>
          <Button variant="ghost" onClick={() => setRevision(revision + 1)}>
            <RotateCcw size={14} />
            Replay
          </Button>
        </div>
      </section>
      <div className="showcase-scramble-tiles">
        <section>
          <div className="showcase-demo-controls">
            <span>Team plan</span>
            <SegmentedControl
              label="Billing period"
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'annual', label: 'Annual' },
              ]}
              value={billing}
              onValueChange={setBilling}
            />
          </div>
          <p className="showcase-scramble-price">
            <Scramble text={billing === 'monthly' ? '$18' : '$180'} revision={0} />{' '}
            <small>{billing === 'monthly' ? 'per seat a month' : 'per seat a year'}</small>
          </p>
        </section>
        <section>
          <div className="showcase-demo-controls">
            <span>Invite code</span>
            <button aria-label="Copy invite code" onClick={() => void clipboard.copy(code)}>
              {clipboard.result === 'copied' ? <Check size={14} /> : <Copy size={14} />}
            </button>
            <button
              aria-label="Generate a new code"
              onClick={() => setCode(Math.random().toString(36).slice(2, 11).toUpperCase())}
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <p>
            <Scramble text={code} revision={0} />
          </p>
          <p role="status" className="icon-morph_srOnly__Yo7Ox">
            {clipboard.result === 'failed'
              ? 'Copy failed'
              : clipboard.result === 'copied'
                ? 'Copied invite code'
                : ''}
          </p>
        </section>
      </div>
    </div>
  );
}
function StopwatchDemo() {
  const reduced = useReducedMotion(),
    [elapsed, setElapsed] = useState(332010),
    [running, setRunning] = useState(false),
    [analog, setAnalog] = useState(false),
    [laps, setLaps] = useState([78420, 76910, 79860, 75340]);
  const base = useRef({ at: 0, value: elapsed });
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout>;
    base.current.at = performance.now();
    const tick = () => {
      setElapsed(base.current.value + performance.now() - base.current.at);
      if (reduced) timer = setTimeout(tick, 1000);
      else frame = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [running, reduced]);
  const format = (time: number) =>
    `${String(Math.floor(time / 60000)).padStart(2, '0')}:${String(Math.floor(time / 1000) % 60).padStart(2, '0')}.${String(Math.floor(time / 10) % 100).padStart(2, '0')}`;
  return (
    <div className="stopwatch_demo__Mwjup">
      <div className="stopwatch_header__2cmyz">
        <div className="stopwatch_heading__jQKaq">
          <p className="stopwatch_title__i00LX">Tuesday intervals</p>
          <p className="stopwatch_meta__1EDHs">5 × 400 m at Franklin Field · 90 s rest</p>
        </div>
        <p className="stopwatch_target__CHKve">
          <span>Target</span>
          <span className="stopwatch_pace__a7SCt">1:18</span>
        </p>
      </div>
      <div className="showcase-stopwatch-face">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={analog ? 'ring' : 'digits'}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            {analog && (
              <svg viewBox="0 0 200 200" className="showcase-stopwatch-ring">
                <circle cx="100" cy="100" r="90" fill="none" stroke="var(--border)" strokeWidth="4" />
                {Array.from({ length: 60 }, (_, i) => (
                  <path
                    key={i}
                    d={`M100 ${i % 5 === 0 ? 12 : 16}V22`}
                    transform={`rotate(${i * 6} 100 100)`}
                    stroke="var(--text-muted)"
                    strokeWidth="1"
                  />
                ))}
                <path
                  d="M100 100V28"
                  stroke="var(--foreground)"
                  strokeWidth="3"
                  transform={`rotate(${((elapsed / 1000) % 60) * 6} 100 100)`}
                />
              </svg>
            )}
            <p className={analog ? 'showcase-stopwatch-small' : 'showcase-stopwatch-digits'}>
              {format(elapsed)}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="showcase-demo-controls">
        <SegmentedControl
          label="Display"
          options={[
            { value: 'digital', label: 'Digits' },
            { value: 'analog', label: 'Ring' },
          ]}
          value={analog ? 'analog' : 'digital'}
          onValueChange={(value) => setAnalog(value === 'analog')}
        />
      </div>
      <div className="showcase-demo-controls">
        <Button
          variant="secondary"
          onClick={() => {
            if (running)
              setLaps((previous) => [elapsed - previous.reduce((sum, time) => sum + time, 0), ...previous]);
            else {
              setElapsed(0);
              setLaps([]);
            }
          }}
        >
          {running ? 'Lap' : 'Reset'}
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            base.current.value = elapsed;
            setRunning(!running);
          }}
        >
          {running ? 'Stop' : 'Start'}
        </Button>
      </div>
      <ol className="showcase-stopwatch-laps">
        {[...laps].reverse().map((lap, index) => (
          <li key={`${index}/${lap}`}>
            <span>Lap {laps.length - index}</span>
            <span>{lap === Math.min(...laps) ? 'Fastest' : lap === Math.max(...laps) ? 'Slowest' : ''}</span>
            <i style={{ width: `${(lap / Math.max(...laps)) * 70}px` }} />
            <time>{format(lap)}</time>
          </li>
        ))}
      </ol>
    </div>
  );
}
export default function AuthDemos({ index }: { index: number }) {
  return [
    <SelectDemo />,
    <ConfirmDemo />,
    <ChartDemo />,
    <IconsDemo />,
    <CountdownDemo />,
    <ColorDemo />,
    <ScrambleDemo />,
    <StopwatchDemo />,
  ][index];
}
