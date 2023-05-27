import { createActorContext } from "@xstate/react";
import type { LexicalEditor } from "lexical/LexicalEditor.js";
import { assign, createMachine, fromPromise, raise, stateIn } from "xstate";

import { getSelection } from "./utils.ts";

interface Context {
  /**
   * Reference for the Popups, updated only when the pointer is up (keyboard selection or pointer up)
   */
  selection: null | Range;
  editor: LexicalEditor;
}

type Event =
  | { type: "pointer down" }
  | { type: "pointer up" }
  | { type: "focus" }
  | { type: "blur" }
  | { type: "selection change" }
  | { type: "selected"; collapsed: boolean }
  | { type: "deselected" }
  | { type: "edit link" }
  | { type: "close" }
  | { type: "cancel link edit" }
  | {
      type: "done.invoke.toolbarMachine.pointer.checking selection:invocation[0]";
      output: Awaited<ReturnType<typeof getSelection>>;
    };

const toolbarMachine = createMachine<Context, Event>(
  {
    id: "toolbarMachine",
    context: {} as Context,
    type: "parallel",
    states: {
      focus: {
        initial: "in",
        states: {
          in: {
            on: { blur: "out" },
          },
          out: {
            on: {
              focus: "in",
            },
          },
        },
      },
      pointer: {
        initial: "pointer-up",
        states: {
          "checking selection": {
            invoke: {
              src: "getSelection",
              input: ({ context }: { context: Context }) => ({
                editor: context.editor,
              }),
              onDone: [
                {
                  guard: "isCollapsedSelection",
                  actions: ["assignSelection", "raiseSelected"],
                  target: "pointer-up",
                },
                {
                  guard: "isRangeSelection",
                  actions: ["assignSelection", "raiseSelected"],
                  target: "pointer-up",
                },
                {
                  actions: ["clearSelection", "raiseDeselected"],
                  target: "pointer-up",
                },
              ],
            },
          },
          "pointer-up": {
            on: {
              "pointer down": {
                target: "pointer-down",
              },
              "selection change": {
                guard: stateIn({ focus: "in" }),
                target: "checking selection",
              },
            },
          },
          "pointer-down": {
            on: {
              "pointer up": {
                guard: stateIn({ focus: "in" }),
                target: "checking selection",
              },
            },
          },
        },
      },

      selection: {
        id: "selection",
        initial: "none",
        on: {
          selected: [
            {
              guard: ({ event }) => event.collapsed,
              target: ".collapsed",
            },
            {
              target: ".range",
            },
          ],
          deselected: {
            target: ".none",
          },
        },
        states: {
          none: {},
          collapsed: {},
          range: {},
        },
      },

      toolbar: {
        id: "toolbar",
        initial: "hidden",
        states: {
          hidden: {
            on: {
              selected: {
                target: "shown",
              },
            },
          },
          shown: {
            id: "shown",
            initial: "open",
            on: {
              deselected: {
                target: ".closing",
              },
              close: {
                target: ".closing",
              },
            },
            states: {
              open: {
                on: {
                  "edit link": "linkEditShown",
                },
              },
              linkEditShown: {
                on: {
                  "cancel link edit": "#shown",
                  selected: {
                    target: "open",
                  },
                },
              },
              closing: {
                on: {
                  selected: "#toolbar.shown",
                },
                after: {
                  200: {
                    target: "#toolbar.hidden",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  {
    actions: {
      assignSelection: assign({
        selection: ({ context, event }) => {
          if (
            event.type ===
            "done.invoke.toolbarMachine.pointer.checking selection:invocation[0]"
          ) {
            return event.output.selection;
          }
          return context.selection;
        },
      }),
      clearSelection: assign({
        selection: null,
      }),
      raiseSelected: raise(({ event }) => {
        if (
          event.type ===
            "done.invoke.toolbarMachine.pointer.checking selection:invocation[0]" &&
          event.output.selection
        ) {
          return {
            type: "selected",
            collapsed: event.output.collapsed,
          };
        }
        return { type: "deselected" };
      }),
      raiseDeselected: raise({ type: "deselected" }),
    },
    guards: {
      isEmptySelection: ({ event }) => {
        if (
          event.type ===
          "done.invoke.toolbarMachine.pointer.checking selection:invocation[0]"
        ) {
          return !!event.output.selection;
        }
        return false;
      },
      isCollapsedSelection: ({ event }) => {
        console.log(event);
        if (
          event.type ===
          "done.invoke.toolbarMachine.pointer.checking selection:invocation[0]"
        ) {
          return event.output.selection ? event.output.collapsed : false;
        }
        return false;
      },
      isRangeSelection: ({ event }) => {
        if (
          event.type ===
          "done.invoke.toolbarMachine.pointer.checking selection:invocation[0]"
        ) {
          return event.output.selection ? !event.output.collapsed : false;
        }
        return false;
      },
    },
    actors: {
      getSelection: fromPromise(async ({ input: { editor } }) => {
        const selection = await getSelection(editor);
        return selection;
      }),
    },
  }
);

const {
  Provider: ToolbarStateProvider,
  useActorRef,
  useSelector,
} = createActorContext(
  toolbarMachine,
  {
    devTools: process.env.NODE_ENV === "development",
  },
  process.env.NODE_ENV === "development"
    ? (state) => {
        const { event, value, context } = state;
        console.log({ event, value, context });
      }
    : undefined
);

export { toolbarMachine, ToolbarStateProvider, useActorRef, useSelector };

export function useReferenceNode() {
  return useSelector((state) => state.context.selection);
}
