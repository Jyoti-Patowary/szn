import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView, 
  ActivityIndicator, 
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, User, Check, X } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import CustomModal from '../components/CustomModal'; 
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const navigation = useNavigation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // --- NEW: Error States for Validation ---
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        
       const { data: profile } = await supabase
          .from('app_users')
          .select('display_name, avatar_url, phone_number') 
          .eq('id', user.id)
          .single();

        if (profile) {
          setFullName(profile.display_name || '');
          setPhoneNumber(profile.phone_number || '');
          
          if (profile.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          } else if (user.user_metadata?.avatar_url) {
            setAvatarUrl(user.user_metadata.avatar_url);
          }
        }
      }
    };
    fetchUserData();
  }, []);

  const handleUpdateAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to upload a photo!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], 
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (result.canceled || !result.assets[0].base64) return;

      setIsUploadingPhoto(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const imagePath = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(imagePath, decode(result.assets[0].base64), {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(imagePath);

      const { error: updateError } = await supabase
        .from('app_users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setNameError('');
    setPhoneError('');
    let isValid = true;

    if (!fullName.trim()) {
      setNameError('Full name cannot be empty.');
      isValid = false;
    }

    if (!phoneNumber.trim()) {
      setPhoneError('Phone number cannot be empty.');
      isValid = false;
    } else {
      const phoneDigits = phoneNumber.replace(/\D/g, '');

      if (phoneDigits.length !== 10) {
        setPhoneError('Please enter a valid 10-digit phone number.');
        isValid = false;
      }
    }
    if (!isValid) return;
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('app_users')
        .update({ 
          display_name: fullName.trim(),
          phone_number: phoneNumber.trim(),
        })
        .eq('id', user.id);

      if (!error) {
        setTimeout(() => {
          setIsLoading(false);
          setSuccessModalVisible(true);
        }, 500);
        return;
      } else {
        console.error("Save error:", error);
      }
    }
    
    setIsLoading(false);
  };

  const handleModalClose = () => {
    setSuccessModalVisible(false);
    navigation.goBack(); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>

          <View style={styles.avatarContainer}>
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={handleUpdateAvatar} 
              disabled={isUploadingPhoto}
              style={{ alignItems: 'center' }}
            >
              <View style={styles.avatarCircle}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <User size={44} color="#7A8794" fill="#7A8794" />
                )}
              </View>
              
              <Text style={styles.uploadPhotoText}>
                {isUploadingPhoto 
                  ? 'Uploading...' 
                  : avatarUrl 
                    ? 'Change photo' 
                    : 'Upload photo'
                }
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Basic Information</Text>

          {/* NAME INPUT */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full Name<Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (nameError) setNameError('');
              }}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          {/* EMAIL INPUT */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: '#999' }]}>
              Email Address<Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
              placeholder="Email address"
              placeholderTextColor="#B0B0B0"
            />
          </View>

         {/* PHONE NUMBER INPUT */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Phone Number<Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, phoneError ? styles.inputError : null]}
              value={phoneNumber}
              onChangeText={(text) => {
                const onlyNumbers = text.replace(/\D/g, ''); 
                
                setPhoneNumber(onlyNumbers);
                if (phoneError) setPhoneError(''); 
              }}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={10}
            />
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.saveBtn} 
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={isLoading || isUploadingPhoto}
          >
            <Text style={styles.saveBtnText}>Save Changes</Text>
            {isLoading && (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelBtn} 
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            disabled={isLoading || isUploadingPhoto}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      <CustomModal
        visible={isSuccessModalVisible}
        onClose={handleModalClose}
        backgroundColor="#FFFFFF"
      >
        <TouchableOpacity 
          style={styles.modalCloseBtn} 
          onPress={handleModalClose}
        >
          <X size={20} color="#666" />
        </TouchableOpacity>

        <View style={styles.successIconContainer}>
          <View style={styles.successIconInner}>
            <Check size={24} color="#4F8F74" strokeWidth={3} />
          </View>
        </View>

        <Text style={styles.modalTitle}>Profile Updated</Text>
        <Text style={styles.modalBody}>
          Your changes have been saved successfully.
        </Text>
      </CustomModal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F6F2' },
  scrollContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  backBtn: { padding: 8, borderWidth: 1, borderColor: '#E8E5E0', borderRadius: 12, backgroundColor: '#FFFFFF', marginRight: 16 },
  headerTitle: { fontFamily: 'Inter_400Regular', fontSize: 20, color: '#1A1A1A' },
  
  avatarContainer: { alignItems: 'center', marginBottom: 40 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#A67B5B', marginBottom: 12 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 45 },
  uploadPhotoText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#A67B5B' },

  sectionTitle: { fontFamily: 'Inter_500Medium', fontSize: 15, color: '#333333', marginBottom: 16 },
  inputGroup: { marginBottom: 20 },
  label: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#333333', marginBottom: 8 },
  asterisk: { color: '#D32F2F' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E5E0', borderRadius: 8, paddingHorizontal: 16, height: 52, fontFamily: 'Inter_400Regular', fontSize: 15, color: '#1A1A1A' },
  disabledInput: { backgroundColor: '#F8F6F2', color: '#999999' },
  
  inputError: { borderColor: '#D32F2F', borderWidth: 1.5 },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#D32F2F', marginTop: 6, marginLeft: 2 },
  
  bottomContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 20 : 30, backgroundColor: '#F8F6F2' },
  saveBtn: { backgroundColor: '#A67B5B', width: '100%', height: 54, borderRadius: 27, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  saveBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#FFFFFF' },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#A67B5B' },

  modalCloseBtn: { position: 'absolute', top: 16, right: 16, padding: 8, zIndex: 10 },
  successIconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EEF6F2', justifyContent: 'center', alignItems: 'center', marginBottom: 20, marginTop: -8 },
  successIconInner: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#4F8F74', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 20, color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  modalBody: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#666666', textAlign: 'center', marginBottom: 10, lineHeight: 22, paddingHorizontal: 16 },
});