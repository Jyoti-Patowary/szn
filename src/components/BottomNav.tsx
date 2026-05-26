import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../context/ThemeContext';

import HomeIcon from '../components/icons/HomeIcon';
import CatalogueIcon from '../components/icons/CatalogueIcon';
import LooksIcon from '../components/icons/LooksIcon';

export default function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const navColor = currentTheme?.color || '#333333'; 

  return (
    <View style={[styles.floatingNavContainer, { bottom: Math.max(insets.bottom + 10, Platform.OS === 'ios' ? 30 : 20) }]}>

      <View style={[styles.floatingNav, { backgroundColor: navColor, shadowColor: navColor }]}>
        
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

          const iconColor = isFocused ? navColor : '#FFF';

          if (route.name === 'Home') {
            label = 'Home';
            iconElement = <HomeIcon color={iconColor} isFocused={isFocused} size={BASE_SIZE} />;
            
          } else if (route.name === 'Catalogue') {
            label = 'Catalogue';
            iconElement = <CatalogueIcon color={iconColor} isFocused={isFocused} size={BASE_SIZE} />;
            
          } else if (route.name === 'Looks') {
            label = 'Looks';
            iconElement = <LooksIcon color={iconColor} size={LOOKS_SIZE} />;
            
          } else if (route.name === 'Wishlist') {
            label = 'Saved';
            iconElement = (
              <Ionicons 
                name={isFocused ? 'heart' : 'heart-outline'} 
                size={WISHLIST_SIZE} 
                color={iconColor} 
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

              {isFocused && (
                <Text style={[styles.navTextActive, { color: navColor }]}>
                  {label}
                </Text>
              )}
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
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontFamily: 'Inter_400Regular',
    marginLeft: 6,
    fontSize: 14,
  },
});