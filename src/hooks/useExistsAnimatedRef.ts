import { Component, useRef } from 'react';
import {
  useAnimatedRef,
  useSharedValue,
  type AnimatedRef,
  type SharedValue,
} from 'react-native-reanimated';

export interface ExistsAnimatedRef<T extends Component> {
  current: T | null;
  (component?: T | null): void;
}

export function useExistsAnimatedRef<TComponent extends Component>(): [
  animatedRef: AnimatedRef<TComponent>,
  exists: SharedValue<boolean>,
  ref: ExistsAnimatedRef<TComponent>
] {
  const exists = useSharedValue(false);
  const animatedRef = useAnimatedRef<TComponent>();

  const ref = useRef<ExistsAnimatedRef<TComponent>>();

  if (!ref.current) {
    const fun: ExistsAnimatedRef<TComponent> = <ExistsAnimatedRef<TComponent>>((
      component
    ) => {
      if (component == null) {
        exists.value = false;
      } else {
        exists.value = true;
        fun.current = component;
      }
      fun.current = component ?? null;
      animatedRef(component ?? undefined);
    });

    ref.current = fun;
  }

  return [animatedRef, exists, ref.current];
}
