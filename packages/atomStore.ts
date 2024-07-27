import { useSyncExternalStore, useMemo, useRef } from "react";
import { StoreChangeCb } from "./types";

class Store<T = object> {
  private listener = new Set<StoreChangeCb>();

  constructor(public state: T) {}

  getState() {
    return this.state;
  }

  setState(editState: Partial<T>) {
    this.state = {
      ...this.state,
      ...editState,
    };
    this.trigger();
  }

  subscribe(storeChangeCb: StoreChangeCb) {
    this.listener.add(storeChangeCb);
    return () => {
      this.listener.delete(storeChangeCb);
    };
  }

  private trigger() {
    for (const storeChangeCb of this.listener) {
      storeChangeCb();
    }
  }
}

export function createStore<T extends object>(state: T) {
  return new Store(state);
}

export function useStore<
  T extends Store,
  V extends Partial<T["state"]> = T["state"]
>(store: T, picker?: (state: T["state"]) => V) {
  const allState = store.getState();
  const usedState = (picker ? picker(allState) : allState) as V;

  const preState = useRef({} as V);
  const state = useSyncExternalStore(
    store.subscribe.bind(store),
    useMemo(() => {
      let cache = usedState;
      return () => {
        const newUsedState = store.getState() as V;
        for (const key in cache) {
          if (!Object.is(newUsedState[key], cache[key])) {
            cache = {
              ...cache,
              [key]: newUsedState[key],
            };
          }
        }
        return cache;
      };
    }, [])
  );
  preState.current = state;

  const dispatch = (s: V | ((state: V) => V)) => {
    if (typeof s === "function") s = s(preState.current);
    const editState = {} as V;
    for (const key in preState.current) {
      editState[key] = s[key];
    }
    store.setState(editState);
  };

  return [state, dispatch] as const;
}
