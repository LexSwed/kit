import { useInterpret, useMachine, useSelector } from '@xstate/react';
import { TextNode, ElementNode } from 'lexical';
import { assign, createMachine, raise, send } from 'xstate';

type SelectionChangeEvent = { type: 'selection change'; selection: null | TextNode | ElementNode };

const toolbarMachine = createMachine(
  {
    id: 'toolbar',
    initial: 'hidden',
    schema: {
      context: {} as { value: string; pointerUp: boolean; selection: null | TextNode | ElementNode },
      events: {} as
        | { type: 'pointer down' }
        | SelectionChangeEvent
        | { type: 'pointer up' }
        | { type: 'edit link' }
        | { type: 'close' }
        | { type: 'cancel link edit' },
    },
    context: {
      pointerUp: true,
      selection: null,
      value: '',
    },
    on: {
      'pointer up': { actions: 'pointerUp' },
      'pointer down': { actions: 'pointerDown' },
    },
    states: {
      hidden: {
        id: 'hidden',
        initial: 'initial',
        states: {
          initial: {
            on: {
              'selection change': {
                cond: 'hasSelection',
                target: '#shown',
                actions: 'updateSelection',
              },
            },
          },
        },
      },
      shown: {
        id: 'shown',
        initial: 'initial',
        on: {
          'selection change': {
            actions: ['updateSelection', raise({ type: 'close' })],
          },
        },
        states: {
          initial: {
            on: {
              'edit link': 'linkEditShown',
              'close': 'closing',
            },
          },
          linkEditShown: {
            on: {
              'cancel link edit': 'initial',
              'close': {
                target: 'closing',
              },
            },
          },
          closing: {
            entry: 'updateSelection',
            after: {
              250: '#hidden.initial',
            },
          },
        },
      },
    },
    predictableActionArguments: true,
  },
  {
    actions: {
      pointerUp: assign({
        pointerUp: true,
      }),
      pointerDown: assign({
        pointerUp: false,
      }),
      updateSelection: assign({
        selection: (context, event) => {
          console.log('update', event);
          if (event.type === 'selection change') {
            return event.selection || null;
          }
          return context.selection;
        },
      }),
    },
    guards: {
      hasNoSelectionAndPointerUp(context) {
        console.log(context);
        return context.pointerUp && !context.selection;
      },
      hasSelection(context, event) {
        if (event.type === 'selection change') {
          return context.pointerUp && event.selection !== null;
        }
        return false;
      },
    },
  }
);

export function useToolbarActor() {
  return useInterpret(toolbarMachine);
}
