import { type ComponentProps, forwardRef } from 'react';
import { clsx } from 'clsx';

import { FloatingList } from './floating-list.tsx';

import styles from './popover.module.css';

type PopoverBoxProps = ComponentProps<'div'>;

export const PopoverBox = forwardRef<HTMLDivElement, PopoverBoxProps>(({ className, ...props }, ref) => {
  return <FloatingList className={clsx(styles.popover, className)} {...props} ref={ref} />;
});
