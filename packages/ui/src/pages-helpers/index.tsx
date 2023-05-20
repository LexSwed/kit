import type { ComponentProps } from 'react';
import { clsx } from 'clsx';

export const ExampleBox = (props: ComponentProps<'div'>) => {
  return (
    <div
      {...props}
      className={clsx(
        'grid h-[50px] min-w-[50px] place-items-center border-2 border-dashed border-primary/60 bg-primary/10 text-sm text-on-surface-variant',
        props.className
      )}
    />
  );
};

export { CopyButton } from './CopyButton.tsx';
export { MainLayout } from './MainLayout/MainLayout.tsx';
export { TextWithComputedStyle } from './TextWithComputedStyle.tsx';
