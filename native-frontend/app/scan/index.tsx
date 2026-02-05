import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ScanScreen() {
  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../../assets/fonts/Playkiddo.ttf'),
  });

  const handleUploadTap = () => {
    // TODO: Implement file/image picker logic
    console.log('Tap to upload file pressed');
  };

  const handleOpenCamera = () => {
    // TODO: Navigate to camera screen (e.g., router.push('/scan/camera'))
    console.log('Open Camera pressed');
  };

  const handleUploadButton = () => {
    // TODO: Implement file/image upload logic
    console.log('Upload Image/File pressed');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={[styles.title, fontsLoaded && styles.titleFont]}>Scan</Text>

      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="cloud-upload-outline"
            size={32}
            color="#4A4A4A"
          />
        </View>

        <Pressable onPress={handleUploadTap}>
          {({ pressed }) => (
            <Text style={[styles.uploadText, pressed && styles.textPressed]}>
              Tap to upload file
            </Text>
          )}
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 32,
  },
  titleFont: {
    fontFamily: 'PlayKiddo',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
    marginBottom: 12,
  },
  textPressed: {
    opacity: 0.6,
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
    paddingBottom: 100,
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
});
