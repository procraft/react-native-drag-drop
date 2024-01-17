import React from 'react';
import type { MeasuredDimensions } from 'react-native-reanimated';

export interface HoveredItemContextType {
  setHoveredItem: (
    jsx: JSX.Element,
    position: { x: number; y: number },
    size: { width: number; height: number }
  ) => void;
  clearHoveredItem: () => void;
  moveHoveredItem: (position: { x: number; y: number }) => void;
  measureHoveredItem: () => MeasuredDimensions | null;
}

export const HoveredItemContext = React.createContext<HoveredItemContextType>({
  setHoveredItem: () => {},
  clearHoveredItem: () => {},
  moveHoveredItem: () => {},
  measureHoveredItem: () => null,
});
