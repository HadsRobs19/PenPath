import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import { colors, gradients } from '@/constants/colors';
import { API_URL } from '@/constants/config';

const { width } = Dimensions.get('window');

export default function ForgotPassword() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../assets/fonts/Playkiddo.ttf'),
  });

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!fontsLoaded) {
    return null;
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    // TODO: Uncomment when backend is ready
    // try {
    //   const res = await fetch(`${API_URL}/forgot-password`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email }),
    //   });
    //
    //   if (!res.ok) {
    //     throw new Error('Failed to send reset email');
    //   }
    // } catch (err: any) {
    //   setError(err.message);
    //   setLoading(false);
    //   return;
    // }

    // For now, just navigate to email-sent
    setLoading(false);
    router.push('/email-sent' as Href);
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.main}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 0.9 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.heading}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a reset link
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Ionicons name="mail" size={20} color={colors.gray} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={colors.gray}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <Button onPress={handleSubmit} disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Button onPress={() => router.back()}>
                Back to Login
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: Math.min(width * 0.4, 160),
    height: Math.min(width * 0.4, 160),
    marginBottom: 24,
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
    marginBottom: 24,
  },
  form: {
    width: '100%',
    maxWidth: 340,
    gap: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.black,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
});
