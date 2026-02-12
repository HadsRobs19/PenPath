import { StyleSheet, Dimensions } from 'react-native';
import { colors as themeColors } from '@/constants/colors';

const { width } = Dimensions.get('window');

export const colorsReadingStyles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#FFF5E1',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontFamily: 'PlayKiddo',
    fontSize: Math.min(width * 0.07, 32),
    color: themeColors.black,
    marginBottom: 24,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  next: {
    fontSize: 18,
    color: themeColors.primary,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: themeColors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
});

export const colorsWritingStyles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontFamily: 'PlayKiddo',
    fontSize: Math.min(width * 0.07, 32),
    color: themeColors.black,
    marginBottom: 24,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  letterCard: {
    backgroundColor: themeColors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  letterImage: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  input: {
    width: 80,
    height: 50,
    backgroundColor: themeColors.grayLight,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  next: {
    fontSize: 18,
    color: themeColors.primary,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: themeColors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
});

export const colorsCheckpointStyles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#FFF3E0',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontFamily: 'PlayKiddo',
    fontSize: Math.min(width * 0.07, 32),
    color: themeColors.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: themeColors.grayDark,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 20,
  },
});

export const colorsBadgeStyles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#F3E5F5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontFamily: 'PlayKiddo',
    fontSize: Math.min(width * 0.08, 36),
    color: themeColors.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: themeColors.grayDark,
    marginBottom: 24,
  },
  badgeCard: {
    width: 200,
    height: 200,
    borderRadius: 20,
    backgroundColor: themeColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  badgeImage: {
    width: 150,
    height: 150,
  },
  badgeHidden: {
    opacity: 0.1,
  },
  badgeRevealed: {
    opacity: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  toast: {
    position: 'absolute',
    top: 60,
    backgroundColor: themeColors.error,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  toastText: {
    color: themeColors.white,
    fontWeight: '600',
  },
});
