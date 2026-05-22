import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, 
  ActivityIndicator, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setIsLoading(false);

    if (error) {
      Alert.alert('Update Failed', error.message);
    } else {
      Alert.alert('Success', 'Your password has been updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Password</Text>
          </View>

          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Current Password<Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter your current password"
                placeholderTextColor="#999"
                secureTextEntry={!showCurrent}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                {showCurrent ? <Eye size={20} color="#999" /> : <EyeOff size={20} color="#999" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              New Password<Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter your new password"
                placeholderTextColor="#999"
                secureTextEntry={!showNew}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                {showNew ? <Eye size={20} color="#999" /> : <EyeOff size={20} color="#999" />}
              </TouchableOpacity>
            </View>
            
            {/* Strength Indicator Row */}
            <View style={styles.strengthRow}>
              <Text style={styles.helperText}>Must be atleast 8 characters</Text>
              <View style={styles.strengthIndicator}>
                <Text style={styles.strengthLabel}>STRENGTH</Text>
                <View style={[styles.strengthBar, { backgroundColor: newPassword.length > 0 ? '#A67B5B' : '#E8E5E0' }]} />
                <View style={[styles.strengthBar, { backgroundColor: newPassword.length >= 8 ? '#A67B5B' : '#E8E5E0' }]} />
                <View style={[styles.strengthBar, { backgroundColor: newPassword.length > 10 ? '#A67B5B' : '#E8E5E0' }]} />
              </View>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Confirm New Password<Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your new password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                {showConfirm ? <Eye size={20} color="#999" /> : <EyeOff size={20} color="#999" />}
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.saveBtn} 
            activeOpacity={0.8}
            onPress={handleUpdatePassword}
            disabled={isLoading}
          >
            <Text style={styles.saveBtnText}>Update Password</Text>
            {isLoading && (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F6F2' },
  scrollContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  backBtn: { padding: 8, borderWidth: 1, borderColor: '#A6A6A6', borderRadius: 12, backgroundColor: '#FFFFFF', marginRight: 16 },
  headerTitle: { fontFamily: 'Inter_400Regular', fontSize: 20, color: '#1A1A1A' },
  
  inputGroup: { marginBottom: 24 },
  label: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#333333', marginBottom: 8 },
  asterisk: { color: '#D32F2F' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E5E0', borderRadius: 8, height: 52 },
  input: { flex: 1, paddingHorizontal: 16, fontFamily: 'Inter_400Regular', fontSize: 15, color: '#1A1A1A' },
  eyeBtn: { padding: 16 },
  
  strengthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  helperText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#999', fontStyle: 'italic' },
  strengthIndicator: { flexDirection: 'row', alignItems: 'center' },
  strengthLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#999', marginRight: 6, letterSpacing: 0.5 },
  strengthBar: { width: 14, height: 4, borderRadius: 2, backgroundColor: '#E8E5E0', marginLeft: 4 },
  
  bottomContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 20 : 30, backgroundColor: '#F8F6F2' },
  saveBtn: { backgroundColor: '#A67B5B', width: '100%', height: 54, borderRadius: 27, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF' },
});