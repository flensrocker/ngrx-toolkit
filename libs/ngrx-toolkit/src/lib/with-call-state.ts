import { Signal, computed } from '@angular/core';
import {
  SignalStoreFeature,
  signalStoreFeature,
  withComputed,
  withState,
} from '@ngrx/signals';
import { Emtpy } from './shared/empty';

export type CallState = 'init' | 'loading' | 'loaded' | { error: string };

export type NamedCallStateSlice<Collection extends string> = {
  [K in Collection as `${K}CallState`]: CallState;
};

export type CallStateSlice = {
  callState: CallState
}

export type NamedCallStateSignals<Prop extends string> = {
  [K in Prop as `${K}Loading`]: Signal<boolean>;
} & {
    [K in Prop as `${K}Loaded`]: Signal<boolean>;
  } & {
    [K in Prop as `${K}Error`]: Signal<string | null>;
  }

export type CallStateSignals = {
  loading: Signal<boolean>;
  loaded: Signal<boolean>;
  error: Signal<string | null>
}

export type SetCallState<Prop extends string | undefined> = Prop extends string
  ? NamedCallStateSlice<Prop>
  : CallStateSlice;

export function getCallStateKeys(config?: { collection?: string }) {
  const prop = config?.collection;
  return {
    callStateKey: prop ?  `${config.collection}CallState` : 'callState',
    loadingKey: prop ? `${config.collection}Loading` : 'loading',
    loadedKey: prop ? `${config.collection}Loaded` : 'loaded',
    errorKey: prop ? `${config.collection}Error` : 'error',
  };
}

export function withCallState<Collection extends string>(config: {
  collection: Collection;
}): SignalStoreFeature<
  { state: Emtpy, signals: Emtpy, methods: Emtpy },
  {
    state: NamedCallStateSlice<Collection>,
    signals: NamedCallStateSignals<Collection>,
    methods: Emtpy
  }
>;
export function withCallState(): SignalStoreFeature<
  { state: Emtpy, signals: Emtpy, methods: Emtpy },
  {
    state: CallStateSlice,
    signals: CallStateSignals,
    methods: Emtpy
  }
>;
export function withCallState<Collection extends string>(config?: {
  collection: Collection;
}): SignalStoreFeature {
  const { callStateKey, errorKey, loadedKey, loadingKey } =
    getCallStateKeys(config);

  return signalStoreFeature(
    withState({ [callStateKey]: 'init' }),
    withComputed((state: Record<string, Signal<unknown>>) => {

      const callState = state[callStateKey] as Signal<CallState>;

      return {
        [loadingKey]: computed(() => callState() === 'loading'),
        [loadedKey]: computed(() => callState() === 'loaded'),
        [errorKey]: computed(() => {
          const v = callState();
          return typeof v === 'object' ? v.error : null;
        })
      }
    })
  );
}

export function setLoading<Prop extends string | undefined = undefined>(
  prop?: Prop
): SetCallState<Prop> {
  if (prop) {
    return { [`${prop}CallState`]: 'loading' } as SetCallState<Prop>;
  }

  return { callState: 'loading' } as SetCallState<Prop>;
}

export function setLoaded<Prop extends string | undefined = undefined>(
  prop?: Prop
): SetCallState<Prop> {

  if (prop) {
    return { [`${prop}CallState`]: 'loaded' } as SetCallState<Prop>;
  }
  else {
    return { callState: 'loaded' } as SetCallState<Prop>;
  }
}

export function setError<Prop extends string | undefined = undefined>(
  error: unknown,
  prop?: Prop,
  ): SetCallState<Prop> {

    let errorMessage = '';

    if (!error) {
      errorMessage = '';
    }
    else if (typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }
    else {
      errorMessage = String(error);
    }
    

    if (prop) {
      return { [`${prop}CallState`]: { error: errorMessage } } as SetCallState<Prop>;
    }
    else {
      return { callState: { error: errorMessage } } as SetCallState<Prop>;
    }
}
