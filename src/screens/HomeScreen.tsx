import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform, ImageBackground, Dimensions, NativeSyntheticEvent, NativeScrollEvent,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { BlurView } from 'expo-blur';
import CustomModal from '../components/CustomModal';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserProfile } from '../context/UserProfileContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CAROUSEL_GAP = 16;

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop';

const STATIC_PICKS = [
  {
    id: 'pick-1',
    title: 'Summer Makeup',
    image: require('../../assets/summer.jpg')
  },
  {
    id: 'pick-2',
    title: 'Autumn Accessories',
    image: require('../../assets/autumn.jpg')
  }
];

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { timeLeft, isLocked } = useAppContext();

  const { profile } = useUserProfile();

  const firstName = profile?.display_name ? profile.display_name.split(' ')[0] : '';
  const avatarUrl = profile?.avatar_url;

  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [featuredLooks, setFeaturedLooks] = useState<any[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  const isTrialEnded = timeLeft <= 0;
  const showLockOverlay = isLocked;
  const isPremiumUser = timeLeft <= 0 && !isLocked;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const fetchRandomFeaturedLooks = async () => {
      try {
        const { data, error } = await supabase
          .from('catalog_looks')
          .select('id, name, render_image_url, look_type:catalog_look_types(name)')
          .limit(15);

        if (error) throw error;

        if (data && data.length > 0) {
          const shuffled = data.sort(() => 0.5 - Math.random());

          const randomSelection = shuffled.slice(0, 3).map((look: any) => {

            const typeData = look.look_type;
            const catName = Array.isArray(typeData) ? typeData[0]?.name : typeData?.name;

            return {
              id: look.id,
              category: catName ? catName.toUpperCase() : 'FEATURED LOOK',
              title: look.name || 'Curated Style',
              image: { uri: look.render_image_url || FALLBACK_IMAGE }
            };
          });

          setFeaturedLooks(randomSelection);
        }
      } catch (err) {
        console.error("Error fetching featured looks:", err);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    fetchRandomFeaturedLooks();
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const slideIndex = Math.round(scrollPosition / (CARD_WIDTH + CAROUSEL_GAP));
    setCurrentSlide(slideIndex);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.topPaddedSection}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.headerLeft}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.profilePic} />
              ) : (
                <View style={[styles.profilePic, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>
                    {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.greeting}>Hello{firstName ? ` ${firstName}` : ''}</Text>
                <Text style={styles.subtitle}>Curated looks inspired by the season</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationBtn}>
              <Ionicons name="notifications-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {!isPremiumUser && (
            <View style={styles.timerWrapper}>
              <View style={[styles.timerContainer, isTrialEnded && styles.timerContainerEnded]}>
                <Ionicons name="time-outline" size={16} color={isTrialEnded ? "#666" : "#B88A60"} style={styles.timerIcon} />
                <Text style={[styles.timerText, isTrialEnded && styles.timerTextEnded]}>DEMO ENDS IN {formatTime(timeLeft)}</Text>
              </View>
            </View>
          )}

          {showLockOverlay && (
            <LinearGradient
              colors={['#F3EFEA', '#EAE4DC']}
              style={styles.trialCard}
            >
              <Image source={require('../../assets/Subscription_Illustration.png')} style={styles.trialWatermark} />
              <View>
                <Text style={styles.trialTitle}>Your free trial has ended</Text>
                <Text style={styles.trialSubtitle}>Upgrade to continue your style journey.</Text>
                <TouchableOpacity style={styles.premiumBtn} onPress={() => setShowPremiumModal(true)} activeOpacity={0.8}>
                  <Text style={styles.premiumBtnText}>Unlock Premium</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          )}
        </View>

        <View style={styles.lockedContentWrapper}>

          {/* --- FEATURED HERO CAROUSEL --- */}
          <View style={styles.carouselContainer}>
            {isLoadingFeatured ? (
              <View style={styles.loadingCarousel}>
                <ActivityIndicator size="large" color="#A67B5B" />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                scrollEnabled={!showLockOverlay}
                snapToInterval={CARD_WIDTH + CAROUSEL_GAP}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {featuredLooks.map((look, index) => (
                  <TouchableOpacity
                    key={look.id}
                    style={[
                      styles.heroWrapper,
                      { marginRight: index === featuredLooks.length - 1 ? 0 : CAROUSEL_GAP }
                    ]}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('LookDetail', { lookId: look.id })}
                    disabled={showLockOverlay}
                  >
                    <ImageBackground
                      source={look.image}
                      style={styles.heroImage}
                      imageStyle={{ borderRadius: 24 }}
                    >
                      <View style={styles.heroOverlay} />
                      <View style={styles.heroContent}>
                        <Text style={styles.heroCategory}>{look.category}</Text>
                        <Text style={styles.heroTitle}>{look.title}</Text>
                        <View style={styles.exploreBtn}>
                          <Text style={styles.exploreBtnText}>EXPLORE LOOK</Text>
                          <Ionicons name="chevron-forward" size={14} color="#FFF" />
                        </View>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Pagination Dots */}
          {!isLoadingFeatured && featuredLooks.length > 0 && (
            <View style={styles.paginationContainer}>
              {featuredLooks.map((_, index) => (
                <View key={index} style={[styles.dot, currentSlide === index && styles.activeDot]} />
              ))}
            </View>
          )}

          {/* --- SEASONAL PICKS SECTION --- */}
          <View style={styles.innerContentPadding}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Seasonal Picks</Text>
              <TouchableOpacity disabled={showLockOverlay} onPress={() => navigation.navigate('CategoryList', { categoryId: 'seasonal_picks' })}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            scrollEnabled={!showLockOverlay}
          >
            <View style={{ width: 20 }} />
            {STATIC_PICKS.map((pick) => (
              <TouchableOpacity
                key={pick.id}
                activeOpacity={0.8}
                disabled={showLockOverlay}
                onPress={() => navigation.navigate('CategoryList', { categoryId: pick.id })}
              >
                <ImageBackground
                  source={pick.image}
                  style={styles.pickCard}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <View style={styles.pickOverlay} />
                  <Text style={styles.pickTitle} numberOfLines={2}>{pick.title}</Text>
                </ImageBackground>
              </TouchableOpacity>
            ))}
            <View style={{ width: 4 }} />
          </ScrollView>

          {/* --- WEEKLY PICKS SECTION --- */}
          <View style={[styles.innerContentPadding, { marginTop: 24 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Weekly Picks</Text>
              <TouchableOpacity disabled={showLockOverlay} onPress={() => navigation.navigate('CategoryList', { categoryId: 'weekly_picks' })}>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            scrollEnabled={!showLockOverlay}
          >
            <View style={{ width: 20 }} />
            {STATIC_PICKS.map((pick) => (
              <TouchableOpacity
                key={`weekly-${pick.id}`}
                activeOpacity={0.8}
                disabled={showLockOverlay}
                onPress={() => navigation.navigate('CategoryList', { categoryId: pick.id })}
              >
                <ImageBackground
                  source={pick.image}
                  style={styles.pickCard}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <View style={styles.pickOverlay} />
                  <Text style={styles.pickTitle} numberOfLines={2}>{pick.title}</Text>
                </ImageBackground>
              </TouchableOpacity>
            ))}
            <View style={{ width: 4 }} />
          </ScrollView>

          {/* --- BLUR & LOCK OVERLAY --- */}
          {showLockOverlay && (
            <View style={StyleSheet.absoluteFill}>
              <BlurView intensity={Platform.OS === 'android' ? 30 : 8} tint="light" style={styles.blurOverlay}>
                <View style={styles.lockIconOverlayContainer}>
                  <View style={styles.lockIconContainer}>
                    <Image source={require('../../assets/Lock.png')} style={styles.customLockPng} />
                  </View>
                </View>
              </BlurView>
            </View>
          )}

        </View>

      </ScrollView>

      {/* --- PREMIUM MODAL --- */}
      <CustomModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="Your Free Trial has Ended"
        subtitle="Continue your personalized styling journey with YourSZN"
        primaryButtonText="Continue to Subscription"
        onPrimaryPress={() => {
          setShowPremiumModal(false);
          navigation.navigate('ChooseSeason');
        }}
        secondaryButtonText="Maybe Later"
      >
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F3EE'
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 15 : 10,
    paddingBottom: 120,
  },
  topPaddedSection: { paddingHorizontal: 20 },
  innerContentPadding: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  profilePic: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  avatarPlaceholder: {
    backgroundColor: 'rgba(216, 194, 186, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: 'rgba(170, 131, 104, 1)',
  },
  greeting: { fontFamily: 'Almarai_400Regular', fontSize: 18, color: '#333' },
  subtitle: { fontFamily: 'Almarai_400Regular', fontSize: 12, color: '#777', marginTop: 2 },
  notificationBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#A67B5B', justifyContent: 'center', alignItems: 'center' },
  timerWrapper: { alignItems: 'center', marginBottom: 24 },
  timerContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 0.8, borderColor: 'rgba(215, 210, 206, 1)', backgroundColor: 'transparent' },
  timerContainerEnded: { borderColor: 'rgba(215, 210, 206, 1)', backgroundColor: 'rgba(236, 231, 227, 1)' },
  timerIcon: { marginRight: 6 },
  timerText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#B88A60', letterSpacing: 0.5 },
  timerTextEnded: { color: '#666' },
  trialCard: { position: 'relative', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 32, marginBottom: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  trialWatermark: { position: 'absolute', bottom: -4, right: 1, opacity: 1, width: 98, height: 98, resizeMode: 'contain' },
  trialTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#222', marginBottom: 6 },
  trialSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#555', marginBottom: 20 },
  premiumBtn: { backgroundColor: '#A67B5B', alignSelf: 'flex-start', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 },
  premiumBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFF' },

  lockedContentWrapper: { position: 'relative', marginTop: 8 },
  lockIconOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  carouselContainer: { height: 400, marginBottom: 16 },
  loadingCarousel: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', marginHorizontal: 20, borderRadius: 24 },
  heroWrapper: {
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  heroImage: { width: '100%', height: 400, justifyContent: 'flex-end' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 24 },
  heroContent: { padding: 24 },
  heroCategory: { color: '#FFF', fontSize: 14, fontFamily: 'Almarai_400Regular', letterSpacing: 1, marginBottom: 8 },
  heroTitle: { color: '#FFF', fontSize: 24, fontFamily: 'Almarai_400Regular', marginBottom: 12 },
  exploreBtn: { flexDirection: 'row', alignItems: 'center' },
  exploreBtnText: { color: '#FFF', fontSize: 12, fontFamily: 'Almarai_400Regular', letterSpacing: 0.5, marginRight: 4 },

  paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DCD3C9', marginHorizontal: 4 },
  activeDot: { width: 24, backgroundColor: '#A67B5B' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sectionTitle: { fontSize: 22, fontFamily: 'Almarai_400Regular', color: '#333' },
  viewAllText: { fontSize: 14, color: 'rgba(170, 131, 104, 1)', fontFamily: 'Almarai_400Regular' },
  horizontalScroll: { paddingBottom: 10 },
  pickCard: {
    width: 170,
    height: 152,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  pickOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16
  },
  pickTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Almarai_400Regular',
    lineHeight: 22,
    textAlign: 'center',
  },

  blurOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Platform.OS === 'android' ? 'rgba(245, 235, 225, 0.5)' : 'rgba(245, 235, 225, 0.24)' },
  lockIconContainer: { width: 54, height: 54, borderRadius: 35, backgroundColor: 'rgba(46, 46, 46, 0.64)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 6 },
  customLockPng: { width: 24, height: 24, resizeMode: 'contain' },
  benefitList: { width: '100%', marginBottom: 24 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  benefitText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#333', marginLeft: 12 },
  fomoBadge: { backgroundColor: '#EBE1D5', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginBottom: 28 },
  fomoBadgeText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#333' },
});