import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { Animated, Easing, ImageBackground, StyleSheet, View } from 'react-native';
import { runAppStartupTasks } from '../../application/services/AppStartupService';
import { RootStackParamList } from '../../app/navigation/RootStackParamList';

type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SPLASH_DURATION_MS = 3000;

export function SplashScreen({ navigation }: SplashScreenProps) {
  const firstDotAnim = useRef(new Animated.Value(0.35)).current;
  const secondDotAnim = useRef(new Animated.Value(0.35)).current;
  const thirdDotAnim = useRef(new Animated.Value(0.35)).current;

  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    startDotsAnimation();
    void initializeApp();

    return () => {
      animationRef.current?.stop();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function startDotsAnimation() {
    const createDotPulse = (animatedValue: Animated.Value) =>
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.35,
          duration: 420,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]);

    animationRef.current = Animated.loop(
      Animated.stagger(180, [
        createDotPulse(firstDotAnim),
        createDotPulse(secondDotAnim),
        createDotPulse(thirdDotAnim),
      ]),
    );

    animationRef.current.start();
  }

  async function initializeApp() {
    const startedAt = Date.now();

    try {
      await runAppStartupTasks();
    } finally {
      const elapsedMs = Date.now() - startedAt;
      const remainingMs = Math.max(SPLASH_DURATION_MS - elapsedMs, 0);

      timeoutRef.current = setTimeout(() => {
        navigation.replace('Home');
      }, remainingMs);
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/splash/splash-lista-mercado-facil.png')}
        resizeMode="cover"
        style={styles.backgroundImage}
      >
        <View style={styles.loadingDotsContainer}>
          <Animated.View
            style={[
              styles.loadingDot,
              {
                opacity: firstDotAnim,
                transform: [{ scale: firstDotAnim }],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.loadingDot,
              styles.loadingDotActive,
              {
                opacity: secondDotAnim,
                transform: [{ scale: secondDotAnim }],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.loadingDot,
              {
                opacity: thirdDotAnim,
                transform: [{ scale: thirdDotAnim }],
              },
            ]}
          />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#061B52',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingDotsContainer: {
    position: 'absolute',
    top: '74%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#38BDF8',
  },
  loadingDotActive: {
    backgroundColor: '#67E8F9',
  },
});