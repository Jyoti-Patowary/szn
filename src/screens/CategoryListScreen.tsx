import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, SafeAreaView, Dimensions, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

const { width } = Dimensions.get('window');

// --- MOCK DATABASE ---
const CATEGORY_DATA: Record<string, any> = {
  'autumn_accessories': {
    title: 'Autumn Accessories',
    subtitle: 'Elevated accessories to complete your autumn style.',
    filters: ['ALL', 'SUNGLASSES', 'CHAIN BELTS', 'STATEMENT EARRINGS'],
    hideSearch: false,
    hideFilters: false,
    products: [
      { id: '1', name: 'Gold Circle Chain Belt', price: '$32.99', image: 'https://images.unsplash.com/photo-1599643477874-cefb3eeb7428?q=80&w=400&auto=format&fit=crop', category: 'CHAIN BELTS' },
      { id: '2', name: 'Vegan Chain Belt', price: '$79.50', image: 'https://images.unsplash.com/photo-1628149462157-19cb9eafaf90?q=80&w=400&auto=format&fit=crop', category: 'CHAIN BELTS' },
      { id: '3', name: 'LANA Metal Oval Sunglasses', price: '$20.00', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400&auto=format&fit=crop', category: 'SUNGLASSES' },
      { id: '4', name: 'Statement Round Bangle', price: '$27.99', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=400&auto=format&fit=crop', category: 'STATEMENT EARRINGS' },
    ]
  },
  'summer_makeup': {
    title: 'Summer Makeup',
    subtitle: 'Glowy, lightweight essentials for the heat.',
    filters: ['ALL', 'LIPS', 'FACE', 'EYES'],
    hideSearch: false,
    hideFilters: false,
    products: [
      { id: '5', name: 'Dewy Finish Setting Spray', price: '$24.00', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop', category: 'FACE' },
    ]
  },
  // 👇 ADDED: The Weekly Picks / Co-Ord Sets Category
  'weekly_picks': {
    title: 'CO-ORD Sets',
    subtitle: 'Effortless matching sets styled for your season.',
    filters: ['ALL'],
    hideSearch: true,  // Tells the screen to hide the search bar
    hideFilters: true, // Tells the screen to hide the horizontal filters
    products: [
      { id: 'w1', name: 'Sora Red Notch Set', price: '$72.99', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop', category: 'ALL' },
      { id: 'w2', name: 'Sloane Tie Co-Ord Set', price: '$49.50', image: 'https://images.unsplash.com/photo-1550639524-a6f58345a278?q=80&w=400&auto=format&fit=crop', category: 'ALL' },
      { id: 'w3', name: 'Suzie Ribbed Chocolate...', price: '$82.00', image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=400&auto=format&fit=crop', category: 'ALL' },
      { id: 'w4', name: 'Noah Brown Co-Ord Set', price: '$56.99', image: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?q=80&w=400&auto=format&fit=crop', category: 'ALL' },
      { id: 'w5', name: 'Cupro Strapless Top Pant', price: '$52.00', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop', category: 'ALL' },
      { id: 'w6', name: 'Oceana White Co-Ord Set', price: '$64.00', image: 'https://images.unsplash.com/photo-1434389672724-4fa0f4e38c35?q=80&w=400&auto=format&fit=crop', category: 'ALL' },
    ]
  }
};

type CategoryScreenRouteProp = RouteProp<RootStackParamList, 'CategoryList'>;

export default function CategoryListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const route = useRoute<CategoryScreenRouteProp>();
  const { categoryId } = route.params;

  const data = CATEGORY_DATA[categoryId] || CATEGORY_DATA['autumn_accessories']; 

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = data.products.filter((item: any) => {
    if (activeFilter === 'ALL') return true;
    return item.category === activeFilter;
  });

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <TouchableOpacity style={styles.heartButton}>
          <Ionicons name="heart-outline" size={18} color="#A67B5B" />
        </TouchableOpacity>
      </View>
      <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.subtitle}>{data.subtitle}</Text>
        </View>
      </View>

      {/* --- CONDITIONALLY RENDER FILTERS --- */}
      {!data.hideFilters && (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {data.filters?.map((filter: string) => (
              <TouchableOpacity 
                key={filter} 
                style={[styles.filterPill, activeFilter === filter && styles.activeFilterPill]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* --- CONDITIONALLY RENDER SEARCH BAR --- */}
      {!data.hideSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {/* --- 2-COLUMN PRODUCT GRID --- */}
      <FlatList 
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.rowWrapper}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EBE1', 
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
    marginTop: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter_600SemiBold', 
    fontSize: 24,
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#666',
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4C7BA',
    marginRight: 10,
  },
  activeFilterPill: {
    backgroundColor: '#A67B5B', 
    borderColor: '#A67B5B',
  },
  filterText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#A67B5B',
  },
  activeFilterText: {
    color: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#A67B5B',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#333',
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, 
  },
  rowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  productCard: {
    width: (width - 48) / 2, 
  },
  imageContainer: {
    backgroundColor: '#EBEBEB',
    borderRadius: 16,
    height: 200, // Slightly taller to match the portrait aspect ratio of your screenshot!
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productName: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#666',
  },
});