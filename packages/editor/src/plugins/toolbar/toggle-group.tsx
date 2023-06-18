import { type ComponentProps } from 'react';

type Props = ComponentProps<'fieldset'>;

export const ToggleGroup = (props: Props) => {
  return (
    <fieldset
      className="flex flex-row [&>button:where(:first-child:not(:last-child))]:rounded-e-none [&>button:where(:last-child:not(:first-child))]:rounded-s-none [&>button:where(:not(:first-child):not(:last-child))]:rounded-none [&>button:where(:not(:last-child))]:ml-[-1px]"
      {...props}
    />
  );
};
