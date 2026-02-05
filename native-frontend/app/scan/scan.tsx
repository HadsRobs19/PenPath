import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

export default function ScanScreen() {
  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../../assets/fonts/Playkiddo.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleUploadTap = () => {
    // TODO: Open document/image picker for file upload
  };

  const handleOpenCamera = () => {
    // TODO: Navigate to camera screen via router.push('/(scan)/camera')
  };

  const handleUploadButton = () => {
    // TODO: Open document/image picker for file upload
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Scan</Text>

      <View style={styles.card}>
        {/* Upload icon placeholder */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconArrow}>&#8679;</Text>
        </View>

        <Pressable onPress={handleUploadTap}>
          <Text style={styles.uploadText}>Tap to upload file</Text>
        </Pressable>

        <Text style={styles.orText}>OR</Text>

        <Pressable
          onPress={handleOpenCamera}
          style={({ pressed }) => [
            styles.cameraButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.cameraButtonText}>Open Camera</Text>
        </Pressable>
      </View>

      <View style={styles.bottomSection}>
        <Pressable
          onPress={handleUploadButton}
          style={({ pressed }) => [
            styles.uploadButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.uploadButtonText}>Upload Image/File</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6EC',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'PlayKiddo',
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconArrow: {
    fontSize: 28,
    color: '#4A4A4A',
  },
  uploadText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
    marginBottom: 12,
  },
  orText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  cameraButton: {
    backgroundColor: '#2563EB',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
});
