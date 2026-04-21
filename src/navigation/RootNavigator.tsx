import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAppContext } from '../context/AppContext';

export type RootStackParamList = {
  Main: undefined;
  Subscription: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isLocked } = useAppContext();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLocked ? (
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
