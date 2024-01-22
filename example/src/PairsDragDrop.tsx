import { AutoScrollScrollView } from '@procraft/react-native-autoscroll';
import { type DragDropRenderItem } from '@procraft/react-native-drag-drop';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { DragDropView } from '../../src/components/DragDropView';
import { SimpleItem, type ItemType, type SimpleItemProps } from './SimpleItem';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export interface PairsDragDropProps {
  style: ViewProps['style'];
}

export function PairsDragDrop(props: PairsDragDropProps) {
  const { style } = props;

  const [itemsA] = useState<ItemType[]>(() =>
    Array.from({ length: 50 }).map((_, i) => ({
      id: (i + 1).toString(),
      text: Array.from({ length: i + 1 })
        .map(() => (i + 1).toString())
        .join(' | '),
    }))
  );
  const [itemsB] = useState<ItemType[]>(() =>
    Array.from({ length: 50 }).map((_, i) => ({
      id: (i + 1).toString(),
      text: Array.from({ length: i + 1 })
        .map(() => (i + 1).toString())
        .join(' | '),
    }))
  );

  const minHeight = useSharedValue(0);
  const onSize = useCallback<NonNullable<SimpleItemProps['onSize']>>(
    (_, height) => {
      'worklet';
      if (height > minHeight.value) {
        minHeight.value = height;
      }
    },
    [minHeight]
  );

  const renderItem = useCallback<DragDropRenderItem<ItemType>>(
    (item, isActive, drag) => (
      <SimpleItem
        item={item.data}
        isActive={isActive}
        minHeight={minHeight}
        drag={drag}
        onSize={onSize}
      />
    ),
    [minHeight, onSize]
  );
  const extractId = useCallback((item: ItemType) => item.id, []);

  const delimeterStyle = useAnimatedStyle(
    () => ({
      minHeight: minHeight.value,
    }),
    []
  );

  return (
    <AutoScrollScrollView style={style}>
      <View style={styles.container}>
        <DragDropView
          items={itemsA}
          renderItem={renderItem}
          extractId={extractId}
          style={styles.dragDrop}
        />
        <Animated.View>
          {itemsA.map((item) => (
            <Animated.View
              key={item.id}
              style={[styles.delimeter, delimeterStyle]}
            >
              <Text>-</Text>
            </Animated.View>
          ))}
        </Animated.View>
        <DragDropView
          items={itemsB}
          renderItem={renderItem}
          extractId={extractId}
          style={styles.dragDrop}
        />
      </View>
    </AutoScrollScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  dragDrop: {
    flex: 1,
  },
  delimeter: {
    marginVertical: 4,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});
