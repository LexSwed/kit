import { type ComponentProps, forwardRef } from 'react';
import { clsx } from 'clsx';

import styles from './floating-list.module.css';

type Props = ComponentProps<'div'>;

export const FloatingList = forwardRef<HTMLDivElement, Props>((props, ref) => {
  return <div {...props} className={clsx(styles['floating-list'], props.className)} ref={ref} />;
});
