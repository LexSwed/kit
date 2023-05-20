import {
  forwardRef,
  type ForwardRefExoticComponent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
  useRef,
} from 'react';
import * as RdxModal from '@radix-ui/react-dialog';

import {
  OpenStateProvider,
  type OpenStateRef,
  useOpenState,
  useOpenStateControls,
} from '../utils/OpenStateProvider.tsx';

import { DialogClose } from './dialog-close.tsx';
import { DialogModal } from './dialog-modal.tsx';
import { DialogTitle } from './dialog-title.tsx';

interface Props {
  children: [ReactElement, (close: () => void) => ReactNode];
  defaultOpen?: boolean;
  /**
   * The modality of the dialog. When set to true, interaction with outside elements will be disabled and only dialog content will be visible to screen readers.
   */
  modal?: boolean;
}

const DialogInner = ({ children, modal, ...props }: Props) => {
  const open = useOpenState();
  const controls = useOpenStateControls();
  const [trigger, content] = children;

  return (
    <RdxModal.Root open={open} onOpenChange={controls.switch} defaultOpen={props.defaultOpen} modal={modal}>
      <RdxModal.Trigger asChild>{trigger}</RdxModal.Trigger>
      {content(controls.close)}
    </RdxModal.Root>
  );
};

export const Dialog = forwardRef<OpenStateRef, Props>((props, ref) => {
  return (
    <OpenStateProvider defaultOpen={props.defaultOpen} ref={ref}>
      <DialogInner {...props} />
    </OpenStateProvider>
  );
}) as ForwardRefExoticComponent<Props & RefAttributes<OpenStateRef>> & {
  Modal: typeof DialogModal;
  Close: typeof DialogClose;
  Title: typeof DialogTitle;
};

Dialog.Modal = DialogModal;
Dialog.Close = DialogClose;
Dialog.Title = DialogTitle;

export function useDialogRef() {
  return useRef<OpenStateRef>(null);
}
