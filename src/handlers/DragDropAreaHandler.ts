import type { MeasuredDimensions } from 'react-native-reanimated';
import type { DragDropItemType } from '../types';

export type DragDropAreas<T = unknown> = {
  [key: string | number]: DragDropAreaHandler<T>;
};

export interface DragDropAreaHandler<T = unknown> {
  groupId?: string;
  axis: {
    horizontal: boolean;
    vertical: boolean;
  };
  measure: () => MeasuredDimensions | null;
  measureItem: (itemId: number | string) => MeasuredDimensions | null;
  itemMoved: (
    item: DragDropItemType<T>,
    hoverMeasurement: MeasuredDimensions
  ) =>
    | [
        itemId: string | number,
        afterId: string | number | null | undefined,
        beforeId: string | number | null | undefined
      ]
    | null;
  tryPutItem: (
    item: DragDropItemType<T>,
    hoverMeasurement: MeasuredDimensions
  ) =>
    | [
        afterId: string | number | null | undefined,
        beforeId: string | number | null | undefined
      ]
    | null;
  removeItem: (itemId: number | string) => void;
}
