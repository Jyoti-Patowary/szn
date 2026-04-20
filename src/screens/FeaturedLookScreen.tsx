import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

const { height } = Dimensions.get('window');

// Mock data for the "Shop the Look" section
const SHOP_ITEMS = [
  {
    id: '1',
    name: 'Classic Beige Trench Coat',
    price: '$46.00',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Vintage Straight Leg Denim',
    price: '$32.00',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Ribbed Cotton Tank Top',
    price: '$12.00',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=400&auto=format&fit=crop',
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FeaturedLook'>;

export default function FeaturedLookScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* --- HERO IMAGE --- */}
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop' }}
          style={styles.heroImage}
        />

        {/* --- BOTTOM SHEET CONTENT --- */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Beige Trench and Denim</Text>
          <Text style={styles.description}>
            Effortless autumn layering with soft neutrals and timeless denim. A silhouette designed for the transitioning seasons.
          </Text>

          <Text style={styles.sectionTitle}>Shop the Look</Text>

          {/* Shop Items List */}
          {SHOP_ITEMS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.shopItem} activeOpacity={0.7}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#C4C4C4" />
            </TouchableOpacity>
          ))}
          
          {/* Bottom Padding */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* --- FLOATING HEADER BUTTONS --- */}
      <SafeAreaView style={styles.floatingHeader}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="share-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EBE1', // Matching your beige theme
  },
  heroImage: {
    width: '100%',
    height: height * 0.55, // Takes up 55% of the screen height
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    backgroundColor: '#F5EBE1',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32, // This pulls the sheet up over the image!
    paddingHorizontal: 24,
    paddingTop: 32,
    minHeight: height * 0.5,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#EBEBEB',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#111',
    marginBottom: 6,
  },
  itemPrice: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#9C5E33', // Brown price color from the design
  },
});