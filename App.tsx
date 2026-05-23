import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';

import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { PlayfairDisplay_400Regular, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { SavedItemsProvider } from './src/context/SavedItemsContext';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'KeplerStd-Medium': require('./assets/fonts/KeplerStd-Medium.otf'),
    'Almarai-Light': require('./assets/fonts/Almarai-Light.ttf'),
    'Almarai-Regular': require('./assets/fonts/Almarai-Regular.ttf'),
    'Almarai-Bold': require('./assets/fonts/Almarai-Bold.ttf'),

    // --- OLD FALLBACK FONTS ---
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <SavedItemsProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SavedItemsProvider>
      </AppProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}