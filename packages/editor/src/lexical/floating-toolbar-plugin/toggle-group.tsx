import { type ComponentProps } from 'solid-js';

type Props = ComponentProps<'div'>;

export function ToggleGroup(props: Props) {
  return (
    <div
      class="[&>button:where(:not(:last-child))]:ml-[-1px] flex flex-row [&>button:where(:first-child:not(:last-child))]:rounded-e-none [&>button:where(:last-child:not(:first-child))]:rounded-s-none [&>button:where(:not(:first-child):not(:last-child))]:rounded-none"
      {...props}
    />
  );
}
