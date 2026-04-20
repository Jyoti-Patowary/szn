import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomCard from '../components/BottomCard';
import { colors, spacing } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

type AuthState = 'welcome_options' | 'sign_in' | 'sign_up' | 'forgot_password';

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

  // --- SUPABASE AUTH FUNCTIONS ---
  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else {
      navigation.replace('Main');
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName, 
        }
      }
    });

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else if (data.session) {
      navigation.replace('Main');
    } else {
      Alert.alert('Success!', 'Please check your email to verify your account.');
      setAuthState('sign_in');
    }
    setLoading(false);
  }

  const renderWelcomeOptions = () => (
    <BottomCard style={styles.cardSpacing}>
      <Text style={styles.cardTitle}>Welcome Back</Text>
      <Text style={styles.cardSubtitle}>Discover the colors, styles, and combinations that truly suits you.</Text>

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#000' }]}>
        <Ionicons name="logo-apple" size={23} color="#FFF" />
        <Text style={[styles.socialButtonText, { color: '#FFF' }]}>Continue with Apple</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#FFF' }]}>
        <Image 
          source={require('../../assets/Google-Logo.png')} 
          style={styles.socialImage} 
        />
        <Text style={[styles.socialButtonText, { color: '#00000090' }]}>Continue with Google</Text>
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
        <Ionicons name="mail-outline" size={24} color={colors.primary} />
        <Text style={styles.outlineButtonText}>Continue with Email</Text>
      </TouchableOpacity>

      <View style={styles.footerTextContainer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => setAuthState('sign_in')}>
           <Text style={styles.linkText} onPress={() => navigation.navigate('Main')}>Sign in</Text>
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
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Ionicons name="mail-outline" size={20} color={colors.textLight} />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password<Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={Boolean(!showPassword)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
             <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => setAuthState('forgot_password')} style={{ alignItems: 'flex-end', marginBottom: spacing.l }}>
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.primaryButton} onPress={signInWithEmail} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <View style={[styles.footerTextContainer, { marginTop: spacing.m }]}>
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
            placeholder="Enter your email address"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Email address<Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Ionicons name="mail-outline" size={20} color={colors.textLight} />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Password<Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={Boolean(!showPassword)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
             <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirm Password<Text style={styles.asterisk}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={Boolean(!showConfirmPassword)}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
             <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => setAuthState('forgot_password')} style={{ alignItems: 'flex-end', marginBottom: spacing.l }}>
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText} onPress={signUpWithEmail} disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
      </TouchableOpacity>

      <View style={[styles.footerTextContainer, { marginTop: spacing.m }]}>
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
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Ionicons name="mail-outline" size={20} color={colors.textLight} />
        </View>
      </View>

      <TouchableOpacity style={[styles.primaryButton, { marginTop: spacing.l }]}>
        <Text style={styles.primaryButtonText}>Submit</Text>
      </TouchableOpacity>

      <View style={[styles.footerTextContainer, { marginTop: spacing.l }]}>
        <Text style={styles.footerText}>Back to </Text>
        <TouchableOpacity onPress={() => setAuthState('sign_in')}>
           <Text style={styles.linkText}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </BottomCard>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground
        source={require('../../assets/Main.png')}
        style={styles.backgroundImage}
      >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
           <View style={[styles.header, { paddingTop: Math.max(insets.top, 80) }]}>
              <Image 
                source={require('../../assets/brand-logo.png')}
                style={styles.logo}
              />

            </View>
            <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) } ]}>
               {authState === 'welcome_options' && renderWelcomeOptions()}
               {authState === 'sign_in' && renderSignIn()}
               {authState === 'sign_up' && renderSignUp()}
               {authState === 'forgot_password' && renderForgotPassword()}
            </View>
          </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
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
  title: {
    fontFamily: 'PlayfairDisplay_700Bold_Italic',
    fontSize: 56,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
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
    fontFamily: 'Inter_400Regular',
    fontSize: 24,
    lineHeight: 28.8,
    textAlign: 'center',
    color: '#2E2E2E', 
    marginBottom: 8,
  },
  cardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
    color: colors.textLight,
    marginBottom: 32,
    // paddingHorizontal: 5,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 54,
    borderRadius: 27,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.17,
    shadowRadius: 3,
    // elevation: 3,
  },
  socialButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    // marginLeft: 10,
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
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#2E2E2E',
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
    borderColor: '#A67B5B',
    marginBottom: 24,
  },
  outlineButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: colors.primary,
    marginLeft: 10,
  },
  footerTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#2E2E2E',
  },
  linkText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#2E2E2E',
    textDecorationLine: 'underline',
  },
  termsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#2E2E2E',
    textAlign: 'center',
    marginTop: spacing.s,
  },
  inputContainer: {
    marginBottom: spacing.m,
  },
  inputLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 10,
  },
  asterisk: {
    color: 'red',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.textDark,
  },
  forgotPasswordText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.primary,
  },
  primaryButton: {
    backgroundColor: '#A07E66',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
