import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import * as RdxSelect from '@radix-ui/react-select';

import { Icon } from '../icon/index.ts';
import { Portal } from '../portal/index.ts';
import { PopoverBox } from '../shared/popover-box.tsx';

import type { OptionType } from './item.tsx';
import Item from './item.tsx';
import { PickerTrigger, type PickerTriggerProps } from './trigger.tsx';

import styles from './picker.module.css';

interface Props extends Omit<PickerTriggerProps, 'value' | 'onChange' | 'defaultValue' | 'children' | 'size'> {
  value?: string;
  defaultValue?: string;
  onChange?: (newValue: string) => void;
  size?: PickerTriggerProps['size'];
  children: OptionType[] | OptionType;
}

export const Picker = ({ children, name, onChange, value, defaultValue, ...triggerProps }: Props) => {
  return (
    <RdxSelect.Root value={value} defaultValue={defaultValue} onValueChange={onChange} name={name}>
      <PickerTrigger {...triggerProps} />
      <Portal radixPortal={RdxSelect.Portal}>
        <RdxSelect.Content asChild>
          <PopoverBox>
            <RdxSelect.SelectScrollUpButton className={styles['scroll-direction-arrow']}>
              <Icon as={ChevronUpIcon} size="sm" />
            </RdxSelect.SelectScrollUpButton>
            <RdxSelect.Viewport>{children}</RdxSelect.Viewport>
            <RdxSelect.SelectScrollDownButton className={styles['scroll-direction-arrow']}>
              <Icon as={ChevronDownIcon} size="sm" />
            </RdxSelect.SelectScrollDownButton>
          </PopoverBox>
        </RdxSelect.Content>
      </Portal>
    </RdxSelect.Root>
  );
};

Picker.Item = Item;
