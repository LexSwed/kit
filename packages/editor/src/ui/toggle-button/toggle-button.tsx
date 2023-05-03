import { As, ToggleButton as KToggleButton } from '@kobalte/core';
import { tv } from 'tailwind-variants';

import { Button } from '../button';

import styles from './toggle-button.module.css';
import { splitProps, type ComponentProps } from 'solid-js';

interface Props
  extends Omit<KToggleButton.ToggleButtonRootOptions, 'children' | 'onChange'>,
    Omit<ComponentProps<typeof Button>, 'variant'> {
  variant?: 'flat';
  onPressedChange?: KToggleButton.ToggleButtonRootOptions['onChange'];
}

export function ToggleButton(props: Props) {
  const [toggleButton, others] = splitProps(props, ['pressed', 'defaultPressed', 'onPressedChange']);
  return (
    <KToggleButton.Root asChild {...toggleButton} onChange={toggleButton.onPressedChange}>
      <As component={Button} {...others} class={toggleButtonCss({ variant: others.variant, class: others.class })} />
    </KToggleButton.Root>
  );
}

const toggleButtonCss = tv({
  variants: {
    variant: {
      flat: styles['variant--flat'],
    },
  },
  defaultVariants: {
    variant: 'flat',
  },
});
