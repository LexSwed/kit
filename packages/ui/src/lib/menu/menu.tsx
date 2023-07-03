import {
  type ComponentProps,
  forwardRef,
  type ForwardRefExoticComponent,
  type ReactElement,
  type RefAttributes,
  useRef,
} from 'react';
import * as RdxMenu from '@radix-ui/react-dropdown-menu';
import { clsx } from 'clsx';

import { Label } from '../form-field/index.ts';
import { Portal } from '../portal/index.ts';
import { ListItem, type ListItemVariants } from '../shared/list-item.tsx';
import { PopoverBox } from '../shared/popover-box.tsx';
import { Presence } from '../shared/presence.tsx';
import { useForkRef } from '../utils/hooks.ts';
import {
  OpenStateProvider,
  type OpenStateRef,
  useOpenState,
  useOpenStateControls,
} from '../utils/OpenStateProvider.tsx';

import styles from './menu.module.css';

interface MenuProps {
  children: [trigger: ReactElement, menuList: ReactElement];
  /**
   * The modality of the dropdown menu. When set to true, interaction with outside elements will be disabled and only menu content will be visible to screen readers.
   */
  modal?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MenuInner = ({ children, modal }: MenuProps) => {
  const open = useOpenState();
  const controls = useOpenStateControls();
  const [trigger, menuList] = children;

  return (
    <RdxMenu.Root open={open} onOpenChange={controls.switch} modal={modal}>
      <RdxMenu.Trigger asChild>{trigger}</RdxMenu.Trigger>
      {menuList}
    </RdxMenu.Root>
  );
};

const MenuRoot = forwardRef<OpenStateRef, MenuProps>(({ open, onOpenChange, ...props }, ref) => {
  return (
    <OpenStateProvider open={open} onChange={onOpenChange} ref={ref}>
      <MenuInner {...props} />
    </OpenStateProvider>
  );
}) as ForwardRefExoticComponent<MenuProps & RefAttributes<OpenStateRef>> & {
  List: typeof List;
  Item: typeof MenuItem;
  Separator: typeof Separator;
  Label: typeof MenuLabel;
};

export function useMenuRef() {
  return useRef<OpenStateRef>(null);
}

interface MenuListProps
  extends Pick<RdxMenu.MenuContentProps, 'side' | 'sideOffset' | 'align'>,
    ComponentProps<typeof PopoverBox> {}
const List = ({ align = 'start', side = 'bottom', sideOffset = 8, ...props }: MenuListProps) => {
  const open = useOpenState();
  return (
    <Presence present={open}>
      {({ ref: presenceRef }) => {
        const content = (
          <RdxMenu.Content align={align} side={side} sideOffset={sideOffset} forceMount asChild>
            <MenuListContent {...props} ref={presenceRef} />
          </RdxMenu.Content>
        );

        if (props.popover) return content;

        return (
          <Portal radixPortal={RdxMenu.Portal} forceMount>
            {content}
          </Portal>
        );
      }}
    </Presence>
  );
};

const MenuListContent = forwardRef<HTMLDivElement, MenuListProps>(({ style = {}, ...props }, ref) => {
  const innerRef = useRef<HTMLDivElement>(null);
  const refs = useForkRef(ref, innerRef);

  return <PopoverBox {...props} style={{ ...style, minWidth: `var(--radix-popper-anchor-width)` }} ref={refs} />;
});

interface MenuItemProps extends ListItemVariants, Omit<ComponentProps<typeof RdxMenu.Item>, 'asChild'> {}

const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(({ onSelect, disabled, textValue, ...props }, ref) => {
  return (
    <RdxMenu.Item onSelect={onSelect} disabled={disabled} textValue={textValue} asChild>
      <ListItem {...props} ref={ref} />
    </RdxMenu.Item>
  );
});

export const Separator = (props: ComponentProps<'div'>) => {
  return <div {...props} className={clsx(styles.separator, props.className)} />;
};

const MenuLabel = forwardRef((props, ref) => {
  return (
    <RdxMenu.Label asChild>
      <Label {...props} ref={ref} />
    </RdxMenu.Label>
  );
}) as typeof Label;

MenuRoot.List = List;
MenuRoot.Item = MenuItem;
MenuRoot.Separator = Separator;
MenuRoot.Label = MenuLabel;

export const Menu = MenuRoot;
