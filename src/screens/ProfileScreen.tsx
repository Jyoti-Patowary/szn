import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';
import { useUserProfile } from '../context/UserProfileContext';
import { useTheme } from '../context/ThemeContext';
import { colors, typography } from '../theme/colors';
import CustomModal from '../components/CustomModal';
import { 
  ArrowLeft, Heart, Lock, Link2 as LinkIcon, Palette, 
  HelpCircle, FileText, ShieldCheck, LogOut, 
  ChevronRight, Pencil, Calendar, X 
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';


export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const { isLocked } = useAppContext();

  const { profile, isLoadingProfile } = useUserProfile();
  const { currentTheme } = useTheme(); 
  
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    const fetchAuthData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.app_metadata?.providers) {
        setLinkedProviders(user.app_metadata.providers);
      }
    };

    if (isFocused) {
      fetchAuthData();
    }
  }, [isFocused]);

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
        <Icon size={20} color={isDestructive ? currentTheme.color : colors.neutral700} strokeWidth={isDestructive ? 2 : 1.5} />
        <Text style={[styles.settingsRowTitle, isDestructive && { color: currentTheme.color }]}>
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
            return <Ionicons key={provider} name="logo-apple" size={20} color={colors.neutral500} />;
          }
          if (provider === 'email') {
            return <FileText key={provider} size={20} color={colors.neutral500} />;
          }
          return null;
        })}
      </View>
    );
  };

  const displayName = profile?.display_name || 'User';
  const avatarUrl = profile?.avatar_url;

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
          <View style={[styles.avatarWrapper, { borderColor: currentTheme.color }]}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={[styles.avatarInitial, { color: currentTheme.color }]}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <TouchableOpacity 
              style={[styles.editAvatarBtn, { backgroundColor: currentTheme.color }]} 
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Pencil size={14} color={colors.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{isLoadingProfile ? 'Loading...' : displayName}</Text>
          <Text style={styles.userStatus}>{!isLocked ? 'Premium Member' : 'Free Member'}</Text>
        </View>

        {/* Subscription Card */}
        {!isLocked && (
          <View style={styles.subCard}>
            <View style={[styles.subBadge, { backgroundColor: currentTheme.color }]}>
              <Text style={styles.subBadgeText}>ACTIVE</Text>
            </View>
            <Text style={styles.subTitle}>{currentTheme.name} Plan {currentTheme.emoji}</Text>
            <Text style={styles.subDetail}>Semi-Annual • $35.99 / 6 months</Text>
            <View style={styles.subDateRow}>
              <Calendar size={14} color={currentTheme.color} strokeWidth={2} />
              <Text style={[styles.subDateText, { color: currentTheme.color }]}>Renews on: 12 Dec 2026</Text>
            </View>
            <TouchableOpacity style={[styles.manageSubBtn, { backgroundColor: currentTheme.color }]} onPress={() => navigation.navigate('Subscription')}>
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
            title="Accounts" 
            rightElement={renderProviderIcons()}
          />
        </View>

        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.cardGroup}>
          <SettingsRow 
            icon={Palette} 
            title="Choose Theme" 
            value={`${currentTheme.name} ${currentTheme.emoji}`} 
            onPress={() => navigation.navigate('ChooseSeason', { fromProfile: true })}
          />
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

        {/* DELETE ACCOUNT */}
        <TouchableOpacity style={styles.deleteAccountBtn} onPress={() => setDeleteModalVisible(true)}>
          <Text style={[styles.deleteAccountText, { color: currentTheme.color }]}>DELETE MY ACCOUNT</Text>
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
    color: '#1A1A1A',
  },
  /* Avatar */
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatarWrapper: { position: 'relative', padding: 4, borderRadius: 60, borderWidth: 2 },
  avatar: { width: 88, height: 88, borderRadius: 45 },
  avatarPlaceholder: {
    backgroundColor: 'rgba(216, 194, 186, 0.4)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
  },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.neutral50 },
  userName: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.neutral900, marginTop: 16 },
  userStatus: { ...typography.bodyDefault, color: colors.neutral700, marginTop: 4 },

  /* Subscription Card */
  subCard: { backgroundColor: 'rgba(216, 194, 186, 0.15)' ,borderRadius: 24, padding: 24, marginBottom: 32, position: 'relative' },
  subBadge: { position: 'absolute', top: 20, right: 20, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  subBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: colors.white, textTransform: 'uppercase' },
  subTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.neutral900, marginBottom: 8 },
  subDetail: { fontSize: 16, fontFamily: 'Inter_400Regular', color: colors.neutral700, marginBottom: 8 },
  subDateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  subDateText: { fontSize: 14, fontFamily: 'Inter_400Regular', marginLeft: 6 },
  manageSubBtn: { paddingVertical: 14, borderRadius: 40, alignItems: 'center' },
  manageSubBtnText: { ...typography.buttonText, color: colors.white },

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
  logoutIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FCECEC', 
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