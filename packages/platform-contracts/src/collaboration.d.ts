export const COLLABORATION_PROTOCOL: number;
export interface PresentationState {
  protocol: 1;
  sequence: number;
  clientId: string;
  pageKey: string;
  dialog: { key: 'order-detail'; orderId: string } | null;
}
export interface Participant {
  id: string;
  name: string;
  following: string | null;
  state: PresentationState | null;
  pointer: { x: number; y: number; surface: string } | null;
}
export function validatePresentation(
  input: unknown,
  project: import('./platform').NativeProject,
): PresentationState | null;
export function validatePointer(input: unknown): { x: number; y: number; surface: string } | null | undefined;
