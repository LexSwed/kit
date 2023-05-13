import { createActorContext } from '@xstate/react';
import { assign, createMachine } from 'xstate';

interface Context {
  /** Currently selected range, with keyboard or pointer */
  selection: null | {
    range: Range;
    isCollapsedLink: boolean;
  };
  /**
   * Reference for the Popups, updated only when the pointer is up (keyboard selection or pointer up)
   */
  reference: null | Range;
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
    on: {
      'selection change': {
        actions: ['assignSelection'],
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
            id: 'hidden',
            initial: 'initial',
            states: {
              initial: {
                on: {
                  'selection change': [
                    {
                      /**
                       * This prevents the toolbar to open on links when navigating with keyboard.
                       * This has a "bug" for a click within selected link to not open the toolbar.
                       */
                      cond: 'rangeSelectionMouseUp',
                      target: '#toolbar.shown',
                      actions: ['assignSelection', 'assignReference'],
                    },
                    {
                      cond: 'noSelectionMouseUp',
                      target: '#toolbar.hidden',
                      actions: ['clearSelection', 'clearReference'],
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
                      target: '#toolbar.shown',
                      actions: ['assignReference'],
                    },
                    {
                      cond: 'hasCollapsedLinkSelection',
                      target: '#toolbar.shown',
                      actions: ['assignReference'],
                    },
                  ],
                },
              },
            },
          },
          shown: {
            id: 'shown',
            initial: 'open',
            states: {
              open: {
                on: {
                  'edit link': 'openingLinkEdit',
                },
              },
              /** opening link edit also selects whole link */
              openingLinkEdit: {
                on: {
                  'selection change': [
                    {
                      cond: 'hasNoSelectionAndPointerUp',
                      target: '#shown.closing',
                      actions: ['clearSelection', 'clearReference'],
                    },
                    {
                      cond: 'hasSelectionAndPointerUp',
                      target: '#shown.linkEditShown',
                      actions: ['assignSelection', 'assignReference'],
                    },
                  ],
                },
                /** but if it doesn't happen, open link edit anyway */
                after: {
                  100: [
                    {
                      cond: 'hasNoSelection',
                      target: '#shown.closing',
                      actions: ['clearSelection', 'clearReference'],
                    },
                    {
                      cond: 'hasSelectionAndPointerUp',
                      target: '#shown.linkEditShown',
                      actions: ['assignSelection', 'assignReference'],
                    },
                  ],
                },
              },
              linkEditShown: {
                on: {
                  'cancel link edit': '#shown',
                  'pointer up': [
                    {
                      cond: 'hasNoSelection',
                      target: '#shown.closing',
                      actions: ['clearSelection', 'clearReference'],
                    },
                    // keep open for pointer ups inside popup
                    {
                      actions: ['assignSelection', 'assignReference'],
                    },
                  ],
                  'selection change': {
                    target: '#shown.open',
                    actions: ['assignSelection', 'assignReference'],
                  },
                },
              },
              closing: {
                after: {
                  200: [
                    {
                      cond: 'hasSelectionAndPointerUp',
                      target: '#shown.open',
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
                target: '#shown.closing',
              },
              'selection change': [
                {
                  cond: 'rangeSelectionMouseUp',
                  target: '#shown.open',
                  actions: ['assignSelection', 'assignReference'],
                },
                {
                  cond: 'noSelectionMouseUp',
                  target: '#shown.closing',
                  actions: ['clearSelection', 'clearReference'],
                },
                {
                  actions: ['assignSelection'],
                },
              ],
              'pointer up': [
                {
                  cond: 'hasNoSelection',
                  target: '#shown.closing',
                  actions: ['clearReference'],
                },
                {
                  cond: 'hasRangeSelection',
                  target: '#shown.open',
                  actions: ['assignReference'],
                },
                {
                  cond: 'hasCollapsedLinkSelection',
                  target: '#shown.open',
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
    },
    guards: {
      hasNoSelectionAndPointerUp(context, event, meta) {
        return meta.state.matches({ pointer: 'up' }) && !context.selection;
      },
      hasSelectionAndPointerUp(context, event, meta) {
        return meta.state.matches({ pointer: 'up' }) && !!context.selection;
      },
      hasNoSelection(context) {
        return !context.selection;
      },
      hasRangeSelection(context) {
        return context.selection ? !context.selection.isCollapsedLink : false;
      },
      hasCollapsedLinkSelection(context) {
        return context.selection ? context.selection.isCollapsedLink : false;
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
