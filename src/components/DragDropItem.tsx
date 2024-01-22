import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import Animated, {
  LinearTransition,
  measure,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { DragDropContext } from '../contexts';
import type { DragDropItemHandler, RegisterItemHandler } from '../handlers';
import { useExistsAnimatedRef } from '../hooks';
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

  const [animatedRef, componentExists, ref] =
    useExistsAnimatedRef<Animated.View>();
  const isActive = useSharedValue(false);
  const size = useSharedValue<{ width: number; height: number } | null>(null);

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
    if (!componentExists.value) {
      return null;
    }
    return measure(animatedRef);
  }, [animatedRef, componentExists]);

  const handler = useMemo<DragDropItemHandler<T>>(
    () => ({ id: item.id, data: item.data, measure: measureItem }),
    [item, measureItem]
  );

  useEffect(
    () => registerItemHandler(itemId, handler),
    [handler, itemId, registerItemHandler]
  );

  const opacityAnim = useDerivedValue(() => {
    if (isActive.value)
      return withDelay(
        50,
        withTiming(0, {
          duration: 0,
        })
      );
    else return 1.0;
  }, [isActive]);

  const viewStyle = useAnimatedStyle(
    () => ({
      opacity: opacityAnim.value,
    }),
    [opacityAnim]
  );

  useEffect(
    () => () => {
      onTransitionDone(itemId);
    },
    [itemId, onTransitionDone]
  );

  return (
    <Animated.View
      ref={ref}
      layout={LinearTransition.duration(200).withCallback((f) => {
        if (f) {
          onTransitionDone(itemId);
        }
      })}
      onLayout={({ nativeEvent }) => {
        size.value = {
          width: nativeEvent.layout.width,
          height: nativeEvent.layout.height,
        };
      }}
      style={viewStyle}
    >
      {jsx}
    </Animated.View>
  );
}) as <T>(props: DragDropItemProps<T>) => JSX.Element;
