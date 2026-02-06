import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import Button from '../components/Button';

const { height, width } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../assets/fonts/Playkiddo.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.appBg}>
      <LinearGradient
        colors={['#B2F7FF', '#98AEFD']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 0.9 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.heading}>Welcome to</Text>

          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Button onPress={() => router.push('/login')}>
            Log in
          </Button>
          <Button onPress={() => router.push('/signup')}>
            Sign Up
          </Button>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  appBg: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
    marginTop: -80,
  },
  heading: {
    fontFamily: 'PlayKiddo',
    fontSize: Math.min(width * 0.08, 48), 
    color: '#050505',
    marginBottom: 300,
    textAlign: 'center',
  },
  logo: {
    width: Math.min(width * 0.8, 360),
    height: Math.min(width * 0.8, 360),
    marginTop: -370,
    marginBottom: 50,
  },
});
