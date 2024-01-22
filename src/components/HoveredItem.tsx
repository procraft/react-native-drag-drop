import React, { useEffect, useState } from 'react';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import type { ExistsAnimatedRef } from '../hooks';
import type { HoveredItemInfo } from '../types';
import { modify } from '../utils';

export interface HoveredItemProps {
  animatedRef: ExistsAnimatedRef<Animated.View>;
  hoveredItemJSX?: JSX.Element;
  hoveredItemInfo: SharedValue<HoveredItemInfo | null>;
  hoveredItemRendered: SharedValue<boolean>;
}

export function HoveredItem(props: HoveredItemProps) {
  const { animatedRef, hoveredItemJSX, hoveredItemInfo, hoveredItemRendered } =
    props;

  const [ready, setReady] = useState(hoveredItemInfo.value != null);

  useEffect(() => {
    if (ready) {
      modify(
        hoveredItemRendered,
        (v) => {
          'worklet';
          v = true;
          return v;
        },
        true
      );
    }

    return () => {
      modify(
        hoveredItemRendered,
        (v) => {
          'worklet';
          v = false;
          return v;
        },
        true
      );
    };
  }, [hoveredItemRendered, ready]);

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

  if (!ready || hoveredItemJSX == null) {
    return null;
  }

  return (
    <Animated.View ref={animatedRef} style={style}>
      {hoveredItemJSX}
    </Animated.View>
  );
}
