// import React, { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabase';
// import { Session } from '@supabase/supabase-js';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import BottomTabNavigator from './BottomTabNavigator';
// import SubscriptionScreen from '../screens/SubscriptionScreen';
// import ProfileScreen from '../screens/ProfileScreen';
// import FeaturedLookScreen from '../screens/FeaturedLookScreen';
// import CategoryListScreen from '../screens/CategoryListScreen';
// import SplashScreen from '../screens/SplashScreen';
// import AuthScreen from '../screens/AuthScreen';
// import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
// import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
// import ChooseSeasonScreen from '../screens/ChooseSeasonScreen';

// export type RootStackParamList = {
//   Auth: undefined;
//   Main: undefined;
//   ChooseSeason: undefined;
//   Subscription: undefined;
//   Profile: undefined;
//   FeaturedLook: undefined;
//   CategoryList: { categoryId: string };
//   TermsOfService: undefined;
//   PrivacyPolicy: undefined;
// };

// const Stack = createNativeStackNavigator<RootStackParamList>();

// export default function RootNavigator() {
//   const [session, setSession] = useState<Session | null>(null);
//   const [isInitializing, setIsInitializing] = useState(true);

//   useEffect(() => {
//     // 1. Check for an existing session when the app boots up
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//       setIsInitializing(false);
//     });

//     // 2. Listen for any login/logout events anywhere in the app
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//     });

//     // Cleanup the listener when the app closes
//     return () => subscription.unsubscribe();
//   }, []);

//   // 3. Show your custom Splash Screen while checking the database
//   if (isInitializing) {
//     return <SplashScreen />;
//   }

//   // 4. Conditionally render screens based ONLY on authentication status
//   return (
//    <Stack.Navigator screenOptions={{ headerShown: false }}>
//       {session && session.user ? (
//         // 🟢 USER IS LOGGED IN: Show the main app flow
//         <>
//           <Stack.Screen name="Main" component={BottomTabNavigator} />
//           <Stack.Screen name="ChooseSeason" component={ChooseSeasonScreen} />
//           <Stack.Screen name="Subscription" component={SubscriptionScreen} />
//           <Stack.Screen name="Profile" component={ProfileScreen} />
//           <Stack.Screen name="FeaturedLook" component={FeaturedLookScreen} />
//           <Stack.Screen name="CategoryList" component={CategoryListScreen} />
//         </>
//       ) : (
//         // 🔴 NO USER: Show the authentication flow
//         <>
//           <Stack.Screen name="Auth" component={AuthScreen} />
//           <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
//           <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
//         </>
//       )}
//     </Stack.Navigator>
//   );
// }


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
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import LookDetailScreen from '../screens/LookDetailScreen';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  ChooseSeason: { fromProfile?: boolean } | undefined;
  Subscription: undefined;
  Profile: undefined;
  FeaturedLook: undefined;
  CategoryList: { categoryId: string };
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  HelpSupport: undefined;
  ProductList: { type: string; title: string; season?: string };
  ProductDetail: { product: any };
  LookDetail: { lookId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const syncUserProfile = async (currentSession: Session) => {
      if (!currentSession?.user) return;

      const user = currentSession.user;
  
      const fullName = user.user_metadata?.full_name;

      if (!fullName || fullName.trim() === '') {
        console.warn('User sync skipped: Full name is required by the backend.');
        return; 
      }

     const { error } = await supabase
        .from('app_users')
        .upsert({
          id: user.id,
          email: user.email,
          display_name: fullName,
          role: 'client',
          password_hash: 'NO_PASSWORD_OAUTH_USER' 
        }, { 
          onConflict: 'id', 
          ignoreDuplicates: true 
        });

      if (error) {
        console.error('Failed to sync user to app_users table:', error.message);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        syncUserProfile(session); 
      }
      // setIsInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        syncUserProfile(session); 
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // if (isInitializing) {
  //   return <SplashScreen />;
  // }

  return (
   <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
    <Stack.Screen name="Splash" component={SplashScreen} />
      {session && session.user ? (
        // USER IS LOGGED IN: Show the main app flow
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="ChooseSeason" component={ChooseSeasonScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="FeaturedLook" component={FeaturedLookScreen} />
          <Stack.Screen name="CategoryList" component={CategoryListScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="ProductList" component={ProductListScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen}/>
          <Stack.Screen name="LookDetail" component={LookDetailScreen} />

          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </>
      ) : (
        // NO USER: Show the authentication flow
        <>
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}