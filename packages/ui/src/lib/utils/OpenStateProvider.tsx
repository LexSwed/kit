import { createContext, forwardRef, type ReactNode, useContext, useImperativeHandle, useMemo } from 'react';

import { useDerivedState } from './hooks';

const openStateContext = createContext(false);
const openStateControlsContext = createContext<MenuControlFunctions>({} as MenuControlFunctions);

export type OpenStateRef = MenuControlFunctions;

interface Props {
  defaultOpen?: boolean;
  children?: ReactNode;
  open?: boolean;
  onChange?: (open: boolean) => void;
}

export const OpenStateProvider = forwardRef<OpenStateRef, Props>(
  ({ children, defaultOpen = false, open, onChange }, ref) => {
    const [isOpen, setOpen] = useDerivedState(open, onChange, defaultOpen);
    const controls = useMemo<MenuControlFunctions>(
      () => ({
        open: () => {
          setOpen(true);
        },
        close: () => {
          setOpen(false);
        },
        toggle: () => {
          setOpen((open) => !open);
        },
        switch: (value: boolean) => {
          setOpen(value);
        },
      }),
      [setOpen]
    );

    useImperativeHandle(ref, () => controls, [controls]);

    return (
      <openStateControlsContext.Provider value={controls}>
        <openStateContext.Provider value={isOpen}>{children}</openStateContext.Provider>
      </openStateControlsContext.Provider>
    );
  }
);

OpenStateProvider.displayName = 'OpenStateProvider';

export function useOpenState() {
  return useContext(openStateContext);
}
export function useOpenStateControls() {
  return useContext(openStateControlsContext);
}
interface MenuControlFunctions {
  open: () => void;
  close: () => void;
  toggle: () => void;
  switch: (value: boolean) => void;
}
