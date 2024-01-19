import { AutoScrollScrollView } from '@procraft/react-native-autoscroll';
import React, { type ComponentProps } from 'react';
import type { ScrollView } from 'react-native-gesture-handler';
import type Animated from 'react-native-reanimated';
import { useAnimatedRef, type AnimatedRef } from 'react-native-reanimated';
import { useDragDropList } from '../hooks';
import type { DragDropRenderItem } from '../types';
import type { DragDropAreaConfig } from '../types/DragDropAreaConfig';
import { DragDropItem } from './DragDropItem';

export interface DragDropScrollViewProps<T>
  extends Omit<ComponentProps<ScrollView>, 'ref'> {
  items: T[];
  innerRef?: AnimatedRef<Animated.ScrollView>;
  config?: DragDropAreaConfig;
  onChange?: (items: T[], from: number, to: number) => void;
  renderItem: DragDropRenderItem<T>;
  extractId: (item: T) => number | string;
}

export function DragDropScrollView<T>(props: DragDropScrollViewProps<T>) {
  const {
    config,
    items: initialItems,
    horizontal: horizontalProps,
    innerRef,
    renderItem,
    extractId,
    // onChange,
    ...otherProps
  } = props;

  const animatedRef = useAnimatedRef<Animated.ScrollView>();
  const areaRef = innerRef ?? animatedRef;

  const { areaId, items, registerItemHandler, onTransitionDone } =
    useDragDropList(
      areaRef,
      horizontalProps ?? false,
      initialItems,
      extractId,
      config
    );

  return (
    <AutoScrollScrollView
      innerRef={areaRef}
      horizontal={horizontalProps}
      {...otherProps}
    >
      {items.map((item) => (
        <DragDropItem<T>
          key={item.id}
          areaId={areaId}
          config={config}
          item={item}
          renderItem={renderItem}
          registerItemHandler={registerItemHandler}
          onTransitionDone={onTransitionDone}
        />
      ))}
    </AutoScrollScrollView>
  );
}
