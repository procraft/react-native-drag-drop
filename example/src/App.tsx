import { AutoScrollContextRootProvider } from '@procraft/react-native-autoscroll';
import * as React from 'react';
import { useCallback, useState } from 'react';

import {
  DragDropContextRootView,
  HoveredItemContextRootProvider,
} from '@procraft/react-native-drag-drop';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PairsDragDrop } from './PairsDragDrop';
import { SimpleDragDrop } from './SimpleDragDrop';

export default function App() {
  const [step, setStep] = useState(1);
  const onNextStep = useCallback(() => {
    setStep((s) => (s + 1) % 2);
  }, []);

  return (
    <GestureHandlerRootView style={styles.full}>
      <AutoScrollContextRootProvider>
        <HoveredItemContextRootProvider>
          <DragDropContextRootView style={styles.full}>
            <SafeAreaView style={styles.full}>
              <View style={styles.container}>
                <View style={styles.header}>
                  <Pressable style={styles.btn} onPress={onNextStep}>
                    <Text>Next Example</Text>
                  </Pressable>
                </View>
                {step === 0 && <SimpleDragDrop style={styles.scroll} />}
                {step === 1 && <PairsDragDrop style={styles.scroll} />}
              </View>
            </SafeAreaView>
          </DragDropContextRootView>
        </HoveredItemContextRootProvider>
      </AutoScrollContextRootProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
  btn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 12,
  },
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
