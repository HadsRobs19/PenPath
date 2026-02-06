import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../../assets/fonts/Playkiddo.ttf'),
  });

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleProgress = () => {
    router.push('/account/progress');
  };

  const handleCameraPress = () => {
    // TODO: Handle camera action or navigate
    console.log('Camera button pressed');
  };

  const badgeColors = [
    '#FF6B6B', // red
    '#FFD93D', // yellow
    '#FFF3B0', // light yellow
    '#6BCB77', // green
    '#A8D8EA', // light blue
    '#C9B1FF', // purple
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Text style={[styles.title, fontsLoaded && styles.titleFont]}>Profile</Text>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Row */}
        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={32} color="#9B7BB8" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Daniel Jones</Text>
            <Text style={styles.profileAge}>8 years old</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable
            onPress={handleSettings}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.actionButtonText}>Settings</Text>
          </Pressable>

          <Pressable
            onPress={handleProgress}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.actionButtonText}>Progress</Text>
          </Pressable>
        </View>

        {/* Badges Section */}
        <Text style={[styles.sectionTitle, fontsLoaded && styles.sectionTitleFont]}>
          Badges
        </Text>
        <View style={styles.badgesGrid}>
          {badgeColors.map((color, index) => (
            <View
              key={index}
              style={[styles.badgeTile, { backgroundColor: color }]}
            />
          ))}
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleFont: {
    fontFamily: 'PlayKiddo',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8DFF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  profileAge: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  sectionTitleFont: {
    fontFamily: 'PlayKiddo',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  badgeTile: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
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
});
