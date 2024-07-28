import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import Animated, {
  type LayoutAnimationFunction,
  measure,
  runOnJS,
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

  useEffect(
    () => () => {
      onTransitionDone(itemId);
    },
    [itemId, onTransitionDone]
  );

  const needSkipAnimation = useSharedValue(false);

  const disableSkipAnimation = useCallback(() => {
    setTimeout(() => {
      needSkipAnimation.value = false;
    }, 100);
  }, [needSkipAnimation]);

  useDerivedValue(() => {
    if (isActive.value) needSkipAnimation.value = true;
    else {
      runOnJS(disableSkipAnimation)();
    }
  }, [needSkipAnimation, isActive, disableSkipAnimation]);

  const customAnimation = useCallback<LayoutAnimationFunction>(
    (values) => {
      'worklet';
      const skipAnimation = needSkipAnimation.value;
      return {
        callback: (f) => {
          if (f) {
            needSkipAnimation.value = false;
            onTransitionDone(itemId);
          }
        },
        animations: {
          originX: withTiming(values.targetOriginX, {
            duration: skipAnimation ? 1 : 150,
          }),
          originY: withTiming(values.targetOriginY, {
            duration: skipAnimation ? 1 : 150,
          }),
          width: withTiming(values.targetWidth, {
            duration: skipAnimation ? 1 : 150,
          }),
          height: withTiming(values.targetHeight, {
            duration: skipAnimation ? 1 : 150,
          }),
        },
        initialValues: {
          originX: values.currentOriginX,
          originY: values.currentOriginY,
          width: values.currentWidth,
          height: values.currentHeight,
        },
      };
    },
    [itemId, needSkipAnimation, onTransitionDone]
  );

  const opacityAnim = useDerivedValue(() => {
    if (needSkipAnimation.value)
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

  return (
    <Animated.View
      ref={ref}
      key={itemId}
      layout={customAnimation}
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
