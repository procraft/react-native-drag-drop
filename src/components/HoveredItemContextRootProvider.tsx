import React, { useCallback, useMemo, useState } from 'react';
import Animated, { measure, useSharedValue } from 'react-native-reanimated';
import { HoveredItemContext, type HoveredItemContextType } from '../contexts';
import { useExistsAnimatedRef, useHoveredItemAutoScroll } from '../hooks';
import type { HoveredItemInfo } from '../types';
import { modify } from '../utils';
import { HoveredItem } from './HoveredItem';

export interface HoveredItemContextRootProviderProps {
  children: React.ReactNode;
}

export function HoveredItemContextRootProvider(
  props: HoveredItemContextRootProviderProps
) {
  const { children } = props;

  const [animatedRef, isRefExists, ref] = useExistsAnimatedRef<Animated.View>();
  const hoveredItemRendered = useSharedValue(false);
  const [hoveredItemJSX, setHoveredItemJSX] = useState<JSX.Element>();
  const hoveredItemInfo = useSharedValue<HoveredItemInfo | null>(null);

  useHoveredItemAutoScroll(animatedRef, hoveredItemInfo, hoveredItemRendered);

  const setHoveredItem = useCallback<HoveredItemContextType['setHoveredItem']>(
    (jsx, position, size) => {
      modify(
        hoveredItemInfo,
        () => {
          'worklet';
          return { ...position, ...size };
        },
        true
      );
      setHoveredItemJSX(jsx);
    },
    [hoveredItemInfo, setHoveredItemJSX]
  );

  const clearHoveredItem = useCallback<
    HoveredItemContextType['clearHoveredItem']
  >(() => {
    setHoveredItemJSX(undefined);
    hoveredItemInfo.value = null;
  }, [hoveredItemInfo, setHoveredItemJSX]);

  const moveHoveredItem = useCallback<
    HoveredItemContextType['moveHoveredItem']
  >(
    (position) => {
      'worklet';
      modify(
        hoveredItemInfo,
        (v) => {
          'worklet';
          if (v == null) {
            return null;
          }
          v.x = position.x;
          v.y = position.y;
          return v;
        },
        true
      );
    },
    [hoveredItemInfo]
  );

  const measureHoveredItem = useCallback<
    HoveredItemContextType['measureHoveredItem']
  >(() => {
    'worklet';
    if (!isRefExists.value) {
      return null;
    }
    return measure(animatedRef);
  }, [animatedRef, isRefExists]);

  const value = useMemo<HoveredItemContextType>(
    () => ({
      setHoveredItem,
      clearHoveredItem,
      moveHoveredItem,
      measureHoveredItem,
    }),
    [clearHoveredItem, setHoveredItem, moveHoveredItem, measureHoveredItem]
  );

  return (
    <HoveredItemContext.Provider value={value}>
      {children}
      <HoveredItem
        animatedRef={ref}
        hoveredItemJSX={hoveredItemJSX}
        hoveredItemInfo={hoveredItemInfo}
        hoveredItemRendered={hoveredItemRendered}
      />
    </HoveredItemContext.Provider>
  );
}
