import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TracingBox from '@/components/TracingBox';
import Button from '@/components/Button';
import { letterPaths } from '@/data/letterPaths';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function ColorsReading() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../../assets/fonts/Playkiddo.ttf'),
  });

  const [completedCount, setCompletedCount] = useState(0);

  const totalBoxes = letterPaths.Cc.length + letterPaths.Dd.length;

  const handleTraceComplete = () => {
    setCompletedCount((prev) => prev + 1);
  };

  const isComplete = completedCount >= totalBoxes;

  if (!fontsLoaded) {
    return null;
  }

  const handleNext = async () => {
    await AsyncStorage.setItem('colors_readingComplete', 'true');
    router.push('/colors/writing' as Href);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Follow the Flow!</Text>
        <Text style={styles.subtitle}>
          Trace each letter by following the dotted path
        </Text>

        <Text style={styles.letterLabel}>Letter C</Text>
        <View style={styles.row}>
          {letterPaths.Cc.map((path, i) => (
            <TracingBox
              key={`c-${i}`}
              svgPath={path}
              onComplete={handleTraceComplete}
            />
          ))}
        </View>

        <Text style={styles.letterLabel}>Letter D</Text>
        <View style={styles.row}>
          {letterPaths.Dd.map((path, i) => (
            <TracingBox
              key={`d-${i}`}
              svgPath={path}
              onComplete={handleTraceComplete}
            />
          ))}
        </View>

        <View style={styles.buttonRow}>
          <Button onPress={() => router.push('/home' as Href)}>
            Exit
          </Button>
          <Button onPress={handleNext} disabled={!isComplete}>
            Next
          </Button>
        </View>

        <Text style={styles.progress}>
          {completedCount} / {totalBoxes} completed
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E1',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  heading: {
    fontFamily: 'PlayKiddo',
    fontSize: Math.min(width * 0.08, 36),
    color: colors.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.grayDark,
    marginBottom: 24,
    textAlign: 'center',
  },
  letterLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  progress: {
    marginTop: 16,
    fontSize: 14,
    color: colors.grayDark,
  },
});
