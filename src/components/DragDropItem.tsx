import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import Animated, {
  LinearTransition,
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { DragDropContext } from '../contexts';
import type { DragDropItemHandler, RegisterItemHandler } from '../handlers';
import type { DragDropItemType, DragDropRenderItem } from '../types';
import type { DragDropAreaConfig } from '../types/DragDropAreaConfig';

export interface DragDropItemProps<T> {
  areaId: number;
  config?: DragDropAreaConfig;
  item: DragDropItemType<T>;
  renderItem: DragDropRenderItem<T>;
  registerItemHandler: RegisterItemHandler<T>;
  onTransitionDone: (id: string | number) => void;
}

export const DragDropItem = React.memo(function DragDropItem<T>(
  props: DragDropItemProps<T>
) {
  const {
    areaId,
    config,
    item,
    renderItem,
    registerItemHandler,
    onTransitionDone,
  } = props;
  const groupId = config?.groupId;

  const { startDrag } = useContext(DragDropContext);

  const animatedRef = useAnimatedRef<Animated.View>();
  const isActive = useSharedValue(false);

  const itemId = item.id;
  const drag = useCallback(() => {
    startDrag(
      { id: areaId, groupId },
      item,
      renderItem(item, isActive, () => {}),
      () => {
        'worklet';
        isActive.value = false;
      }
    );
    isActive.value = true;
  }, [areaId, groupId, isActive, item, renderItem, startDrag]);

  const jsx = useMemo(
    () => renderItem(item, isActive, drag),
    [isActive, item, drag, renderItem]
  );

  //! ITEM HANDLER

  const measureItem = useCallback(() => {
    'worklet';
    return measure(animatedRef);
  }, [animatedRef]);

  const handler = useMemo<DragDropItemHandler<T>>(
    () => ({ id: item.id, data: item.data, measure: measureItem }),
    [item, measureItem]
  );

  useEffect(
    () => registerItemHandler(itemId, handler),
    [handler, itemId, registerItemHandler]
  );

  const viewStyle = useAnimatedStyle(
    () => ({
      opacity: isActive.value ? 0.0 : 1.0,
    }),
    [isActive]
  );

  useEffect(
    () => () => {
      onTransitionDone(itemId);
    },
    [itemId, onTransitionDone]
  );

  return (
    <Animated.View
      ref={animatedRef}
      layout={LinearTransition.duration(200).withCallback((f) => {
        if (f) {
          onTransitionDone(itemId);
        }
      })}
      style={viewStyle}
    >
      {jsx}
    </Animated.View>
  );
}) as <T>(props: DragDropItemProps<T>) => JSX.Element;
