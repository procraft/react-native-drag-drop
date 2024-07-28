export interface Offset {
  x: number;
  y: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ItemPosition {
  afterId?: string | number | null;
  beforeId?: string | number | null;
  overId?: string | number | null;
}
