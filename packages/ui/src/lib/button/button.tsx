import { Children, type ComponentProps, type ElementType, forwardRef, isValidElement } from 'react';
import { classed as css, type VariantProps } from '@tw-classed/core';
import { clsx } from 'clsx';

import { flexCss, type FlexVariants } from '../flex/flex.tsx';
import { Icon } from '../icon/index.ts';

import styles from './button.module.css';

interface ButtonOwnProps extends VariantProps<typeof buttonCss> {
  icon?: ElementType;
  label?: string;
  popovertarget?: string;
}

interface ButtonProps extends ButtonOwnProps, ComponentProps<'button'> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    icon,
    label,
    type = 'button',
    display,
    main,
    cross,
    flow,
    gap,
    variant,
    // only for the icon, other defaults are defined in `buttonCss`
    size = 'md',
    disabled,
    children,
    className,
    ...rest
  } = props;
  return (
    <button
      {...rest}
      className={clsx(
        buttonCss({ display, main, cross, flow, gap, variant, size }),
        isIconButton(props) && styles['button--icon'],
        className
      )}
      aria-label={label}
      title={label}
      disabled={disabled}
      aria-disabled={disabled}
      type={type}
      ref={ref}
    >
      {children}
      {icon ? <Icon as={icon} size={size} /> : null}
    </button>
  );
});

Button.displayName = 'Button';

interface LinkButtonProps extends ButtonOwnProps, ComponentProps<'a'> {}

const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>((props, ref) => {
  const {
    icon,
    label,
    display,
    main,
    cross,
    flow,
    gap,
    variant,
    // only for the icon, other defaults are defined in `buttonCss`
    size = 'md',
    children,
    className,
    ...rest
  } = props;
  return (
    <a
      {...rest}
      className={clsx(
        styles['link-button'],
        buttonCss({ display, main, cross, flow, gap, variant, size }),
        isIconButton(props) && styles['button--icon'],
        className
      )}
      aria-label={label}
      title={label}
      ref={ref}
    >
      {icon ? <Icon as={icon} size={size} /> : null}
      {children}
    </a>
  );
});

/**
 * Checks if the Button has only icon inside.
 * CSS-only :has(>svg:only-child) would not count text nodes.
 */
function isIconButton(props: ButtonProps | LinkButtonProps) {
  // icon passed as props
  if (props.icon) return Children.count(props.children) === 0;

  // icon used as children
  return Children.count(props.children) === 1 && isValidElement(props.children) && props.children.type === Icon;
}

const buttonCss = css(styles.button, flexCss, {
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
    ...{
      ...({
        display: 'inline',
        main: 'center',
        cross: 'center',
        flow: 'row',
        gap: 'sm',
      } satisfies FlexVariants),
    },
    variant: 'flat',
    size: 'md',
  },
});

export { Button, LinkButton };
