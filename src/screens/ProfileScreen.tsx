
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { colors, typography } from '../theme/colors';
import CustomModal from '../components/CustomModal';
import { 
  ArrowLeft, Heart, User, Lock, Link2 as LinkIcon, Palette, 
  HelpCircle, FileText, ShieldCheck, LogOut, 
  ChevronRight, Pencil, Calendar, X 
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const { isLocked } = useAppContext();
  
  const [userName, setUserName] = useState(''); 
  const [userEmail, setUserEmail] = useState('');
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  // const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email || '');
        if (user.app_metadata?.providers) {
          setLinkedProviders(user.app_metadata.providers);
        }

        const { data: profile, error } = await supabase
          .from('app_users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile && !error) {
          setUserName(profile.display_name);
          
          if (profile.avatar_url) {
            setAvatarUrl(profile.avatar_url);
          } else if (user.user_metadata?.avatar_url) {
            setAvatarUrl(user.user_metadata.avatar_url);
          }
        } else {
          setUserName(user.user_metadata?.full_name || 'User');
          if (user.user_metadata?.avatar_url) {
            setAvatarUrl(user.user_metadata.avatar_url);
          }
        }
      }
      setLoading(false);
    };

    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused]);


  // const handleUpdateAvatar = async () => {
  //   try {
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ['images'], 
  //       allowsEditing: true,
  //       aspect: [1, 1],
  //       quality: 0.5,
  //       base64: true,
  //     });

  //     if (result.canceled || !result.assets[0].base64) return;

  //     setIsUploading(true);
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) throw new Error('No user logged in');

  //     const imagePath = `${user.id}/${Date.now()}.jpg`;
  //     const { data: uploadData, error: uploadError } = await supabase.storage
  //       .from('avatars')
  //       .upload(imagePath, decode(result.assets[0].base64), {
  //         contentType: 'image/jpeg',
  //       });

  //     if (uploadError) throw uploadError;

  //     const { data: { publicUrl } } = supabase.storage
  //       .from('avatars')
  //       .getPublicUrl(imagePath);

  //     const { error: updateError } = await supabase
  //       .from('app_users')
  //       .update({ avatar_url: publicUrl })
  //       .eq('id', user.id);

  //     if (updateError) throw updateError;

  //     setAvatarUrl(publicUrl);

  //   } catch (error) {
  //     console.error('Error uploading image:', error);
  //     alert('Failed to upload image. Please try again.');
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     const { data: { user } } = await supabase.auth.getUser();
      
  //     if (user) {
  //       setUserEmail(user.email || '');
  //       if (user.app_metadata?.providers) {
  //         setLinkedProviders(user.app_metadata.providers);
  //       }
  //       const { data: profile, error } = await supabase
  //         .from('app_users')
  //         .select('*')
  //         .eq('id', user.id)
  //         .single();

  //       if (profile && !error) {
  //         setUserName(profile.display_name);
  //       } else {
  //         setUserName(user.user_metadata?.full_name || 'User');
  //       }
  //     }
  //     setLoading(false);
  //   };

  //   fetchUserData();
  // }, []);

  const handleConfirmLogout = async () => {
    setLogoutModalVisible(false);
    await supabase.auth.signOut();
  };

  const handleConfirmDelete = () => {
    setDeleteModalVisible(false);
    console.log("Account deletion triggered");
  };

  const SettingsRow = ({ icon: Icon, title, value, isDestructive, rightElement, onPress }: any) => (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingsRowLeft}>
        <Icon size={20} color={isDestructive ? colors.error : colors.neutral700} strokeWidth={isDestructive ? 2 : 1.5} />
        <Text style={[styles.settingsRowTitle, isDestructive && { color: colors.error }]}>
          {title}
        </Text>
      </View>
      <View style={styles.settingsRowRight}>
        {value && <Text style={styles.settingsRowValue}>{value}</Text>}
        {rightElement ? rightElement : <ChevronRight size={18} color={colors.neutral300} />}
      </View>
    </TouchableOpacity>
  );

  const renderProviderIcons = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {linkedProviders.map((provider) => {
          if (provider === 'google') {
            return (
              <Image 
                key={provider}
                source={require('../../assets/Google-Logo.png')} 
                style={{ width: 20, height: 20 }} 
                resizeMode="contain"
              />
            );
          }
          if (provider === 'apple') {
            return (
              <Ionicons key={provider} name="logo-apple" size={20} color={colors.neutral500} />
            );
          }
          if (provider === 'email') {
            return <FileText key={provider} size={20} color={colors.neutral500} />;
          }
          return null;
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Avatar Section */}
       <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.editAvatarBtn} 
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Pencil size={14} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{loading ? 'Loading...' : userName}</Text>
          <Text style={styles.userStatus}>{!isLocked ? 'Premium Member' : 'Free Member'}</Text>
        </View>

        {/* Subscription Card */}
        {!isLocked && (
          <View style={styles.subCard}>
            <View style={styles.subBadge}>
              <Text style={styles.subBadgeText}>ACTIVE</Text>
            </View>
            <Text style={styles.subTitle}>Autumn Plan 🍂</Text>
            <Text style={styles.subDetail}>Semi-Annual • $35.99 / 6 months</Text>
            <View style={styles.subDateRow}>
              <Calendar size={14} color={colors.autumn} strokeWidth={2} />
              <Text style={styles.subDateText}>Renews on: 12 Dec 2026</Text>
            </View>
            <TouchableOpacity style={styles.manageSubBtn} onPress={() => navigation.navigate('Subscription')}>
              <Text style={styles.manageSubBtnText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings Sections */}
        <Text style={styles.sectionTitle}>MANAGE PROFILE</Text>
        <View style={styles.cardGroup}>
          <SettingsRow icon={Heart} title="Edit Name" onPress={() => navigation.navigate('EditProfile')}/>
          <View style={styles.divider} />
          <SettingsRow icon={Lock} title="Change Password" onPress={() => navigation.navigate('ChangePassword')}/>
          <View style={styles.divider} />
          <SettingsRow 
            icon={LinkIcon} 
            title="Linked Accounts" 
            rightElement={renderProviderIcons()}
          />
        </View>

        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.cardGroup}>
          <SettingsRow icon={Palette} title="App Theme" value="Autumn 🍂" />
        </View>

        <Text style={styles.sectionTitle}>SUPPORT & LEGAL</Text>
        <View style={styles.cardGroup}>
          <SettingsRow icon={HelpCircle} title="Help & Support" onPress={() => navigation.navigate('HelpSupport')} />
          <View style={styles.divider} />
          <SettingsRow icon={FileText} title="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
          <View style={styles.divider} />
          <SettingsRow icon={ShieldCheck} title="Terms of Service" onPress={() => navigation.navigate('TermsOfService')} />
          <View style={styles.divider} />

          <SettingsRow 
            icon={LogOut} 
            title="Logout" 
            isDestructive 
            rightElement={<View/>} 
            onPress={() => setLogoutModalVisible(true)} 
          />
        </View>

        {/* DELETE ACCOUNT TRIGGERS MODAL */}
        <TouchableOpacity style={styles.deleteAccountBtn} onPress={() => setDeleteModalVisible(true)}>
          <Text style={styles.deleteAccountText}>DELETE MY ACCOUNT</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 1. LOGOUT MODAL */}
      <CustomModal
        visible={isLogoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        backgroundColor="#FFFFFF"
      >
        <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setLogoutModalVisible(false)}>
          <X size={20} color="#666" />
        </TouchableOpacity>

        <View style={styles.logoutIconContainer}>
          <LogOut size={28} color="#D32F2F" strokeWidth={1.5} style={{ marginLeft: 4 }} />
        </View>

        <Text style={styles.modalTitleCentered}>Log Out?</Text>
        <Text style={styles.modalBodyCentered}>
          Are you sure you want to logout of your account?
        </Text>

        <TouchableOpacity style={styles.primaryRedBtn} activeOpacity={0.8} onPress={handleConfirmLogout}>
          <Text style={styles.primaryRedBtnText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryCancelBtn} activeOpacity={0.7} onPress={() => setLogoutModalVisible(false)}>
          <Text style={styles.secondaryCancelBtnText}>CANCEL</Text>
        </TouchableOpacity>
      </CustomModal>

      {/* 2. DELETE ACCOUNT MODAL */}
      <CustomModal
        visible={isDeleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        backgroundColor="#FFFFFF"
      >
        <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setDeleteModalVisible(false)}>
          <X size={20} color="#666" />
        </TouchableOpacity>

        <View style={styles.leftAlignedContent}>
          <Text style={styles.modalTitleLeft}>Delete Account</Text>
          <Text style={styles.modalBodyLeft}>
            This action cannot be undone. Deleting your account will permanently remove all your data from our servers.
          </Text>

          {/* Bullet List */}
          <View style={styles.bulletList}>
            <View style={styles.bulletRow}>
              <X size={16} color="#6B6B6B" />
              <Text style={styles.bulletText}>All saved looks will be deleted</Text>
            </View>
            <View style={styles.bulletRow}>
              <X size={16} color="#6B6B6B" />
              <Text style={styles.bulletText}>Your style preferences will be lost</Text>
            </View>
            <View style={styles.bulletRow}>
              <X size={16} color="#6B6B6B" />
              <Text style={styles.bulletText}>Active subscriptions will be canceled</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryRedBtn} activeOpacity={0.8} onPress={handleConfirmDelete}>
          <Text style={styles.primaryRedBtnText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryCancelBtn} activeOpacity={0.7} onPress={() => setDeleteModalVisible(false)}>
          <Text style={styles.secondaryCancelBtnText}>CANCEL</Text>
        </TouchableOpacity>
      </CustomModal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'rgba(247, 243, 238, 1)' },
  scrollContent: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10 },
  
  /* Header */
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 32 
  },
  backBtn: { 
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(166, 166, 166, 1)',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginRight: 16
  },
  headerTitle: { 
    fontFamily: 'Almarai_400Regular',
    fontSize: 22,
    color: 'colors.neutral900',
  },
  /* Avatar */
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatarWrapper: { position: 'relative', padding: 4, borderRadius: 60, borderWidth: 2, borderColor: colors.autumn },
  avatar: { width: 88, height: 88, borderRadius: 45 },
  avatarPlaceholder: {
    backgroundColor: 'rgba(216, 194, 186, 0.4)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    color: 'rgba(170, 131, 104, 1)', 
  },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.autumn, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.neutral50 },
  userName: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.neutral900, marginTop: 16 },
  userStatus: { ...typography.bodyDefault, color: colors.neutral700, marginTop: 4 },

  /* Subscription Card */
  subCard: { backgroundColor: 'rgba(216, 194, 186, 0.15)' ,borderRadius: 24, padding: 24, marginBottom: 32, position: 'relative' },
  subBadge: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(170, 131, 104, 1)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  subBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: colors.white, textTransform: 'uppercase' },
  subTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.neutral900, marginBottom: 8 },
  subDetail: { fontSize: 16, fontFamily: 'Inter_400Regular', color: colors.neutral700, marginBottom: 8 },
  subDateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  subDateText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.autumn, marginLeft: 6 },
  manageSubBtn: { backgroundColor: 'rgba(170, 131, 104, 1)', paddingVertical: 14, borderRadius: 40, alignItems: 'center' },
  manageSubBtnText: { ...typography.buttonText, color: colors.white },

  /* Settings Lists */
 sectionTitle: { 
    fontFamily: 'Inter_400Regular', 
    fontSize: 14,                   
    color: colors.neutral500, 
    textTransform: 'uppercase', 
    marginBottom: 12, 
    marginLeft: 8 
  },
  cardGroup: { backgroundColor: colors.white, borderRadius: 20, marginBottom: 24, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingsRowLeft: { flexDirection: 'row', alignItems: 'center' },
  settingsRowTitle: { 
    fontFamily: 'Inter_400Regular', 
    fontSize: 14,                   
    color: colors.neutral900, 
    marginLeft: 12 
  },
  settingsRowRight: { flexDirection: 'row', alignItems: 'center' },
  settingsRowValue: { 
    fontFamily: 'Inter_400Regular', 
    fontSize: 14,                  
    color: colors.neutral700, 
    marginRight: 8 
  },
  divider: { height: 1, backgroundColor: 'rgba(216, 194, 186, 0.05)', },

  /* Delete Account */
  deleteAccountBtn: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  deleteAccountText: {    fontFamily: 'Inter_400Regular',
    fontSize: 12, color: colors.error },

  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  primaryRedBtn: {
    backgroundColor: '#D32F2F',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  primaryRedBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  secondaryCancelBtn: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  secondaryCancelBtnText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#D32F2F',
    textTransform: 'uppercase',
  },

  /* --- LOGOUT MODAL SPECIFIC --- */
  logoutIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FCECEC', // Light red circle
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -8,
  },
  modalTitleCentered: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalBodyCentered: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#6B6B6B',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 22,
  },

  /* --- DELETE MODAL SPECIFIC --- */
  leftAlignedContent: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitleLeft: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'left',
  },
  modalBodyLeft: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#6B6B6B',
    textAlign: 'left',
    lineHeight: 22,
    marginBottom: 20,
  },
  bulletList: {
    width: '100%',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulletText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#6B6B6B',
    marginLeft: 12,
  },
});