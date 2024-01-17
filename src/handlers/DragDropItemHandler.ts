import type { MeasuredDimensions } from 'react-native-reanimated';

export interface DragDropItemHandler<T> {
  id: string | number;
  data: T;
  measure: () => MeasuredDimensions | null;
}

export type RegisterItemHandler<T> = (
  id: number | string,
  handler: DragDropItemHandler<T>
) => () => void;
