import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Platform, ImageBackground, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { BlurView } from 'expo-blur';
import CustomModal from '../components/CustomModal';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Pulling timeLeft from your context
  const { timeLeft } = useAppContext();
  
  // Boolean to easily check if the trial is over
  const isTrialEnded = timeLeft <= 0; 

const [showPremiumModal, setShowPremiumModal] = useState(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. We remove standard padding from ScrollView to allow full-width blur */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- PADED TOP SECTION --- */}
        {/* Re-applying padding to unblurred elements manually */}
        <View style={styles.topPaddedSection}>
          {/* --- HEADER --- */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' }} 
                style={styles.profilePic} 
              />
              <View>
                <Text style={styles.greeting}>Hello Sarah</Text>
                <Text style={styles.subtitle}>Curated looks inspired by the season</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationBtn}>
              <Ionicons name="notifications-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* --- DYNAMIC TIMER --- */}
          <View style={styles.timerWrapper}>
            <View style={[styles.timerContainer, isTrialEnded && styles.timerContainerEnded]}>
              <Ionicons 
                name="time-outline" 
                size={16} 
                color={isTrialEnded ? "#666" : "#B88A60"} 
                style={styles.timerIcon} 
              />
              <Text style={[styles.timerText, isTrialEnded && styles.timerTextEnded]}>
                DEMO ENDS IN {formatTime(timeLeft)}
              </Text> 
            </View>
          </View>

          {/* --- TRIAL ENDED CARD --- */}
          {isTrialEnded && (
            <View style={styles.trialCard}>
              {/* Watermark Icon */}
              <Ionicons name="sparkles" size={120} color="#E3D7CC" style={styles.trialWatermark} />
              
              <Text style={styles.trialTitle}>Your free trial has ended</Text>
              <Text style={styles.trialSubtitle}>Upgrade to continue your style journey.</Text>
              
              <TouchableOpacity 
                style={styles.premiumBtn} 
             onPress={() => setShowPremiumModal(true)}
              >
                <Text style={styles.premiumBtnText}>Unlock Premium</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* --- LOCKED CONTENT WRAPPER --- */}
        {/* 2. This view is now full width left to right */}
        <View style={styles.lockedContentWrapper}>
          
          {/* Re-applying padding to the inner content */}
          <View style={styles.innerContentPadding}>
            <TouchableOpacity 
              style={styles.heroWrapper} 
              activeOpacity={0.9} 
              onPress={() => navigation.navigate('FeaturedLook')}
              disabled={isTrialEnded} 
            >
              <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop' }} 
                style={styles.heroImage}
                imageStyle={{ borderRadius: 24 }}
              >
                <View style={styles.heroOverlay} />
                <View style={styles.heroContent}>
                  <Text style={styles.heroCategory}>AUTUMN COLLECTION</Text>
                  <Text style={styles.heroTitle}>Beige Trench and Denim</Text>
                  <View style={styles.exploreBtn}>
                    <Text style={styles.exploreBtnText}>EXPLORE LOOK</Text>
                    <Ionicons name="chevron-forward" size={14} color="#FFF" />
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>

            <View style={styles.paginationContainer}>
              <View style={[styles.dot, styles.activeDot]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Seasonal Picks</Text>
              <TouchableOpacity disabled={isTrialEnded}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalScroll}
            scrollEnabled={!isTrialEnded} 
          >
            {/* Added left margin spacer for horizontal scroll, matching existing padding */}
            <View style={{ width: 20 }} /> 
            <TouchableOpacity activeOpacity={0.8} disabled={isTrialEnded} onPress={() => navigation.navigate('CategoryList', { categoryId: 'summer_makeup' })}>
              <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop' }} style={styles.pickCard} imageStyle={{ borderRadius: 16 }}>
                <View style={styles.pickOverlay} />
                <Text style={styles.pickTitle}>Summer Makeup</Text>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} disabled={isTrialEnded} onPress={() => navigation.navigate('CategoryList', { categoryId: 'autumn_accessories' })}>
              <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1611080645601-cb8b2ea4a132?q=80&w=800&auto=format&fit=crop' }} style={styles.pickCard} imageStyle={{ borderRadius: 16 }}>
                <View style={styles.pickOverlay} />
                <Text style={styles.pickTitle}>Autumn Accessories</Text>
              </ImageBackground>
            </TouchableOpacity>
            <View style={{ width: 4 }} /> 
          </ScrollView>

          {/* --- THE BLUR & LOCK OVERLAY --- */}
          {/* 3. Absolute fill now perfectly stretches edge to edge */}
          {isTrialEnded && (
            <View style={StyleSheet.absoluteFill}>
              <BlurView intensity={25} tint="light" style={styles.blurOverlay}>
                <View style={styles.lockIconContainer}>
                  {/* 4. Swapped to your custom PNG! */}
                  <Image 
                    source={require('../../assets/Lock.png')} 
                    style={styles.customLockPng} 
                  />
                </View>
              </BlurView>
            </View>
          )}

        </View>

        <View style={{ height: 100 }} /> 
        </ScrollView>

   {/* --- PREMIUM CONVERSION MODAL --- */}
      <CustomModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="Your Free Trial has Ended"
        subtitle="Continue your personalized styling journey with YourSZN"
        primaryButtonText="Continue to Subscription"
        onPrimaryPress={() => {
          setShowPremiumModal(false);
          navigation.navigate('Subscription');
        }}
        secondaryButtonText="Maybe Later"
      >
        {/* We just pass the highly specific custom content as children! */}
        <View style={styles.benefitList}>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#A67B5B" />
            <Text style={styles.benefitText}>AI-powered outfit recommendations</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#A67B5B" />
            <Text style={styles.benefitText}>Access to all seasons</Text>
          </View>
          <View style={styles.benefitRow}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#A67B5B" />
            <Text style={styles.benefitText}>Save and create unlimited looks</Text>
          </View>
        </View>

        <View style={styles.fomoBadge}>
          <Text style={styles.fomoBadgeText}>You Explored 12 Looks During Your Trial 👀</Text>
        </View>
      </CustomModal>
     
    </SafeAreaView>
  );
}

// 5. Calculate dimensions for full-width horizontal scrolling adjustment
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5EBE1', 
  },
  scrollContent: {
    // 6. Removed horizontal padding here
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  // 7. Added manual padded sections
  topPaddedSection: {
    paddingHorizontal: 20,
  },
  innerContentPadding: {
    paddingHorizontal: 20,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  greeting: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#333',
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A67B5B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Timer Styles */
  timerWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#B88A60',
    backgroundColor: 'transparent',
  },
  timerContainerEnded: {
    borderColor: '#D4CDC4',
    backgroundColor: '#EBE3DB',
  },
  timerIcon: {
    marginRight: 6,
  },
  timerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#B88A60',
    letterSpacing: 0.5,
  },
  timerTextEnded: {
    color: '#666',
  },

  /* Trial Ended Card */
  trialCard: {
    backgroundColor: '#EBE3DB',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  trialWatermark: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    opacity: 0.4,
  },
  trialTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#222',
    marginBottom: 6,
  },
  trialSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  premiumBtn: {
    backgroundColor: '#A67B5B',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  premiumBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#FFF',
  },

  /* Locked Content Section */
  lockedContentWrapper: {
    // 8. Stretches edge to edge automatically now
    position: 'relative',
    marginTop: 8, // slight space after trial card
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // 9. BlurView gets screen width because container is screen width
    // Removed radius so it looks infinite left-to-right
    backgroundColor: 'rgba(245, 235, 225, 0.45)', // Matching image tint more closely
  },
  lockIconContainer: {
    width: 70, // Slightly bigger for image
    height: 70, // Slightly bigger for image
    borderRadius: 35,
    backgroundColor: 'rgba(30, 30, 30, 0.85)', // Darks circle for contrast
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  // 10. Styles for your custom PNG
  customLockPng: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },

  /* Hero Card Styles */
  heroWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: 400,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
  },
  heroContent: {
    padding: 24,
  },
  heroCategory: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 28,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    marginBottom: 12,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exploreBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
    marginRight: 4,
  },

  /* Pagination Dots */
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DCD3C9',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#A67B5B',
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'Inter_500Medium',
  },

  /* Horizontal Scroll Cards */
  horizontalScroll: {
    paddingBottom: 20,
    // Width spacer at start takes care of alignment
  },
  pickCard: {
    width: 160,
    height: 160,
    marginRight: 16,
    justifyContent: 'flex-end',
    padding: 16,
  },
  pickOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
  },
  pickTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    lineHeight: 22,
  },
  /* Custom Modal Inner Content Styles */
  benefitList: {
    width: '100%',
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  fomoBadge: {
    backgroundColor: '#EBE1D5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 28,
  },
  fomoBadgeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#333',
  },
});