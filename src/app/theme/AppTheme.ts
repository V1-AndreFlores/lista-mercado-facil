export type ThemeMode = 'light' | 'dark';

export type GradientColors = readonly [string, string, ...string[]];

export interface AppTheme {
  mode: ThemeMode;
  colors: {
    appBackdrop: string;
    background: string;
    backgroundAlt: string;
    surface: string;
    surfaceElevated: string;
    surfaceMuted: string;
    card: string;
    cardSoft: string;
    cardStrong: string;
    primary: string;
    primaryStrong: string;
    primarySoft: string;
    primaryText: string;
    accent: string;
    accentStrong: string;
    accentSoft: string;
    headerText: string;
    headerMuted: string;
    text: string;
    textMuted: string;
    textSubtle: string;
    border: string;
    borderStrong: string;
    inputBackground: string;
    navBackground: string;
    navActiveBackground: string;
    navText: string;
    navTextActive: string;
    success: string;
    warning: string;
    shadow: string;
    overlay: string;
    switchTrackOff: string;
    switchTrackOn: string;
    switchThumb: string;
  };
  gradients: {
    primary: GradientColors;
    header: GradientColors;
    hero: GradientColors;
    card: GradientColors;
    subtle: GradientColors;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 26,
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    appBackdrop: '#D7EEF8',
    background: '#F4F8FC',
    backgroundAlt: '#EAF4FA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#EEF6FB',
    card: '#FFFFFF',
    cardSoft: '#F8FCFF',
    cardStrong: '#E8F6FD',
    primary: '#0284C7',
    primaryStrong: '#075985',
    primarySoft: '#E0F2FE',
    primaryText: '#FFFFFF',
    accent: '#06B6D4',
    accentStrong: '#0891B2',
    accentSoft: '#CFFAFE',
    headerText: '#FFFFFF',
    headerMuted: '#E6F9FF',
    text: '#0F172A',
    textMuted: '#475569',
    textSubtle: '#64748B',
    border: '#E2EDF5',
    borderStrong: '#BAE6FD',
    inputBackground: '#FFFFFF',
    navBackground: '#FFFFFF',
    navActiveBackground: '#E0F2FE',
    navText: '#64748B',
    navTextActive: '#0369A1',
    success: '#0891B2',
    warning: '#B45309',
    shadow: '#0F172A',
    overlay: 'rgba(14, 165, 233, 0.10)',
    switchTrackOff: '#CBD5E1',
    switchTrackOn: '#0284C7',
    switchThumb: '#FFFFFF',
  },
  gradients: {
    primary: ['#0284C7', '#06B6D4'],
    header: ['#063C71', '#0284C7', '#06B6D4'],
    hero: ['#FFFFFF', '#EAF8FF'],
    card: ['#FFFFFF', '#F4FBFF'],
    subtle: ['#F4F8FC', '#FFFFFF'],
  },
  spacing,
  radius,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    appBackdrop: '#020617',
    background: '#06111F',
    backgroundAlt: '#071827',
    surface: '#0A1B2D',
    surfaceElevated: '#0D2438',
    surfaceMuted: '#102D47',
    card: '#0B1E31',
    cardSoft: '#0D2438',
    cardStrong: '#123654',
    primary: '#38BDF8',
    primaryStrong: '#0EA5E9',
    primarySoft: '#082F49',
    primaryText: '#031426',
    accent: '#22D3EE',
    accentStrong: '#67E8F9',
    accentSoft: '#164E63',
    headerText: '#F8FAFC',
    headerMuted: '#D8F5FF',
    text: '#F8FAFC',
    textMuted: '#CBD5E1',
    textSubtle: '#94A3B8',
    border: '#17354E',
    borderStrong: '#0EA5E9',
    inputBackground: '#071827',
    navBackground: '#0A1B2D',
    navActiveBackground: '#102D47',
    navText: '#94A3B8',
    navTextActive: '#67E8F9',
    success: '#22D3EE',
    warning: '#FBBF24',
    shadow: '#000000',
    overlay: 'rgba(56, 189, 248, 0.12)',
    switchTrackOff: '#334155',
    switchTrackOn: '#38BDF8',
    switchThumb: '#E0F7FF',
  },
  gradients: {
    primary: ['#38BDF8', '#22D3EE'],
    header: ['#031426', '#075985', '#0EA5E9'],
    hero: ['#0D2438', '#0B1E31'],
    card: ['#0B1E31', '#071827'],
    subtle: ['#102D47', '#0A1B2D'],
  },
  spacing,
  radius,
};

export function getAppTheme(mode: ThemeMode): AppTheme {
  return mode === 'dark' ? darkTheme : lightTheme;
}
