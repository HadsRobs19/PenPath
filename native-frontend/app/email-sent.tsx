import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import { colors, gradients } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function EmailSent() {
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
          <View style={styles.iconCircle}>
            <Ionicons name="mail" size={48} color={colors.primary} />
          </View>

          <Text style={styles.heading}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a password reset link to your email address.
          </Text>

          <Button onPress={() => router.replace('/login' as Href)}>
            Back to Login
          </Button>
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
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heading: {
    fontFamily: 'PlayKiddo',
    fontSize: Math.min(width * 0.07, 32),
    color: colors.black,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.grayDark,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
  },
});
