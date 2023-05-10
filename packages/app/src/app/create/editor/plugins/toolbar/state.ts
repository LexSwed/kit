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
    states: {
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
                on: {},
              },
            },
            on: {
              'selection change': [
                // {
                //   cond: 'collapsedLinkSelectionMouseUp',
                //   target: '#toolbar.shown',
                //   actions: ['assignSelection', 'assignReference'],
                // },
                {
                  cond: 'rangeSelectionMouseUp',
                  target: '#toolbar.openState',
                  actions: ['assignSelection', 'assignReference'],
                },
                {
                  cond: 'noSelectionMouseUp',
                  target: '#toolbar.hidden',
                  actions: ['clearSelection', 'clearReference'],
                },
                {
                  actions: ['assignSelection'],
                },
              ],
              'pointer up': [
                {
                  cond: 'hasNoSelection',
                  target: '#toolbar.hidden',
                  actions: ['clearReference'],
                },
                {
                  cond: 'hasRangeSelection',
                  target: '#toolbar.openState',
                  actions: ['assignReference'],
                },
                {
                  cond: 'hasCollapsedLinkSelection',
                  target: '#toolbar.openState',
                  actions: ['assignReference'],
                },
              ],
            },
          },
          openState: {
            id: 'openState',
            initial: 'open',
            states: {
              open: {
                on: {
                  'edit link': 'openingLinkEdit',
                },
              },
              // add artificial delay for when whole link is selected and then open the popup
              openingLinkEdit: {
                on: {
                  'selection change': [
                    {
                      cond: 'hasNoSelectionAndPointerUp',
                      target: '#openState.closing',
                    },
                    {
                      cond: 'hasSelectionAndPointerUp',
                      target: '#openState.linkEditShown',
                    },
                  ],
                },
              },
              linkEditShown: {
                on: {
                  'cancel link edit': '#openState',
                },
              },
              closing: {
                after: {
                  200: [
                    {
                      cond: 'hasSelectionAndPointerUp',
                      target: '#openState.open',
                    },
                    {
                      target: '#toolbar.hidden',
                      cond: 'hasNoSelectionAndPointerUp',
                    },
                  ],
                },
              },
            },
            on: {
              'close': {
                target: '#openState.closing',
              },
              'selection change': [
                {
                  cond: 'collapsedLinkSelectionMouseUp',
                  target: '#openState.open',
                  actions: ['assignSelection', 'assignReference'],
                },
                {
                  cond: 'rangeSelectionMouseUp',
                  target: '#openState.open',
                  actions: ['assignSelection', 'assignReference'],
                },
                {
                  cond: 'noSelectionMouseUp',
                  target: '#openState.closing',
                  actions: ['clearSelection', 'clearReference'],
                },
                {
                  actions: ['assignSelection'],
                },
              ],
              'pointer up': [
                {
                  cond: 'hasNoSelection',
                  target: '#openState.closing',
                  actions: ['clearReference'],
                },
                {
                  cond: 'hasRangeSelection',
                  target: '#openState.open',
                  actions: ['assignReference'],
                },
                {
                  cond: 'hasCollapsedLinkSelection',
                  target: '#openState.open',
                  actions: ['assignReference'],
                },
              ],
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
        return !context.selection;
      },
      hasRangeSelection(context) {
        return context.selection ? !context.selection.isCollapsedLink : false;
      },
      hasCollapsedLinkSelection(context) {
        return context.selection ? context.selection.isCollapsedLink : false;
      },
      /** Sometimes selection event is emitted after the pointer is up.
       * Example: select range on the link, click within the link.
       */
      collapsedLinkSelectionMouseUp(context, event, meta) {
        if (event.type === 'selection change' && event.selection) {
          return event.collapsed && meta.state.matches({ pointer: 'up' });
        }
        return false;
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
