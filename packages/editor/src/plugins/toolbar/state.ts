import { createActorContext } from "@xstate/react";
import type { LexicalEditor } from "lexical/LexicalEditor.js";
import { assign, createMachine, fromPromise, raise, stateIn } from "xstate";

import { getSelection } from "./utils.ts";

interface Context {
  /**
   * Reference for the Popups, updated only when the pointer is up (keyboard selection or pointer up)
   */
  selection: Range | null;
  editor: LexicalEditor;
}

type Event =
  | { type: "pointer down" }
  | { type: "pointer up" }
  | { type: "focus" }
  | { type: "blur" }
  | { type: "selection change" }
  | { type: "selected"; selection: "link" | "range" }
  | { type: "deselected" }
  | { type: "edit link" }
  | { type: "close" }
  | { type: "cancel link edit" }
  | {
      type: "done.invoke.selector";
      output: Awaited<ReturnType<typeof getSelection>>;
    };

const toolbarMachine = createMachine<Context, Event>(
  {
    id: "toolbarMachine",
    context: {
      selection: null,
    } as Context,
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
        initial: "up",
        states: {
          up: {
            on: {
              "pointer down": "down",
            },
          },
          down: {
            on: {
              "pointer up": "up",
            },
          },
        },
      },

      selection: {
        id: "selection",
        initial: "idle",
        on: {
          deselected: {
            target: ".idle",
          },
          "pointer up": [
            {
              guard: stateIn({ focus: "in" }),
              target: ".check selection",
            },
          ],
          "selection change": [
            {
              guard: stateIn({ focus: "in", pointer: "up" }),
              target: ".check selection",
            },
          ],
        },
        states: {
          idle: {},
          // "check selection": {
          //   after: {
          //     150: {
          //       target: "checking selection",
          //     },
          //   },
          // },
          "check selection": {
            invoke: {
              src: "getSelection",
              id: "selector",
              input: ({ context }: { context: Context }) => ({
                editor: context.editor,
              }),
              onDone: [
                {
                  guard: "isRangeSelection",
                  actions: ["assignSelection", "raiseSelected"],
                  target: "idle",
                },
                {
                  actions: ["clearSelection", "raiseDeselected"],
                  target: "idle",
                },
              ],
            },
          },
        },
      },

      toolbar: {
        id: "toolbar",
        initial: "hidden",
        on: {
          selected: ".shown",
        },
        states: {
          hidden: {},
          shown: {
            id: "shown",
            initial: "range",
            on: {
              deselected: {
                target: "hidden",
              },
              close: {
                target: "hidden",
              },
            },
            states: {
              range: {
                on: {
                  "edit link": {
                    target: "linkEditShown",
                  },
                },
              },
              linkEditShown: {
                on: {
                  "cancel link edit": "#shown",
                  selected: {
                    target: "range",
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
          if (event.type === "done.invoke.selector") {
            return event.output;
          }
          return context.selection;
        },
      }),
      clearSelection: assign({
        selection: null,
      }),
      raiseSelected: raise(({ event }) => {
        if (event.type === "done.invoke.selector" && event.output) {
          return {
            type: "selected",
            selection: event.output.collapsed ? "link" : "range",
          };
        }
        throw new Error("Cannot raise selected event from non-selection queue");
      }),
      raiseDeselected: raise({ type: "deselected" }),
    },
    guards: {
      isRangeSelection: ({ event }) => {
        if (event.type === "done.invoke.selector") {
          return Boolean(event.output);
        }
        return false;
      },
    },
    actors: {
      getSelection: fromPromise(async ({ input: { editor } }) =>
        getSelection(editor)
      ),
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
