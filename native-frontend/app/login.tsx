import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, Link, Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/Button';
import { colors, gradients } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../assets/fonts/Playkiddo.ttf'),
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!fontsLoaded) {
    return null;
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    try {
    // simulate a short delay for loading effect
    await new Promise(resolve => setTimeout(resolve, 300));

    // navigate straight to home
    router.replace('/home');
  } catch (err: any) {
    setError('Something went wrong!');
  } finally {
    setLoading(false);
  }
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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.heading}>Log In</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Ionicons name="person" size={20} color={colors.gray} style={styles.icon} />
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

              <View style={styles.inputGroup}>
                <Ionicons name="key" size={20} color={colors.gray} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.gray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <Link href="/forgot-password" asChild>
                <Pressable>
                  <Text style={styles.forgotLink}>Forgot password?</Text>
                </Pressable>
              </Link>

              <Button onPress={handleSubmit} disabled={loading}>
                {loading ? 'Logging in...' : 'Log in'}
              </Button>

              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Link href="/signup" asChild>
                <Pressable>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </Pressable>
              </Link>
            </View>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: Math.min(width * 0.4, 180),
    height: Math.min(width * 0.4, 180),
    marginBottom: 20,
  },
  heading: {
    fontFamily: 'PlayKiddo',
    fontSize: Math.min(width * 0.08, 36),
    color: colors.black,
    marginBottom: 24,
  },
  form: {
    width: '100%',
    maxWidth: 340,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
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
  forgotLink: {
    color: colors.primary,
    textAlign: 'right',
    marginBottom: 20,
    fontWeight: '500',
  },
  errorText: {
    color: colors.error,
    marginTop: 12,
    textAlign: 'center',
  },
  signupRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  signupText: {
    color: colors.grayDark,
  },
  signupLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
