import type { DragDropItemType } from './DragDropItemType';
import type { Position, Size } from './common';

export interface DragDropItemInfo<T = unknown> {
  area: {
    id: number;
    groupId?: string;
  };
  item: DragDropItemType<T>;
  position: Position;
  size: Size;
  onEnd?: () => void;
}
