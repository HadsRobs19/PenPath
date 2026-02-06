import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

export default function ProgressScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../../assets/fonts/Playkiddo.ttf'),
  });

  const handleBack = () => {
    router.back();
  };

  const handleCameraPress = () => {
    // TODO: Handle camera action
    console.log('Camera button pressed');
  };

  const lessonTiles = [
    { number: '1', color: '#FFB380' }, // orange
    { number: '2', color: '#C9B1FF' }, // purple
    { number: '3', color: '#A8E6CF' }, // green
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
        </Pressable>
        <Text style={[styles.title, fontsLoaded && styles.titleFont]}>Progress</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Lessons Completed Section */}
        <Text style={styles.sectionTitle}>Lessons Completed</Text>
        <View style={styles.lessonsRow}>
          {lessonTiles.map((tile, index) => (
            <View
              key={index}
              style={[styles.lessonTile, { backgroundColor: tile.color }]}
            >
              <Text style={styles.lessonNumber}>{tile.number}</Text>
            </View>
          ))}
        </View>

        {/* Letters Perfected Section */}
        <Text style={styles.sectionTitle}>Letters Perfected</Text>
        <View style={styles.emptySection}>
          {/* TODO: Add perfected letters content */}
        </View>

        {/* Letters that need work Section */}
        <Text style={styles.sectionTitle}>Letters that need work</Text>
        <View style={styles.emptySection}>
          {/* TODO: Add letters that need work content */}
        </View>
      </ScrollView>

      {/* Bottom Camera Button */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={handleCameraPress}
          style={({ pressed }) => [
            styles.cameraButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="camera-outline" size={28} color="#1A1A1A" />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  titleFont: {
    fontFamily: 'PlayKiddo',
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 20,
    marginBottom: 12,
  },
  lessonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  lessonTile: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  lessonNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  emptySection: {
    minHeight: 40,
    // Placeholder for future content
  },
  bottomBar: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 24,
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
