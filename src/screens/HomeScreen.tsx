import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAppContext } from '../context/AppContext';

const THEMES = {
  Spring: {
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    title: 'Spring Collection',
    subtitle: 'Fresh florals and pastels',
    primaryColor: '#D1E8E2',
    accentColor: '#19747E',
  },
  Summer: {
    heroImage: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=2070&auto=format&fit=crop',
    title: 'Summer Breeze',
    subtitle: 'Light fabrics and bright colors',
    primaryColor: '#FDF6E3',
    accentColor: '#DDA77B',
  },
  Winter: {
    heroImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
    title: 'Winter Wardrobe',
    subtitle: 'Cozy layers and dark tones',
    primaryColor: '#E2E8F0',
    accentColor: '#2D3748',
  },
};

export default function HomeScreen() {
  const { season, setSeason, timeLeft } = useAppContext();
  const currentTheme = THEMES[season];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.primaryColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>StyleApp</Text>
          <View style={styles.timerContainer}>
             <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        <View style={styles.seasonToggle}>
          {(['Spring', 'Summer', 'Winter'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.seasonButton,
                season === s && { backgroundColor: currentTheme.accentColor },
              ]}
              onPress={() => setSeason(s)}
            >
              <Text style={[styles.seasonButtonText, season === s && { color: '#FFF' }]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.heroContainer}>
          <Image source={{ uri: currentTheme.heroImage }} style={styles.heroImage} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{currentTheme.title}</Text>
            <Text style={styles.heroSubtitle}>{currentTheme.subtitle}</Text>
            <TouchableOpacity style={styles.shopButton}>
              <Text style={styles.shopButtonText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Placeholder for trending items to make screen scrollable */}
        <View style={styles.trendingSection}>
          <Text style={[styles.sectionTitle, { color: currentTheme.accentColor }]}>Trending Now</Text>
          <View style={styles.placeholderBox} />
          <View style={styles.placeholderBox} />
        </View>
        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 24,
    color: '#333',
  },
  timerContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#333',
  },
  seasonToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  seasonButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  seasonButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#666',
  },
  heroContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 400,
    marginBottom: 30,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  heroTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 28,
    color: '#333',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  shopButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shopButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFF',
    fontSize: 14,
  },
  trendingSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 22,
    marginBottom: 16,
  },
  placeholderBox: {
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginBottom: 16,
  }
});
