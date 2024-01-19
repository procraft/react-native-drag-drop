import type { MeasuredDimensions } from 'react-native-reanimated';

export type DragDropItemHandlerMap<T> = {
  [key: number | string]: DragDropItemHandler<T>;
};

export interface DragDropItemHandler<T> {
  id: string | number;
  data: T;
  measure: () => MeasuredDimensions | null;
}

export type RegisterItemHandler<T> = (
  id: number | string,
  handler: DragDropItemHandler<T>
) => () => void;
