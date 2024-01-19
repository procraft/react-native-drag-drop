import type { DragDropItemId, DragDropItemType } from '../types';

export function convertToDragDrop<T>(
  item: T,
  extractId: (item: T) => DragDropItemId
): DragDropItemType<T> {
  return {
    id: extractId(item),
    data: item,
  };
}

export function convertArrToDragDrop<T>(
  items: T[],
  extractId: (item: T) => DragDropItemId
): DragDropItemType<T>[] {
  return items.map((item) => ({ id: extractId(item), data: item }));
}

export function convertDragDropToArr<T>(items: DragDropItemType<T>[]): T[] {
  return items.map((item) => item.data);
}

export function extractDragDropId(item: DragDropItemType<any>): DragDropItemId {
  return item.id;
}
