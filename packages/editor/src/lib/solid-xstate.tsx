import {
  type AnyStateMachine,
  type AreAllImplementationsAssumedToBeProvided,
  type InternalMachineImplementations,
  interpret,
  type InterpreterOptions,
  type Observer,
  type StateFrom,
  toObserver,
  StateMachine,
  type ActorRefFrom,
  type MarkAllImplementationsAsProvided,
  type SnapshotFrom,
} from 'xstate';
import { createContext, onCleanup, useContext, type ParentProps, createEffect } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import React from 'react';

type RestParams<TMachine extends AnyStateMachine> = AreAllImplementationsAssumedToBeProvided<
  TMachine['__TResolvedTypesMeta']
> extends false
  ? [
      options: InterpreterOptions<TMachine> &
        InternalMachineImplementations<
          TMachine['__TContext'],
          TMachine['__TEvent'],
          TMachine['__TResolvedTypesMeta'],
          true
        >,
      observerOrListener?: Observer<StateFrom<TMachine>> | ((value: StateFrom<TMachine>) => void)
    ]
  : [
      options?: InterpreterOptions<TMachine> &
        InternalMachineImplementations<TMachine['__TContext'], TMachine['__TEvent'], TMachine['__TResolvedTypesMeta']>,
      observerOrListener?: Observer<StateFrom<TMachine>> | ((value: StateFrom<TMachine>) => void)
    ];

export function useInterpret<TMachine extends AnyStateMachine>(
  getMachine: MaybeLazy<TMachine>,
  ...[options = {}, observerOrListener]: RestParams<TMachine>
) {
  const machine = typeof getMachine === 'function' ? getMachine() : getMachine;

  const { guards, actions, actors, delays, ...interpreterOptions } = options;

  const machineConfig = {
    guards,
    actions,
    actors,
    delays,
  };

  const machineWithConfig = machine.provide(machineConfig as any);

  const service = interpret(machineWithConfig, interpreterOptions).start();

  let sub: undefined | ReturnType<typeof service.subscribe>;
  if (observerOrListener) {
    sub = service.subscribe(toObserver(observerOrListener as any));
  }

  onCleanup(() => {
    service.stop();
    sub?.unsubscribe();
  });

  return service;
}

type MaybeLazy<T> = T | (() => T);

export function createActorContext<TMachine extends AnyStateMachine>(
  machine: TMachine,
  interpreterOptions?: InterpreterOptions<TMachine>,
  observerOrListener?: Observer<StateFrom<TMachine>> | ((value: StateFrom<TMachine>) => void)
) {
  const Context = createContext<ActorRefFrom<TMachine> | null>(null);

  const OriginalProvider = Context.Provider;

  function Provider(props: ParentProps) {
    const [state, setState] = createStore<StateFrom<TMachine>>({} as StateFrom<TMachine>);
    function listener(nextState: StateFrom<TMachine>) {
      if (nextState.changed) {
        setState(reconcile(nextState));
      }
    }

    const service = useInterpret(machine, interpreterOptions, listener);

    if (observerOrListener) {
      const sub = service.subscribe(observerOrListener as any);
      onCleanup(() => {
        return () => {
          sub.unsubscribe();
        };
      });
    }

    return <OriginalProvider value={service as any}>{props.children}</OriginalProvider>;
  }

  function useActorContext(): ActorRefFrom<TMachine> {
    const actor = useContext(Context);
    if (!actor) {
      throw new Error('xstate actor hooks should be called from components wrapped into Provider');
    }

    return actor;
  }

  function useMachine() {
    const actor = useActorContext();
    return [actor];
  }

  return {
    Provider,
    useActorContext,
    useMachine,
  };
}
