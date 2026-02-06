import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import Button from '@/components/Button';
import { colors, gradients } from '@/constants/colors';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../assets/fonts/Playkiddo.ttf'),
  });

  const [lesson1Complete, setLesson1Complete] = useState(false);
  const [lesson2Complete, setLesson2Complete] = useState(false);

  useEffect(() => {
    async function checkProgress() {
      const completed1 = await AsyncStorage.getItem('lesson1Complete');
      const completed2 = await AsyncStorage.getItem('lesson2Complete');
      setLesson1Complete(completed1 === 'true');
      setLesson2Complete(completed2 === 'true');
    }
    checkProgress();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E8F4F8', '#D4E7ED']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo */}
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Lesson Path */}
          <View style={styles.lessonPath}>
            {/* SVG Path Background */}
            <Svg
              style={styles.pathSvg}
              viewBox="0 0 300 700"
              preserveAspectRatio="none"
            >
              <Path
                d="M150 0 C 50 120, 250 240, 150 360 C 50 480, 250 600, 150 700"
                fill="none"
                stroke={colors.gray}
                strokeWidth={4}
                strokeDasharray="1,18"
                strokeLinecap="round"
              />
            </Svg>

            {/* Lesson 1: Colors */}
            <View style={[styles.lessonStep, styles.step1]}>
              <Pressable
                style={[styles.lessonButton, styles.lessonRainbow]}
                onPress={() => router.push('/colors/reading' as Href)}
              >
                <Text style={styles.lessonTitle}>Lesson 1</Text>
                <Text style={styles.lessonSubtitle}>Colors</Text>
              </Pressable>
            </View>

            {/* Tutorial */}
            <View style={[styles.lessonStep, styles.step2]}>
              <Pressable
                style={[styles.lessonButton, styles.lessonTan]}
                onPress={() => router.push('/tutorial' as Href)}
              >
                <Text style={styles.tutorialText}>Tutorial</Text>
              </Pressable>
            </View>

            {/* Lesson 1 Icons Row */}
            <View style={[styles.iconsRow, styles.step3]}>
              <Pressable
                style={styles.iconNode}
                onPress={() => router.push('/colors/reading' as Href)}
              >
                <Ionicons name="book" size={24} color={colors.primary} />
              </Pressable>
              <Pressable
                style={styles.iconNode}
                onPress={() => router.push('/colors/writing' as Href)}
              >
                <Ionicons name="pencil" size={24} color={colors.primary} />
              </Pressable>
              <Pressable
                style={styles.iconNode}
                onPress={() => router.push('/colors/checkpoint' as Href)}
              >
                <Ionicons name="flag" size={24} color={colors.primary} />
              </Pressable>
              <Pressable
                style={styles.iconNode}
                onPress={() => router.push('/colors/badge' as Href)}
              >
                <Image
                  source={require('../assets/images/rainbow-pen.png')}
                  style={styles.penIcon}
                  resizeMode="contain"
                />
              </Pressable>
            </View>

            {/* Lesson 2: Animals */}
            <View style={[styles.lessonStep, styles.step4]}>
              <Pressable
                style={[
                  styles.lessonButton,
                  styles.lessonBrown,
                  !lesson1Complete && styles.lessonLocked,
                ]}
                onPress={() => lesson1Complete && router.push('/animals/reading' as Href)}
                disabled={!lesson1Complete}
              >
                <Text style={styles.lessonTitle}>Lesson 2</Text>
                <Text style={styles.lessonSubtitle}>
                  {lesson1Complete ? 'Animals' : 'Locked'}
                </Text>
              </Pressable>
            </View>

            {/* Lesson 2 Icons Row */}
            <View style={[styles.iconsRow, styles.step5]}>
              <Pressable
                style={[styles.iconNode, !lesson1Complete && styles.iconLocked]}
                onPress={() => lesson1Complete && router.push('/animals/reading' as Href)}
                disabled={!lesson1Complete}
              >
                <Ionicons name="book" size={24} color={lesson1Complete ? colors.primary : colors.gray} />
              </Pressable>
              <Pressable
                style={[styles.iconNode, !lesson1Complete && styles.iconLocked]}
                onPress={() => lesson1Complete && router.push('/animals/writing' as Href)}
                disabled={!lesson1Complete}
              >
                <Ionicons name="pencil" size={24} color={lesson1Complete ? colors.primary : colors.gray} />
              </Pressable>
              <Pressable
                style={[styles.iconNode, !lesson1Complete && styles.iconLocked]}
                onPress={() => lesson1Complete && router.push('/animals/checkpoint' as Href)}
                disabled={!lesson1Complete}
              >
                <Ionicons name="flag" size={24} color={lesson1Complete ? colors.primary : colors.gray} />
              </Pressable>
              <Pressable
                style={[styles.iconNode, !lesson1Complete && styles.iconLocked]}
                onPress={() => lesson1Complete && router.push('/animals/badge' as Href)}
                disabled={!lesson1Complete}
              >
                <Image
                  source={require('../assets/images/animal-pen.png')}
                  style={[styles.penIcon, !lesson1Complete && styles.penIconLocked]}
                  resizeMode="contain"
                />
              </Pressable>
            </View>

            {/* Lesson 3: Foods (Locked) */}
            <View style={[styles.lessonStep, styles.step6]}>
              <Pressable
                style={[
                  styles.lessonButton,
                  styles.lessonPurple,
                  !lesson2Complete && styles.lessonLocked,
                ]}
                disabled={!lesson2Complete}
              >
                <Text style={styles.lessonTitle}>Lesson 3</Text>
                <Text style={styles.lessonSubtitle}>
                  {lesson2Complete ? 'Foods' : 'Locked'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <Pressable style={styles.navButton} onPress={() => router.push('/home' as Href)}>
            <Ionicons name="home" size={28} color={colors.primary} />
          </Pressable>
          <Pressable style={styles.navButton} onPress={() => router.push('/scan' as Href)}>
            <Ionicons name="camera" size={28} color={colors.grayDark} />
          </Pressable>
          <Pressable style={styles.navButton} onPress={() => router.push('/account' as Href)}>
            <Ionicons name="person" size={28} color={colors.grayDark} />
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 100,
  },
  logo: {
    width: Math.min(width * 0.5, 200),
    height: Math.min(width * 0.3, 120),
    marginBottom: 20,
  },
  lessonPath: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 700,
  },
  pathSvg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  lessonStep: {
    marginBottom: 16,
  },
  step1: {
    alignSelf: 'center',
  },
  step2: {
    alignSelf: 'flex-start',
    marginLeft: 40,
  },
  step3: {
    alignSelf: 'center',
  },
  step4: {
    alignSelf: 'flex-end',
    marginRight: 40,
  },
  step5: {
    alignSelf: 'center',
  },
  step6: {
    alignSelf: 'center',
  },
  lessonButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lessonRainbow: {
    backgroundColor: '#FF6B6B',
  },
  lessonBrown: {
    backgroundColor: '#8B5A2B',
  },
  lessonPurple: {
    backgroundColor: '#8B5CF6',
  },
  lessonTan: {
    backgroundColor: '#D2B48C',
  },
  lessonLocked: {
    opacity: 0.5,
  },
  lessonTitle: {
    fontFamily: 'PlayKiddo',
    fontSize: 16,
    color: colors.white,
  },
  lessonSubtitle: {
    fontFamily: 'PlayKiddo',
    fontSize: 14,
    color: colors.white,
    marginTop: 4,
  },
  tutorialText: {
    fontFamily: 'PlayKiddo',
    fontSize: 16,
    color: colors.black,
  },
  iconsRow: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 16,
  },
  iconNode: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconLocked: {
    opacity: 0.5,
  },
  penIcon: {
    width: 32,
    height: 32,
  },
  penIconLocked: {
    opacity: 0.5,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
  },
  navButton: {
    padding: 8,
  },
});
