import { createActorContext } from "@xstate/react";
import type { LexicalEditor } from "lexical/LexicalEditor.js";
import { assign, createMachine, fromPromise, raise, stateIn } from "xstate";

import { getSelection } from "./utils.ts";

interface Context {
  selection: Range | HTMLAnchorElement | null;
  editor: LexicalEditor;
}

type Event =
  | { type: "pointer down" }
  | { type: "pointer up" }
  | { type: "focus" }
  | { type: "blur" }
  | { type: "selection change" }
  | { type: "range selected" }
  | { type: "link clicked" }
  | { type: "deselected" }
  | { type: "edit link" }
  | { type: "close" }
  | { type: "toggle edit link" }
  | { type: "cancel link edit" }
  | { type: "menu item open" }
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
                  actions: [
                    "clearSelection",
                    "assignSelection",
                    "raiseSelected",
                  ],
                  target: "idle",
                },
                {
                  guard: "isLinkClicked",
                  actions: [
                    "clearSelection",
                    "assignSelection",
                    "raiseLinkClicked",
                  ],
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
          "range selected": {
            target: ".shown.range",
          },
          "link clicked": {
            target: ".shown.link",
          },
        },
        states: {
          hidden: {},
          shown: {
            id: "shown",
            initial: "range",
            on: {
              deselected: {
                target: "#toolbar.shown.closing",
              },
              close: {
                target: "#toolbar.shown.closing",
              },
            },
            states: {
              range: {
                initial: "initial",
                states: {
                  initial: {
                    on: {
                      "edit link": "link-edit",
                      "toggle edit link": "link-edit",
                    },
                  },
                  "link-edit": {
                    on: {
                      "cancel link edit": "initial",
                      "range selected": "initial",
                      "toggle edit link": "initial",
                      "menu item open": "initial",
                    },
                  },
                },
              },
              link: {
                initial: "initial",
                states: {
                  initial: {
                    on: {
                      "edit link": "link-edit",
                      "toggle edit link": "link-edit",
                    },
                  },
                  "link-edit": {
                    on: {
                      "cancel link edit": "initial",
                      "range selected": "initial",
                      "toggle edit link": "initial",
                      "menu item open": "initial",
                    },
                  },
                },
              },
              closing: {
                after: {
                  150: {
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
            event.type === "done.invoke.selector" &&
            event.output &&
            "range" in event.output
          ) {
            return event.output.range;
          }
          if (
            event.type === "done.invoke.selector" &&
            event.output &&
            "link" in event.output
          ) {
            return event.output.link;
          }
          return context.selection;
        },
      }),
      clearSelection: assign({
        selection: null,
      }),
      raiseLinkClicked: raise(({ event }) => {
        if (event.type === "done.invoke.selector") {
          return {
            type: "link clicked",
          };
        }
        throw new Error("Cannot raise selected event from non-selection queue");
      }),
      raiseSelected: raise(({ event }) => {
        if (event.type === "done.invoke.selector") {
          return {
            type: "range selected",
          };
        }
        throw new Error("Cannot raise selected event from non-selection queue");
      }),
      raiseDeselected: raise({ type: "deselected" }),
    },
    guards: {
      isLinkClicked: ({ event }) => {
        if (event.type === "done.invoke.selector" && event.output) {
          return "link" in event.output && Boolean(event.output.link);
        }
        return false;
      },
      isRangeSelection: ({ event }) => {
        if (event.type === "done.invoke.selector" && event.output) {
          return "range" in event.output && Boolean(event.output.range);
        }
        return false;
      },
    },
    actors: {
      getSelection: fromPromise(async ({ input: { editor } }) =>
        getSelection(editor),
      ),
    },
  },
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
  // process.env.NODE_ENV === 'development'
  //   ? (state) => {
  //       const { event, value, context } = state;
  //       console.log({ event, value, context });
  //     }
  //   : undefined
);

export { toolbarMachine, ToolbarStateProvider, useActorRef, useSelector };
