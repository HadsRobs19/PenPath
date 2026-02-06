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
import WritingBox from '@/components/WritingBox';
import Button from '@/components/Button';
import { useAudio } from '@/hooks/useAudio';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function AnimalsWriting() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../../assets/fonts/Playkiddo.ttf'),
  });

  const playMeow = useAudio(require('../../assets/audio/meow.mp3'));
  const playWoof = useAudio(require('../../assets/audio/woof.mp3'));

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Write what you hear in cursive!</Text>

        <View style={styles.audioRow}>
          <View style={styles.audioCard}>
            <Text style={styles.number}>1.</Text>
            <Pressable style={styles.audioBtn} onPress={playMeow}>
              <Ionicons name="volume-high" size={28} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.audioCard}>
            <Text style={styles.number}>2.</Text>
            <Pressable style={styles.audioBtn} onPress={playWoof}>
              <Ionicons name="volume-high" size={28} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.writingBoxes}>
          <WritingBox />
          <WritingBox />
        </View>

        <View style={styles.buttonRow}>
          <Button onPress={() => router.push('/home' as Href)}>
            Exit
          </Button>
          <Button onPress={() => router.push('/animals/checkpoint' as Href)}>
            Next
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  heading: {
    fontFamily: 'PlayKiddo',
    fontSize: Math.min(width * 0.07, 28),
    color: colors.black,
    marginBottom: 24,
    textAlign: 'center',
  },
  audioRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  audioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  number: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
  },
  audioBtn: {
    padding: 8,
    backgroundColor: colors.grayLight,
    borderRadius: 8,
  },
  writingBoxes: {
    gap: 16,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
});
