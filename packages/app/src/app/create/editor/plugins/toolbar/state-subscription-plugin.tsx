import { useEffect, memo } from 'react';
import { useActorRef } from './state';

export const StateSubscriptionPlugin = memo(function StateSubscriptionPlugin() {
  const actor = useActorRef();

  useEffect(() => {
    const { unsubscribe } = actor.subscribe((state) => {
      console.log(state.event, state.value);
    });
    return unsubscribe;
  }, [actor]);

  return null;
});
