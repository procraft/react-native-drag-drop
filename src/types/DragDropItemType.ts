import type { SharedValue } from 'react-native-reanimated';

export interface DragDropItemType<T> {
  id: string | number;
  data: T;
}

export type DragDropRenderItem<T> = (
  item: DragDropItemType<T>,
  isActive: SharedValue<boolean>,
  drag: () => void
) => JSX.Element;
