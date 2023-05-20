import { type ComponentProps, forwardRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import * as RdxDialog from '@radix-ui/react-dialog';

import { Button } from '../button/index.ts';

type CloseButtonProps = ComponentProps<typeof Button>;

export const DialogClose = forwardRef<HTMLButtonElement, CloseButtonProps>((props, ref) => {
  return (
    <RdxDialog.DialogClose asChild>
      <Button icon={XMarkIcon} variant="flat" {...props} ref={ref} />
    </RdxDialog.DialogClose>
  );
});
