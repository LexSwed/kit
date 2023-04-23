import { type ComponentProps } from 'react';

type Props = ComponentProps<'div'>

export const ToggleGroup = (props: Props) => {
  return (
    <div
      className="flex flex-row [&>button:where(:not(:first-child):not(:last-child))]:rounded-none [&>button:where(:last-child)]:rounded-s-none [&>button:where(:first-child)]:rounded-e-none [&>button:where(:not(:last-child))]:ml-[-1px]"
      {...props}
    />
  );
};
