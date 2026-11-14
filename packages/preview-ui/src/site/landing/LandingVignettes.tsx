/** Adapted from Animate UI homepage vignettes, fixed at 22a9236; see upstream/animate-home.
 * Values and notifications are local interaction examples, never platform metrics or writes. */
import { useState, useRef, type ComponentType } from 'react';
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
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Checkbox,
  createToastManager,
  Toast,
  ToastClose,
  ToastContent,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  useToastManager,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Switch,
} from './demo-controls';
import { useAutoplay, usePlaybackPaused } from './landing-playback';
import { Notification01 } from '../../../upstream/animate-home/icons/notification-01';
import { Favourite } from '../../../upstream/animate-home/icons/favourite';
import { Settings02 } from '../../../upstream/animate-home/icons/settings-02';
import { Sent } from '../../../upstream/animate-home/icons/sent';
import { Sparkles } from '../../../upstream/animate-home/icons/sparkles';
import { Clapperboard } from '../../../upstream/animate-home/icons/clapperboard';

function SwitchVignette() {
  const [on, setOn] = useState([true, false]);
  useAutoplay(() => setOn(([a, b]) => [!a, !b]), 1600);
  return (
    <div className="home-demo-switches">
      {['Airplane Mode', 'Wi-Fi'].map((label, index) => (
        <label key={label} className="home-demo-label">
          <Switch
            checked={on[index]}
            onCheckedChange={(value) => setOn((list) => list.map((v, i) => (i === index ? value : v)))}
          />
          {label}
        </label>
      ))}
    </div>
  );
}
const DEMO_TABS = [
  { value: 'overview', label: 'Overview', text: '12 active projects, 3 tasks due.' },
  { value: 'analytics', label: 'Analytics', text: 'Page views up 25% this week.' },
  { value: 'reports', label: 'Reports', text: '5 reports are ready to export.' },
];
function TabsVignette() {
  const [value, setValue] = useState(DEMO_TABS[0].value);
  useAutoplay(
    () =>
      setValue(
        (v) => DEMO_TABS[(DEMO_TABS.findIndex((tab) => tab.value === v) + 1) % DEMO_TABS.length].value,
      ),
    1600,
    300,
  );
  return (
    <Tabs value={value} onValueChange={setValue} className="home-demo-tabs">
      <TabsHighlight className="home-demo-tab-highlight">
        <TabsList className="home-demo-tab-list" aria-label="Example data views">
          {DEMO_TABS.map((tab) => (
            <TabsHighlightItem key={tab.value} value={tab.value}>
              <TabsTrigger className="home-demo-tab" value={tab.value}>
                {tab.label}
              </TabsTrigger>
            </TabsHighlightItem>
          ))}
        </TabsList>
      </TabsHighlight>
      <TabsContents className="home-demo-tab-panels">
        {DEMO_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="home-demo-tab-panel">
            <p>{tab.label}</p>
            <p>{tab.text}</p>
          </TabsContent>
        ))}
      </TabsContents>
    </Tabs>
  );
}
const QUESTIONS = [
  ['Is it accessible?', 'Every primitive keeps its library’s accessibility.'],
  ['Is it animated?', 'Yes, out of the box, with nothing to configure.'],
  ['Can I style it?', 'Your classes and your styles stay as they are.'],
];
function AccordionVignette() {
  const [value, setValue] = useState('0');
  useAutoplay(() => setValue((v) => String((Number(v) + 1) % 3)), 2000, 600);
  return (
    <Accordion
      type="single"
      collapsible
      value={value}
      onValueChange={setValue}
      className="home-demo-accordion"
    >
      {QUESTIONS.map(([question, answer], index) => (
        <AccordionItem key={question} value={String(index)}>
          <AccordionTrigger>{question}</AccordionTrigger>
          <AccordionContent>{answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
const TASKS = ['Book the studio', 'Send the estimate', 'Pick a typeface'];
function ChecklistVignette() {
  const [done, setDone] = useState(0);
  useAutoplay(() => setDone((count) => (count + 1) % (TASKS.length + 1)), 1100, 200);
  return (
    <div className="home-demo-checklist">
      {TASKS.map((task, index) => (
        <label key={task} className="home-demo-label">
          <Checkbox checked={index < done} onCheckedChange={(value) => setDone(value ? index + 1 : index)} />
          <span data-complete={index < done}>{task}</span>
        </label>
      ))}
    </div>
  );
}
const DENSITIES = ['Default', 'Comfortable', 'Compact'];
function RadioVignette() {
  const [value, setValue] = useState(DENSITIES[1]);
  useAutoplay(() => setValue((v) => DENSITIES[(DENSITIES.indexOf(v) + 1) % DENSITIES.length]), 1300, 500);
  return (
    <RadioGroup value={value} onValueChange={setValue} aria-label="Example density">
      {DENSITIES.map((density) => (
        <label key={density} className="home-demo-label">
          <RadioGroupItem value={density} />
          {density}
        </label>
      ))}
    </RadioGroup>
  );
}
const NOTIFICATIONS = [{ title: 'Event created' }, { title: 'Changes saved' }, { title: 'Invite sent' }];
function ToastStack() {
  const { toasts } = useToastManager();
  return toasts.map((item) => (
    <Toast key={item.id} toast={item}>
      <ToastContent>
        <ToastTitle />
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}
function ToastVignette() {
  const [manager] = useState(() => createToastManager());
  const next = useRef(0);
  const shown = useRef<string[]>([]);
  useAutoplay(
    () => {
      shown.current.push(manager.add({ ...NOTIFICATIONS[next.current], timeout: 4200 }));
      while (shown.current.length > 3) manager.close(shown.current.shift()!);
      next.current = (next.current + 1) % NOTIFICATIONS.length;
    },
    1600,
    300,
  );
  return (
    <ToastProvider toastManager={manager} limit={2}>
      <div className="home-demo-toast-stage">
        <ToastViewport>
          <ToastStack />
        </ToastViewport>
      </div>
    </ToastProvider>
  );
}
function CounterVignette() {
  const [count, setCount] = useState(12480);
  useAutoplay(() => setCount((c) => c + 37 + Math.round(Math.random() * 90)), 1500);
  return (
    <div className="home-demo-counter" aria-label="Example installation counter">
      <SlidingNumber number={count} thousandSeparator="," className="home-demo-counter-number" />
      <span>installs this week</span>
    </div>
  );
}
const ICONS: [string, ComponentType<{ size?: number }>][] = [
  ['notification', Notification01],
  ['favourite', Favourite],
  ['settings', Settings02],
  ['sent', Sent],
  ['sparkles', Sparkles],
  ['clapperboard', Clapperboard],
];
function IconsVignette() {
  const paused = usePlaybackPaused();
  return (
    <div className="home-demo-icons" aria-label="Animated icon examples">
      {ICONS.map(([name, Icon], index) => (
        <AnimateIcon key={name} animate={!paused} loop loopDelay={600 + index * 150} animateOnHover={paused}>
          <span className="home-demo-icon" title={name}>
            <Icon size={26} />
          </span>
        </AnimateIcon>
      ))}
    </div>
  );
}
const STEPS = [18, 46, 74, 100];
function ProgressVignette() {
  const [step, setStep] = useState(0);
  useAutoplay(() => setStep((s) => (s + 1) % STEPS.length), 1000, 100);
  return (
    <div className="home-demo-progress-example">
      <div>
        <span>Uploading</span>
        <span>
          <SlidingNumber number={STEPS[step]} />%
        </span>
      </div>
      <Progress value={STEPS[step]} aria-label="Example upload progress" />
    </div>
  );
}
export const VIGNETTES: { title: string; Vignette: ComponentType }[] = [
  { title: 'Switch', Vignette: SwitchVignette },
  { title: 'Tabs', Vignette: TabsVignette },
  { title: 'Accordion', Vignette: AccordionVignette },
  { title: 'Checkbox', Vignette: ChecklistVignette },
  { title: 'Sliding Number', Vignette: CounterVignette },
  { title: 'Radio Group', Vignette: RadioVignette },
  { title: 'Icons', Vignette: IconsVignette },
  { title: 'Toast', Vignette: ToastVignette },
  { title: 'Progress', Vignette: ProgressVignette },
];
