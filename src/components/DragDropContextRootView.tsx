import { modify } from '@procraft/react-native-autoscroll';
import React, { useCallback, useContext, useMemo, useRef } from 'react';
import type { ViewProps } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useDerivedValue,
  useSharedValue,
  type MeasuredDimensions,
} from 'react-native-reanimated';
import { DragDropContext, HoveredItemContext } from '../contexts';
import type { DragDropContextType } from '../contexts/DragDropContext';
import type { DragDropAreaHandler, DragDropAreas } from '../handlers';
import { useDragDropMove } from '../hooks';
import type { DragDropItemInfo } from '../types';

export interface DragDropContextRootViewProps {
  children: React.ReactNode;
  style?: ViewProps['style'];
}

export function DragDropContextRootView(props: DragDropContextRootViewProps) {
  const { children, style } = props;

  const { setHoveredItem } = useContext(HoveredItemContext);

  const dragDropId = useRef(-1);
  const dragDropAreas = useSharedValue<DragDropAreas>({});

  const dragDropItemInfo = useSharedValue<DragDropItemInfo | null>(null);
  const startDragInfo = useRef<Parameters<DragDropContextType['startDrag']>>();
  const startDragMeasureInfo = useSharedValue<{
    areaId: number;
    itemId: string | number;
  } | null>(null);

  const isMoving = useSharedValue(false);
  const hoveredItemMeasurement = useSharedValue<MeasuredDimensions | null>(
    null
  );

  const registerDragDropArea = useCallback<
    DragDropContextType['registerDragDropArea']
  >(
    (handler: DragDropAreaHandler<unknown>) => {
      const id = ++dragDropId.current;
      modify(dragDropAreas, (v) => {
        'worklet';
        v[id] = handler;
        return v;
      });
      return id;
    },
    [dragDropId, dragDropAreas]
  );

  const removeDragDropArea = useCallback<
    DragDropContextType['removeDragDropArea']
  >(
    (id) => {
      modify(dragDropAreas, (v) => {
        'worklet';
        delete v[id];
        return v;
      });
    },
    [dragDropAreas]
  );
  const onStartDrag = useCallback(
    (
      areaId: number,
      itemId: number | string,
      itemMeasurement: MeasuredDimensions
    ) => {
      if (startDragInfo.current == null) {
        return;
      }
      const [area, item, itemJSX, onEnd] = startDragInfo.current;
      if (area.id !== areaId || item.id !== itemId) {
        return;
      }

      const position = { x: itemMeasurement.pageX, y: itemMeasurement.pageY };
      const size = {
        width: itemMeasurement.width,
        height: itemMeasurement.height,
      };

      setHoveredItem(itemJSX, position, size);
      dragDropItemInfo.value = { area, item, position, size, onEnd };
    },
    [dragDropItemInfo, setHoveredItem]
  );

  useDerivedValue(() => {
    if (startDragMeasureInfo.value == null) {
      return;
    }

    const areaId = startDragMeasureInfo.value.areaId;
    const itemId = startDragMeasureInfo.value.itemId;
    const areaHandler = dragDropAreas.value[areaId];

    const measureItem = areaHandler?.measureItem;

    if (typeof measureItem !== 'function') {
      return;
    }

    const itemMeasurement = areaHandler?.measureItem(itemId);
    if (itemMeasurement == null) {
      return;
    }

    runOnJS(onStartDrag)(areaId, itemId, itemMeasurement);
  }, [startDragMeasureInfo, dragDropAreas, onStartDrag]);

  const startDrag = useCallback<DragDropContextType['startDrag']>(
    (...args) => {
      const [area, item] = args;
      startDragInfo.current = args;
      const areaId = area.id;
      const itemId = item.id;
      modify(
        startDragMeasureInfo,
        () => {
          'worklet';
          return { areaId, itemId };
        },
        true
      );
    },
    [startDragMeasureInfo]
  );

  const value = useMemo<DragDropContextType>(
    () => ({ registerDragDropArea, removeDragDropArea, startDrag }),
    [registerDragDropArea, removeDragDropArea, startDrag]
  );

  const gesture = useDragDropMove(
    isMoving,
    dragDropItemInfo,
    hoveredItemMeasurement,
    dragDropAreas
  );

  return (
    <DragDropContext.Provider value={value}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={style}>{children}</Animated.View>
      </GestureDetector>
    </DragDropContext.Provider>
  );
}
