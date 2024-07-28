import React from 'react';
import type { DragDropAreaHandler } from '../handlers';
import type { DragDropItemType } from '../types';
import type { SharedValue } from 'react-native-reanimated';

export interface DragDropContextType {
  isMoving?: SharedValue<boolean>;
  startDrag: (
    area: {
      id: number;
      groupId?: string;
    },
    item: DragDropItemType<unknown>,
    itemJSX: JSX.Element,
    onEnd?: () => void
  ) => void;
  registerDragDropArea: (handler: DragDropAreaHandler<unknown>) => number;
  removeDragDropArea: (id: number) => void;
}

export const DragDropContext = React.createContext<DragDropContextType>({
  startDrag: () => {},
  registerDragDropArea: () => -1,
  removeDragDropArea: () => {},
});
