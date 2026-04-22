import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FeaturedLookScreen from '../screens/FeaturedLookScreen';
import CategoryListScreen from '../screens/CategoryListScreen';
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import ChooseSeasonScreen from '../screens/ChooseSeasonScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ChooseSeason: undefined;
  Subscription: undefined;
  Profile: undefined;
  FeaturedLook: undefined;
  CategoryList: { categoryId: string };
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // 1. Check for an existing session when the app boots up
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
    });

    // 2. Listen for any login/logout events anywhere in the app
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup the listener when the app closes
    return () => subscription.unsubscribe();
  }, []);

  // 3. Show your custom Splash Screen while checking the database
  if (isInitializing) {
    return <SplashScreen />;
  }

  // 4. Conditionally render screens based ONLY on authentication status
  return (
   <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session && session.user ? (
        // 🟢 USER IS LOGGED IN: Show the main app flow
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="ChooseSeason" component={ChooseSeasonScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="FeaturedLook" component={FeaturedLookScreen} />
          <Stack.Screen name="CategoryList" component={CategoryListScreen} />
        </>
      ) : (
        // 🔴 NO USER: Show the authentication flow
        <>
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}