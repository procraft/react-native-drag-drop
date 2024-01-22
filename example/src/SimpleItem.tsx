import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

export interface ItemType {
  id: string;
  text: string;
  color?: string;
}

export interface SimpleItemProps {
  item: ItemType;
  isActive: SharedValue<boolean>;
  drag: () => void;
}

export const SimpleItem = React.memo(function SimpleItem(
  props: SimpleItemProps
) {
  const { item, isActive, drag } = props;

  const style = useAnimatedStyle(
    () => ({
      borderColor: isActive.value ? 'red' : 'black',
    }),
    [isActive]
  );

  return (
    <Animated.View style={[styles.item, style]}>
      <Pressable style={styles.btn} onLongPress={drag}>
        <Text>{item.text}</Text>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  item: {
    borderRadius: 4,
    borderWidth: 1,
    marginVertical: 4,
    backgroundColor: 'white',
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
