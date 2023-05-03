import { splitProps, type ValidComponent } from 'solid-js';
import { tv, type VariantProps } from 'tailwind-variants';
import { Button as KButton } from '@kobalte/core';
import { Link as KLink } from '@kobalte/core';

import { flexCss } from '../flex/flex';
import { Icon } from '../icon';

import styles from './button.module.css';

interface ButtonOwnProps extends VariantProps<typeof buttonCss> {
  icon?: ValidComponent;
  label?: string;
}

interface ButtonProps extends Omit<KButton.ButtonRootProps, 'as'>, ButtonOwnProps {}

function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, ['class', 'variant', 'size', 'intent', 'label', 'icon']);
  return (
    <KButton.Root aria-label={local.label} title={local.label} class={buttonCss(local)} {...others}>
      {others.children}
      {local.icon ? <Icon as={local.icon} size={local.size} class={styles.icon} /> : null}
    </KButton.Root>
  );
}

interface LinkButtonProps extends Omit<KLink.LinkRootProps, 'as'>, ButtonOwnProps {}

function LinkButton(props: LinkButtonProps) {
  const [local, others] = splitProps(props, ['class', 'variant', 'size', 'intent', 'label', 'icon']);
  return (
    <KLink.Root aria-label={local.label} title={local.label} {...others} class={buttonCss(local)}>
      {local.icon ? <Icon as={local.icon} size={local.size} class={styles.icon} /> : null}
      {others.children}
    </KLink.Root>
  );
}

const buttonCss = tv({
  extend: [flexCss],
  base: styles.button,
  variants: {
    variant: {
      flat: styles['variant--flat'],
      primary: styles['variant--primary'],
      tonal: styles['variant--tonal'],
      outline: styles['variant--outline'],
      link: styles['variant--link'],
    },
    size: {
      xs: styles['size--xs'],
      sm: styles['size--sm'],
      md: styles['size--md'],
      lg: styles['size--lg'],
    },
    intent: {
      danger: styles['intent--danger'],
    },
  },
  defaultVariants: {
    variant: 'flat',
    size: 'md',
    icon: false,
    /* flex variants */
    main: 'center',
    cross: 'center',
    flow: 'row',
    gap: 'sm',
  },
});

export { Button, LinkButton };
