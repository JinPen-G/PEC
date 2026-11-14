/** Animate UI's agent-window composition and example clock, adapted to host MCP scenarios.
 * This component never calls an MCP server or writes files; all results are labeled examples. */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import {
  blur,
  ease,
  scale,
  spring,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';
import { AnimateIcon } from '@animate-ui/react/icons';
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@animate-ui/react/primitives/tabs';
import { TypingText } from '@animate-ui/react/primitives/texts/typing';
import { ShimmeringText } from '@animate-ui/react/primitives/texts/shimmering';
import { ArrowRight, Check, CircleCheck, FileText, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { Notification01 } from '../../../upstream/animate-home/icons/notification-01';
import { usePageVisible } from './landing-playback';

export type LandingScenario = {
  id: string;
  label: string;
  prompt: string;
  steps: string[];
  result: string;
  preview: 'read' | 'source' | 'governance' | 'updates';
};
const TYPE_MS = 26;
const STEP_MS = 750;
const HOLD_MS = 5600;
function Rich({ text }: { text: string }) {
  return text.split('`').map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part));
}
function useScenarioClock(scenario: LandingScenario, running: boolean, onDone: () => void) {
  const reduce = useShouldReduceMotion();
  const [progress, setProgress] = useState(-1);
  const done = useRef(onDone);
  const clock = useRef({ elapsed: 0, last: 0, fired: false });
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    if (!running || reduce) return;
    clock.current.last = performance.now();
    const tick = () => {
      const now = performance.now();
      clock.current.elapsed += now - clock.current.last;
      clock.current.last = now;
      const typed = [...scenario.prompt].length * TYPE_MS + 450;
      const step = Math.min(scenario.steps.length, Math.floor((clock.current.elapsed - typed) / STEP_MS));
      setProgress(step);
      if (
        clock.current.elapsed >= typed + scenario.steps.length * STEP_MS + HOLD_MS &&
        !clock.current.fired
      ) {
        clock.current.fired = true;
        done.current();
      }
    };
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [running, reduce, scenario]);
  return reduce ? scenario.steps.length : progress;
}
function StepIcon({ done, running }: { done: boolean; running: boolean }) {
  const pop = useTempoTransition(spring.pop);
  const fade = useTempoTransition({ duration: 0.15, ease: ease.out });
  return (
    <span className="home-agent-step-icon">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={done ? 'done' : 'working'}
          initial={{ opacity: 0, scale: scale.icon, filter: blur.icon }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: blur.icon, transition: fade }}
          transition={pop}
        >
          {done ? (
            <CircleCheck size={16} className="home-agent-check" />
          ) : (
            <LoaderCircle size={16} className="home-agent-spinner" data-playing={running} />
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
function ReadPreview({ playing, text }: { playing: boolean; text: (value: string) => string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'read'>('idle');
  const [pressed, setPressed] = useState(false);
  const press = useTempoTransition(spring.press);
  const swap = useTempoTransition({ duration: 0.3, ease: ease.out });
  const exit = useTempoTransition({ duration: 0.15, ease: ease.out });
  useEffect(() => {
    if (!playing) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const at of [300, 3600]) {
      timers.push(setTimeout(() => setPressed(true), at));
      timers.push(
        setTimeout(() => {
          setPressed(false);
          setState('loading');
        }, at + 140),
      );
      timers.push(setTimeout(() => setState('read'), at + 1500));
      timers.push(setTimeout(() => setState('idle'), at + 2900));
    }
    return () => timers.forEach(clearTimeout);
  }, [playing]);
  const Icon = state === 'loading' ? LoaderCircle : state === 'read' ? Check : FileText;
  return (
    <motion.div
      className="home-agent-read-button"
      animate={{ scale: pressed ? scale.press : 1 }}
      transition={press}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 8, filter: blur.surface }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: blur.surface, transition: exit }}
          transition={swap}
        >
          <Icon
            size={16}
            className={state === 'loading' ? 'home-agent-spinner' : undefined}
            data-playing={playing}
          />
          {text(state === 'loading' ? '读取中…' : state === 'read' ? '已读取需求' : '读取需求原文')}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}
function SourcePreview({ playing, text }: { playing: boolean; text: (value: string) => string }) {
  const files = [
    text('组件入口.tsx'),
    text('样式.css'),
    text('依赖清单.json'),
    text('辅助模块.ts'),
    text('来源与许可'),
  ];
  const [rows, setRows] = useState([0, 2]);
  const reflow = useTempoTransition(spring.reflow);
  const swap = useTempoTransition({ duration: 0.3, ease: ease.out });
  const exit = useTempoTransition({ duration: 0.2, ease: ease.out });
  useEffect(() => {
    if (!playing) return;
    let next = 0;
    const moves = [
      [0, 2, 1],
      [2, 1],
      [2, 1, 3],
      [1, 3],
      [4, 1, 3],
      [4, 3],
    ];
    const interval = setInterval(() => setRows(moves[next++ % moves.length]), 950);
    return () => clearInterval(interval);
  }, [playing]);
  return (
    <ul className="home-agent-files">
      <AnimatePresence mode="popLayout" initial={false}>
        {rows.map((index) => (
          <motion.li
            key={index}
            layout
            initial={{ opacity: 0, y: 10, filter: blur.surface }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: blur.surface, transition: exit }}
            transition={{ layout: reflow, default: swap }}
          >
            <span className="home-agent-file-box" />
            {files[index]}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
function GovernancePreview({ finished, text }: { finished: boolean; text: (value: string) => string }) {
  const rows = [
    [text('需求依据'), text('确认来源与版本'), text('先核对')],
    [text('任务与协作'), text('拆任务，保留他人修改'), text('按范围')],
    [text('验证与交付'), text('用实际结果说明完成情况'), text('留证据')],
    [text('Git 与清理'), text('授权内同步，清理自产临时文件'), text('可接续')],
  ];
  const reveal = useTempoTransition({ duration: 0.35, ease: ease.out });
  return (
    <div className="home-agent-governance">
      {rows.map(([label, detail, verdict], index) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 8, filter: blur.surface }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ ...reveal, delay: index * 0.1 }}
        >
          <span>
            <strong>{label}</strong>
            <small>{detail}</small>
          </span>
          <span className="home-agent-verdict">{verdict}</span>
        </motion.div>
      ))}
      {finished && (
        <p>
          <ShieldCheck size={16} />
          {text('是否在你的工程中采用这套治理规范？')}
        </p>
      )}
    </div>
  );
}
function UpdatesPreview({ playing, text }: { playing: boolean; text: (value: string) => string }) {
  return (
    <div className="home-agent-updates">
      <AnimateIcon animate={playing} loop loopDelay={700} animateOnHover>
        <span className="home-agent-update-icon">
          <Notification01 size={36} />
        </span>
      </AnimateIcon>
      <span>{text('开始或继续任务前，先查看更新。')}</span>
    </div>
  );
}
function ScenarioPane({
  scenario,
  running,
  onDone,
  text,
}: {
  scenario: LandingScenario;
  running: boolean;
  onDone: () => void;
  text: (value: string) => string;
}) {
  const progress = useScenarioClock(scenario, running, onDone);
  const reduce = useShouldReduceMotion();
  const finished = progress >= scenario.steps.length;
  const reveal = useTempoTransition({ duration: 0.35, ease: ease.out });
  const exit = useTempoTransition({ duration: 0.15, ease: ease.out });
  const playing = running && finished && !reduce;
  return (
    <div className="home-agent-panes">
      <div className="home-agent-conversation">
        <div className="home-agent-prompt">
          <ArrowRight size={16} />
          {running ? (
            <TypingText key={scenario.id} text={scenario.prompt} duration={TYPE_MS} />
          ) : (
            <span>{scenario.prompt}</span>
          )}
        </div>
        <ol className="home-agent-steps">
          {scenario.steps.map((step, index) =>
            progress >= index ? (
              <motion.li
                key={step}
                initial={{ opacity: 0, y: 6, filter: blur.icon }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={reveal}
              >
                <StepIcon done={progress > index} running={running} />
                <span data-done={progress > index}>
                  {progress === index && running && !reduce ? (
                    <ShimmeringText
                      text={step.replaceAll('`', '')}
                      color="var(--home-muted)"
                      shimmeringColor="var(--foreground)"
                    />
                  ) : (
                    <Rich text={step} />
                  )}
                </span>
              </motion.li>
            ) : null,
          )}
        </ol>
        <AnimatePresence>
          {finished && (
            <motion.div
              className="home-agent-result"
              initial={{ opacity: 0, y: 6, filter: blur.icon }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, transition: exit }}
              transition={reveal}
            >
              <Sparkles size={14} />
              <span>
                <Rich text={scenario.result} />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="home-agent-preview">
        <span className="home-agent-localhost">{text('本地开发 · 示例')}</span>
        <div className="home-agent-preview-content">
          {scenario.preview === 'read' ? (
            <ReadPreview playing={playing} text={text} />
          ) : scenario.preview === 'source' ? (
            <SourcePreview playing={playing} text={text} />
          ) : scenario.preview === 'governance' ? (
            <GovernancePreview finished={finished} text={text} />
          ) : (
            <UpdatesPreview playing={playing} text={text} />
          )}
        </div>
      </div>
    </div>
  );
}
export function LandingAgentDemo({
  scenarios,
  text = (value) => value,
}: {
  scenarios: LandingScenario[];
  text?: (value: string) => string;
}) {
  const [active, setActive] = useState(scenarios[0].id);
  const [auto, setAuto] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useInView(ref, { margin: '-80px' });
  const visible = usePageVisible();
  const running = onScreen && visible;
  return (
    <div
      ref={ref}
      className="home-agent-demo"
      data-slot="ai-demo"
      data-playing={running}
      onFocusCapture={() => setAuto(false)}
    >
      <Tabs
        value={active}
        onValueChange={(value) => {
          setAuto(false);
          setActive(value);
        }}
        className="home-agent-tabs"
      >
        <TabsHighlight className="home-agent-tab-highlight">
          <TabsList aria-label={text('MCP 开发场景')} className="home-agent-tab-list">
            {scenarios.map((scenario) => (
              <TabsHighlightItem key={scenario.id} value={scenario.id}>
                <TabsTrigger className="home-agent-tab" value={scenario.id}>
                  {scenario.label}
                </TabsTrigger>
              </TabsHighlightItem>
            ))}
          </TabsList>
        </TabsHighlight>
        <div className="home-agent-window">
          <div className="home-agent-window-bar">
            <span aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>~/my-app</span>
            <small>{text('MCP 工作流演示')}</small>
          </div>
          <TabsContents className="home-agent-window-panels">
            {scenarios.map((scenario) => (
              <TabsContent key={scenario.id} value={scenario.id}>
                <ScenarioPane
                  key={`${scenario.id}-${active === scenario.id ? 'active' : 'idle'}`}
                  scenario={scenario}
                  running={running && active === scenario.id}
                  text={text}
                  onDone={() => {
                    if (!auto) return;
                    const index = scenarios.findIndex((item) => item.id === active);
                    setActive(scenarios[(index + 1) % scenarios.length].id);
                  }}
                />
              </TabsContent>
            ))}
          </TabsContents>
        </div>
      </Tabs>
    </div>
  );
}
