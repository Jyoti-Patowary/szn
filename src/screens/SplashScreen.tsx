import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

const SEASON_ICONS = [
  require('../../assets/winter-icon.png'),
  require('../../assets/autumn-icon.png'),
  require('../../assets/summer-icon.png'),
  require('../../assets/spring-icon.png'),
];

export default function SplashScreen({ navigation }: any) {
  const [showSznLogo, setShowSznLogo] = useState(false);

  const iconAnimations = useRef(SEASON_ICONS.map(() => new Animated.Value(0))).current;

  const { isLocked } = useAppContext();

  useEffect(() => {
    const logoTimer = setTimeout(() => setShowSznLogo(true), 1200);
    const navigationTimer = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          navigation.replace('Main');
        } else {
          navigation.replace('Auth');
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigation.replace('Auth');
      }
    }, 3800);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigation, isLocked]);

  useEffect(() => {
    if (showSznLogo) {
      const animations = iconAnimations.map((anim) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500, 
          useNativeDriver: true,
        })
      );

      Animated.stagger(150, animations).start();
    }
  }, [showSznLogo]); 

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
          
          <View style={styles.stackedIconsColumn}>

            {SEASON_ICONS.map((iconSource, index) => {
    
              const translateX = iconAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0], 
              });

              const opacity = iconAnimations[index];

              return (
  
                <Animated.Image 
                  key={index}
                  source={iconSource} 
                  resizeMode="contain"
                  style={[
                    styles.miniIcon, 
                    { opacity: opacity, transform: [{ translateX }] }
                  ]} 
                />
              );
            })}
          </View>

          <View style={styles.textColumn}>
            <Image 
              source={require('../../assets/splash_logo_1.png')} 
              resizeMode="contain"
              style={{ width: width * 0.90, height: 240, top: 20, marginBottom: -20 }} 
            />
          </View>

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#ffffff', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // backgroundColor: colors.accent,
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
    position: 'absolute', 
    left: 20,          
    zIndex: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginRight: 15,
    height: 160, 
  },
  miniIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
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