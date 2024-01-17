import React, { useState } from 'react';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  type AnimatedRef,
  type SharedValue,
} from 'react-native-reanimated';
import type { HoveredItemInfo } from '../types';

export interface HoveredItemProps {
  animatedRef: AnimatedRef<Animated.View>;
  hoveredItemJSX: JSX.Element;
  hoveredItemInfo: SharedValue<HoveredItemInfo | null>;
}

export function HoveredItem(props: HoveredItemProps) {
  const { animatedRef, hoveredItemJSX, hoveredItemInfo } = props;

  const [ready, setReady] = useState(hoveredItemInfo.value != null);

  useDerivedValue(() => {
    runOnJS(setReady)(hoveredItemInfo.value != null);
  }, [hoveredItemInfo]);

  const style = useAnimatedStyle(
    () => ({
      position: 'absolute',
      width: hoveredItemInfo.value?.width,
      height: hoveredItemInfo.value?.height,
      top: hoveredItemInfo.value?.y,
      left: hoveredItemInfo.value?.x,
    }),
    [hoveredItemInfo]
  );

  if (!ready) {
    return null;
  }

  return (
    <Animated.View ref={animatedRef} style={style}>
      {hoveredItemJSX}
    </Animated.View>
  );
}
