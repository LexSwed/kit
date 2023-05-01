import { createStore, reconcile } from 'solid-js/store';

export const useReducer = <State extends object, Action>(
  reducer: (state: State, action: Action) => State,
  state: State
) => {
  const [store, setStore] = createStore(state);
  const dispatch = (action: Action) => {
    state = reducer(state, action);
    setStore(reconcile(state));
  };
  return [store, dispatch] as const;
};
