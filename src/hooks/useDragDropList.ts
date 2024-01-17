import { useCallback, useMemo, type Component } from 'react';
import {
  useSharedValue,
  type AnimatedRef,
  type MeasuredDimensions,
} from 'react-native-reanimated';
import type {
  DragDropAreaHandler,
  DragDropItemHandler,
  RegisterItemHandler,
} from '../handlers';
import { modify } from '../utils';
import {
  useDragDropArea,
  type useDragDropAreaHandlers,
} from './useDragDropArea';

export function useDragDropList<T, TComponent extends Component>(
  areaRef: AnimatedRef<TComponent>,
  horizontal: boolean,
  initialItems: T[],
  // onChange: (items: T[], from: number, to: number) => void,
  extractId: (item: T) => number | string,
  config?: {
    groupId?: string;
    axis?: {
      horizontal?: boolean;
      vertical?: boolean;
    };
  }
) {
  const handlers = useSharedValue<{
    [key: string | number]: DragDropItemHandler<T>;
  }>({});

  const registerItemHandler = useCallback<RegisterItemHandler<T>>(
    (id, handler) => {
      modify(
        handlers,
        (v) => {
          'worklet';
          v[id] = handler;
          return v;
        },
        true
      );

      return () => {
        modify(
          handlers,
          (v) => {
            'worklet';
            delete v[id];
            return v;
          },
          true
        );
      };
    },
    [handlers]
  );

  const measureItem = useCallback(
    (id: number | string) => {
      'worklet';
      const handler = handlers.value[id];
      return handler?.measure() ?? null;
    },
    [handlers]
  );

  const findNeighboursItem = useCallback<
    (
      itemId: string | number,
      hoverMeasurement: MeasuredDimensions
    ) =>
      | [
          afterId: string | number | null | undefined,
          beforeId: string | number | null | undefined
        ]
      | null
  >(
    (itemId, hoverMeasurement) => {
      'worklet';

      const handlersWithMeasure: {
        handler: DragDropItemHandler<T>;
        measurement: MeasuredDimensions;
      }[] = [];
      for (const handler of Object.values(handlers.value)) {
        const measurement = handler.measure();
        if (measurement != null) {
          handlersWithMeasure.push({ handler, measurement });
        }
      }
      handlersWithMeasure.sort((a, b) =>
        horizontal
          ? a.measurement.pageX - b.measurement.pageX
          : a.measurement.pageY - b.measurement.pageY
      );
      const start = horizontal
        ? hoverMeasurement.pageX
        : hoverMeasurement.pageY;
      const length = horizontal
        ? hoverMeasurement.width
        : hoverMeasurement.height;
      const center = start + length / 2;

      let isBefore = true;
      let afterId: string | number | null = null;
      for (const { handler, measurement } of handlersWithMeasure) {
        if (handler.id === itemId) {
          isBefore = false;
          continue;
        }

        const itemStart = horizontal ? measurement.pageX : measurement.pageY;
        const itemLength = horizontal ? measurement.width : measurement.height;
        if (isBefore) {
          const minStart = itemStart + (length + itemLength) / 2;
          if (center < minStart) {
            return [undefined, handler.id];
          }
        } else {
          const minStart = itemStart + itemLength - (length + itemLength) / 2;
          if (center < minStart) {
            return [undefined, handler.id];
          } else {
            afterId = handler.id;
          }
        }
      }
      if (afterId != null) {
        return [afterId, undefined];
      }

      return null;
    },
    [handlers, horizontal]
  );

  const movingIds = useSharedValue<{ [key: string | number]: null }>({});
  const itemMoved = useCallback<DragDropAreaHandler<T>['itemMoved']>(
    (item, hoverMeasurement) => {
      'worklet';
      const nearItem = findNeighboursItem(item.id, hoverMeasurement);
      if (
        nearItem == null ||
        (nearItem[0] != null && nearItem[0] in movingIds.value) ||
        (nearItem[1] != null && nearItem[1] in movingIds.value)
      ) {
        return null;
      }
      return [item.id, nearItem[0], nearItem[1]];
    },
    [movingIds, findNeighboursItem]
  );

  const tryPutItem = useCallback<useDragDropAreaHandlers<T>['tryPutItem']>(
    (item, hoverMeasurement) => {
      'worklet';

      const nearItem = findNeighboursItem(item.id, hoverMeasurement);
      if (
        nearItem == null ||
        (nearItem[0] != null && nearItem[0] in movingIds.value) ||
        (nearItem[1] != null && nearItem[1] in movingIds.value)
      ) {
        return null;
      }
      return nearItem;
    },
    [movingIds, findNeighboursItem]
  );

  const removeItem = useCallback<useDragDropAreaHandlers<T>['removeItem']>(
    (itemId) => {
      'worklet';

      modify(movingIds, (v) => {
        'worklet';
        delete v[itemId];
        return v;
      });
      modify(handlers, (v) => {
        'worklet';
        delete v[itemId];
        return v;
      });
    },
    [handlers, movingIds]
  );

  const handlerCallbacks = useMemo<useDragDropAreaHandlers<T>>(
    () => ({
      measureItem,
      itemMoved,
      tryPutItem,
      removeItem,
    }),
    [measureItem, itemMoved, tryPutItem, removeItem]
  );

  const value = useDragDropArea(
    areaRef,
    initialItems,
    extractId,
    handlerCallbacks,
    config
  );

  const onTransitionDone = useCallback(
    (id: string | number) => {
      'worklet';
      modify(movingIds, (v) => {
        delete v[id];
        return v;
      });
    },
    [movingIds]
  );

  return useMemo(
    () => ({ ...value, registerItemHandler, onTransitionDone }),
    [value, registerItemHandler, onTransitionDone]
  );
}
