import { AutoScrollContext } from '@procraft/react-native-autoscroll';
import { useContext } from 'react';
import Animated, {
  type AnimatedRef,
  type SharedValue,
  useDerivedValue,
  measure,
} from 'react-native-reanimated';
import type { HoveredItemInfo } from '../types';

export function useHoveredItemAutoScroll(
  animatedRef: AnimatedRef<Animated.View>,
  hoveredItemMeta: SharedValue<HoveredItemInfo | null>
) {
  const { startScroll, stopScroll } = useContext(AutoScrollContext);

  useDerivedValue(() => {
    if (hoveredItemMeta.value == null) {
      stopScroll();
      return;
    }

    if (animatedRef() === -1) {
      return;
    }
    const measurement = measure(animatedRef);
    if (measurement != null) {
      startScroll({ measurement });
    }
  }, [animatedRef, hoveredItemMeta, startScroll, stopScroll]);
}
