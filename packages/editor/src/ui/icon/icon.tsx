import { type ComponentProps } from 'solid-js';
import { Polymorphic, type AsChildProp } from '@kobalte/core';
import { mergeDefaultProps } from '@kobalte/utils';
import { tv, type VariantProps } from 'tailwind-variants';

import styles from './icon.module.css';

interface Props extends ComponentProps<'svg'>, AsChildProp, VariantProps<typeof iconCss> {}

function Icon(props: Props) {
  const mergedProps = mergeDefaultProps({ as: 'svg', size: 'md' }, props);
  const hidden =
    mergedProps['aria-hidden'] || !mergedProps.as || !(mergedProps['aria-label'] || mergedProps['aria-labelledby']);

  return (
    <Polymorphic
      as="svg"
      {...mergedProps}
      aria-hidden={hidden}
      class={iconCss({ size: mergedProps.size, class: props.class })}
    />
  );
}

const iconCss = tv({
  base: styles.icon,
  variants: {
    size: {
      'xs': styles['icon--xs'],
      'sm': styles['icon--sm'],
      'md': styles['icon--md'],
      'lg': styles['icon--lg'],
      'xl': styles['icon--xl'],
      '2xl': styles['icon--2xl'],
      '3xl': styles['icon--3xl'],
      '4xl': styles['icon--4xl'],
      '5xl': styles['icon--5xl'],
      '6xl': styles['icon--6xl'],
      'inherit': styles['icon--inherit'],
    },
  },
});

export { Icon };
