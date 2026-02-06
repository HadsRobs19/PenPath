import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '@/components/Button';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function ColorsWriting() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../../assets/fonts/Playkiddo.ttf'),
  });

  const [fInput, setFInput] = useState('');
  const [nInput, setNInput] = useState('');

  const isCorrect =
    fInput.toLowerCase() === 'f' && nInput.toLowerCase() === 'n';

  if (!fontsLoaded) {
    return null;
  }

  const handleNext = async () => {
    await AsyncStorage.setItem('colors_writingComplete', 'true');
    router.push('/colors/checkpoint' as Href);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Read & Reveal!</Text>
        <Text style={styles.subtitle}>
          Look at the cursive letter and type what you see
        </Text>

        <View style={styles.letterRow}>
          <View style={styles.letterCard}>
            <Image
              source={require('../../assets/images/F.png')}
              style={styles.letterImage}
              resizeMode="contain"
            />
            <TextInput
              style={styles.input}
              maxLength={1}
              value={fInput}
              onChangeText={setFInput}
              placeholder="?"
              placeholderTextColor={colors.gray}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.letterCard}>
            <Image
              source={require('../../assets/images/N.png')}
              style={styles.letterImage}
              resizeMode="contain"
            />
            <TextInput
              style={styles.input}
              maxLength={1}
              value={nInput}
              onChangeText={setNInput}
              placeholder="?"
              placeholderTextColor={colors.gray}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Button onPress={() => router.push('/colors/reading' as Href)}>
            Back
          </Button>
          <Button onPress={handleNext} disabled={!isCorrect}>
            Next
          </Button>
        </View>

        {isCorrect && (
          <Text style={styles.successText}>Correct!</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
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
  letterRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  letterCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  letterImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  input: {
    width: 60,
    height: 50,
    backgroundColor: colors.grayLight,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '600',
    color: colors.black,
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
