import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { useFonts } from 'expo-font';
import Button from '@/components/Button';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

const TARGET_SENTENCE = 'a bug hid in the big rug. the bug loved to be snug.';

export default function AnimalsReading() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../../assets/fonts/Playkiddo.ttf'),
  });

  const [input, setInput] = useState('');

  const isCorrect = input.trim().toLowerCase() === TARGET_SENTENCE;

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Type what you see!</Text>

        <View style={styles.card}>
          <Text style={styles.instruction}>
            Read the following cursive sentence and type it in the text box below:
          </Text>

          <Text style={styles.cursiveSample}>
            A bug hid in the big rug. The bug loved to be snug.
          </Text>
        </View>

        <TextInput
          style={styles.textArea}
          placeholder="Type what you see!"
          placeholderTextColor={colors.gray}
          value={input}
          onChangeText={setInput}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.buttonRow}>
          <Button onPress={() => router.push('/home' as Href)}>
            Back
          </Button>
          <Button
            onPress={() => router.push('/animals/writing' as Href)}
            disabled={!isCorrect}
          >
            Next
          </Button>
        </View>

        {isCorrect && (
          <Text style={styles.successText}>Perfect!</Text>
        )}
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
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  instruction: {
    fontSize: 16,
    color: colors.grayDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  cursiveSample: {
    fontFamily: 'PlayKiddo',
    fontSize: 20,
    color: colors.black,
    textAlign: 'center',
    lineHeight: 28,
  },
  textArea: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    minHeight: 120,
    fontSize: 16,
    color: colors.black,
    borderWidth: 1,
    borderColor: colors.grayLight,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  successText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.success,
    fontWeight: '600',
  },
});
