import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ICON_SIZE = 22; 

export default function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.floatingNavContainer, { bottom: Math.max(insets.bottom + 10, Platform.OS === 'ios' ? 30 : 20) }]}>
      <View style={styles.floatingNav}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconElement;
          let label = '';

          const BASE_SIZE = 18; 
          
          const LOOKS_SIZE = 20;
          const WISHLIST_SIZE = 22;

          if (route.name === 'Home') {
            label = 'Home';
            iconElement = (
              <Image 
                source={isFocused ? require('../../assets/bottom_nav_icons/home_brown.png') : require('../../assets/bottom_nav_icons/home_white.png')} 
                style={{ width: BASE_SIZE, height: BASE_SIZE, resizeMode: 'contain' }} 
              />
            );
          } else if (route.name === 'Catalogue') {
            label = 'Catalogue';
            iconElement = (
              <Image 
                source={isFocused ? require('../../assets/bottom_nav_icons/catalogue_brown.png') : require('../../assets/bottom_nav_icons/catalogue_white.png')} 
                style={{ width: BASE_SIZE, height: BASE_SIZE, resizeMode: 'contain' }} 
              />
            );
          } else if (route.name === 'Looks') {
            label = 'Looks';
            iconElement = (
              <Image 
                source={isFocused ? require('../../assets/bottom_nav_icons/looks_brown.png') : require('../../assets/bottom_nav_icons/looks_white.png')} 
                style={{ width: LOOKS_SIZE, height: LOOKS_SIZE, resizeMode: 'contain' }}
              />
            );
          } else if (route.name === 'Wishlist') {
            label = 'Saved';
            iconElement = (
              <Ionicons 
                name={isFocused ? 'heart' : 'heart-outline'} 
                size={WISHLIST_SIZE} 
                color={isFocused ? '#A67B5B' : '#FFF'} 
              />
            );  
          }

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={isFocused ? styles.navItemActive : styles.navItem}
              activeOpacity={0.8}
            >
              {iconElement}
              {isFocused && <Text style={styles.navTextActive}>{label}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingNavContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  floatingNav: {
    flexDirection: 'row',
    backgroundColor: '#A67B5B',
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#A67B5B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  navItem: {
    padding: 10,
  },
  navItemActive: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  navTextActive: {
    color: '#A67B5B',
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 6,
    fontSize: 14,
  },
});