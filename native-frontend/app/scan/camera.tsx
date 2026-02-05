import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

export default function CameraScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../../assets/fonts/Playkiddo.ttf'),
  });

  const handleBack = () => {
    router.back();
  };

  const handleThumbnail = () => {
    // TODO: open gallery
    console.log('Thumbnail pressed - open gallery');
  };

  const handleShutter = () => {
    // TODO: take picture
    console.log('Shutter pressed - take picture');
  };

  const handleConfirm = () => {
    router.push('/scan/result');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
        </Pressable>
        <Text style={[styles.title, fontsLoaded && styles.titleFont]}>Camera</Text>
      </View>

      {/* Camera Preview Placeholder */}
      <View style={styles.previewContainer}>
        <View style={styles.previewPlaceholder}>
          {/* Document detection overlay placeholder */}
          <View style={styles.documentOverlay} />
        </View>
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        {/* Thumbnail / Gallery */}
        <Pressable
          onPress={handleThumbnail}
          style={({ pressed }) => [
            styles.thumbnailButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <View style={styles.thumbnailPlaceholder} />
        </Pressable>

        {/* Shutter Button */}
        <Pressable
          onPress={handleShutter}
          style={({ pressed }) => [
            styles.shutterButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="camera" size={32} color="#1A1A1A" />
        </Pressable>

        {/* Confirm Button */}
        <Pressable
          onPress={handleConfirm}
          style={({ pressed }) => [
            styles.confirmButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="checkmark" size={28} color="#1A1A1A" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6EC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  titleFont: {
    fontFamily: 'PlayKiddo',
  },
  previewContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 8,
  },
  previewPlaceholder: {
    flex: 1,
    backgroundColor: '#C4C4C4',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  documentOverlay: {
    width: '70%',
    height: '45%',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
    backgroundColor: '#FDF6EC',
    gap: 32,
  },
  thumbnailButton: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  thumbnailPlaceholder: {
    width: 44,
    height: 44,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  confirmButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A1A1A',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
