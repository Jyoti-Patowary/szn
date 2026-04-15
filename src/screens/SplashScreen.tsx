import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

// The colors for our 4 mini icons
const ICON_COLORS = ['#4A4A4A', '#A67B5B', '#6DA4EE', '#B49CE5'];

export default function SplashScreen({ navigation }: any) {
  const [showSznLogo, setShowSznLogo] = useState(false);

  // 1. Create an array of 4 Animated Values, initialized to 0
  const iconAnimations = useRef(ICON_COLORS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const logoTimer = setTimeout(() => setShowSznLogo(true), 1200);
    const navigationTimer = setTimeout(() => navigation.replace('Main'), 3800); // Increased slightly to let the animation finish

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigation]);

  useEffect(() => {
    // 2. When the SZN logo is allowed to show, trigger the animation
    if (showSznLogo) {
      const animations = iconAnimations.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500, // Half a second per icon
          useNativeDriver: true,
        })
      );

      // Animated.stagger starts each animation 150ms after the previous one
      Animated.stagger(150, animations).start();
    }
  }, [showSznLogo]); // Run this effect when showSznLogo changes

  return (
    <View style={styles.container}>
      {!showSznLogo ? (
        <View style={styles.iconContainer}>
          <Image 
            source={require('../../assets/spring-icon.png')} 
            style={styles.springImage}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View style={styles.logoLayoutContainer}>
          
          {/* Left Column: The 4 Stacked Icons (Now Animated) */}
          <View style={styles.stackedIconsColumn}>
            {ICON_COLORS.map((color, index) => {
              // Interpolate the animated value (0 to 1) into a physical distance
              // Starts at 100 pixels to the right (towards middle), ends at 0 (left position)
              const translateX = iconAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0], 
              });

              // Fade in as it moves
              const opacity = iconAnimations[index];

              return (
                <Animated.View 
                  key={index}
                  style={[
                    styles.miniIcon, 
                    { backgroundColor: color },
                    // 3. Apply the animated styles here
                    { opacity: opacity, transform: [{ translateX }] }
                  ]} 
                />
              );
            })}
          </View>

          {/* Right Column: The Typography */}
          <View style={styles.textColumn}>
            <Text style={styles.textYour}>Your</Text>
            <Text style={styles.textSZN}>SZN</Text>
          </View>

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3EBE1', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', 
  },
  springImage: {
    width: 60,
    height: 60,
  },
  logoLayoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackedIconsColumn: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginRight: 15,
    height: 160, 
  },
  miniIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
  textColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  textYour: {
    fontFamily: 'PlayfairDisplay_700Bold_Italic',
    fontSize: 70,
    color: '#333333',
    lineHeight: 75,
  },
  textSZN: {
    fontFamily: 'PlayfairDisplay_700Bold_Italic', 
    fontSize: 90,
    color: '#333333',
    lineHeight: 90,
    letterSpacing: -2,
    marginTop: -15, 
  },
});