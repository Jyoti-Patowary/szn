import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

          // Determine Icons and Labels based on the route name
          let iconName: any = 'home';
          let label = '';

          if (route.name === 'Home') {
            iconName = isFocused ? 'home' : 'home-outline';
            label = 'Home';
          } else if (route.name === 'Catalogue') {
            iconName = isFocused ? 'grid' : 'grid-outline';
            label = 'Grid';
          } else if (route.name === 'Looks') {
            iconName = isFocused ? 'sparkles' : 'sparkles-outline';
            label = 'Discover';
          } else if (route.name === 'Wishlist') {
            iconName = isFocused ? 'heart' : 'heart-outline';
            label = 'Saved';
          }

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={isFocused ? styles.navItemActive : styles.navItem}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={iconName} 
                size={isFocused ? 18 : 24} 
                color={isFocused ? '#A67B5B' : '#FFF'} 
              />
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
    // bottom: Platform.OS === 'ios' ? 30 : 20,
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