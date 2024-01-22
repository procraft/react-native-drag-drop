import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ItemType {
  id: string;
  text: string;
  color?: string;
}

export interface SimpleItemProps {
  item: ItemType;
  isActive: SharedValue<boolean>;
  minHeight?: SharedValue<number>;
  drag: () => void;
  onSize?: (width: number, height: number) => void;
}

export const SimpleItem = React.memo(function SimpleItem(
  props: SimpleItemProps
) {
  const { item, isActive, minHeight, drag, onSize } = props;

  const size = useSharedValue<{ width: number; height: number } | null>(null);

  useDerivedValue(() => {
    if (size.value != null && onSize != null) {
      onSize(size.value.width, size.value.height);
    }
  }, [onSize]);

  const onLayout = useCallback<NonNullable<ViewProps['onLayout']>>(
    ({ nativeEvent }) => {
      size.value = nativeEvent.layout;
    },
    [size]
  );

  const style = useAnimatedStyle(
    () => ({
      minHeight: minHeight?.value ?? 0,
      borderColor: isActive.value ? 'red' : 'black',
    }),
    [isActive]
  );

  return (
    <AnimatedPressable
      style={[styles.item, style]}
      onLayout={onLayout}
      onLongPress={drag}
    >
      <Text>{item.text}</Text>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  item: {
    borderRadius: 4,
    borderWidth: 1,
    marginVertical: 4,
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
