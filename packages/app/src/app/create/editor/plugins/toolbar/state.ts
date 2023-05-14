import { createActorContext } from '@xstate/react';
import { and, assign, createMachine, stateIn, raise } from 'xstate';

interface Context {
  /** Currently selected range, with keyboard or pointer */
  selection: null | Range;
  /**
   * Reference for the Popups, updated only when the pointer is up (keyboard selection or pointer up)
   */
  reference: null | Range;
}

type Event =
  | { type: 'pointer down' }
  | { type: 'pointer up' }
  | { type: 'focus' }
  | { type: 'blur' }
  | { type: 'selection change'; selection: Range; collapsed: boolean }
  | { type: 'selection change'; selection: null }
  | { type: 'selected' }
  | { type: 'deselected' }
  | { type: 'edit link' }
  | { type: 'close' }
  | { type: 'cancel link edit' };

const toolbarMachine = createMachine<Context, Event>(
  {
    id: 'toolbarMachine',
    context: {
      reference: null,
      selection: null,
    },
    type: 'parallel',
    states: {
      editor: {
        id: 'editor',
        type: 'parallel',
        states: {
          focus: {
            initial: 'out',
            id: 'focus',
            states: {
              in: {
                on: {
                  blur: 'out',
                },
              },
              out: {
                on: {
                  focus: { target: 'in' },
                },
              },
            },
          },
          selection: {
            id: 'selection',
            initial: 'none',
            on: {
              'selected': {
                actions: ['assignReference'],
              },
              'deselected': {
                actions: ['clearSelection', 'clearReference'],
              },
              'selection change': [
                /**
                 * Keyboard selection
                 * (or weird cases when "pointer up" is emitted before "selection change")
                 */
                {
                  guard: and(['rangeSelection', stateIn({ pointer: 'up', editor: { focus: 'in' } })]),
                  actions: ['assignSelection', 'raiseSelected'],
                  target: ['#selection.range'],
                },
                /**
                 * Commented out is to avoid toolbar opening on collapsed (link) navigating with keyboard only
                 */
                // {
                //   in: {
                //     pointer: 'up',
                //     editor: {
                //       focus: 'in',
                //     },
                //   },
                //   cond: 'collapsedSelection',
                //   actions: ['assignSelection', 'assignReference', 'raiseSelected'],
                //   target: ['#selection.collapsed'],
                // },
                {
                  guard: and(['noSelection', stateIn({ pointer: 'up', editor: { focus: 'in' } })]),
                  actions: ['raiseDeselected'],
                  target: ['#selection.none'],
                },
                {
                  guard: 'collapsedSelection',
                  actions: ['assignSelection'],
                  target: ['#selection.collapsed'],
                },
                {
                  guard: 'rangeSelection',
                  actions: ['assignSelection'],
                  target: ['#selection.range'],
                },
                {
                  guard: 'noSelection',
                  actions: ['clearSelection'],
                  target: ['#selection.none'],
                },
                {
                  actions: ['assignSelection'],
                },
              ],
              'pointer up': [
                {
                  guard: and(['hasNoSelection', stateIn({ editor: { focus: 'in' } })]),
                  actions: ['raiseDeselected'],
                  target: ['.none'],
                },
                {
                  guard: and(['hasSelection', stateIn({ editor: { focus: 'in' } })]),
                  actions: ['raiseSelected'],
                },
              ],
            },
            states: {
              none: {},
              collapsed: {},
              range: {},
            },
          },
        },
      },
      pointer: {
        id: 'pointer',
        initial: 'up',
        states: {
          up: {
            on: {
              'pointer down': {
                target: 'down',
              },
            },
          },
          down: {
            on: {
              'pointer up': {
                target: 'up',
              },
            },
          },
        },
      },
      toolbar: {
        id: 'toolbar',
        initial: 'hidden',
        states: {
          hidden: {
            on: {
              selected: {
                target: 'shown',
              },
            },
          },
          shown: {
            id: 'shown',
            initial: 'open',
            on: {
              deselected: {
                target: '.closing',
              },
              close: {
                target: '.closing',
              },
            },
            states: {
              open: {
                on: {
                  'edit link': 'linkEditShown',
                },
              },
              linkEditShown: {
                on: {
                  'cancel link edit': '#shown',
                  'selected': {
                    target: 'open',
                  },
                },
              },
              closing: {
                on: {
                  selected: '#toolbar.shown',
                },
                after: {
                  200: {
                    target: '#toolbar.hidden',
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
          if (event.type === 'selection change') {
            return event.selection;
          }
          return context.selection;
        },
      }),
      clearSelection: assign({
        selection: null,
      }),
      assignReference: assign({
        reference: ({ context }) => {
          return context.selection ?? null;
        },
      }),
      clearReference: assign({
        reference: null,
      }),
      raiseSelected: raise({ type: 'selected' }),
      raiseDeselected: raise({ type: 'deselected' }),
    },
    guards: {
      hasSelection({ context }) {
        return !!context.selection;
      },
      hasNoSelection({ context }) {
        return !context.selection;
      },
      rangeSelection({ event }) {
        return event.type === 'selection change' && !!event.selection;
      },
      collapsedSelection({ event }) {
        return event.type === 'selection change' && !!event.selection && event.collapsed;
      },
      noSelection({ event }) {
        return event.type === 'selection change' && !event.selection;
      },
    },
  }
);

const {
  Provider: ToolbarStateProvider,
  useActor,
  useActorRef,
  useSelector,
} = createActorContext(
  toolbarMachine,
  {
    devTools: process.env.NODE_ENV === 'development',
  },
  process.env.NODE_ENV === 'development'
    ? (state) => {
        const { event, value, context } = state;
        console.log({ event, value, context });
      }
    : undefined
);

export { ToolbarStateProvider, useActor, useActorRef, useSelector };

export function useReferenceNode() {
  return useSelector((state) => state.context.reference);
}
