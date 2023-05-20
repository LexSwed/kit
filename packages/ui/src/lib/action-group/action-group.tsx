import { Children, type ComponentProps, type ForwardedRef, forwardRef, isValidElement, type ReactElement } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { clsx } from 'clsx';

import { flexCss, type FlexVariants } from '../flex/flex.tsx';
import { ToggleButton } from '../toggle-button/index.ts';

import styles from './action-group.module.css';

type Props = FlexVariants &
  Omit<ToggleGroup.ToggleGroupSingleProps | ToggleGroup.ToggleGroupMultipleProps, 'direction' | 'rovingFocus' | 'as'>;

export const ActionGroup = forwardRef(
  ({ children, type = 'single', gap = 'none', className, ...props }: Props, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      // @ts-expect-error tough kid
      <ToggleGroup.Root type={type} className={clsx(flexCss({ gap, ...props }), className)} {...props} ref={ref}>
        {Children.map(children, (child) => {
          if (isValidElement(child) && child.type === ToggleButton) {
            return (
              <ToggleGroup.Item
                asChild
                value={
                  (child as ReactElement<ComponentProps<typeof ToggleButton>, typeof ToggleButton>).props
                    .value as string
                }
                key={child.key}
                className={gap === 'none' ? styles['action-group-item--no-gap'] : undefined}
              >
                {child}
              </ToggleGroup.Item>
            );
          }
          return child;
        })}
      </ToggleGroup.Root>
    );
  }
);
