import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomCard from '../components/BottomCard';
import { colors, spacing } from '../theme/colors';

type AuthState = 'welcome_options' | 'sign_in' | 'sign_up' | 'forgot_password';

export default function MainScreen() {
  const [authState, setAuthState] = useState<AuthState>('welcome_options');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const renderWelcomeOptions = () => (
    <BottomCard style={styles.cardSpacing}>
      <Text style={styles.cardTitle}>Welcome Back</Text>
      <Text style={styles.cardSubtitle}>Discover the colors, styles, and combinations that truly suits you.</Text>

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#000' }]}>
        <Ionicons name="logo-apple" size={20} color="#FFF" style={styles.socialIcon} />
        <Text style={[styles.socialButtonText, { color: '#FFF' }]}>Continue with Apple</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#FFF' }]}>
        <Ionicons name="logo-google" size={20} color="#000" style={styles.socialIcon} />
        <Text style={[styles.socialButtonText, { color: '#000' }]}>Continue with Google</Text>
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
        <Ionicons name="mail-outline" size={20} color={colors.primary} style={styles.socialIcon} />
        <Text style={styles.outlineButtonText}>Continue with Email</Text>
      </TouchableOpacity>

      <View style={styles.footerTextContainer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => setAuthState('sign_in')}>
           <Text style={styles.linkText}>Sign in</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.termsText}>
        By continuing, you agree to our <Text style={{ textDecorationLine: 'underline' }}>Terms</Text> & <Text style={{ textDecorationLine: 'underline' }}>Privacy Policy</Text>
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
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
             <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => setAuthState('forgot_password')} style={{ alignItems: 'flex-end', marginBottom: spacing.l }}>
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Sign In</Text>
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
            placeholder="Enter your email address" // as per screenshot typo
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
            secureTextEntry={!showPassword}
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
            secureTextEntry={!showConfirmPassword}
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
        <Text style={styles.primaryButtonText}>Create Account</Text>
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
        source={{ uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Your SZN</Text>
            </View>
            <View style={styles.content}>
               {authState === 'welcome_options' && renderWelcomeOptions()}
               {authState === 'sign_in' && renderSignIn()}
               {authState === 'sign_up' && renderSignUp()}
               {authState === 'forgot_password' && renderForgotPassword()}
            </View>
          </ScrollView>
        </SafeAreaView>
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
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: 80,
    alignItems: 'center',
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
    paddingHorizontal: spacing.l,
    paddingTop: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.l,
  },
  cardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  cardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.m,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25,
    marginBottom: spacing.m,
  },
  socialButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    marginLeft: 10,
  },
  socialIcon: {
    position: 'absolute',
    left: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.m,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textLight,
    paddingHorizontal: 10,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.l,
  },
  outlineButtonText: {
    fontFamily: 'Inter_600SemiBold',
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
    fontSize: 14,
    color: colors.textDark,
  },
  linkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.textDark,
    textDecorationLine: 'underline',
  },
  termsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.s,
  },
  inputContainer: {
    marginBottom: spacing.m,
  },
  inputLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 6,
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
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.textDark,
  },
  forgotPasswordText: {
    fontFamily: 'Inter_500Medium',
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
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
