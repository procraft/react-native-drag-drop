import { useSharedValue } from 'react-native-reanimated';
import type { DragDropListConfig } from '../types';
import { useEffect } from 'react';
import { modify } from '../utils';

export function useDragDropListConfig(horizontal?: boolean) {
  const config = useSharedValue<DragDropListConfig>({
    horizontal: horizontal ?? false,
  });

  useEffect(() => {
    modify(config, (v) => {
      'worklet';
      v.horizontal = horizontal ?? false;
      return v;
    });
  }, [config, horizontal]);

  return config;
}
