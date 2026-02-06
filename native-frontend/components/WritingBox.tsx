import React, { useState, useRef } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { colors } from '@/constants/colors';

type WritingBoxProps = {
  width?: number;
  height?: number;
};

/*
 * Freehand writing component
 * - user can draw anywhere inside the box
 * - shows handwriting guide lines
 * - supports touch/pen input
 * - includes a clear button to reset drawing
 */

export default function WritingBox({
  width = 300,
  height = 180,
}: WritingBoxProps) {
  const [userPath, setUserPath] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const svgRef = useRef<View>(null);
  const layoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const getSVGCoords = (pageX: number, pageY: number) => {
    const layout = layoutRef.current;
    if (layout.width === 0) return { x: 0, y: 0 };

    const scaleX = 300 / layout.width;
    const scaleY = 180 / layout.height;
    const x = (pageX - layout.x) * scaleX;
    const y = (pageY - layout.y) * scaleY;

    return { x, y };
  };

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      const { x, y } = getSVGCoords(e.absoluteX, e.absoluteY);
      setUserPath(`M ${x} ${y}`);
      setIsWriting(true);
    })
    .onUpdate((e) => {
      const { x, y } = getSVGCoords(e.absoluteX, e.absoluteY);
      setUserPath((prev) => `${prev} L ${x} ${y}`);
    })
    .onEnd(() => {
      setIsWriting(false);
    });

  const clearDrawing = () => {
    setUserPath('');
  };

  return (
    <GestureHandlerRootView style={{ width, height }}>
      <View
        ref={svgRef}
        style={[styles.container, { width, height }]}
        onLayout={(e) => {
          const { width: w, height: h } = e.nativeEvent.layout;
          svgRef.current?.measureInWindow((pageX, pageY) => {
            layoutRef.current = { x: pageX, y: pageY, width: w, height: h };
          });
        }}
      >
        {/* Clear button */}
        <Pressable style={styles.clearBtn} onPress={clearDrawing}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </Pressable>

        {/* Guide lines */}
        <View style={[styles.guideLine, styles.ascender]} />
        <View style={[styles.guideLine, styles.midline]} />
        <View style={[styles.guideLine, styles.baseline]} />

        <GestureDetector gesture={panGesture}>
          <View style={StyleSheet.absoluteFill}>
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 300 180"
              preserveAspectRatio="none"
            >
              {userPath && (
                <Path
                  d={userPath}
                  fill="none"
                  stroke={colors.tracingUser}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  clearBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.grayLight,
    borderRadius: 6,
  },
  clearBtnText: {
    fontSize: 12,
    color: colors.grayDark,
    fontWeight: '500',
  },
  guideLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.guideLine,
  },
  ascender: {
    top: '22%',
  },
  midline: {
    top: '50%',
  },
  baseline: {
    top: '78%',
  },
});
