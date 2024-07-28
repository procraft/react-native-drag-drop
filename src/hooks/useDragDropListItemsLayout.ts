import type { MeasuredDimensions, SharedValue } from 'react-native-reanimated';
import type { DragDropListConfig, ItemPosition } from '../types';
import { useCallback } from 'react';
import type { DragDropItemHandler, DragDropItemHandlerMap } from '../handlers';

function measuredDimensionsToLine(
  listConfig: SharedValue<DragDropListConfig>,
  measurement: MeasuredDimensions
): [start: number, size: number] {
  'worklet';
  return [
    listConfig.value.horizontal ? measurement.pageX : measurement.pageY,
    listConfig.value.horizontal ? measurement.width : measurement.height,
  ];
}

export function useDragDropListItemsLayout<T>(
  handlers: SharedValue<DragDropItemHandlerMap<T>>,
  listConfig: SharedValue<DragDropListConfig>
) {
  const getSortedHandlers = useCallback(() => {
    'worklet';

    const handlersWithMeasure: {
      handler: DragDropItemHandler<T>;
      measurement: MeasuredDimensions;
      itemStart: number;
      itemSize: number;
    }[] = [];
    for (const handler of Object.values(handlers.value)) {
      const measurement = handler.measure();
      if (measurement != null) {
        const [itemStart, itemSize] = measuredDimensionsToLine(
          listConfig,
          measurement
        );
        handlersWithMeasure.push({
          handler,
          measurement,
          itemStart,
          itemSize,
        });
      }
    }
    handlersWithMeasure.sort((a, b) =>
      listConfig.value.horizontal
        ? a.measurement.pageX - b.measurement.pageX
        : a.measurement.pageY - b.measurement.pageY
    );

    return handlersWithMeasure;
  }, [handlers, listConfig]);

  const findNeighboursItem = useCallback<
    (
      itemId: string | number,
      hoverMeasurement: MeasuredDimensions
    ) => ItemPosition | null
  >(
    (itemId, hoverMeasurement) => {
      'worklet';

      const handlersWithMeasure = getSortedHandlers();

      const [hoverStart, hoverSize] = measuredDimensionsToLine(
        listConfig,
        hoverMeasurement
      );
      const hoverCenter = hoverStart + hoverSize / 2;
      const hoverHalfSize = hoverSize / 2;

      let isBefore = true;
      let afterId: string | number | null | undefined;
      let overId: string | number | null | undefined;
      for (const { handler, itemStart, itemSize } of handlersWithMeasure) {
        if (hoverCenter > itemStart && hoverCenter < itemStart + itemSize) {
          overId = handler.id;
        }

        if (handler.id === itemId) {
          isBefore = false;
          continue;
        }

        const offset = isBefore ? hoverHalfSize : -hoverHalfSize;
        const minStart = itemStart + itemSize / 2 + offset;

        if (hoverCenter < minStart) {
          return isBefore
            ? { beforeId: handler.id, overId }
            : { afterId, overId };
        } else if (!isBefore) {
          afterId = handler.id;
        }
      }

      const result: ItemPosition = {};

      if (afterId != null) {
        result.afterId = afterId;
      }

      if (overId != null) {
        result.overId = overId;
      }

      return Object.keys(result).length > 0 ? result : null;
    },
    [listConfig, getSortedHandlers]
  );

  const measureItem = useCallback(
    (id: number | string) => {
      'worklet';
      const handler = handlers.value[id];
      return handler?.measure() ?? null;
    },
    [handlers]
  );

  return { findNeighboursItem, measureItem };
}
