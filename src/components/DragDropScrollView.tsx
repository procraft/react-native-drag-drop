import { AutoScrollScrollView } from '@procraft/react-native-autoscroll';
import React, { type ComponentProps } from 'react';
import type { ScrollView } from 'react-native-gesture-handler';
import type Animated from 'react-native-reanimated';
import { useAnimatedRef, type AnimatedRef } from 'react-native-reanimated';
import { useDragDropList } from '../hooks';
import type { DragDropRenderItem } from '../types';
import type { DragDropAreaConfig } from '../types/DragDropAreaConfig';
import { DragDropItem } from './DragDropItem';
import type { RegisterItemHandler } from '../handlers';

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
        <DragDropItem
          key={item.id}
          areaId={areaId}
          config={config}
          item={item}
          renderItem={renderItem as DragDropRenderItem<unknown>}
          registerItemHandler={
            registerItemHandler as RegisterItemHandler<unknown>
          }
          onTransitionDone={onTransitionDone}
        />
      ))}
    </AutoScrollScrollView>
  );
}

// interface ListItemProps<T> {
//   index: number;
//   item: DragDropItemType<T>;
//   renderItem: DragDropRenderItem<T>;
// }

// const ListItem = React.memo(function ListItem<T>(props: ListItemProps<T>) {
//   const { index, item, renderItem } = props;

//   const { startDrag } = useContext(DragDropContext);

//   const indexAnim = useSharedValue(index);
//   useEffect(() => {
//     indexAnim.value = index;
//   }, [index, indexAnim]);

//   return renderItem(item, indexAnim) ?? null;
// });
