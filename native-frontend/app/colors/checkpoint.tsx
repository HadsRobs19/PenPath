import React from 'react';
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
import WritingBox from '@/components/WritingBox';
import Button from '@/components/Button';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function ColorsCheckpoint() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../../assets/fonts/Playkiddo.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleComplete = async () => {
    await AsyncStorage.setItem('lesson1Complete', 'true');
    router.push('/colors/badge' as Href);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Checkpoint!</Text>
        <Text style={styles.subtitle}>
          Practice writing the letters you've learned in cursive
        </Text>

        <Text style={styles.prompt}>Write the letter "C" in cursive:</Text>
        <WritingBox />

        <Text style={styles.prompt}>Write the letter "D" in cursive:</Text>
        <WritingBox />

        <View style={styles.buttonRow}>
          <Button onPress={() => router.push('/colors/writing' as Href)}>
            Back
          </Button>
          <Button onPress={handleComplete}>
            Complete
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
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
  },
  subtitle: {
    fontSize: 16,
    color: colors.grayDark,
    marginBottom: 32,
    textAlign: 'center',
  },
  prompt: {
    fontSize: 18,
    color: colors.black,
    fontWeight: '500',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
});
