import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

type AIOption = 'penpath' | 'penpath-pro' | 'gpt5-pro';

export default function ResultScreen() {
  const router = useRouter();
  const [selectedAI, setSelectedAI] = useState<AIOption>('penpath');

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../../assets/fonts/Playkiddo.ttf'),
  });

  const handleBack = () => {
    router.back();
  };

  const handleClose = () => {
    router.push('/scan');
  };

  const aiOptions: { key: AIOption; label: string }[] = [
    { key: 'penpath', label: 'PenPath AI' },
    { key: 'penpath-pro', label: 'PenPath AI Pro' },
    { key: 'gpt5-pro', label: 'GPT -5 Pro' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
        </Pressable>
        <Text style={[styles.title, fontsLoaded && styles.titleFont]}>Result</Text>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <View style={styles.closeCircle}>
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </View>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Scanned Image Preview */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            {/* Placeholder for scanned handwriting image */}
            <View style={styles.handwritingLines}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={styles.handwritingLine} />
              ))}
            </View>
          </View>
        </View>

        {/* AI Assistant Card */}
        <View style={styles.aiCard}>
          <Text style={styles.aiTitle}>AI Assistant</Text>
          <View style={styles.pillContainer}>
            {aiOptions.map((option) => (
              <Pressable
                key={option.key}
                onPress={() => setSelectedAI(option.key)}
                style={[
                  styles.pill,
                  selectedAI === option.key && styles.pillSelected,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    selectedAI === option.key && styles.pillTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Translation Section */}
        <View style={styles.translationSection}>
          <Text style={[styles.sectionTitle, fontsLoaded && styles.titleFont]}>
            Translation
          </Text>
          <Text style={styles.translationText}>
            {"Don't talk me down. Don't fill my head with doubt. Don't call me late at night, knowing what I'm like. Don't trust myself when you walk out. Don't turn around. Don't talk me down."}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation - Visual only since main app has tabs */}
      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() => {
            // TODO: Navigate to home
            router.push('/');
          }}
        >
          <Ionicons name="home-outline" size={26} color="#9CA3AF" />
        </Pressable>

        <Pressable style={styles.navItemCenter}>
          <View style={styles.navCenterButton}>
            <Ionicons name="chevron-back" size={18} color="#1A1A1A" />
            <Ionicons name="chevron-forward" size={18} color="#1A1A1A" />
          </View>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => {
            // TODO: Navigate to profile/account
            router.push('/account');
          }}
        >
          <Ionicons name="person-outline" size={26} color="#9CA3AF" />
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  titleFont: {
    fontFamily: 'PlayKiddo',
  },
  closeButton: {
    padding: 4,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  imageContainer: {
    marginBottom: 16,
  },
  imagePlaceholder: {
    backgroundColor: '#F5F0E6',
    borderRadius: 12,
    padding: 16,
    minHeight: 180,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E0D6',
  },
  handwritingLines: {
    gap: 12,
  },
  handwritingLine: {
    height: 2,
    backgroundColor: '#D1CBC0',
    borderRadius: 1,
    opacity: 0.6,
  },
  aiCard: {
    backgroundColor: '#D4F1F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#F5C842',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  pillSelected: {
    backgroundColor: '#E8F4F8',
    borderColor: '#2563EB',
  },
  pillText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  pillTextSelected: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  translationSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  translationText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#374151',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: '#FDF6EC',
    borderTopWidth: 0,
  },
  navItem: {
    padding: 8,
  },
  navItemCenter: {
    padding: 8,
  },
  navCenterButton: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 4,
  },
});
