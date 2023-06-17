import {
  type ComponentProps,
  createContext,
  forwardRef,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { type Direction, DirectionProvider } from '@radix-ui/react-direction';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { clsx } from 'clsx';

import { useForkRef, useId } from '../utils/hooks.ts';

import type { Theme } from './types.ts';
import { createThemeVariables, mergeTheme } from './utils.ts';

import styles from './theme-provider.module.css';

type Props = {
  children?: ReactNode;
  theme?: Theme;
  /**
   * Apply all CSS variables to global window. Allows accessing CSS variables from ::overlay, :root, etc.
   * Pass `false` if polluting global :root is not desirable, f.e. in client extensions.
   * @default true
   */
  globalCss?: boolean;
} & ComponentProps<'div'>;

const ThemeProvider = forwardRef<HTMLDivElement, Props>(
  ({ theme = {}, globalCss = true, className, children, ...props }, propRef) => {
    const rootRef = useFxtrotRootRef();
    const ref = useRef<HTMLDivElement>(null);
    const [direction, directionRef] = useDirection();
    const refs = useForkRef<HTMLElement>(ref, directionRef, propRef);

    // slice :r0: -> r0
    const themeClassName = `fxtrot-ui-${useId().slice(1, -1)}`;
    let css: string;
    if (globalCss) {
      css = createThemeCssText(':root, ::selection, ::before, ::after', theme);
      css += `@supports selector(::backdrop) {${createThemeCssText('::backdrop', theme)}}`;
      css += `@supports selector(::highlight(editor)) {${createThemeCssText('::highlight(editor)', theme)}}`;
    } else {
      css = createThemeCssText(`.${themeClassName}`, theme);
    }

    return (
      <rootRefContext.Provider value={rootRef.current ? rootRef : ref}>
        <DirectionProvider dir={direction}>
          <TooltipProvider delayDuration={400}>
            <>
              <style dangerouslySetInnerHTML={{ __html: css }} />
              <div {...props} className={clsx(styles['fxtrot-ui-theme'], themeClassName, className)} ref={refs}>
                {children}
              </div>
            </>
          </TooltipProvider>
        </DirectionProvider>
      </rootRefContext.Provider>
    );
  }
);

function createThemeCssText(selector: string, theme: Theme) {
  const fullTheme = mergeTheme(theme);
  const css = `${selector} {${createThemeVariables(fullTheme)
    .map((entry) => entry.join(':'))
    .join(';')};}`.trim();
  return css;
}

const rootRefContext = createContext<RefObject<HTMLElement>>({ current: null });
export const useFxtrotRootRef = () => useContext(rootRefContext);

function useDirection() {
  const [element, ref] = useState<HTMLElement | null>(null);
  const [direction, setDirection] = useState<Direction>('ltr');
  useEffect(() => {
    if (!element) {
      return;
    }
    const el = window.getComputedStyle(element);
    setDirection(el.direction as Direction);
  }, [element]);
  return [direction, ref] as const;
}

export { ThemeProvider };
