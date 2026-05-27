import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { colors, typography } from '../theme/colors';
import { Mail, Eye, EyeOff } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons'; 
import * as AppleAuthentication from 'expo-apple-authentication';
import BottomCard from '../components/BottomCard';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

type AuthState = 'welcome_options' | 'sign_in' | 'sign_up' | 'forgot_password';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [authState, setAuthState] = useState<AuthState>('welcome_options');

  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const isValidEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const clearErrors = () => {
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
  };

  useEffect(() => {
  GoogleSignin.configure({
  webClientId: '458874391941-477qg71gavhhd0ad2mih34a96dsq15ko.apps.googleusercontent.com',
  });
}, []);

  async function signInWithGoogleNative() {
  setLoading(true);
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    const idToken = userInfo.data?.idToken || (userInfo as any).idToken;

    if (idToken) {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;
    } else {
      throw new Error('No ID token found.');
    }
  } catch (error: any) {
    console.error(error);
    if (error.code !== 'SIGN_IN_CANCELLED') {
      Alert.alert('Google Sign In Failed', error.message);
    }
  } finally {
    setLoading(false);
  }
}

  async function signInWithAppleNative() {
  setLoading(true);
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (credential.identityToken) {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) throw error;
    } else {
      throw new Error('No identity token found from Apple.');
    }
  } catch (error: any) {
    if (error.code === 'ERR_CANCELED') {
      return;
    }
    Alert.alert('Apple Sign In Failed', error.message);
  } finally {
    setLoading(false);
  }
}

  async function signInWithEmail() {
    clearErrors();
    let isValid = true;

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }
    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    if (!isValid) return; 

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } 
    setLoading(false);
  }

 async function signUpWithEmail() {

    clearErrors();
    let isValid = true;

    if (!fullName.trim()) {
      setNameError('Full name is required.');
      isValid = false;
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      isValid = false;
    }
    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      isValid = false;
    }

    if (!isValid) return; 

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(), 
          }
        }
      });

      if (error) {
        Alert.alert('Sign Up Failed', error.message);
        
      } else if (!data.session) {
        Alert.alert(
          'Success!', 
          'Please check your email inbox to verify your account.'
        );
        setAuthState('sign_in'); 
      } 
    } catch (err: any) {
      Alert.alert('An unexpected error occurred', err.message);
    } finally {
      setLoading(false); 
    }
  }

//  async function signInWithSocial(provider: 'google' | 'apple') {
//     setLoading(true);
//     try {
//       const redirectUrl = Linking.createURL('');
      
//       const { data, error } = await supabase.auth.signInWithOAuth({
//         provider: provider,
//         options: {
//           redirectTo: redirectUrl,
//           skipBrowserRedirect: true, 
//           queryParams: provider === 'google' ? {
//             prompt: 'select_account', 
//           } : undefined,
//         },
//       });

//       if (error) throw error;

//       if (data?.url) {
//         const browserResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        
//         if (browserResult.type === 'success') {
//           const url = browserResult.url;
          
//           const params = url.split('#')[1]?.split('&').reduce((acc, current) => {
//             const [key, value] = current.split('=');
//             acc[key] = decodeURIComponent(value);
//             return acc;
//           }, {} as Record<string, string>);

//           if (!params || !params.access_token || !params.refresh_token) {
//              throw new Error('Authentication tokens not found.');
//           }

//           const { error: sessionError } = await supabase.auth.setSession({
//             access_token: params.access_token,
//             refresh_token: params.refresh_token,
//           });

//           if (sessionError) throw sessionError;
//         }
//       }
//     } catch (error: any) {
//       Alert.alert(`${provider === 'google' ? 'Google' : 'Apple'} Sign In Failed`, error.message);
//     } finally {
//       setLoading(false);
//     }
//   }

  async function handleResetPassword() {
    clearErrors();
    
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = Linking.createURL('/reset-password');

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      Alert.alert(
        'Check your inbox', 
        'We have sent you an email with a link to reset your password.'
      );
      
      setAuthState('sign_in'); 
      
    } catch (error: any) {
      Alert.alert('Reset Failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  const renderWelcomeOptions = () => (
    <BottomCard style={styles.cardSpacing}>
      <Text style={styles.cardTitle}>Welcome Back</Text>
      <Text style={styles.cardSubtitle}>Discover the colors, styles, and combinations that truly suits you.</Text>

      {Platform.OS === 'ios' && (
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.black }]} onPress={signInWithAppleNative}
          disabled={loading}> 
          <Ionicons name="logo-apple" size={23} color={colors.white} />
          <Text style={[styles.socialButtonText, { color: colors.white }]}>Continue with Apple</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.white }]} onPress={signInWithGoogleNative}
        disabled={loading}> 
      {/* <TouchableOpacity style={[styles.socialButton, { backgroundColor: colors.white }]} onPress={() => signInWithSocial('google')}
        disabled={loading}> */}
        <Image 
          source={require('../../assets/Google-Logo.png')} 
          style={styles.socialImage} 
        />
        <Text style={[styles.socialButtonText, { color: colors.neutral900 }]}>Continue with Google</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => setAuthState('sign_in')}
      >
        <Mail color={colors.autumn} size={20} strokeWidth={1.5} />
        <Text style={styles.outlineButtonText}>Continue with Email</Text>
      </TouchableOpacity>

      <View style={styles.footerTextContainer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => setAuthState('sign_in')}>
           <Text style={styles.linkText}>Sign in</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.termsText}>
        By continuing, you agree to our <Text style={{ textDecorationLine: 'underline' }}
        onPress={() => navigation.navigate('TermsOfService')}>Terms</Text> & <Text style={{ textDecorationLine: 'underline' }}
        onPress={() => navigation.navigate('PrivacyPolicy')}>Privacy Policy</Text>
      </Text>
    </BottomCard>
  );

  const renderSignIn = () => (
    <BottomCard style={styles.cardSpacing}>
      <Text style={styles.cardTitle}>Welcome Back</Text>
      <Text style={styles.cardSubtitle}>Sign in to continue your color analysis journey.</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email address<Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor={colors.neutral500}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Mail color={colors.neutral500} size={20} />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password<Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.neutral500}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={Boolean(!showPassword)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
             {showPassword ? (
               <Eye color={colors.neutral500} size={20} />
             ) : (
               <EyeOff color={colors.neutral500} size={20} />
             )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => setAuthState('forgot_password')} style={{ alignItems: 'flex-end', marginBottom: 24 }}>
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.primaryButton} onPress={signInWithEmail} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <View style={[styles.footerTextContainer, { marginTop: 16 }]}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => setAuthState('sign_up')}>
           <Text style={styles.linkText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </BottomCard>
  );

  const renderSignUp = () => (
    <BottomCard style={styles.cardSpacing}>
      <Text style={styles.cardTitle}>Create your Account</Text>
      <Text style={styles.cardSubtitle}>Start discovering the colors and styles that suits you best.</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name<Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={colors.neutral500}
            value={fullName}
            onChangeText={(text) => { setFullName(text); setNameError(''); }}
          />
        </View>
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email address<Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor={colors.neutral500}
            value={email}
            onChangeText={(text) => { setEmail(text); setEmailError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Mail color={colors.neutral500} size={20} />
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password<Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.neutral500}
            value={password}
            onChangeText={(text) => { setPassword(text); setPasswordError(''); }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
             {showPassword ? (
               <Eye color={colors.neutral500} size={20} />
             ) : (
               <EyeOff color={colors.neutral500} size={20} />
             )}
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirm Password<Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            placeholderTextColor={colors.neutral500}
            value={confirmPassword}
            onChangeText={(text) => { setConfirmPassword(text); setConfirmError(''); }}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
             {showConfirmPassword ? (
               <Eye color={colors.neutral500} size={20} />
             ) : (
               <EyeOff color={colors.neutral500} size={20} />
             )}
          </TouchableOpacity>
        </View>
        {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={signUpWithEmail} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
      </TouchableOpacity>

      <View style={[styles.footerTextContainer, { marginTop: 16 }]}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => setAuthState('sign_in')}>
           <Text style={styles.linkText}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </BottomCard>
  );

  const renderForgotPassword = () => (
    <BottomCard style={styles.cardSpacing}>
      <Text style={styles.cardTitle}>Forgot Password?</Text>
      <Text style={styles.cardSubtitle}>Enter your email address and we'll send you instructions to reset your password.</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email address<Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor={colors.neutral500}
            value={email}
            onChangeText={(text) => { setEmail(text); setEmailError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Mail color={colors.neutral500} size={20} />
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>

      <TouchableOpacity style={[styles.primaryButton, { marginTop: 24 }]} onPress={handleResetPassword} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'Sending...' : 'Submit'}</Text>
      </TouchableOpacity>

      <View style={[styles.footerTextContainer, { marginTop: 24 }]}>
        <Text style={styles.footerText}>Back to </Text>
        <TouchableOpacity onPress={() => { clearErrors(); setAuthState('sign_in'); }}>
           <Text style={styles.linkText}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </BottomCard>
  );

const content = (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} 
      showsVerticalScrollIndicator={false} 
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.header, { position: 'absolute', top: Math.max(insets.top, 80), width: '100%' }]}>
        <Image 
          source={require('../../assets/brand-logo.png')}
          style={styles.logo}
        />
      </View>

      <View style={{ paddingBottom: Math.max(insets.bottom, 24), paddingTop: 180 }}>
         {authState === 'welcome_options' && renderWelcomeOptions()}
         {authState === 'sign_in' && renderSignIn()}
         {authState === 'sign_up' && renderSignUp()}
         {authState === 'forgot_password' && renderForgotPassword()}
      </View>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1}}>
      
      <Image
        source={require('../../assets/Main.png')}
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', resizeMode: 'cover' }]}
      />

      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={{ flex: 1 }}>
          {content}
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 90,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardSpacing: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  cardTitle: {
    ...typography.h3,
    textAlign: 'center',
    color: colors.neutral900, 
    marginBottom: 8,
  },
  cardSubtitle: {
    ...typography.bodyDefault,
    textAlign: 'center',
    color: colors.neutral700,
    marginBottom: 32,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 54,
    borderRadius: 27,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.17,
    shadowRadius: 3,
  },
  socialButtonText: {
    ...typography.buttonText,
  },
  socialImage: {
    width: 23,
    height: 23,
    resizeMode: 'contain', 
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral300,
  },
  dividerText: {
    ...typography.bodyDefault,
    color: colors.neutral700,
    paddingHorizontal: 10,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 54,
    borderRadius: 27, 
    borderWidth: 1,
    borderColor: colors.autumn,
    marginBottom: 24,
  },
  outlineButtonText: {
    ...typography.buttonText,
    color: colors.autumn,
  },
  footerTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    ...typography.bodyDefault,
    color: colors.neutral900,
  },
  linkText: {
    ...typography.bodyDefault,
    color: colors.neutral900,
    textDecorationLine: 'underline',
  },
  termsText: {
    ...typography.caption,
    color: colors.neutral700,
    textAlign: 'center',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    ...typography.inputLabel,
    color: colors.neutral900,
    marginBottom: 10,
  },
  asterisk: {
    color: colors.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  input: {
    flex: 1,
    ...typography.inputText,
    color: colors.neutral900,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.autumn,
    fontFamily: 'Almarai-Bold', 
  },
  primaryButton: {
    backgroundColor: colors.autumn,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...typography.buttonText,
    color: colors.white,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
});
