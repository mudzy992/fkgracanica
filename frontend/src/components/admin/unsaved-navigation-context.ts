import { createContext, useContext, useLayoutEffect, useRef } from 'react';

export type DirtyCheck = () => boolean;
export type Register = (check: DirtyCheck) => () => void;
export const UnsavedContext = createContext<Register | null>(null);

/** Samo otvorena forma se registruje; stanje se čita u trenutku navigacije. */
export function useUnsavedNavigation(open: boolean, isDirty: DirtyCheck) {
  const register = useContext(UnsavedContext);
  const current = useRef(isDirty);
  useLayoutEffect(() => { current.current = isDirty; }, [isDirty]);
  useLayoutEffect(() => {
    if (!open || !register) return;
    return register(() => current.current());
  }, [open, register]);
}
