import type { VirtualElement } from '@floating-ui/dom';
import { createActorContext } from '@xstate/react';
import { assign, createMachine, raise } from 'xstate';

import { choose } from 'xstate/lib/actions';

interface Context {
  /** Currently selected range, with keyboard or pointer */
  selection: null | {
    range: Range;
    isCollapsedLink: boolean;
  };
  /**
   * Reference for the Popups, updated only when the pointer is up (keyboard selection or pointer up)
   */
  reference: null | VirtualElement;
}

type Event =
  | { type: 'pointer down' }
  | { type: 'pointer up' }
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
    schema: {
      context: {} as Context,
      events: {} as Event,
    },
    context: {
      reference: null,
      selection: null,
    },
    type: 'parallel',
    // on: {
    //   'selection change': [
    //     {
    //       cond: (context, event) => !event.selection,
    //       target: '#selection.none',
    //       /** Should assign always as pointer UP is emitted AFTER selection */
    //       actions: ['assignSelection', 'clearReference'],
    //     },
    //     {
    //       cond: (context, event) => !!event.selection && event.collapsed,
    //       target: '#selection.collapsedLink',
    //       /** Should assign always as pointer UP is emitted AFTER selection */
    //       actions: 'assignSelection',
    //     },
    //     {
    //       cond: (context, event) => !!event.selection,
    //       target: '#selection.range',
    //       /** Should assign always as pointer UP is emitted AFTER selection */
    //       actions: 'assignSelection',
    //     },
    //   ],
    // },
    states: {
      selection: {
        id: 'selection',
        initial: 'none',
        states: {
          none: {
            on: {
              'selection change': [
                {
                  cond: 'rangeSelectionMouseUp',
                  actions: ['assignSelection'],
                  target: 'range',
                },
                {
                  actions: 'assignSelection',
                },
              ],
              'pointer up': [
                {
                  cond: 'collapsedLinkSelected',
                  target: 'collapsedLink',
                },
                {
                  cond: 'hasSelection',
                  target: 'range',
                },
              ],
            },
          },
          collapsedLink: {
            entry: ['assignReference', 'raiseSelected'],
            exit: ['clearReference', 'raiseDeselected'],
            on: {
              'selection change': [
                {
                  cond: 'hasSelection',
                  actions: ['assignSelection'],
                  target: 'range',
                },
                {
                  cond: 'noSelectionMouseUp',
                  actions: ['clearSelection'],
                  target: 'none',
                },
                {
                  actions: 'assignSelection',
                },
              ],
              'pointer up': [
                {
                  cond: 'hasSelection',
                  actions: ['assignSelection', 'assignReference', 'raiseSelected'],
                },
                {
                  cond: 'hasNoSelection',
                  target: 'none',
                },
              ],
            },
          },
          range: {
            entry: ['assignReference', 'raiseSelected'],
            exit: ['clearReference', 'raiseDeselected'],
            on: {
              'selection change': [
                {
                  cond: 'rangeSelectionMouseUp',
                  actions: ['assignSelection', 'assignReference', 'raiseSelected'],
                },
                {
                  cond: 'noSelectionMouseUp',
                  actions: ['clearSelection'],
                  target: 'none',
                },
                {
                  cond: 'hasNoSelection',
                  actions: ['clearSelection'],
                  target: 'none',
                },
                {
                  actions: 'assignSelection',
                },
              ],
              'pointer up': [
                {
                  cond: 'hasNoSelection',
                  target: 'none',
                },
                {
                  cond: 'hasSelection',
                  actions: ['assignSelection', 'assignReference', 'raiseSelected'],
                },
                {
                  cond: 'collapsedLinkSelected',
                  target: 'collapsedLink',
                  actions: ['assignSelection', 'assignReference', 'raiseSelected'],
                },
              ],
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
            id: 'hidden',
            initial: 'initial',
            states: {
              initial: {
                on: {
                  selected: {
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
    actions: {
      assignSelection: assign({
        selection: (context, event) => {
          if (event.type === 'selection change') {
            return event.selection
              ? {
                  range: event.selection,
                  isCollapsedLink: event.collapsed,
                }
              : null;
          }
          return context.selection;
        },
      }),
      clearSelection: assign({
        selection: null,
      }),
      assignReference: assign({
        reference: (context) => context.selection?.range || null,
      }),
      clearReference: assign({
        reference: null,
      }),
      raiseSelected: raise({ type: 'selected' }),
      raiseDeselected: raise({ type: 'deselected' }),
    },
    guards: {
      pointerUp(context, event, meta) {
        return meta.state.matches({ pointer: 'up' });
      },
      hasNoSelectionAndPointerUp(context, event, meta) {
        return meta.state.matches({ pointer: 'up' }) && !context.selection;
      },
      hasSelectionAndPointerUp(context, event, meta) {
        return meta.state.matches({ pointer: 'up' }) && !!context.selection;
      },
      hasNoSelection(context, event) {
        if (event.type === 'selection change') {
          return !event.selection;
        }
        return !context.selection;
      },
      hasSelection(context) {
        return !!context.selection;
      },
      rangeSelectionMouseUp(context, event, meta) {
        if (event.type === 'selection change' && event.selection) {
          return !event.collapsed && meta.state.matches({ pointer: 'up' });
        }
        return false;
      },
      noSelectionMouseUp(context, event, meta) {
        if (event.type === 'selection change') {
          return !event.selection && meta.state.matches({ pointer: 'up' });
        }
        return false;
      },
      collapsedLinkSelected(context) {
        return context.selection ? context.selection.isCollapsedLink : false;
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
