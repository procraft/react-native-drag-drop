import type { MeasuredDimensions, SharedValue } from 'react-native-reanimated';

export function innerModify<T, A extends unknown[]>(
  modifier: (value: T, ...args: A) => T | void,
  ...args: A
) {
  'worklet';
  return (value: T) => {
    'worklet';
    const r = modifier(value, ...args);
    if (r === undefined) {
      return value;
    }
    return r;
  };
}

export function modify<T>(
  value: SharedValue<T>,
  modifier: (value: T) => T,
  forceUpdate?: boolean
) {
  'worklet';
  value.modify(modifier, forceUpdate);
}

export function cModify<T, A extends unknown[]>(
  modifier: (value: T, ...args: A) => T | void
) {
  'worklet';
  return (value: SharedValue<T>, args: A, forceUpdate?: boolean) => {
    'worklet';
    modify(value, innerModify(modifier, ...args), forceUpdate);
  };
}

export function toModify<T, A extends unknown[]>(
  value: SharedValue<T>,
  modifier: (value: T, ...args: A) => T | void,
  forceUpdate?: boolean
) {
  'worklet';
  return (...args: A) => {
    'worklet';
    modify(value, innerModify(modifier, ...args), forceUpdate);
  };
}

export function filterMap<T, U>(arr: T[], cb: (item: T) => U | null): U[] {
  'worklet';
  return arr.reduce((prev, curr) => {
    'worklet';
    const v = cb(curr);
    if (v != null) {
      prev.push(v);
    }
    return prev;
  }, [] as U[]);
}

export function easeInExpo(x: number): number {
  'worklet';
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}

export function checkCollision(a: MeasuredDimensions, b: MeasuredDimensions) {
  'worklet';
  return (
    a.pageX < b.pageX + b.width &&
    a.pageX + a.width > b.pageX &&
    a.pageY < b.pageY + b.height &&
    a.pageY + a.height > b.pageY
  );
}

export function minMax(min: number, max: number, value: number) {
  'worklet';
  return Math.min(max, Math.max(min, value));
}

export function calcSpeed(offset: number, delta: number) {
  'worklet';
  return minMax(0, 1, easeInExpo((offset + delta) / delta));
}
