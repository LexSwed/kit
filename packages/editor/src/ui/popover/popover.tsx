import { splitProps, type ParentComponent, type JSX, Show } from 'solid-js';

import styles from './popover.module.css';
import { Portal, isServer } from 'solid-js/web';

export const Popover: ParentComponent<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, others] = splitProps(props, ['class', 'classList']);
  const element = isServer ? null : document.querySelector('[class*="fxtrot-ui"');

  return (
    <Show when={element}>
      {(node) => (
        <Portal mount={node()}>
          <div
            {...others}
            classList={{
              [styles.popover]: true,
              [`${local.class}`]: true,
              ...local.classList,
            }}
          >
            {props.children}
          </div>
        </Portal>
      )}
    </Show>
  );
};
