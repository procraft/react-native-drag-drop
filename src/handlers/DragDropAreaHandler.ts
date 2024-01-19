import type { MeasuredDimensions } from 'react-native-reanimated';
import type {
  DragDropAreaConfig,
  DragDropItemType,
  ItemPosition,
} from '../types';

export type DragDropAreas<T = unknown> = {
  [key: string | number]: DragDropAreaHandler<T>;
};

export interface DragDropAreaHandler<T = unknown> {
  config: DragDropAreaConfig;
  measure: () => MeasuredDimensions | null;
  measureItem: (itemId: number | string) => MeasuredDimensions | null;
  itemMoved: (
    item: DragDropItemType<T>,
    hoverMeasurement: MeasuredDimensions
  ) => ItemPosition | null;
  tryPutItem: (
    item: DragDropItemType<T>,
    hoverMeasurement: MeasuredDimensions
  ) => ItemPosition | null;
  removeItem: (itemId: number | string) => void;
}
