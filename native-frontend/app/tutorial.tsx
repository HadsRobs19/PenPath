import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { useVideoPlayer, VideoView } from 'expo-video';
import Button from '@/components/Button';
import { colors, gradients } from '@/constants/colors';

const { width } = Dimensions.get('window');

export default function Tutorial() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../assets/fonts/Playkiddo.ttf'),
  });

  // Video player setup (will need actual video asset)
  const player = useVideoPlayer(null, (player) => {
    player.loop = false;
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
          <Text style={styles.heading}>Tutorial</Text>
          <Text style={styles.subtitle}>
            Watch this video to learn how to trace cursive letters
          </Text>

          <View style={styles.videoContainer}>
            <VideoView
              style={styles.video}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
            />
            <Text style={styles.placeholder}>Video tutorial will play here</Text>
          </View>

          <View style={styles.buttonRow}>
            <Button onPress={() => router.back()}>
              Back
            </Button>
            <Button onPress={() => router.push('/colors/reading' as Href)}>
              Start Lesson
            </Button>
          </View>
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
  heading: {
    fontFamily: 'PlayKiddo',
    fontSize: Math.min(width * 0.08, 36),
    color: colors.black,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.grayDark,
    textAlign: 'center',
    marginBottom: 24,
  },
  videoContainer: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 16 / 9,
    backgroundColor: colors.black,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    position: 'absolute',
    color: colors.white,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
});
