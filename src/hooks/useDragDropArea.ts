import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type Component,
} from 'react';
import { measure, type AnimatedRef } from 'react-native-reanimated';
import { DragDropContext } from '../contexts';
import type { DragDropAreaHandler } from '../handlers';
import type { DragDropAreaConfig } from '../types/DragDropAreaConfig';

export function useDragDropArea<T, TComponent extends Component>(
  areaRef: AnimatedRef<TComponent>,
  handlers: Omit<DragDropAreaHandler<T>, 'config' | 'measure'>,
  config?: DragDropAreaConfig
) {
  const { registerDragDropArea, removeDragDropArea } =
    useContext(DragDropContext);

  const { measureItem, itemMoved, tryPutItem, removeItem } = handlers;

  const measureArea = useCallback(() => {
    'worklet';
    return measure(areaRef);
  }, [areaRef]);

  const handler = useMemo<DragDropAreaHandler<T>>(
    () => ({
      config: config ?? {
        axis: {
          horizontal: true,
          vertical: true,
        },
      },
      measure: measureArea,
      measureItem,
      itemMoved,
      tryPutItem,
      removeItem,
    }),
    [config, measureArea, measureItem, itemMoved, tryPutItem, removeItem]
  );

  const areaId = useMemo(
    () => registerDragDropArea(handler as DragDropAreaHandler<unknown>),
    // because useEffect has deps removeDragDropArea
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handler, registerDragDropArea, removeDragDropArea]
  );
  useEffect(
    () => () => {
      removeDragDropArea(areaId);
    },
    [areaId, removeDragDropArea]
  );

  return { areaId };
}
