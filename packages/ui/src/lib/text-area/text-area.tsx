import {
  type ChangeEventHandler,
  type ComponentProps,
  forwardRef,
  type Ref,
  useEffect,
  useRef,
} from 'react';
import { classed as css } from '@tw-classed/core';
import { clsx } from 'clsx';

import { Column, type FlexVariants } from '../flex/flex.tsx';
import { fieldBoxCss, type FieldVariants } from '../form-field/form-field.tsx';
import { FormFieldWrapper, Hint, Label, useFormField } from '../form-field/index.ts';
import { useForkRef } from '../utils/hooks.ts';
import type { ForwardRefComponent } from '../utils/polymorphic.ts';

import styles from './text-area.module.css';

export const TextArea = forwardRef(
  (
    {
      label,
      secondaryLabel,
      hint,
      main,
      cross,
      flow,
      wrap,
      display,
      gap,
      style,
      className,
      validity,
      disabled,
      variant = 'boxed',
      id,
      size = 'md',
      as: Component,
      ...props
    },
    ref
  ) => {
    const ariaProps = useFormField({ id, hint });
    const inputClassName = clsx(fieldBoxCss({ validity, size, variant }), textfieldCss({ size }));

    return (
      <FormFieldWrapper
        main={main}
        cross={cross}
        flow={flow}
        display={display}
        gap={gap}
        wrap={wrap}
        style={style}
        className={className}
        ref={ref as unknown as Ref<HTMLDivElement>}
      >
        {label !== undefined && (
          <Label label={label} secondary={secondaryLabel} htmlFor={ariaProps.id} disabled={disabled} />
        )}
        <Column gap="xs">
          {!Component ? (
            <TextAreaInner {...props} {...ariaProps}  className={inputClassName} />
          ) : (
            <Component {...props} {...ariaProps} className={inputClassName} />
          )}
          {hint && (
            <Hint id={ariaProps['aria-describedby']} validity={validity}>
              {hint}
            </Hint>
          )}
        </Column>
      </FormFieldWrapper>
    );
  }
) as ForwardRefComponent<'textarea', Props>;

const TextAreaInner = ({ onChange, inputRef, ...props }: Props & TextAreaElementProps) => {
  const innerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (innerRef.current) {
      autosize(innerRef.current);
    }
  }, []);

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const el = e.currentTarget;
    onChange?.(e);
    autosize(el);
  };

  const refs = useForkRef(inputRef, innerRef);

  return <textarea rows={1} {...props} onChange={handleChange} ref={refs} />;
};

TextArea.displayName = 'TextArea';

type TextAreaElementProps = ComponentProps<'textarea'>
interface Props extends FlexVariants, FieldVariants {
  label?: string;
  secondaryLabel?: string;
  hint?: string;
  inputRef?: Ref<HTMLTextAreaElement>;
}

function autosize(el: HTMLTextAreaElement) {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight + 2}px`;
}

const textfieldCss = css(styles['text-area'], {
  variants: {
    size: {
      sm: styles['size--sm'],
      md: styles['size--md'],
      lg: styles['size--lg'],
      xl: styles['size--xl'],
    },
  },
});
