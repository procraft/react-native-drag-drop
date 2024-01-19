import type { SharedValue } from 'react-native-reanimated';

export type DragDropItemId = number | string;

export interface DragDropItemType<T> {
  id: DragDropItemId;
  data: T;
}

export type DragDropRenderItem<T> = (
  item: DragDropItemType<T>,
  isActive: SharedValue<boolean>,
  drag: () => void
) => JSX.Element;
