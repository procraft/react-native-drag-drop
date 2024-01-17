/* eslint-disable react-native/no-inline-styles */
import { AutoScrollContextRootProvider } from '@procraft/react-native-autoscroll';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import {
  DragDropContextRootView,
  DragDropScrollView,
  HoveredItemContextRootProvider,
  type DragDropRenderItem,
} from 'react-native-drag-drop';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

export default function App() {
  const [items] = useState<ItemType[]>(() =>
    Array.from({ length: 50 }).map((_, i) => ({
      id: (i + 1).toString(),
      text: Array.from({ length: i + 1 })
        .map(() => (i + 1).toString())
        .join(' | '),
    }))
  );

  const renderItem = useCallback<DragDropRenderItem<ItemType>>(
    (item, isActive, drag) => (
      <Item item={item.data} isActive={isActive} drag={drag} />
    ),
    []
  );
  const extractId = useCallback((item: ItemType) => item.id, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AutoScrollContextRootProvider>
        <HoveredItemContextRootProvider>
          <DragDropContextRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.container}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  }}
                >
                  <Pressable>
                    <Text>HeeeE</Text>
                  </Pressable>
                </View>
                <DragDropScrollView
                  items={items}
                  renderItem={renderItem}
                  extractId={extractId}
                  style={styles.scroll}
                />
              </View>
            </SafeAreaView>
          </DragDropContextRootView>
        </HoveredItemContextRootProvider>
      </AutoScrollContextRootProvider>
    </GestureHandlerRootView>
  );
}

interface ItemType {
  id: string;
  text: string;
  color?: string;
}

interface ItemProps {
  item: ItemType;
  isActive: SharedValue<boolean>;
  drag: () => void;
}

const Item = React.memo(function Item(props: ItemProps) {
  const { item, isActive, drag } = props;

  const style = useAnimatedStyle(
    () => ({
      borderColor: isActive.value ? 'red' : 'black',
    }),
    [isActive]
  );

  useEffect(() => {
    console.log('MOUNT');
  }, []);

  return (
    <Animated.View
      style={[
        {
          borderRadius: 4,
          borderWidth: 1,
          marginVertical: 4,
          backgroundColor: 'white',
        },
        style,
      ]}
    >
      <Pressable
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
        }}
        onLongPress={drag}
      >
        <Text>{item.text}</Text>
      </Pressable>
    </Animated.View>
  );
});

// function Item2() {
//   const { setHoveredItem } = useContext(HoveredItemContext);
//   const d = useWindowDimensions();
//   const size = useRef<{ w: number; h: number } | null>(null);

//   return (
//     <Pressable
//       style={{
//         borderWidth: 1,
//         borderRadius: 4,
//         paddingHorizontal: 8,
//         paddingVertical: 4,
//       }}
//       onLayout={({ nativeEvent }) => {
//         size.current = {
//           w: nativeEvent.layout.width,
//           h: nativeEvent.layout.height,
//         };
//       }}
//       onPress={() => {
//         if (size.current == null) {
//           return;
//         }
//         setHoveredItem(
//           <Item2 />,
//           {
//             x: Math.random() * (d.width - size.current.w),
//             y: Math.random() * (d.height - size.current.h),
//           },
//           { width: size.current.w, height: size.current.h }
//         );
//       }}
//     >
//       <Text>Hi</Text>
//     </Pressable>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  scroll: {
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
