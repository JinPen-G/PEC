/** Homepage-only styling of Animate UI's original Radix and Base UI controls.
 * Source geometry and motion are retained; this is not the admin control entry. */
import type { ComponentProps, ReactNode } from 'react';
import * as SwitchPrimitive from '@animate-ui/react/primitives/radix-ui/switch';
import * as CheckboxPrimitive from '@animate-ui/react/primitives/radix-ui/checkbox';
import * as RadioPrimitive from '@animate-ui/react/primitives/radix-ui/radio-group';
import * as AccordionPrimitive from '@animate-ui/react/primitives/radix-ui/accordion';
import * as ProgressPrimitive from '@animate-ui/react/primitives/radix-ui/progress';
import { Toast as ToastPrimitive } from '@animate-ui/react/primitives/base-ui/toast';
import { Check, ChevronDown, X } from 'lucide-react';

export function Switch(props: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root {...props} className="home-demo-switch">
      <SwitchPrimitive.Thumb className="home-demo-switch-thumb" />
    </SwitchPrimitive.Root>
  );
}
export function Checkbox(props: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root {...props} className="home-demo-checkbox">
      <CheckboxPrimitive.Indicator className="home-demo-checkbox-indicator">
        <Check size={14} aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
export function RadioGroup(props: ComponentProps<typeof RadioPrimitive.Root>) {
  return <RadioPrimitive.Root {...props} className="home-demo-radio-group" />;
}
export function RadioGroupItem(props: ComponentProps<typeof RadioPrimitive.Item>) {
  return (
    <RadioPrimitive.Item {...props} className="home-demo-radio">
      <RadioPrimitive.Indicator className="home-demo-radio-indicator">
        <span />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Item>
  );
}
export const Accordion = AccordionPrimitive.Root;
export function AccordionItem(props: ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item {...props} className="home-demo-accordion-item" />;
}
export function AccordionTrigger({ children, ...props }: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="home-demo-accordion-header">
      <AccordionPrimitive.Trigger {...props} className="home-demo-accordion-trigger">
        {children}
        <ChevronDown size={14} aria-hidden="true" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}
export function AccordionContent(props: ComponentProps<typeof AccordionPrimitive.Content>) {
  return <AccordionPrimitive.Content {...props} className="home-demo-accordion-content" />;
}
export function Progress({ value = 0, ...props }: ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root {...props} value={value} className="home-demo-progress">
      <ProgressPrimitive.Indicator
        className="home-demo-progress-indicator"
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
export const createToastManager = ToastPrimitive.createToastManager;
export const useToastManager = ToastPrimitive.useToastManager;
export const ToastProvider = ToastPrimitive.Provider;
export function ToastViewport(props: ComponentProps<typeof ToastPrimitive.Viewport>) {
  return <ToastPrimitive.Viewport {...props} className="home-demo-toast-viewport" />;
}
export function Toast(props: ComponentProps<typeof ToastPrimitive.Root>) {
  return <ToastPrimitive.Root {...props} className="home-demo-toast" />;
}
export function ToastContent({ children }: { children: ReactNode }) {
  return <ToastPrimitive.Content className="home-demo-toast-content">{children}</ToastPrimitive.Content>;
}
export const ToastTitle = ToastPrimitive.Title;
export function ToastClose() {
  return (
    <ToastPrimitive.Close className="home-demo-toast-close" aria-label="Close example notification">
      <X size={14} aria-hidden="true" />
    </ToastPrimitive.Close>
  );
}
