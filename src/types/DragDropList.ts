export interface DragDropListConfig {
  horizontal: boolean;
}

export interface DragDropListHandlers<T> {
  onItemChangedPosition?: (items: T[], from: number, to: number) => void;
  onItemAdded?: (items: T[], item: T) => void;
  onItemRemoved?: (items: T[], item: T) => void;
}
