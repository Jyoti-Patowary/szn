import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import CatalogueScreen from '../screens/CatalogueScreen';
import LooksScreen from '../screens/LooksScreen';
import WishlistScreen from '../screens/WishlistScreen';
import BottomNav from '../components/BottomNav'; // Import your custom bar!

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      // This line injects your floating component as the official tab bar!
      tabBar={(props) => <BottomNav {...props} />} 
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Catalogue" component={CatalogueScreen} />
      <Tab.Screen name="Looks" component={LooksScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
    </Tab.Navigator>
  );
}