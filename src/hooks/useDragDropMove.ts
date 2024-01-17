import { AutoScrollContext } from '@procraft/react-native-autoscroll';
import { useCallback, useContext, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useDerivedValue,
  useFrameCallback,
  type MeasuredDimensions,
  type SharedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { HoveredItemContext } from '../contexts';
import type { DragDropAreas } from '../handlers';
import type { DragDropItemInfo } from '../types';
import { checkCollision, modify } from '../utils';

export function useDragDropMove(
  isMoving: SharedValue<boolean>,
  dragDropItemInfo: SharedValue<DragDropItemInfo | null>,
  hoveredItemMeasurement: SharedValue<MeasuredDimensions | null>,
  dragDropAreas: SharedValue<DragDropAreas>
) {
  const { clearHoveredItem, moveHoveredItem, measureHoveredItem } =
    useContext(HoveredItemContext);
  const { startScroll, stopScroll } = useContext(AutoScrollContext);

  const moveAnim = useFrameCallback(() => {
    'worklet';

    if (
      dragDropItemInfo.value == null ||
      hoveredItemMeasurement.value == null
    ) {
      return;
    }

    startScroll({ measurement: hoveredItemMeasurement.value });

    const { area: infoArea, item: infoItem } = dragDropItemInfo.value;
    for (const areaId of Object.keys(dragDropAreas.value)) {
      const areaHandler = dragDropAreas.value[areaId];
      const areaMeasurement = areaHandler?.measure() ?? null;

      const canPutByGroup =
        (infoArea.groupId == null && infoArea.id.toString() === areaId) ||
        (infoArea.groupId != null && infoArea.groupId === areaHandler?.groupId);

      if (
        areaMeasurement != null &&
        areaHandler != null &&
        canPutByGroup &&
        checkCollision(hoveredItemMeasurement.value, areaMeasurement)
      ) {
        if (areaId !== infoArea.id.toString()) {
          const putResult = areaHandler.tryPutItem(
            infoItem,
            hoveredItemMeasurement.value
          );

          if (putResult != null) {
            dragDropAreas.value[infoArea.id]?.removeItem(infoItem.id);
            modify(
              dragDropItemInfo,
              (v) => {
                'worklet';
                if (v != null) {
                  v.area.id = parseInt(areaId, 10);
                }
                return v;
              },
              true
            );
          }
        }

        areaHandler.itemMoved(infoItem, hoveredItemMeasurement.value);
        break;
      }
    }
  }, false);

  const setMoveAnimActive = useCallback(
    (isActive: boolean) => {
      moveAnim.setActive(isActive);
    },
    [moveAnim]
  );

  const prevIsMoving = useSharedValue(isMoving.value);
  useDerivedValue(() => {
    if (isMoving.value === prevIsMoving.value) {
      return;
    }
    prevIsMoving.value = isMoving.value;

    runOnJS(setMoveAnimActive)(isMoving.value);
    if (!isMoving.value) {
      stopScroll();
      runOnJS(clearHoveredItem)();
      if (dragDropItemInfo.value != null) {
        dragDropItemInfo.value.onEnd?.();
        modify(
          dragDropItemInfo,
          () => {
            'worklet';
            return null;
          },
          true
        );
      }
    }
  }, [
    isMoving,
    dragDropItemInfo,
    setMoveAnimActive,
    stopScroll,
    clearHoveredItem,
  ]);

  return useMemo(
    () =>
      Gesture.Pan()
        .manualActivation(true)
        .onStart(() => {
          isMoving.value = true;
        })
        .onChange((e) => {
          if (dragDropItemInfo.value == null) {
            return;
          }
          const areaId = dragDropItemInfo.value.area.id;
          const areaAxis = dragDropAreas.value[areaId]?.axis;
          const position = dragDropItemInfo.value.position;

          const newPosition = {
            x: position.x + (areaAxis?.horizontal ? e.changeX : 0.0),
            y: position.y + (areaAxis?.vertical ? e.changeY : 0.0),
          };

          modify(dragDropItemInfo, (v) => {
            'worklet';
            if (v != null) {
              v.position = newPosition;
            }
            return v;
          });

          moveHoveredItem(newPosition);
          hoveredItemMeasurement.value = measureHoveredItem();
        })
        .onFinalize(() => {
          isMoving.value = false;
        })
        .onTouchesDown((e, manager) => {
          if (dragDropItemInfo.value != null && e.state === 2) {
            manager.activate();
          }
        })
        .onTouchesMove((e, manager) => {
          if (dragDropItemInfo.value != null && e.state === 2) {
            manager.activate();
          }
        }),
    [
      isMoving,
      dragDropItemInfo,
      dragDropAreas,
      hoveredItemMeasurement,
      moveHoveredItem,
      measureHoveredItem,
    ]
  );
}
