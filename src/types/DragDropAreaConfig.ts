export interface DragDropAreaConfig {
  groupId?: string;
  axis?: {
    horizontal?: boolean;
    vertical?: boolean;
  };
  mode?: DragDropAreaConfigMode;
}

export type DragDropAreaConfigMode = 'MOVE' | 'SWAP';
