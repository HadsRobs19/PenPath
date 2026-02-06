import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

export const sharedStyles = StyleSheet.create({
  // Backgrounds
  appBg: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content containers
  content: {
    alignItems: 'center',
    padding: 24,
    width: '100%',
  },
  loginContent: {
    alignItems: 'center',
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },

  // Typography
  heading: {
    fontFamily: 'PlayKiddo',
    fontSize: Math.min(width * 0.08, 48),
    color: colors.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    color: colors.grayDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: colors.black,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '500',
  },
  errorText: {
    color: colors.error,
    marginTop: 8,
    textAlign: 'center',
  },

  // Logo
  logo: {
    width: Math.min(width * 0.6, 280),
    height: Math.min(width * 0.6, 280),
    marginBottom: 30,
  },
  logoSmall: {
    width: Math.min(width * 0.4, 180),
    height: Math.min(width * 0.4, 180),
    marginBottom: 20,
  },

  // Forms
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.black,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    gap: 12,
  },
  welcomeButtons: {
    gap: 16,
    width: '100%',
    maxWidth: 300,
  },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Row layouts
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
});

export default sharedStyles;
