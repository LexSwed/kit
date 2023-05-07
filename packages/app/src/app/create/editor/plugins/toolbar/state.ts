import type { VirtualElement } from '@floating-ui/dom';
import { createActorContext } from '@xstate/react';
import { assign, createMachine, raise } from 'xstate';

import { choose } from 'xstate/lib/actions';

interface Context {
  /** Currently selected range, with keyboard or pointer */
  selection: null | Range;
  /**
   * Reference for the Popups, updated only when the pointer is up (keyboard selection or pointer up)
   */
  reference: null | VirtualElement;
}

type Event =
  | { type: 'pointer down' }
  | { type: 'pointer up' }
  | { type: 'selection change'; selection: Range | null }
  | { type: 'selected' }
  | { type: 'deselected' }
  | { type: 'edit link' }
  | { type: 'close' }
  | { type: 'cancel link edit' };

const selectionReadyActions = choose<Context, Event>([
  {
    cond: (context) => Boolean(context.selection),
    actions: [
      assign({
        reference: (context) => context.selection,
      }),
      raise('selected'),
    ],
  },
  {
    cond: (context) => !context.selection,
    actions: [
      assign({
        reference: null,
      }),
      raise('deselected'),
    ],
  },
]);

const toolbarMachine = createMachine<Context, Event>(
  {
    id: 'toolbarMachine',
    schema: {
      context: {} as Context,
      events: {} as Event,
    },
    context: {
      reference: null,
      selection: null,
    },
    on: {},
    type: 'parallel',
    states: {
      /** This state only exists to override context selection, because `selection change` event should be handled regardless the state, but other states should be able to react on it */
      selection: {
        id: 'selection',
        initial: 'initial',
        states: {
          initial: {
            on: {
              'selection change': {
                actions: assign({
                  selection: (context, event) => event.selection,
                }),
              },
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
              'pointer down': 'down',
              /** keyboard-only selection with pointer up */
              'selection change': {
                actions: selectionReadyActions,
              },
            },
          },
          down: {
            on: {
              /** Now that the pointer is up we can check if selection was made, saving popup reference */
              'pointer up': {
                target: 'up',
                actions: selectionReadyActions,
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
            id: 'hidden',
            initial: 'initial',
            states: {
              initial: {
                on: {
                  selected: {
                    cond: (context) => Boolean(context.selection),
                    target: '#shown',
                  },
                },
              },
            },
          },
          shown: {
            id: 'shown',
            initial: 'initial',
            on: {
              close: {
                target: '#shown.closing',
              },
              deselected: {
                target: '#shown.closing',
              },
            },
            states: {
              initial: {
                on: {
                  'edit link': 'openingLinkEdit',
                },
              },
              // add artificial delay for when whole link is selected and then open the popup
              openingLinkEdit: {
                after: {
                  10: [
                    {
                      cond: 'hasNoSelectionAndPointerUp',
                      target: 'closing',
                    },
                    {
                      cond: 'hasSelectionAndPointerUp',
                      target: 'linkEditShown',
                    },
                  ],
                },
              },
              linkEditShown: {
                on: {
                  'cancel link edit': 'initial',
                  'selected': 'initial',
                },
              },
              closing: {
                after: {
                  200: [
                    {
                      target: '#hidden.initial',
                      cond: 'hasNoSelectionAndPointerUp',
                    },
                    {
                      target: '#shown.initial',
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    predictableActionArguments: true,
  },
  {
    guards: {
      hasNoSelectionAndPointerUp(context, event, meta) {
        return meta.state.matches({ pointer: 'up' }) && !context.selection;
      },
      hasSelectionAndPointerUp(context, event, meta) {
        console.log(event);
        return meta.state.matches({ pointer: 'up' }) && !!context.selection;
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
  undefined,
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
