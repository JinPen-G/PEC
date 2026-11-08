/** Original brand geometry. Brand assets and provenance are kept locally so
 * opening the menu does not contact assistant providers. */
import paths from './assistant-icon-paths.json';
import deepseek from './assistant-brands/deepseek.json';
import workbuddy from './assistant-brands/workbuddy.png';
export type AssistantIconName = keyof typeof paths | 'deepseek' | 'workbuddy';
export function AssistantIcon({ name }: { name: AssistantIconName }) {
  if (name === 'workbuddy')
    return (
      <img
        src={workbuddy}
        width="15"
        height="15"
        alt=""
        aria-hidden="true"
        data-assistant-icon={name}
        style={{ width: 15, height: 15, objectFit: 'cover', objectPosition: 'left', flexShrink: 0 }}
      />
    );
  return (
    <svg
      viewBox={name === 'deepseek' ? deepseek.viewBox : '0 0 24 24'}
      width="15"
      height="15"
      fill={name === 'claude' ? '#D97757' : name === 'deepseek' ? '#4D6BFE' : 'currentColor'}
      aria-hidden="true"
      data-assistant-icon={name}
    >
      <path d={name === 'deepseek' ? deepseek.path : paths[name]} />
    </svg>
  );
}
