import { forwardRef } from 'react';
import { clsx } from 'clsx';

import type { ForwardRefComponent } from '../utils/polymorphic';

import styles from './floating-list.module.css';

export const FloatingList = forwardRef(({ as: Component = 'div', className, ...props }, ref) => {
  return <Component {...props} className={clsx(styles['floating-list'], className)} ref={ref} />;
}) as ForwardRefComponent<'div'>;
