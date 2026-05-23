import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import CatalogueScreen from '../screens/CatalogueScreen';
import LooksScreen from '../screens/LooksScreen';
import WishlistScreen from '../screens/WishlistScreen';
import BottomNav from '../components/BottomNav'; 
import { useAppContext } from '../context/AppContext';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { isLocked } = useAppContext();

  const handleTabPress = (e: any) => {
    if (isLocked) {
      e.preventDefault(); 
    }
  };

  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />} 
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Catalogue" component={CatalogueScreen} listeners={{ tabPress: handleTabPress }} />
      <Tab.Screen name="Looks" component={LooksScreen} listeners={{ tabPress: handleTabPress }} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} listeners={{ tabPress: handleTabPress }} />
    </Tab.Navigator>
  );
}