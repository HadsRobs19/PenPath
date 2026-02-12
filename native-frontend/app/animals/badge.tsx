import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '@/components/Button';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function AnimalsBadge() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../../assets/fonts/Playkiddo.ttf'),
  });

  const [isRevealed, setIsRevealed] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    async function checkCompletion() {
      const lessonComplete = await AsyncStorage.getItem('lesson2Complete');
      if (lessonComplete !== 'true') {
        setShowToast(true);
        setTimeout(() => {
          router.replace('/home' as Href);
        }, 2200);
      }
    }
    checkCompletion();
  }, [router]);

  useEffect(() => {
    if (isRevealed) {
      Animated.spring(fadeAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [isRevealed, fadeAnim]);

  if (!fontsLoaded) {
    return null;
  }

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleNextLesson = async () => {
    await AsyncStorage.setItem('animalsLessonComplete', 'true');
    router.push('/home' as Href);
  };

  return (
    <View style={styles.container}>
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>Finish the lesson first!</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.heading}>You earned a badge!</Text>

        {!isRevealed && (
          <Text style={styles.subtitle}>Tap to reveal!</Text>
        )}

        <Pressable style={styles.badgeCard} onPress={handleReveal}>
          <Animated.Image
            source={require('../../assets/images/animal-pen.png')}
            style={[
              styles.badgeImage,
              {
                opacity: isRevealed ? fadeAnim : 0.1,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
            resizeMode="contain"
          />
        </Pressable>

        {isRevealed && (
          <Text style={styles.congratsText}>
            Congratulations! You've completed Lesson 2!
          </Text>
        )}

        <View style={styles.buttonRow}>
          <Button onPress={() => router.push('/home' as Href)}>
            Exit
          </Button>
          <Button onPress={handleNextLesson}>
            {isRevealed ? 'Finish' : 'Next'}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  toast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    zIndex: 10,
  },
  toastText: {
    color: colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  heading: {
    fontFamily: 'PlayKiddo',
    fontSize: Math.min(width * 0.08, 36),
    color: colors.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.grayDark,
    marginBottom: 24,
  },
  badgeCard: {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  badgeImage: {
    width: 150,
    height: 150,
  },
  congratsText: {
    fontSize: 16,
    color: colors.success,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
});
