import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WritingBox from '@/components/WritingBox';
import Button from '@/components/Button';
import { useAudio } from '@/hooks/useAudio';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function AnimalsCheckpoint() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../../assets/fonts/Playkiddo.ttf'),
  });

  const playMoo = useAudio(require('../../assets/audio/moo.mp3'));

  if (!fontsLoaded) {
    return null;
  }

  const handleComplete = async () => {
    await AsyncStorage.setItem('lesson2Complete', 'true');
    router.push('/animals/badge' as Href);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Checkpoint!</Text>
        <Text style={styles.subtitle}>
          Listen to the sound and write what you hear in cursive
        </Text>

        <View style={styles.audioCard}>
          <Text style={styles.prompt}>What animal makes this sound?</Text>
          <Pressable style={styles.audioBtn} onPress={playMoo}>
            <Ionicons name="volume-high" size={32} color={colors.white} />
          </Pressable>
        </View>

        <WritingBox width={320} height={200} />

        <View style={styles.buttonRow}>
          <Button onPress={() => router.push('/animals/writing' as Href)}>
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
    backgroundColor: '#FFF8E1',
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
    marginBottom: 24,
    textAlign: 'center',
  },
  audioCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  prompt: {
    fontSize: 18,
    color: colors.black,
    fontWeight: '500',
    marginBottom: 16,
  },
  audioBtn: {
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
});
