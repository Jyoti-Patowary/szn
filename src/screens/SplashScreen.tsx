import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import { useAppContext } from '../context/AppContext';

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
    const navigationTimer = setTimeout(() => navigation.replace('Auth'), 3800); 

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
    width: 60,
    height: 60,
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