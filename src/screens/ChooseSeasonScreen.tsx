import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

type ChooseSeasonRouteProp = RouteProp<RootStackParamList, 'ChooseSeason'>;

const SEASONS = [
  { id: 'spring', title: 'Spring', image: require('../../assets/spring-season.jpg') },
  { id: 'summer', title: 'Summer', image: require('../../assets/summer-season.png') },
  { id: 'autumn', title: 'Autumn', image: require('../../assets/autumn-season.png') },
  { id: 'winter', title: 'Winter', image: require('../../assets/winter-season.png') },
  { id: 'all', title: 'All Seasons', image: require('../../assets/allseason.png') },
];

export default function ChooseSeasonScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ChooseSeasonRouteProp>();
  const { changeTheme } = useTheme();
  const themeColor = useTheme().currentTheme.color || '#A67B5B';
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  const fromProfile = route.params?.fromProfile;

  const handleContinue = async () => { 
    if (selectedSeason) {
      if (fromProfile) {
        await changeTheme(selectedSeason); 
        navigation.goBack(); 
      } else {
        navigation.navigate('Subscription');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Choose your Style Season</Text>
          <Text style={styles.headerSubtitle}>Tailor your experience to your favorite time of year.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {SEASONS.map((season) => {
            const isSelected = selectedSeason === season.id;
            return (
              <TouchableOpacity
                key={season.id}
                style={[
                  styles.card,
                  isSelected && { borderColor: themeColor }
                ]}
                activeOpacity={0.9}
                onPress={() => setSelectedSeason(season.id)}
              >
                <View style={styles.imageContainer}>
                  <Image source={season.image} style={styles.cardImage} resizeMode="cover"/>
                  
                  {isSelected && (
                    <View style={styles.checkmarkBadge}>
                      <Ionicons name="checkmark-circle" size={24} color={themeColor} />
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle}>{season.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueBtn, !selectedSeason && styles.continueBtnDisabled, { backgroundColor: selectedSeason ? themeColor : '#D1C4B8' }]}
          onPress={handleContinue}
          disabled={!selectedSeason} 
        >
          <Text style={styles.continueBtnText}>{fromProfile ? 'Apply Theme' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5EBE1', 
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
    marginTop: 2, 
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 22,
    color: '#333',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    paddingRight: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: '47%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16, 
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    marginBottom: 12,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FFF', 
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#F5EBE1',
  },
  continueBtn: {
    backgroundColor: '#A67B5B',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnDisabled: {
    backgroundColor: '#D1C4B8',
  },
  continueBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
});