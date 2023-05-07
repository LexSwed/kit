import { createActorContext } from '@xstate/react';
import { assign, createMachine, raise } from 'xstate';

import { choose, log, sendParent, sendTo } from 'xstate/lib/actions';

interface Context {
  selection: null | Range;
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

const toolbarMachine = createMachine<Context, Event>(
  {
    id: 'toolbarMachine',
    schema: {
      context: {} as Context,
      events: {} as Event,
    },
    context: {
      selection: null,
    },
    on: {
      'selection change': {
        actions: [
          choose([
            {
              cond: (context, event) => Boolean(event.selection),
              actions: raise('selected'),
            },
            {
              cond: (context, event) => !event.selection,
              actions: raise('deselected'),
            },
          ]),
          assign({
            selection: (context, event) => event.selection,
          }),
        ],
      },
    },
    type: 'parallel',
    states: {
      pointer: {
        id: 'pointer',
        initial: 'up',
        states: {
          up: {
            on: {
              'pointer down': 'down',
              /* 'selection change': {
                actions: [
                  choose([
                    {
                      cond: (context, event) => Boolean(event.selection),
                      actions: raise('selected'),
                    },
                    {
                      cond: (context, event) => !event.selection,
                      actions: raise('deselected'),
                    },
                  ]),
                  assign({
                    selection: (context, event) => event.selection,
                  }),
                ],
              }, */
            },
          },
          down: {
            on: {
              'pointer up': 'up',
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
                    cond: (context) => console.log(context) || Boolean(context.selection),
                    target: 'hasSelection',
                  },
                },
              },
              hasSelection: {
                always: [
                  {
                    cond: 'hasSelectionAndPointerUp',
                    target: '#shown',
                  },
                  {
                    cond: 'hasNoSelectionAndPointerUp',
                    target: 'initial',
                  },
                ],
                on: {
                  'pointer up': {
                    cond: 'hasSelectionAndPointerUp',
                    target: '#shown',
                  },
                  'deselected': 'initial',
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
                      target: 'closing',
                      cond: 'hasNoSelectionAndPointerUp',
                    },
                    {
                      target: 'linkEditShown',
                      cond: 'hasSelectionAndPointerUp',
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
    actions: {},
    guards: {
      hasNoSelectionAndPointerUp(context, event, meta) {
        return meta.state.matches({ pointer: 'up' }) && !context.selection;
      },
      hasSelectionAndPointerUp(context, event, meta) {
        return meta.state.matches({ pointer: 'up' }) && !!context.selection;
      },
      pointerUp(context, event, meta) {
        return meta.state.matches({ pointer: 'up' });
      },
    },
  }
);

const {
  Provider: ToolbarStateProvider,
  useActor,
  useActorRef,
  useSelector,
  // useSelector: useToolbarStateSelector,
} = createActorContext(toolbarMachine);

// export function useSelector<T>(selector: Parameters<typeof useToolbarStateSelector<T>>[0], shallow?: boolean) {
//   return useToolbarStateSelector<T>(selector, shallow ? shallowEqual : undefined);
// }

export { ToolbarStateProvider, useActor, useActorRef, useSelector };
