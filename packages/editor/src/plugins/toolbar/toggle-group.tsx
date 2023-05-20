import { type ComponentProps } from "react";

type Props = ComponentProps<"div">;

export const ToggleGroup = (props: Props) => {
  return (
    <div
      className="[&>button:where(:not(:last-child))]:ml-[-1px] flex flex-row [&>button:where(:first-child:not(:last-child))]:rounded-e-none [&>button:where(:last-child:not(:first-child))]:rounded-s-none [&>button:where(:not(:first-child):not(:last-child))]:rounded-none"
      {...props}
    />
  );
};
