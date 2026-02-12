import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import { colors, gradients } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function Scan() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../assets/fonts/Playkiddo.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.main}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 0.9 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.heading}>Scan Your Writing</Text>
          <Text style={styles.subtitle}>
            Take a photo or upload an image of your handwriting to get feedback
          </Text>

          <View style={styles.optionsContainer}>
            <Pressable style={styles.optionCard}>
              <Ionicons name="camera" size={48} color={colors.primary} />
              <Text style={styles.optionText}>Take Photo</Text>
            </Pressable>

            <Pressable style={styles.optionCard}>
              <Ionicons name="image" size={48} color={colors.primary} />
              <Text style={styles.optionText}>Upload Image</Text>
            </Pressable>
          </View>

          <Text style={styles.comingSoon}>Coming Soon!</Text>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <Pressable style={styles.navButton} onPress={() => router.push('/home' as Href)}>
            <Ionicons name="home" size={28} color={colors.grayDark} />
          </Pressable>
          <Pressable style={styles.navButton} onPress={() => router.push('/scan' as Href)}>
            <Ionicons name="camera" size={28} color={colors.primary} />
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  heading: {
    fontFamily: 'PlayKiddo',
    fontSize: Math.min(width * 0.07, 32),
    color: colors.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.grayDark,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  optionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
  comingSoon: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
  },
  bottomNav: {
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
