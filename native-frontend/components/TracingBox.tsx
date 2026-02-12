import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, Marker } from 'react-native-svg';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { colors } from '@/constants/colors';

const ACCURACY_RADIUS = 18;

type TracingBoxProps = {
  svgPath: string;
  onComplete?: () => void;
  width?: number;
  height?: number;
};

/*
 * Interactive SVG tracing component for letters or shapes
 * - displays handwriting guide lines (ascender, midline, baseline)
 * - renders a dashed guide path with direction arrow
 * - shows a green start dot indicating where tracing should begin
 * - tracks touch input to draw a user path
 * - checks real-time accuracy against the guide path using distance tolerance
 * - dynamically colors the guide path green/red based on tracing accuracy
 */

export default function TracingBox({
  svgPath,
  onComplete,
  width = 300,
  height = 180,
}: TracingBoxProps) {
  const [userPath, setUserPath] = useState('');
  const [isTracing, setIsTracing] = useState(false);
  const [accuracy, setAccuracy] = useState<'idle' | 'good' | 'bad'>('idle');
  const svgRef = useRef<View>(null);
  const layoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Parse the SVG path to get points for accuracy checking
  const getPathPoints = (pathData: string): { x: number; y: number }[] => {
    const points: { x: number; y: number }[] = [];
    const commands = pathData.match(/[MLCQ][^MLCQ]*/gi) || [];

    commands.forEach((cmd) => {
      const type = cmd[0].toUpperCase();
      const coords = cmd
        .slice(1)
        .trim()
        .split(/[\s,]+/)
        .map(parseFloat);

      if (type === 'M' || type === 'L') {
        for (let i = 0; i < coords.length; i += 2) {
          if (!isNaN(coords[i]) && !isNaN(coords[i + 1])) {
            points.push({ x: coords[i], y: coords[i + 1] });
          }
        }
      } else if (type === 'C') {
        // For bezier curves, sample points along the curve
        for (let i = 0; i < coords.length; i += 6) {
          if (!isNaN(coords[i + 4]) && !isNaN(coords[i + 5])) {
            points.push({ x: coords[i + 4], y: coords[i + 5] });
          }
        }
      }
    });

    return points;
  };

  const pathPoints = getPathPoints(svgPath);
  const startPoint = pathPoints.length > 0 ? pathPoints[0] : null;

  const isPointNearPath = (x: number, y: number): boolean => {
    for (const pt of pathPoints) {
      const dx = pt.x - x;
      const dy = pt.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < ACCURACY_RADIUS) {
        return true;
      }
    }
    return false;
  };

  const getSVGCoords = (pageX: number, pageY: number) => {
    const layout = layoutRef.current;
    if (layout.width === 0) return { x: 0, y: 0 };

    // Convert screen coordinates to SVG viewBox coordinates
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
      setIsTracing(true);
    })
    .onUpdate((e) => {
      const { x, y } = getSVGCoords(e.absoluteX, e.absoluteY);
      setUserPath((prev) => `${prev} L ${x} ${y}`);

      const close = isPointNearPath(x, y);
      setAccuracy(close ? 'good' : 'bad');
    })
    .onEnd(() => {
      setIsTracing(false);
      if (accuracy === 'good') {
        onComplete?.();
      }
      setAccuracy('idle');
    });

  const getStrokeColor = () => {
    switch (accuracy) {
      case 'good':
        return colors.tracingGood;
      case 'bad':
        return colors.tracingBad;
      default:
        return colors.tracingGuide;
    }
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
              <Defs>
                <Marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="5"
                  refY="5"
                  markerWidth={6}
                  markerHeight={6}
                  orient="auto"
                >
                  <Path d="M 0 0 L 10 5 L 0 10 z" fill={colors.gray} />
                </Marker>
              </Defs>

              {/* Starting point */}
              {startPoint && !isTracing && (
                <Circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r={6}
                  fill={colors.success}
                />
              )}

              {/* Guide path */}
              <Path
                d={svgPath}
                fill="none"
                stroke={getStrokeColor()}
                strokeWidth={4}
                strokeDasharray="6,12"
                strokeLinecap="round"
                markerEnd={!isTracing ? 'url(#arrow)' : undefined}
              />

              {/* User traced path */}
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
