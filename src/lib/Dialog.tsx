import {
  createSignal,
  type Accessor,
  type ParentComponent,
  Show,
  children,
  createEffect,
  on,
  createUniqueId,
  createMemo,
  splitProps,
  type JSX,
} from "solid-js";
import { Portal } from "solid-js/web";
import { mergeRefs, Ref } from "@solid-primitives/refs";

interface Props extends JSX.DialogHtmlAttributes<HTMLDialogElement> {
  defaultOpen?: boolean;
  controls: DialogControls;
  ref?: Ref<HTMLDialogElement>;
  id?: string;
}

type DialogControls = {
  isOpen: Accessor<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
  switch: (providedOpenState: boolean) => void;
};

const Dialog: ParentComponent<Props> = (props) => {
  const [local, others] = splitProps(props, [
    "controls",
    "children",
    "ref",
    "id",
    "defaultOpen",
  ]);
  const id = createMemo(() => local.id || createUniqueId());
  let dialogElement: HTMLDialogElement | undefined;

  const c = children(() => props.children);

  createEffect(
    on(
      () => local.controls.isOpen(),
      (shouldBeOpen) => {
        if (shouldBeOpen) {
          dialogElement.showModal();
        } else {
          dialogElement.close();
        }
      },
      { defer: true }
    )
  );

  return (
    <Portal mount={document.getElementById("root")}>
      <dialog
        id={`dialog-${id()}`}
        ref={mergeRefs(local.ref, (el) => (dialogElement = el))}
        onClose={() => {
          local.controls.close();
        }}
        onCancel={() => local.controls.close()}
        class=""
        {...others}
      >
        {c()}
      </dialog>
    </Portal>
  );
};

export { Dialog };

function createDialogControls(params?: {
  defaultOpen?: boolean;
}): DialogControls {
  const [open, setOpen] = createSignal(params?.defaultOpen || false);
  return {
    isOpen: open,
    open: () => {
      setOpen(true);
    },
    close: () => {
      setOpen(false);
    },
    toggle: () => {
      setOpen((open) => !open);
    },
    switch: (providedOpenState: boolean) => {
      setOpen(providedOpenState);
    },
  };
}

export const App = () => {
  const controls: DialogControls = createDialogControls();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          controls.toggle();
        }}
      >
        Open dialog
      </button>
      <Dialog controls={controls}>
        <Show when={controls.isOpen()}>
          <h1 slot="title">This is a title</h1>
          <p>Content</p>
          <ExpensiveForm />
          <div>
            <button value="submit">Submit</button>
            <button value="cancel">Cancel</button>
          </div>
        </Show>
      </Dialog>
    </>
  );
};

const ExpensiveForm = () => {
  return (
    <form
      method="post"
      class="flex flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log(Object.fromEntries(formData.entries()));
      }}
    >
      <input name="name" />
      <select name="country">
        <option value="de">Germany</option>
        <option value="ua">Ukraine</option>
        <option value="es">Spain</option>
      </select>
      <button>Submit</button>
    </form>
  );
};
