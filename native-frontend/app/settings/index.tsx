import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

type ThemeColor = 'blue' | 'pink' | 'green';
type FontSizeOption = 0 | 1 | 2 | 3 | 4;

export default function SettingsScreen() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<ThemeColor>('blue');
  const [selectedFontSize, setSelectedFontSize] = useState<FontSizeOption>(2);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0.3);

  const [fontsLoaded] = useFonts({
    PlayKiddo: require('../../assets/fonts/Playkiddo.ttf'),
  });

  const handleBack = () => {
    router.back();
  };

  const handleLogOut = () => {
    // TODO: Implement logout logic
    console.log('Log Out pressed');
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    // TODO: Implement actual delete account logic
    console.log('Account deletion confirmed');
    setShowDeleteModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleInkColorPress = () => {
    // TODO: Open ink color picker
    console.log('Ink Color selector pressed');
  };

  const handleCameraPress = () => {
    // TODO: Navigate to camera or handle camera action
    console.log('Camera button pressed');
  };

  const themeColors: { key: ThemeColor; color: string }[] = [
    { key: 'blue', color: '#A8D8EA' },
    { key: 'pink', color: '#F5C1D0' },
    { key: 'green', color: '#C8E6C9' },
  ];

  const fontSizes = [14, 18, 22, 26, 30];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1A1A1A" />
        </Pressable>
        <Text style={[styles.title, fontsLoaded && styles.titleFont]}>
          Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Themes Section */}
        <Text style={[styles.sectionTitle, fontsLoaded && styles.sectionTitleFont]}>
          Themes
        </Text>
        <View style={styles.themesRow}>
          {themeColors.map((theme) => (
            <Pressable
              key={theme.key}
              onPress={() => setSelectedTheme(theme.key)}
              style={[
                styles.themeBox,
                { backgroundColor: theme.color },
                selectedTheme === theme.key && styles.themeBoxSelected,
              ]}
            />
          ))}
        </View>

        {/* Font Size Section */}
        <Text style={[styles.sectionTitle, fontsLoaded && styles.sectionTitleFont]}>
          Font Size
        </Text>
        <View style={styles.fontSizeRow}>
          {fontSizes.map((size, index) => (
            <Pressable
              key={index}
              onPress={() => setSelectedFontSize(index as FontSizeOption)}
              style={styles.fontSizeItem}
            >
              <Text
                style={[
                  styles.fontSizeLetter,
                  { fontSize: size },
                  selectedFontSize === index && styles.fontSizeLetterSelected,
                ]}
              >
                B
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Ink Color & Ink Thickness Row */}
        <View style={styles.inkRow}>
          <View style={styles.inkColumn}>
            <Text style={styles.inkLabel}>Ink Color</Text>
            <Pressable onPress={handleInkColorPress} style={styles.inkColorPicker}>
              <Text style={styles.inkColorText}>Please Select...</Text>
            </Pressable>
          </View>
          <View style={styles.inkColumn}>
            <Text style={styles.inkLabel}>Ink Thickness</Text>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <View
                  style={[
                    styles.sliderHandle,
                    { left: `${sliderPosition * 100}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <Text style={[styles.sectionTitle, fontsLoaded && styles.sectionTitleFont]}>
          Notifications
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable
            onPress={handleLogOut}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.actionButtonText}>Log Out</Text>
          </Pressable>

          <Pressable
            onPress={handleDeleteAccount}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.actionButtonText}>Delete Account</Text>
          </Pressable>
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

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Are you sure you want to delete your account?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={handleConfirmDelete}
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </Pressable>
              <Pressable
                onPress={handleCancelDelete}
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7EEDC',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitleFont: {
    fontFamily: 'PlayKiddo',
  },
  themesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  themeBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeBoxSelected: {
    borderColor: '#1A1A1A',
  },
  fontSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  fontSizeItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 40,
    height: 50,
  },
  fontSizeLetter: {
    fontWeight: 'bold',
    color: '#6B7280',
  },
  fontSizeLetterSelected: {
    color: '#1A1A1A',
  },
  inkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  inkColumn: {
    flex: 1,
  },
  inkLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  inkColorPicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inkColorText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    position: 'relative',
  },
  sliderHandle: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    marginLeft: -8,
  },
  buttonsContainer: {
    gap: 12,
    marginTop: 24,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalText: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 24,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
});
