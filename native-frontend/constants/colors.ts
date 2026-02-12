// App color palette
export const colors = {
  // Primary colors
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',

  // Gradients
  gradientStart: '#B2F7FF',
  gradientEnd: '#98AEFD',

  // Accent colors
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',

  // Neutrals
  white: '#FFFFFF',
  black: '#050505',
  gray: '#9CA3AF',
  grayLight: '#E5E7EB',
  grayDark: '#374151',

  // Background colors
  bgLight: '#F3F4F6',
  bgDark: '#1F2937',

  // Lesson theme colors
  lessonRainbow: '#FF6B6B',
  lessonBrown: '#8B5A2B',
  lessonPurple: '#8B5CF6',
  lessonTan: '#D2B48C',

  // Tracing colors
  tracingUser: '#2563EB',
  tracingGuide: '#9CA3AF',
  tracingGood: '#22C55E',
  tracingBad: '#EF4444',

  // Guide lines
  guideLine: 'rgba(156, 163, 175, 0.3)',
};

export const gradients = {
  main: ['#B2F7FF', '#98AEFD'] as const,
  reading: ['#FFF5E1', '#FFE4C4'] as const,
  writing: ['#E8F5E9', '#C8E6C9'] as const,
  animals: ['#FFF3E0', '#FFE0B2'] as const,
  badge: ['#F3E5F5', '#E1BEE7'] as const,
};

export default colors;
