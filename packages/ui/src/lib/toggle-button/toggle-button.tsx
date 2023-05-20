import { type ComponentProps, forwardRef, memo } from 'react';
import { Root, type ToggleProps } from '@radix-ui/react-toggle';
import { clsx } from 'clsx';

import { Button } from '../button/index.ts';

import styles from './toggle-button.module.css';

interface Props extends ToggleProps, Omit<ComponentProps<typeof Button>, 'variant'> {
  /**
   * @default "flat"
   */
  variant?: 'flat';
}

export const ToggleButton = memo(
  forwardRef<HTMLButtonElement, Props>(
    ({ pressed, onPressedChange, defaultPressed, className, variant = 'flat', ...props }, ref) => {
      return (
        <Root asChild pressed={pressed} defaultPressed={defaultPressed} onPressedChange={onPressedChange}>
          <Button {...props} variant={variant} className={clsx(styles['variant--flat'], className)} ref={ref} />
        </Root>
      );
    }
  )
);

ToggleButton.displayName = 'ToggleButton';
