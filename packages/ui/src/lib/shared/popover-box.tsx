import { forwardRef } from 'react';
import { clsx } from 'clsx';

import { FloatingList } from './floating-list.tsx';

import styles from './popover.module.css';

export const PopoverBox = forwardRef(({ className, ...props }, ref) => {
  return <FloatingList className={clsx(styles.popover, className)} {...props} ref={ref} />;
}) as typeof FloatingList;
