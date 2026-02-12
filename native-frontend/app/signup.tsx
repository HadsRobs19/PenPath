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
import { API_URL } from '@/constants/config';

const { width } = Dimensions.get('window');

export default function SignUp() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../assets/fonts/Playkiddo.ttf'),
  });

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!fontsLoaded) {
    return null;
  }

  async function handleSubmit() {
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setError(null);
    setLoading(true);

    // TODO: Uncomment when backend is ready
    // try {
    //   const res = await fetch(`${API_URL}/signup`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       name,
    //       username,
    //       email,
    //       birthday,
    //       password,
    //     }),
    //   });
    //
    //   if (!res.ok) {
    //     throw new Error('Failed to create account');
    //   }
    //
    //   const data = await res.json();
    //   console.log('Account created:', data);
    // } catch (err: any) {
    //   setError(err.message);
    //   setLoading(false);
    //   return;
    // }

    // For now, just navigate to home
    setLoading(false);
    router.replace('/home' as Href);
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

            <Text style={styles.heading}>Sign Up</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Ionicons name="person" size={20} color={colors.gray} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor={colors.gray}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="person-circle" size={20} color={colors.gray} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={colors.gray}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

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

              <View style={styles.inputGroup}>
                <Ionicons name="calendar" size={20} color={colors.gray} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Birthday (YYYY-MM-DD)"
                  placeholderTextColor={colors.gray}
                  value={birthday}
                  onChangeText={setBirthday}
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

              <View style={styles.inputGroup}>
                <Ionicons name="key" size={20} color={colors.gray} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor={colors.gray}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <Button onPress={handleSubmit} disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>

              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/login" asChild>
                <Pressable>
                  <Text style={styles.loginLink}>Log In</Text>
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
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  logo: {
    width: Math.min(width * 0.3, 120),
    height: Math.min(width * 0.3, 120),
    marginBottom: 16,
  },
  heading: {
    fontFamily: 'PlayKiddo',
    fontSize: Math.min(width * 0.08, 36),
    color: colors.black,
    marginBottom: 20,
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
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.black,
  },
  errorText: {
    color: colors.error,
    marginTop: 12,
    textAlign: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  loginText: {
    color: colors.grayDark,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
