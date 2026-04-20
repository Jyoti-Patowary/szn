import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FeaturedLookScreen from '../screens/FeaturedLookScreen';
import CategoryListScreen from '../screens/CategoryListScreen';
import { useAppContext } from '../context/AppContext';
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  Subscription: undefined;
  Profile: undefined;
  FeaturedLook: undefined;
  CategoryList: { categoryId: string };
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isLocked } = useAppContext();

  return (
   <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      {isLocked ? (
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="FeaturedLook" component={FeaturedLookScreen} />
          <Stack.Screen name="CategoryList" component={CategoryListScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
